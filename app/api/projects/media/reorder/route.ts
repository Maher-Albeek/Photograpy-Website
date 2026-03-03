export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order: { id: number; sort_order: number }[] = body.order;

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Update media order
    for (const item of order) {
      await sql`
        UPDATE project_media
        SET sort_order = ${item.sort_order}
        WHERE id = ${item.id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("REORDER ERROR:", err);
    return NextResponse.json(
      { error: "Reorder failed" },
      { status: 500 }
    );
  }
}
