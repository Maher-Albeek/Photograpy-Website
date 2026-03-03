import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

type AvifResize = {
  width?: number;
  height?: number;
};

type SaveAvifOptions = {
  buffer: Buffer;
  targetDir: string;
  filename: string;
  publicPathPrefix: string;
  quality?: number;
  resize?: AvifResize;
};

export function sanitizeFilenameBase(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "");
  const safe = base.replace(/[^\w.\-]/g, "_").trim();
  return safe.length ? safe : "image";
}

export async function saveAvifImage({
  buffer,
  targetDir,
  filename,
  publicPathPrefix,
  quality = 60,
  resize,
}: SaveAvifOptions): Promise<string> {
  const safeFilename = filename.toLowerCase().endsWith(".avif")
    ? filename
    : `${filename}.avif`;
  const prefix = publicPathPrefix.replace(/\/+$/, "");

  await fs.mkdir(targetDir, { recursive: true });

  const pipeline = sharp(buffer);
  if (resize && (resize.width || resize.height)) {
    pipeline.resize(resize);
  }

  const avifBuffer = await pipeline.avif({ quality }).toBuffer();
  const outputPath = path.join(targetDir, safeFilename);

  await fs.writeFile(outputPath, avifBuffer);

  return path.posix.join(prefix, safeFilename);
}

export async function keepOnlyFiles(dir: string, allowedNames: string[]) {
  const allowed = new Set(allowedNames);
  const entries = await fs.readdir(dir).catch(() => []);
  await Promise.all(
    entries
      .filter((name) => !allowed.has(name))
      .map((name) => fs.rm(path.join(dir, name)).catch(() => null))
  );
}
