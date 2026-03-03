/* # POST (create) */
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";
import type { ResultSetHeader } from "mysql2";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category_id } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const result = (await sql`
      INSERT INTO projects (title, description, category_id)
      VALUES (${title}, ${description || null}, ${category_id})
    `) as ResultSetHeader;

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    return NextResponse.json(
      { error: "Create failed" },
      { status: 500 }
    );
  }
}
