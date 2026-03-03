import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";

export async function GET() {
  const r = await sql`select 1 as ok`;
  return NextResponse.json({ ok: true, r });
}
