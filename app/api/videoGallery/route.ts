import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { keepOnlyFiles, saveAvifImage } from "@/lib/image";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

const SETTINGS_KEY = "video_gallery_content";
const contentFilePath = path.join(process.cwd(), "data", "videoGallery", "videoGallery.json");
const uploadsDir = path.join(process.cwd(), "public", "videoGallery", "videoGalleryPage");

type VideoSource = "bunny" | "youtube" | "vimeo" | "embed";

type VideoItem = {
  source: VideoSource;
  title?: string;
  libraryId?: string;
  videoId?: string;
  url?: string;
};

type VideoGalleryContent = {
  title: string;
  content: string;
  imageUrl: string;
  videos: VideoItem[];
};

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
);
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const skipDb = process.env.SKIP_DB === "1";

function normalizeString(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function sanitizeVideos(items: unknown): VideoItem[] {
  if (!Array.isArray(items)) return [];
  const result: VideoItem[] = [];
  for (const item of items) {
    const source = normalizeString((item as any)?.source) as VideoSource;
    const title = normalizeString((item as any)?.title);
    if (source === "bunny") {
      const libraryId = normalizeString((item as any)?.libraryId);
      const videoId = normalizeString((item as any)?.videoId);
      if (libraryId && videoId) {
        result.push({ source, title, libraryId, videoId });
      }
      continue;
    }
    if (source === "youtube" || source === "vimeo") {
      const videoId = normalizeString((item as any)?.videoId);
      if (videoId) {
        result.push({ source, title, videoId });
      }
      continue;
    }
    if (source === "embed") {
      const url = normalizeString((item as any)?.url);
      if (url) {
        result.push({ source, title, url });
      }
    }
  }
  return result;
}

function normalizeContent(input: Partial<VideoGalleryContent> | null): VideoGalleryContent {
  const safe = input ?? {};
  const fromVideos = sanitizeVideos(safe.videos);
  const fromLegacy = Array.isArray((safe as any).videoUrls)
    ? (safe as any).videoUrls.map((video: any) => ({
        source: "embed" as VideoSource,
        title: typeof video?.title === "string" ? video.title : "",
        url: typeof video?.url === "string" ? video.url : "",
      }))
    : [];

  return {
    title: typeof safe.title === "string" ? safe.title : "Video Gallery",
    content: typeof safe.content === "string" ? safe.content : "Add your video gallery description here.",
    imageUrl: typeof safe.imageUrl === "string" ? safe.imageUrl : "/videoGallery/default.jpg",
    videos: fromVideos.length ? fromVideos : sanitizeVideos(fromLegacy),
  };
}

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

async function readFromFile(): Promise<VideoGalleryContent | null> {
  try {
    const raw = await fs.readFile(contentFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<VideoGalleryContent>;
    return normalizeContent(parsed);
  } catch {
    return null;
  }
}

async function readFromSettings(): Promise<VideoGalleryContent | null> {
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
    const parsed = JSON.parse(value) as Partial<VideoGalleryContent>;
    return normalizeContent(parsed);
  } catch {
    return null;
  }
}

async function loadContent(): Promise<VideoGalleryContent> {
  const fromSettings = await readFromSettings();
  if (fromSettings) return fromSettings;
  const fromFile = await readFromFile();
  if (fromFile) {
    await writeToSettings(fromFile).catch(() => null);
    return fromFile;
  }
  return normalizeContent(null);
}

async function writeToSettings(payload: VideoGalleryContent): Promise<boolean> {
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

async function writeToFile(payload: VideoGalleryContent): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(contentFilePath), { recursive: true });
    await fs.writeFile(contentFilePath, JSON.stringify(payload, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function persistContent(payload: VideoGalleryContent): Promise<boolean> {
  const stored = await writeToSettings(payload);
  if (stored) return true;
  return writeToFile(payload);
}

async function saveHeroImage(buffer: Buffer) {
  if (hasBlobToken) {
    const avifBuffer = await sharp(buffer)
      .resize({ width: 2000, withoutEnlargement: true })
      .avif({ quality: 60 })
      .toBuffer();
    const filename = `video-gallery-hero-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.avif`;
    const { url } = await put(`videoGallery/${filename}`, avifBuffer, {
      access: "public",
      contentType: "image/avif",
    });
    return url;
  }

  const imageUrl = await saveAvifImage({
    buffer,
    targetDir: uploadsDir,
    filename: "video-gallery-hero.avif",
    publicPathPrefix: "/videoGallery/videoGalleryPage",
    quality: 60,
    resize: { width: 2000 },
  });
  await keepOnlyFiles(uploadsDir, ["video-gallery-hero.avif"]);
  return imageUrl;
}

export async function GET() {
  const content = await loadContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get("title")?.toString() || "Video Gallery";
  const content = formData.get("content")?.toString() || "Add your video gallery description here.";
  const imageUrlInput = formData.get("imageUrl")?.toString() || "";

  const videosPayload = formData.get("videos");
  let videos: VideoItem[] = [];
  if (typeof videosPayload === "string") {
    const trimmed = videosPayload.trim();
    if (trimmed) {
      try {
        videos = sanitizeVideos(JSON.parse(trimmed));
      } catch {
        videos = [];
      }
    }
  } else {
    const videoUrlsRaw = formData.getAll("videoUrls");
    const videoTitlesRaw = formData.getAll("videoTitles");
    const videoUrls: { url: string; title: string }[] = [];
    for (let i = 0; i < videoUrlsRaw.length; i++) {
      const url = videoUrlsRaw[i]?.toString() || "";
      const title = videoTitlesRaw[i]?.toString() || "";
      if (url) {
        videoUrls.push({ url, title });
      }
    }
    videos = sanitizeVideos(
      videoUrls.map((video) => ({
        source: "embed",
        title: video.title,
        url: video.url,
      }))
    );
  }

  const current = await loadContent();
  let imageUrl = imageUrlInput || current.imageUrl || "/videoGallery/default.jpg";

  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    if (isServerless && !hasBlobToken) {
      return NextResponse.json(
        { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
        { status: 500 }
      );
    }
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imageUrl = await saveHeroImage(buffer);

    if (hasBlobToken && current.imageUrl && isRemoteUrl(current.imageUrl) && current.imageUrl !== imageUrl) {
      await del(current.imageUrl).catch(() => null);
    }
  }

  const newContent: VideoGalleryContent = {
    title,
    content,
    imageUrl: imageUrl || "/videoGallery/default.jpg",
    videos,
  };

  const stored = await persistContent(newContent);
  if (!stored) {
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }

  return NextResponse.json(newContent);
}
