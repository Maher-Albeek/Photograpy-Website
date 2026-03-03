import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const HERO_TITLE_KEY = "about_me_hero_title";
const HERO_IMAGE_KEY = "about_me_hero_image";
const heroFilePath = path.join(process.cwd(), "data", "aboutMe", "hero.json");

type HeroContent = {
  title: string;
  imageUrl: string;
};

const fallbackHero: HeroContent = {
  title: "Welcome to My Portfolio",
  imageUrl: "",
};

async function readHeroFromFile(): Promise<HeroContent | null> {
  try {
    const raw = await fs.readFile(heroFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<HeroContent>;
    return {
      title: typeof parsed.title === "string" ? parsed.title : fallbackHero.title,
      imageUrl:
        typeof parsed.imageUrl === "string" ? parsed.imageUrl : fallbackHero.imageUrl,
    };
  } catch {
    return null;
  }
}

async function getSettingValue(key: string): Promise<string | null> {
  const rows = (await sql`
    SELECT value_content
    FROM settings
    WHERE key_name = ${key}
    ORDER BY id DESC
    LIMIT 1
  `) as Array<{ value_content: string }>;
  return rows[0]?.value_content ?? null;
}

async function setSettingValue(key: string, value: string) {
  const rows = (await sql`
    SELECT id
    FROM settings
    WHERE key_name = ${key}
    LIMIT 1
  `) as Array<{ id: number }>;

  if (rows.length) {
    await sql`
      UPDATE settings
      SET value_content = ${value}, last_updated = NOW()
      WHERE key_name = ${key}
    `;
    return;
  }

  await sql`
    INSERT INTO settings (key_name, value_content, last_updated)
    VALUES (${key}, ${value}, NOW())
  `;
}

async function loadHero(): Promise<HeroContent> {
  const [title, imageUrl] = await Promise.all([
    getSettingValue(HERO_TITLE_KEY),
    getSettingValue(HERO_IMAGE_KEY),
  ]);

  if (title !== null || imageUrl !== null) {
    return {
      title: title ?? fallbackHero.title,
      imageUrl: imageUrl ?? fallbackHero.imageUrl,
    };
  }

  const fromFile = await readHeroFromFile();
  if (fromFile) {
    await Promise.all([
      setSettingValue(HERO_TITLE_KEY, fromFile.title),
      setSettingValue(HERO_IMAGE_KEY, fromFile.imageUrl),
    ]).catch(() => null);
    return fromFile;
  }

  return fallbackHero;
}

async function uploadHeroImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const avifBuffer = await sharp(buffer)
    .resize({ width: 2000, withoutEnlargement: true })
    .avif({ quality: 60 })
    .toBuffer();

  const filename = `about-me-hero-${Date.now()}.avif`;
  const { url } = await put(`aboutMe/${filename}`, avifBuffer, {
    access: "public",
    contentType: "image/avif",
  });

  return url;
}

export async function GET() {
  try {
    const hero = await loadHero();
    return NextResponse.json(hero);
  } catch (error) {
    console.error("Failed to read hero content", error);
    return NextResponse.json(
      { error: "Unable to load hero content" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { title, imageUrl } = await request.json();
      if (typeof title !== "string" || typeof imageUrl !== "string") {
        return NextResponse.json(
          { error: "Invalid payload" },
          { status: 400 }
        );
      }

      const previousImage = await getSettingValue(HERO_IMAGE_KEY);
      await Promise.all([
        setSettingValue(HERO_TITLE_KEY, title),
        setSettingValue(HERO_IMAGE_KEY, imageUrl),
      ]);

      if (
        previousImage &&
        previousImage !== imageUrl &&
        /^https?:\/\//i.test(previousImage)
      ) {
        await del(previousImage).catch(() => null);
      }

      return NextResponse.json({ success: true });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const file = formData.get("image");

    if (typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const currentImage = await getSettingValue(HERO_IMAGE_KEY);
    let imageUrl = currentImage ?? "";

    if (file && typeof file === "object" && "arrayBuffer" in file) {
      imageUrl = await uploadHeroImage(file as File);
      if (currentImage && /^https?:\/\//i.test(currentImage)) {
        await del(currentImage).catch(() => null);
      }
    }

    await Promise.all([
      setSettingValue(HERO_TITLE_KEY, title),
      setSettingValue(HERO_IMAGE_KEY, imageUrl),
    ]);

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Failed to save hero content", error);
    return NextResponse.json(
      { error: "Unable to save hero content" },
      { status: 500 }
    );
  }
}
