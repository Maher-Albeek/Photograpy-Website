import { sql } from "@/lib/db2";
import type { ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messageId = Number(id);

  if (!messageId) {
    return NextResponse.json(
      { error: "Invalid id" },
      { status: 400 }
    );
  }

  const result = (await sql`
    DELETE FROM contact_messages
    WHERE id = ${messageId}
  `) as ResultSetHeader;

  return NextResponse.json({
    success: true,
    deleted: result.affectedRows,
  });
}
