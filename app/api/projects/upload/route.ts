import { NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import { sql } from "@/lib/db2";
import { saveAvifImage } from "@/lib/image";
import { put } from "@vercel/blob";
import sharp from "sharp";

export const runtime = "nodejs";

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
);
const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;

  if (!file || !projectId) {
    return NextResponse.json(
      { error: "Missing file or project_id" },
      { status: 400 }
    );
  }

  if (isServerless && !hasBlobToken) {
    return NextResponse.json(
      { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const filename = crypto.randomBytes(16).toString("hex") + ".avif";
  let dbPath = "";

  if (hasBlobToken) {
    const avifBuffer = await sharp(buffer)
      .resize({ width: 2400, withoutEnlargement: true })
      .avif({ quality: 55 })
      .toBuffer();
    const { url } = await put(`projects/${filename}`, avifBuffer, {
      access: "public",
      contentType: "image/avif",
    });
    dbPath = url;
  } else {
    const uploadDir = path.join(
      process.cwd(),
      "public/uploads/projects"
    );

    const publicPath = await saveAvifImage({
      buffer,
      targetDir: uploadDir,
      filename,
      publicPathPrefix: "/uploads/projects",
      quality: 55,
      resize: { width: 2400 },
    });
    dbPath = publicPath.replace(/^\/+/, "");
  }

  await sql`
    INSERT INTO project_media
      (project_id, media_type, file_path)
    VALUES (${projectId}, 'image', ${dbPath})
  `;

  return NextResponse.json({ success: true });
}
