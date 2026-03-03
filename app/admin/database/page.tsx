export const dynamic = "force-dynamic";
export const revalidate = 0;

import SqlConsole from "@/components/admin/SqlConsole";
import { sql } from "@/lib/db2";

type TableRow = Record<string, string | number | null>;

export default async function AdminDatabasePage() {
  const rows = (await sql`SHOW TABLES`) as TableRow[];
  const tables = rows
    .map((row) => String(Object.values(row)[0]))
    .sort((a, b) => a.localeCompare(b));

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Database</h1>
        <p className="text-base-content/60 mt-1">
          Create tables and run SQL queries.
        </p>
      </div>

      <SqlConsole tables={tables} />
    </main>
  );
}
