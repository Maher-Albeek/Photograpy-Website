export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";

type MediaRow = {
  project_id: number;
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get project_id
    const rows = await sql`
      SELECT project_id FROM project_media WHERE id = ${id} LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const projectId = rows[0].project_id;

    // Clear current thumbnail
    await sql`
      UPDATE project_media
      SET is_thumbnail = 0
      WHERE project_id = ${projectId}
    `;

    // Set new thumbnail
    await sql`
      UPDATE project_media
      SET is_thumbnail = 1
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SET THUMBNAIL ERROR:", err);
    return NextResponse.json(
      { error: "Failed to set thumbnail" },
      { status: 500 }
    );
  }
}
