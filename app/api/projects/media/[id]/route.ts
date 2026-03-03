export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { sql } from "@/lib/db2";
import { del } from "@vercel/blob";

const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

type MediaRow = {
  file_path: string;
};

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function normalizeLocalPath(value: string) {
  return value.replace(/^\/+/, "");
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rows = (await sql`
      SELECT file_path FROM project_media WHERE id = ${id} LIMIT 1
    `) as MediaRow[];

    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const filePath = rows[0].file_path;

    if (filePath && isRemoteUrl(filePath)) {
      if (hasBlobToken) {
        await del(filePath).catch(() => null);
      }
    } else if (filePath) {
      const absolutePath = path.join(
        process.cwd(),
        "public",
        normalizeLocalPath(filePath)
      );
      await fs.unlink(absolutePath).catch(() => null);
    }

    await sql`
      DELETE FROM project_media WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE IMAGE ERROR:", err);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
