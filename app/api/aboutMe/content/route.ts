import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const CONTENT_TITLE_KEY = "about_me_title";
const CONTENT_BODY_KEY = "about_me_content";
const contentFilePath = path.join(
  process.cwd(),
  "data",
  "aboutMe",
  "aboutMeContent.json"
);

type AboutMeContent = {
  title: string;
  content: string;
};

const fallbackContent: AboutMeContent = {
  title: "About Me",
  content: "Write something about yourself.",
};

async function readContentFromFile(): Promise<AboutMeContent | null> {
  try {
    const raw = await fs.readFile(contentFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AboutMeContent>;
    return {
      title:
        typeof parsed.title === "string" ? parsed.title : fallbackContent.title,
      content:
        typeof parsed.content === "string"
          ? parsed.content
          : fallbackContent.content,
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

async function loadContent(): Promise<AboutMeContent> {
  const [title, content] = await Promise.all([
    getSettingValue(CONTENT_TITLE_KEY),
    getSettingValue(CONTENT_BODY_KEY),
  ]);

  if (title !== null || content !== null) {
    return {
      title: title ?? fallbackContent.title,
      content: content ?? fallbackContent.content,
    };
  }

  const fromFile = await readContentFromFile();
  if (fromFile) {
    await Promise.all([
      setSettingValue(CONTENT_TITLE_KEY, fromFile.title),
      setSettingValue(CONTENT_BODY_KEY, fromFile.content),
    ]).catch(() => null);
    return fromFile;
  }

  return fallbackContent;
}

export async function GET() {
  try {
    const data = await loadContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to read About Me content", error);
    return NextResponse.json(
      { error: "Unable to load About Me content" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();
    if (typeof title !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    await Promise.all([
      setSettingValue(CONTENT_TITLE_KEY, title),
      setSettingValue(CONTENT_BODY_KEY, content),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save About Me content", error);
    return NextResponse.json(
      { error: "Unable to save About Me content" },
      { status: 500 }
    );
  }
}
