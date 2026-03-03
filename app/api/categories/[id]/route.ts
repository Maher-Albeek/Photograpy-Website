import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { name, slug } = await req.json();

  await sql`
    UPDATE categories
    SET name = ${name}, slug = ${slug}
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Do not delete categories used by projects.
  const rows = await sql`
    SELECT COUNT(*) as cnt
    FROM projects
    WHERE category_id = ${id}
  `;

  if (rows[0].cnt > 0) {
    return NextResponse.json(
      { error: "Category has projects" },
      { status: 400 }
    );
  }

  await sql`
    DELETE FROM categories WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}
