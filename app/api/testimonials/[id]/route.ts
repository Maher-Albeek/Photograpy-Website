import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import fs from "fs";
import path from "path";
import { saveAvifImage } from "@/lib/image";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
);

const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}


export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  // Get image path before delete
  const rows = await sql`
    SELECT image
    FROM testimonials
    WHERE id = ${id}
    LIMIT 1
    `;

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const imagePath = rows[0].image;

  // Delete row
  await sql`
    DELETE FROM testimonials
    WHERE id = ${id}
    `;

  // Delete image file if present
  if (imagePath) {
    if (isRemoteUrl(imagePath)) {
      await del(imagePath).catch(() => null);
    } else if (!isServerless) {
      const fullPath = path.join(process.cwd(), "public", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const content = formData.get("content") as string;
  const file = formData.get("image") as File | null;

  // Get current image path
  const rows = await sql`
    SELECT image FROM testimonials WHERE id = ${id} LIMIT 1
  `;

  if (!rows.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let imagePath = rows[0].image;

  // Replace image if a new file was uploaded
  if (file) {
    if (imagePath) {
      if (isRemoteUrl(imagePath)) {
        await del(imagePath).catch(() => null);
      } else if (!isServerless) {
        const oldPath = path.join(process.cwd(), "public", imagePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    if (isServerless && !hasBlobToken) {
      return NextResponse.json(
        { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (hasBlobToken) {
      const avifBuffer = await sharp(buffer)
        .resize({ width: 300, withoutEnlargement: true })
        .avif({ quality: 50 })
        .toBuffer();
      const filename = `testimonials-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.avif`;
      const { url } = await put(`testimonials/${filename}`, avifBuffer, {
        access: "public",
        contentType: "image/avif",
      });
      imagePath = url;
    } else {
      const uploadsDir = path.join(
        process.cwd(),
        "public/uploads/testimonials"
      );
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.avif`;
      const publicPath = await saveAvifImage({
        buffer,
        targetDir: uploadsDir,
        filename,
        publicPathPrefix: "/uploads/testimonials",
        quality: 50,
        resize: { width: 300 },
      });
      imagePath = publicPath.replace(/^\/+/, "");
    }
  }

  // Update row
  await sql`
    UPDATE testimonials
    SET name = ${name}, content = ${content}, image = ${imagePath}
    WHERE id = ${id}
    `;

  return NextResponse.json({ success: true });
}
