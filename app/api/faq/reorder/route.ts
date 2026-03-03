import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";

type Item = {
  id: number;
  sort_order: number;
};

export async function PUT(req: Request) {
  const items: Item[] = await req.json();

  for (const item of items) {
    await sql`
      UPDATE faq
      SET sort_order = ${item.sort_order}
      WHERE id = ${item.id}
    `;
  }

  return NextResponse.json({ success: true });
}
