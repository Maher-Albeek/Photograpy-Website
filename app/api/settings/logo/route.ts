import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";

type LogoRow = {
  logo?: string | null;
};

export async function GET() {
  const rows = (await sql`
    SELECT value_content AS logo
    FROM settings
    WHERE key_name = 'site_logo'
    LIMIT 1
  `) as LogoRow[];

  return NextResponse.json(rows.length ? rows[0] : {});
}
