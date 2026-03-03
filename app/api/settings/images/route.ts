import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import { put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("image") as File | null;
  const settingKey = formData.get("setting_key") as string | null;
  const imgcat = Number(formData.get("imgcat"));

  if (!file || !settingKey || !imgcat) {
    return NextResponse.json(
      { error: "Missing data" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const avifBuffer = await sharp(buffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .avif({ quality: 60 })
    .toBuffer();

  const filename = `${settingKey}-${Date.now()}.avif`;
  const { url } = await put(`settings/${filename}`, avifBuffer, {
    access: "public",
    contentType: "image/avif",
  });
  const dbPath = url;

  const keyName =
    settingKey === "hero"
      ? `hero_image_${Date.now()}`
      : `${settingKey}_image_${Date.now()}`;

  await sql`
    INSERT INTO settings
      (key_name, value_content, imgcat, last_updated)
    VALUES (${keyName}, ${dbPath}, ${imgcat}, NOW())
  `;

  return NextResponse.json({ success: true });
}
