import { NextResponse } from "next/server";
import { db } from "@/lib/db2";

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 100_000;

function jsonSafe(value: unknown) {
  return JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === "bigint" ? item.toString() : item
    )
  );
}

function getCookieValue(
  cookieHeader: string | null,
  name: string
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const session = getCookieValue(
      req.headers.get("cookie"),
      "admin_session"
    );
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: { query?: string };
    try {
      body = (await req.json()) as { query?: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: "Query is too long" },
        { status: 400 }
      );
    }

    const [rows, fields] = await db.query(query);
    const safeRows = jsonSafe(rows);
    const isRowsArray = Array.isArray(safeRows);

    const columns = isRowsArray
      ? safeRows.length > 0
        ? Object.keys(
            safeRows[0] as Record<string, unknown>
          )
        : Array.isArray(fields)
          ? fields.map((field) => field.name)
          : []
      : [];

    return NextResponse.json({
      ok: true,
      rows: isRowsArray ? safeRows : [],
      columns,
      meta: isRowsArray ? null : safeRows,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Query failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
