import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await sql`
    SELECT name FROM categories ORDER BY name
  `

  return NextResponse.json(rows)
}
export async function POST(req: Request) {
  const { name, slug } = await req.json();

  await sql`
    INSERT INTO categories (name, slug)
    VALUES (${name}, ${slug})
  `;

  return NextResponse.json({ success: true });
}
