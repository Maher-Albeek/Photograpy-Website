import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { keepOnlyFiles, saveAvifImage } from "@/lib/image";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

type HeroData = {
  title: string;
  imageUrl: string;
};

const SETTINGS_KEY = "photo_gallery_hero";
const dataFilePath = path.join(
  process.cwd(),
  "data",
  "photoGallery",
  "photoGalleryHero.json"
);

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
);
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const skipDb = process.env.SKIP_DB === "1";

const fallbackHero: HeroData = {
  title: "Photo Gallery",
  imageUrl: "",
};

function normalizeHero(input: Partial<HeroData> | null): HeroData {
  const safe = input ?? {};
  return {
    title: typeof safe.title === "string" ? safe.title : fallbackHero.title,
    imageUrl: typeof safe.imageUrl === "string" ? safe.imageUrl : fallbackHero.imageUrl,
  };
}

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

async function readFromFile(): Promise<HeroData | null> {
  try {
    const raw = await fs.readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<HeroData>;
    return normalizeHero(parsed);
  } catch {
    return null;
  }
}

async function readFromSettings(): Promise<HeroData | null> {
  if (skipDb) return null;
  try {
    const rows = (await sql`
      SELECT value_content
      FROM settings
      WHERE key_name = ${SETTINGS_KEY}
      LIMIT 1
    `) as Array<{ value_content?: string | null }>;
    const value = rows[0]?.value_content;
    if (!value || typeof value !== "string") return null;
    const parsed = JSON.parse(value) as Partial<HeroData>;
    return normalizeHero(parsed);
  } catch {
    return null;
  }
}

async function loadHero(): Promise<HeroData> {
  const fromSettings = await readFromSettings();
  if (fromSettings) return fromSettings;
  const fromFile = await readFromFile();
  if (fromFile) {
    await writeToSettings(fromFile).catch(() => null);
    return fromFile;
  }
  return fallbackHero;
}

async function writeToSettings(payload: HeroData): Promise<boolean> {
  if (skipDb) return false;
  try {
    const value = JSON.stringify(payload);
    await sql`
      INSERT INTO settings (key_name, value_content, last_updated)
      VALUES (${SETTINGS_KEY}, ${value}, NOW())
      ON DUPLICATE KEY UPDATE
        value_content = ${value},
        last_updated = NOW()
    `;
    return true;
  } catch {
    return false;
  }
}

async function writeToFile(payload: HeroData): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(payload, null, 2),
      "utf-8"
    );
    return true;
  } catch {
    return false;
  }
}

async function persistHero(payload: HeroData): Promise<boolean> {
  const stored = await writeToSettings(payload);
  if (stored) return true;
  return writeToFile(payload);
}

async function uploadHeroImage(buffer: Buffer, uploadDir: string) {
  if (hasBlobToken) {
    const avifBuffer = await sharp(buffer)
      .resize({ width: 2000, withoutEnlargement: true })
      .avif({ quality: 60 })
      .toBuffer();
    const filename = `photo-gallery-hero-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.avif`;
    const { url } = await put(`photoGallery/${filename}`, avifBuffer, {
      access: "public",
      contentType: "image/avif",
    });
    return url;
  }

  return saveAvifImage({
    buffer,
    targetDir: uploadDir,
    filename: "photo-gallery-hero.avif",
    publicPathPrefix: "/uploads/photoGallery",
    quality: 60,
    resize: { width: 2000 },
  });
}

export async function GET() {
  try {
    const hero = await loadHero();
    return NextResponse.json(hero);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to load hero content",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titleRaw = formData.get("title");
    if (typeof titleRaw !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const current = await loadHero();
    let imageUrl = current.imageUrl || "";
    const imageFile = formData.get("image") as File | null;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "photoGallery");

    if (imageFile && imageFile.size > 0) {
      if (isServerless && !hasBlobToken) {
        return NextResponse.json(
          { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
          { status: 500 }
        );
      }
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadHeroImage(buffer, uploadDir);

      if (hasBlobToken) {
        if (
          current.imageUrl &&
          isRemoteUrl(current.imageUrl) &&
          current.imageUrl !== imageUrl
        ) {
          await del(current.imageUrl).catch(() => null);
        }
      } else {
        await keepOnlyFiles(uploadDir, ["photo-gallery-hero.avif"]);
      }
    }

    const payload: HeroData = {
      title: titleRaw,
      imageUrl,
    };

    const stored = await persistHero(payload);
    if (!stored) {
      return NextResponse.json({ error: "Failed to save hero content" }, { status: 500 });
    }

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to save hero content",
      },
      { status: 500 }
    );
  }
}
