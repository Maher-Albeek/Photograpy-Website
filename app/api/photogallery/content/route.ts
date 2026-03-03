import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { keepOnlyFiles, sanitizeFilenameBase, saveAvifImage } from "@/lib/image";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

type PhotoAlbum = {
  name?: string;
  date?: string;
  description?: string;
  photos?: string[];
  coverPhoto?: string;
};

type PhotoGalleryContent = {
  title: string;
  description: string;
  albums: PhotoAlbum[];
};

const SETTINGS_KEY = "photo_gallery_content";
const dataFilePath = path.join(
  process.cwd(),
  "data",
  "photoGallery",
  "photoGalleryContent.json"
);

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
);
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const skipDb = process.env.SKIP_DB === "1";

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function collectAlbumUrls(albums: PhotoAlbum[]) {
  return albums
    .flatMap((album) => {
      const photos = Array.isArray(album.photos) ? album.photos : [];
      const cover = typeof album.coverPhoto === "string" ? album.coverPhoto : "";
      return cover ? [...photos, cover] : photos;
    })
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}

function collectLocalFilenames(albums: PhotoAlbum[]) {
  return collectAlbumUrls(albums)
    .filter((url) => url.includes("/uploads/photoGalleryContent/"))
    .map((url) => path.posix.basename(url));
}

async function cleanupRemote(previous: PhotoAlbum[], next: PhotoAlbum[]) {
  if (!hasBlobToken) return;
  const previousUrls = new Set(collectAlbumUrls(previous).filter(isRemoteUrl));
  const nextUrls = new Set(collectAlbumUrls(next).filter(isRemoteUrl));
  const toDelete = [...previousUrls].filter((url) => !nextUrls.has(url));
  await Promise.all(toDelete.map((url) => del(url).catch(() => null)));
}

async function cleanupLocal(albums: PhotoAlbum[], uploadDir: string) {
  const allowedNames = collectLocalFilenames(albums);
  await keepOnlyFiles(uploadDir, allowedNames);
}

function normalizeContent(input: Partial<PhotoGalleryContent> | null): PhotoGalleryContent {
  const safe = input ?? {};
  return {
    title: typeof safe.title === "string" ? safe.title : "",
    description: typeof safe.description === "string" ? safe.description : "",
    albums: Array.isArray(safe.albums)
      ? safe.albums.map((album) => ({
          name: typeof album?.name === "string" ? album.name : "",
          date: typeof album?.date === "string" ? album.date : "",
          description: typeof album?.description === "string" ? album.description : "",
          photos: Array.isArray(album?.photos) ? album.photos : [],
          coverPhoto: typeof album?.coverPhoto === "string" ? album.coverPhoto : "",
        }))
      : [],
  };
}

async function readFromFile(): Promise<PhotoGalleryContent | null> {
  try {
    const raw = await fs.readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PhotoGalleryContent>;
    return normalizeContent(parsed);
  } catch {
    return null;
  }
}

async function readFromSettings(): Promise<PhotoGalleryContent | null> {
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
    const parsed = JSON.parse(value) as Partial<PhotoGalleryContent>;
    return normalizeContent(parsed);
  } catch {
    return null;
  }
}

async function loadContent(): Promise<PhotoGalleryContent> {
  const fromSettings = await readFromSettings();
  if (fromSettings) return fromSettings;
  const fromFile = await readFromFile();
  if (fromFile) {
    await writeToSettings(fromFile).catch(() => null);
    return fromFile;
  }
  return { title: "", description: "", albums: [] };
}

async function writeToSettings(payload: PhotoGalleryContent): Promise<boolean> {
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

async function writeToFile(payload: PhotoGalleryContent): Promise<boolean> {
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

async function persistContent(payload: PhotoGalleryContent): Promise<boolean> {
  const stored = await writeToSettings(payload);
  if (stored) return true;
  return writeToFile(payload);
}

async function saveGalleryImage(buffer: Buffer, filename: string, uploadDir: string) {
  if (hasBlobToken) {
    const avifBuffer = await sharp(buffer)
      .resize({ width: 2400, withoutEnlargement: true })
      .avif({ quality: 60 })
      .toBuffer();
    const { url } = await put(`photoGalleryContent/${filename}`, avifBuffer, {
      access: "public",
      contentType: "image/avif",
    });
    return url;
  }

  if (!hasBlobToken) {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  return saveAvifImage({
    buffer,
    targetDir: uploadDir,
    filename,
    publicPathPrefix: "/uploads/photoGalleryContent",
    quality: 60,
    resize: { width: 2400 },
  });
}

function hasUploads(files: (File | null)[]) {
  return files.some((file) => file && file.size > 0);
}

export async function GET() {
  try {
    const content = await loadContent();
    return NextResponse.json(content);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to load gallery content",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = (formData.get("action") as string) || "full";
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "photoGalleryContent"
    );

    const existingContent = await loadContent();

    if (action === "meta") {
      const contentData: PhotoGalleryContent = {
        ...existingContent,
        title,
        description,
      };
      if (hasBlobToken) {
        await cleanupRemote(existingContent.albums || [], contentData.albums);
      } else {
        await cleanupLocal(contentData.albums, uploadDir);
      }
      const stored = await persistContent(contentData);
      if (!stored) {
        return NextResponse.json({ error: "Failed to save gallery content" }, { status: 500 });
      }
      return NextResponse.json(contentData);
    }

    if (action === "album") {
      const albumIndexRaw = formData.get("albumIndex");
      const albumIndex =
        typeof albumIndexRaw === "string" ? Number.parseInt(albumIndexRaw, 10) : 0;
      const albumRaw = (formData.get("album") as string) || "{}";
      let albumMeta: PhotoAlbum = {};
      try {
        albumMeta = JSON.parse(albumRaw) as PhotoAlbum;
      } catch {
        return NextResponse.json({ error: "Invalid album payload" }, { status: 400 });
      }

      const imageFiles = formData.getAll("albumUploads") as (File | null)[];
      if (hasUploads(imageFiles) && isServerless && !hasBlobToken) {
        return NextResponse.json(
          { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
          { status: 500 }
        );
      }

      const newPhotos: string[] = [];
      for (const imageFile of imageFiles) {
        if (imageFile && imageFile.size > 0) {
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const safeBase = sanitizeFilenameBase(imageFile.name || "gallery-image");
          const filename = `${Date.now()}-${safeBase}.avif`;
          const imageUrl = await saveGalleryImage(buffer, filename, uploadDir);
          newPhotos.push(imageUrl);
        }
      }

      const nextAlbums = Array.isArray(existingContent.albums)
        ? [...existingContent.albums]
        : [];
      const safeIndex = Number.isFinite(albumIndex) && albumIndex >= 0 ? albumIndex : 0;
      const currentAlbum = nextAlbums[safeIndex] || {};
      const basePhotos = Array.isArray(albumMeta.photos)
        ? albumMeta.photos
        : Array.isArray(currentAlbum.photos)
          ? currentAlbum.photos
          : [];
      const mergedAlbum: PhotoAlbum = {
        name: albumMeta.name ?? currentAlbum.name ?? "",
        date: albumMeta.date ?? currentAlbum.date ?? "",
        description: albumMeta.description ?? currentAlbum.description ?? "",
        photos: [...basePhotos, ...newPhotos],
        coverPhoto: albumMeta.coverPhoto ?? currentAlbum.coverPhoto ?? "",
      };

      if (safeIndex >= nextAlbums.length) {
        nextAlbums.push(mergedAlbum);
      } else {
        nextAlbums[safeIndex] = mergedAlbum;
      }

      const contentData: PhotoGalleryContent = {
        title: existingContent.title || "",
        description: existingContent.description || "",
        albums: nextAlbums,
      };

      const stored = await persistContent(contentData);
      if (!stored) {
        return NextResponse.json({ error: "Failed to save gallery content" }, { status: 500 });
      }
      return NextResponse.json(contentData);
    }

    const albumsRaw = (formData.get("albums") as string) || "[]";
    let albumsMeta: PhotoAlbum[] = [];
    try {
      albumsMeta = JSON.parse(albumsRaw) as PhotoAlbum[];
    } catch {
      return NextResponse.json({ error: "Invalid albums payload" }, { status: 400 });
    }

    if (isServerless && !hasBlobToken) {
      let hasAnyUpload = false;
      for (let index = 0; index < albumsMeta.length; index += 1) {
        const imageFiles = formData.getAll(`albumUploads_${index}`) as (File | null)[];
        if (hasUploads(imageFiles)) {
          hasAnyUpload = true;
          break;
        }
      }
      if (hasAnyUpload) {
        return NextResponse.json(
          { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
          { status: 500 }
        );
      }
    }

    const albums: PhotoAlbum[] = [];
    for (let index = 0; index < albumsMeta.length; index += 1) {
      const album = albumsMeta[index];
      const existingPhotos = Array.isArray(album.photos) ? album.photos : [];
      const uploadKey = `albumUploads_${index}`;
      const imageFiles = formData.getAll(uploadKey) as (File | null)[];
      const newPhotos: string[] = [];

      for (const imageFile of imageFiles) {
        if (imageFile && imageFile.size > 0) {
          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const safeBase = sanitizeFilenameBase(imageFile.name || "gallery-image");
          const filename = `${Date.now()}-${safeBase}.avif`;
          const imageUrl = await saveGalleryImage(buffer, filename, uploadDir);
          newPhotos.push(imageUrl);
        }
      }

      albums.push({
        name: album.name || "",
        date: album.date || "",
        description: album.description || "",
        photos: [...existingPhotos, ...newPhotos],
        coverPhoto: album.coverPhoto || "",
      });
    }

    const contentData: PhotoGalleryContent = {
      title,
      description,
      albums,
    };
    if (hasBlobToken) {
      await cleanupRemote(existingContent.albums || [], contentData.albums);
    } else {
      await cleanupLocal(contentData.albums, uploadDir);
    }
    const stored = await persistContent(contentData);
    if (!stored) {
      return NextResponse.json({ error: "Failed to save gallery content" }, { status: 500 });
    }
    return NextResponse.json(contentData);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to save gallery content",
      },
      { status: 500 }
    );
  }
}
