import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const imageId = Number(id);

  if (!imageId) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const rows = await sql`
    SELECT value_content
    FROM settings
    WHERE id = ${imageId}
    LIMIT 1
  `;

  if (!rows.length) {
    return NextResponse.json(
      { error: "Image not found" },
      { status: 404 }
    );
  }

  const filePath = rows[0].value_content;
  if (filePath && /^https?:\/\//i.test(filePath)) {
    await del(filePath).catch(() => null);
  }

  await sql`
    DELETE FROM settings WHERE id = ${imageId}
  `;

  return NextResponse.json({ success: true });
}
