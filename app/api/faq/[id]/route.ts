import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await sql`
    DELETE FROM faq WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  const question = body.question?.toString().trim() ?? null;
  const answer = body.answer?.toString().trim() ?? null;
  const sortOrder = body.sort_order ?? 0;

  await sql`
    UPDATE faq
    SET question = ${question}, answer = ${answer}, sort_order = ${sortOrder}
    WHERE id = ${id}
    `;

  return NextResponse.json({ success: true });
}
