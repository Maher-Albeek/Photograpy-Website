export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import fs from "fs/promises";
import path from "path";
import { del } from "@vercel/blob";

const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function normalizeLocalPath(value: string) {
  return value.replace(/^\/+/, "");
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { title, description, category_id } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    await sql`
      UPDATE projects
      SET title = ${title},
          description = ${description || null},
          category_id = ${category_id}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const images = (await sql`
      SELECT file_path
      FROM project_media
      WHERE project_id = ${id}
    `) as Array<{ file_path: string }>;

    for (const img of images) {
      const filePath = img.file_path;
      if (!filePath) continue;

      if (isRemoteUrl(filePath)) {
        if (hasBlobToken) {
          await del(filePath).catch(() => null);
        }
        continue;
      }

      const fullPath = path.join(
        process.cwd(),
        "public",
        normalizeLocalPath(filePath)
      );

      try {
        await fs.unlink(fullPath);
      } catch {
        // ignore
      }
    }

    await sql`
      DELETE FROM project_media WHERE project_id = ${id}
    `;

    await sql`
      DELETE FROM projects WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
