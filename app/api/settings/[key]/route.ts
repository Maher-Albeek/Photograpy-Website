import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
);
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const localUploadDir = path.join(process.cwd(), "public", "uploads", "settings");

function isMissingBlobStoreError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /store does not exist/i.test(error.message);
}

type EncodedImage = {
  buffer: Buffer;
  extension: "avif" | "webp";
  contentType: "image/avif" | "image/webp";
};

async function encodeSettingsImage(file: File): Promise<EncodedImage> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const buffer = await sharp(inputBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .avif({ quality: 60 })
      .toBuffer();

    return {
      buffer,
      extension: "avif",
      contentType: "image/avif",
    };
  } catch {
    try {
      const buffer = await sharp(inputBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();

      return {
        buffer,
        extension: "webp",
        contentType: "image/webp",
      };
    } catch {
      throw new Error("Unsupported image format");
    }
  }
}

async function saveLocalSettingsImage(key: string, encoded: EncodedImage) {
  await fs.mkdir(localUploadDir, { recursive: true });
  const filename = `${key}.${encoded.extension}`;
  const outputPath = path.join(localUploadDir, filename);
  await fs.writeFile(outputPath, encoded.buffer);
  return `/uploads/settings/${filename}`;
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params;

    const contentType = req.headers.get("content-type") || "";

    // TEXT
    if (contentType.includes("application/json")) {
      const { value } = await req.json();

      await sql`
      UPDATE settings
      SET value_content = ${value}, last_updated = NOW()
      WHERE key_name = ${key}
      `;

      return NextResponse.json({ success: true });
    }

    // IMAGE (SINGLE ONLY)
    const formData = await req.formData();
    const file =
      (formData.get("image") as File | null) ??
      (formData.get("file") as File | null);

    if (!file) {
      return NextResponse.json(
        { error: "No image" },
        { status: 400 }
      );
    }

    const rows = await sql`
    SELECT value_content
    FROM settings
    WHERE key_name = ${key}
    LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    let encoded: EncodedImage;
    try {
      encoded = await encodeSettingsImage(file);
    } catch {
      return NextResponse.json(
        { error: "Unsupported image format" },
        { status: 400 }
      );
    }

    if (isServerless && !hasBlobToken) {
      return NextResponse.json(
        { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
        { status: 500 }
      );
    }

    let newPath: string;
    if (hasBlobToken) {
      const filename = `${key}-${Date.now()}.${encoded.extension}`;
      try {
        const { url } = await put(`settings/${filename}`, encoded.buffer, {
          access: "public",
          contentType: encoded.contentType,
        });
        newPath = url;
      } catch (error) {
        // In local dev, a stale/invalid blob token should not block uploads.
        if (!isServerless && isMissingBlobStoreError(error)) {
          newPath = await saveLocalSettingsImage(key, encoded);
        } else {
          throw error;
        }
      }
    } else {
      newPath = await saveLocalSettingsImage(key, encoded);
    }

    await sql`
    UPDATE settings
    SET value_content = ${newPath}, last_updated = NOW()
    WHERE key_name = ${key}
    `;

    const oldImage = rows[0].value_content;
    if (hasBlobToken && oldImage && /^https?:\/\//i.test(oldImage)) {
      await del(oldImage).catch(() => null);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[settings:key PUT]", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
