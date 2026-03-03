import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

export async function PUT(
  req: Request,
  context: { params: Promise<{ key: string }> }
) {
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const avifBuffer = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .avif({ quality: 60 })
    .toBuffer();

  const filename = `${key}-${Date.now()}.avif`;
  const { url } = await put(`settings/${filename}`, avifBuffer, {
    access: "public",
    contentType: "image/avif",
  });
  const newPath = url;

  await sql`
    UPDATE settings
    SET value_content = ${newPath}, last_updated = NOW()
    WHERE key_name = ${key}
    `;

  const oldImage = rows[0].value_content;
  if (oldImage && /^https?:\/\//i.test(oldImage)) {
    await del(oldImage).catch(() => null);
  }

  return NextResponse.json({ success: true });
}
