import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { keepOnlyFiles, sanitizeFilenameBase, saveAvifImage } from "@/lib/image";
import { sql } from "@/lib/db2";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

type BeforeAfterStyle = {
  id: string;
  name: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
};

type BeforeAfterData = {
  styles: BeforeAfterStyle[];
};

const dataFilePath = path.join(
  process.cwd(),
  "data",
  "photoGallery",
  "photoGalleryBeforeAfter.json"
);

type SettingRow = {
  value_content?: string | null;
};

const SETTINGS_KEY = "photo_gallery_before_after";

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
);

const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const skipDb = process.env.SKIP_DB === "1";

function normalizeStyle(input: Partial<BeforeAfterStyle>, index: number): BeforeAfterStyle {
  const id =
    typeof input.id === "string" && input.id.trim().length > 0
      ? input.id
      : `style-${index + 1}`;
  return {
    id,
    name: typeof input.name === "string" && input.name.trim().length > 0 ? input.name : `Style ${index + 1}`,
    description: typeof input.description === "string" ? input.description : "",
    beforeImageUrl: typeof input.beforeImageUrl === "string" ? input.beforeImageUrl : "",
    afterImageUrl: typeof input.afterImageUrl === "string" ? input.afterImageUrl : "",
  };
}

function normalizeData(
  input: Partial<BeforeAfterData> & {
    beforeImageUrl?: string;
    afterImageUrl?: string;
  }
): BeforeAfterData {
  if (Array.isArray(input.styles)) {
    return {
      styles: input.styles.map((style, index) => normalizeStyle(style, index)),
    };
  }
  if (input.beforeImageUrl || input.afterImageUrl) {
    return {
      styles: [
        normalizeStyle(
          {
            id: "default",
            name: "Style 1",
            beforeImageUrl: input.beforeImageUrl || "",
            afterImageUrl: input.afterImageUrl || "",
          },
          0
        ),
      ],
    };
  }
  return { styles: [] };
}

async function readDataFromFile(): Promise<BeforeAfterData> {
  try {
    const data = await fs.readFile(dataFilePath, "utf-8");
    const json = JSON.parse(data) as Partial<BeforeAfterData> & {
      beforeImageUrl?: string;
      afterImageUrl?: string;
    };
    return normalizeData(json);
  } catch {
    return { styles: [] };
  }
}

async function readDataFromSettings(): Promise<BeforeAfterData | null> {
  if (skipDb) return null;
  try {
    const rows = (await sql`
      SELECT value_content
      FROM settings
      WHERE key_name = ${SETTINGS_KEY}
      LIMIT 1
    `) as SettingRow[];
    const value = rows[0]?.value_content;
    if (!value || typeof value !== "string") return null;
    const json = JSON.parse(value) as Partial<BeforeAfterData> & {
      beforeImageUrl?: string;
      afterImageUrl?: string;
    };
    return normalizeData(json);
  } catch {
    return null;
  }
}

async function readData(): Promise<BeforeAfterData> {
  const fromSettings = await readDataFromSettings();
  if (fromSettings) return fromSettings;
  return readDataFromFile();
}

async function writeDataToSettings(payload: BeforeAfterData): Promise<boolean> {
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

async function writeDataToFile(payload: BeforeAfterData): Promise<boolean> {
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

async function persistData(payload: BeforeAfterData): Promise<boolean> {
  const stored = await writeDataToSettings(payload);
  if (stored) return true;
  return writeDataToFile(payload);
}

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function collectUrls(styles: BeforeAfterStyle[]) {
  return styles
    .flatMap((style) => [style.beforeImageUrl, style.afterImageUrl])
    .filter((url): url is string => typeof url === "string" && url.length > 0);
}

async function cleanupRemote(previous: BeforeAfterStyle[], next: BeforeAfterStyle[]) {
  if (!hasBlobToken) return;
  const previousUrls = new Set(collectUrls(previous).filter(isRemoteUrl));
  const nextUrls = new Set(collectUrls(next).filter(isRemoteUrl));
  const toDelete = [...previousUrls].filter((url) => !nextUrls.has(url));
  await Promise.all(toDelete.map((url) => del(url).catch(() => null)));
}

function buildFilename(prefix: "before" | "after", safeId: string) {
  if (hasBlobToken) {
    return `${prefix}-${safeId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.avif`;
  }
  return `${prefix}-${safeId}.avif`;
}

async function saveBeforeAfterImage(
  buffer: Buffer,
  filename: string,
  uploadDir: string
): Promise<string> {
  if (hasBlobToken) {
    const avifBuffer = await sharp(buffer)
      .resize({ width: 2000, withoutEnlargement: true })
      .avif({ quality: 60 })
      .toBuffer();
    const { url } = await put(`photoGalleryBeforeAfter/${filename}`, avifBuffer, {
      access: "public",
      contentType: "image/avif",
    });
    return url;
  }

  return saveAvifImage({
    buffer,
    targetDir: uploadDir,
    filename,
    publicPathPrefix: "/uploads/photoGalleryBeforeAfter",
    quality: 60,
    resize: { width: 2000 },
  });
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to load before/after content",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const uploadDir = path.join(process.cwd(), "public", "uploads", "photoGalleryBeforeAfter");
    const action = formData.get("action");
    const current = await readData();

    if (action === "style") {
      const styleRaw = formData.get("style");
      if (typeof styleRaw !== "string") {
        return NextResponse.json({ error: "Missing style payload" }, { status: 400 });
      }
      let incoming: Partial<BeforeAfterStyle>;
      try {
        incoming = JSON.parse(styleRaw) as Partial<BeforeAfterStyle>;
      } catch {
        return NextResponse.json({ error: "Invalid style payload" }, { status: 400 });
      }

      const normalizedIncoming = normalizeStyle(incoming, 0);
      const existingIndex = current.styles.findIndex(
        (style) => style.id === normalizedIncoming.id
      );
      const baseStyle = existingIndex >= 0 ? current.styles[existingIndex] : normalizedIncoming;

      const safeId = sanitizeFilenameBase(normalizedIncoming.id);
      const beforeFile = formData.get("beforeImage") as File | null;
      const afterFile = formData.get("afterImage") as File | null;

      let beforeImageUrl = baseStyle.beforeImageUrl || "";
      let afterImageUrl = baseStyle.afterImageUrl || "";

      if (beforeFile && beforeFile.size > 0) {
        if (isServerless && !hasBlobToken) {
          return NextResponse.json(
            { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
            { status: 500 }
          );
        }
        const buffer = Buffer.from(await beforeFile.arrayBuffer());
        beforeImageUrl = await saveBeforeAfterImage(
          buffer,
          buildFilename("before", safeId),
          uploadDir
        );
      }

      if (afterFile && afterFile.size > 0) {
        if (isServerless && !hasBlobToken) {
          return NextResponse.json(
            { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
            { status: 500 }
          );
        }
        const buffer = Buffer.from(await afterFile.arrayBuffer());
        afterImageUrl = await saveBeforeAfterImage(
          buffer,
          buildFilename("after", safeId),
          uploadDir
        );
      }

      const updatedStyle: BeforeAfterStyle = {
        id: normalizedIncoming.id,
        name: normalizedIncoming.name,
        description: normalizedIncoming.description,
        beforeImageUrl,
        afterImageUrl,
      };

      const mergedStyles = [...current.styles];
      if (existingIndex >= 0) {
        mergedStyles[existingIndex] = updatedStyle;
      } else {
        mergedStyles.push(updatedStyle);
      }

      const allowedNames = mergedStyles
        .flatMap((style) => [style.beforeImageUrl, style.afterImageUrl])
        .filter(
          (url) =>
            typeof url === "string" && url.includes("/uploads/photoGalleryBeforeAfter/")
        )
        .map((url) => path.posix.basename(url));

      if (hasBlobToken) {
        await cleanupRemote(current.styles, mergedStyles);
      } else {
        await keepOnlyFiles(uploadDir, allowedNames);
      }

      const payload = { styles: mergedStyles };
      const stored = await persistData(payload);
      if (!stored) {
        return NextResponse.json(
          { error: "Failed to save before/after content" },
          { status: 500 }
        );
      }
      return NextResponse.json(payload);
    }

    const stylesRaw = formData.get("styles");
    if (typeof stylesRaw !== "string") {
      return NextResponse.json({ error: "Missing styles payload" }, { status: 400 });
    }
    let stylesInput: Partial<BeforeAfterStyle>[] = [];
    try {
      stylesInput = JSON.parse(stylesRaw) as Partial<BeforeAfterStyle>[];
    } catch {
      return NextResponse.json({ error: "Invalid styles payload" }, { status: 400 });
    }

    const styles = stylesInput.map((style, index) => normalizeStyle(style, index));
    const updatedStyles: BeforeAfterStyle[] = [];

    for (const style of styles) {
      const safeId = sanitizeFilenameBase(style.id);
      const beforeFile = formData.get(`beforeImage_${style.id}`) as File | null;
      const afterFile = formData.get(`afterImage_${style.id}`) as File | null;
      let beforeImageUrl = style.beforeImageUrl || "";
      let afterImageUrl = style.afterImageUrl || "";

      if (beforeFile && beforeFile.size > 0) {
        if (isServerless && !hasBlobToken) {
          return NextResponse.json(
            { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
            { status: 500 }
          );
        }
        const buffer = Buffer.from(await beforeFile.arrayBuffer());
        beforeImageUrl = await saveBeforeAfterImage(
          buffer,
          buildFilename("before", safeId),
          uploadDir
        );
      }

      if (afterFile && afterFile.size > 0) {
        if (isServerless && !hasBlobToken) {
          return NextResponse.json(
            { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
            { status: 500 }
          );
        }
        const buffer = Buffer.from(await afterFile.arrayBuffer());
        afterImageUrl = await saveBeforeAfterImage(
          buffer,
          buildFilename("after", safeId),
          uploadDir
        );
      }

      updatedStyles.push({
        id: style.id,
        name: style.name,
        description: style.description,
        beforeImageUrl,
        afterImageUrl,
      });
    }

    const allowedNames = updatedStyles
      .flatMap((style) => [style.beforeImageUrl, style.afterImageUrl])
      .filter(
        (url) =>
          typeof url === "string" && url.includes("/uploads/photoGalleryBeforeAfter/")
      )
      .map((url) => path.posix.basename(url));

    if (hasBlobToken) {
      await cleanupRemote(current.styles, updatedStyles);
    } else {
      await keepOnlyFiles(uploadDir, allowedNames);
    }

    const payload = { styles: updatedStyles };
    const stored = await persistData(payload);
    if (!stored) {
      return NextResponse.json(
        { error: "Failed to save before/after content" },
        { status: 500 }
      );
    }
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to save before/after content",
      },
      { status: 500 }
    );
  }
}
