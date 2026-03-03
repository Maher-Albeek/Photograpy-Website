import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

type LogoRow = {
  value_content?: string | null;
};

function isBlobUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

async function getExistingLogo(): Promise<string | null> {
  const rows = (await sql`
    SELECT value_content
    FROM settings
    WHERE key_name = 'site_logo'
    LIMIT 1
  `) as LogoRow[];

  return rows.length ? rows[0].value_content ?? null : null;
}

export async function GET() {
  try {
    const logo = await getExistingLogo();
    return NextResponse.json(logo ? { logo } : {});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load logo" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const file =
      (formData.get("file") as File | null) ??
      (formData.get("image") as File | null);

    if (!file) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 }
      );
    }

    const existingLogo = await getExistingLogo();

    const buffer = Buffer.from(await file.arrayBuffer());
    const avifBuffer = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .avif({ quality: 60 })
      .toBuffer();

    const filename = `site_logo-${Date.now()}.avif`;
    const { url } = await put(`settings/${filename}`, avifBuffer, {
      access: "public",
      contentType: "image/avif",
    });

    await sql`
      INSERT INTO settings (key_name, value_content, last_updated)
      VALUES ('site_logo', ${url}, NOW())
      ON DUPLICATE KEY UPDATE
        value_content = ${url},
        last_updated = NOW()
    `;

    if (existingLogo && isBlobUrl(existingLogo)) {
      await del(existingLogo).catch(() => null);
    }

    return NextResponse.json({ ok: true, logo: url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Logo upload failed" },
      { status: 500 }
    );
  }
}
