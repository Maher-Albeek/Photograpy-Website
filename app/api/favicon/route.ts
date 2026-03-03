import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

type LogoRow = {
  logo?: string | null;
};

function normalizeLogoUrl(logo: string, requestUrl: string) {
  if (/^https?:\/\//i.test(logo)) return logo;
  const path = logo.startsWith("/") ? logo : `/${logo}`;
  return new URL(path, requestUrl).toString();
}

async function getLogoValue(): Promise<string | null> {
  const rows = (await sql`
    SELECT value_content AS logo
    FROM settings
    WHERE key_name = 'site_logo'
    LIMIT 1
  `) as LogoRow[];

  return rows?.[0]?.logo ?? null;
}

export async function GET(req: Request) {
  const logo = await getLogoValue();
  if (!logo) {
    return new NextResponse(null, { status: 204 });
  }

  const url = normalizeLogoUrl(logo, req.url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(null, { status: 204 });
    }

    const contentType = response.headers.get("content-type");
    const input = Buffer.from(await response.arrayBuffer());
    const inputArray = new Uint8Array(input);
    try {
      const png = await sharp(input)
        .resize(64, 64, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
      const pngArray = new Uint8Array(png);

      return new NextResponse(pngArray, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control":
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    } catch {
      return new NextResponse(inputArray, {
        headers: {
          "Content-Type": contentType ?? "application/octet-stream",
          "Cache-Control":
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
