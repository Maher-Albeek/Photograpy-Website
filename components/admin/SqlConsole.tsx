"use client";

import { useEffect, useMemo, useState } from "react";

type SqlResult = {
  rows: Record<string, unknown>[];
  columns: string[];
  meta?: Record<string, unknown> | null;
};

type Props = {
  tables: string[];
};

function escapeTableName(name: string) {
  return name.replace(/`/g, "``");
}

function formatValue(value: unknown) {
  if (value === null) return "NULL";
  if (value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export default function SqlConsole({ tables }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SqlResult | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState(
    tables[0] ?? ""
  );

  const quickSelectQuery = useMemo(() => {
    if (!selectedTable) return "";
    return `SELECT * FROM \`${escapeTableName(selectedTable)}\` LIMIT 100;`;
  }, [selectedTable]);

  async function runQuery(sqlText: string) {
    const trimmed = sqlText.trim();
    if (!trimmed) {
      setError("Please enter a SQL query.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setLastQuery(trimmed);

    try {
      const res = await fetch("/api/admin/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      const rawText = await res.text();
      if (!rawText) {
        if (!res.ok) {
          setError(`Query failed. (${res.status})`);
          setResult(null);
          return;
        }
        setResult({ rows: [], columns: [], meta: null });
        return;
      }

      let data: {
        error?: string;
        rows?: Record<string, unknown>[];
        columns?: string[];
        meta?: Record<string, unknown> | null;
      };

      try {
        data = JSON.parse(rawText) as {
          error?: string;
          rows?: Record<string, unknown>[];
          columns?: string[];
          meta?: Record<string, unknown> | null;
        };
      } catch {
        if (!res.ok) {
          setError(`Query failed. (${res.status})`);
          setResult(null);
          return;
        }
        setError("Query failed. Response was not JSON.");
        setResult(null);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Query failed.");
        setResult(null);
        return;
      }

      setResult({
        rows: data.rows ?? [],
        columns: data.columns ?? [],
        meta: data.meta ?? null,
      });
    } catch (err) {
      console.error(err);
      setError("Query failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setQuery("");
    setResult(null);
    setError(null);
    setLastQuery(null);
  }

  function handleInsertExample() {
    const example = `CREATE TABLE your_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
    setQuery(example);
  }

  const displayRows = result?.rows ?? [];
  const displayColumns =
    result?.columns ?? (displayRows[0] ? Object.keys(displayRows[0]) : []);
  const shownRows = displayRows.slice(0, 200);

  useEffect(() => {
    if (!quickSelectQuery) return;
    runQuery(quickSelectQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickSelectQuery]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">SQL Runner</h2>
            <button
              type="button"
              onClick={handleInsertExample}
              className="btn btn-ghost btn-sm"
            >
              Insert Example
            </button>
          </div>
          <p className="text-sm text-base-content/60">
            Run raw SQL queries. Use with care.
          </p>
        </div>

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">SQL Query</span>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Write any SQL: CREATE / SELECT / INSERT / UPDATE / DELETE ..."
            className="textarea textarea-bordered min-h-[180px] font-mono"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runQuery(query)}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              "Run SQL"
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-ghost"
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Quick SELECT</h2>
          <p className="text-sm text-base-content/60">
            Preview table rows and columns.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <label className="form-control w-full sm:max-w-xs">
            <div className="label">
              <span className="label-text">Table</span>
            </div>
            <select
              className="select select-bordered"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={tables.length === 0}
            >
              {tables.length === 0 ? (
                <option value="">No tables found</option>
              ) : (
                tables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))
              )}
            </select>
          </label>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={!quickSelectQuery || loading}
            onClick={() => runQuery(quickSelectQuery)}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              "Preview Table"
            )}
          </button>
        </div>

        {quickSelectQuery ? (
          <div className="text-xs text-base-content/50 font-mono">
            {quickSelectQuery}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Results</h2>
          {lastQuery ? (
            <p className="text-xs text-base-content/50 font-mono">
              {lastQuery}
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : null}

        {result?.meta ? (
          <div className="rounded-md bg-base-200 p-3 text-sm font-mono">
            {JSON.stringify(result.meta, null, 2)}
          </div>
        ) : null}

        {displayColumns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table w-full table-zebra [&_tbody_tr:hover]:bg-base-200">
              <thead>
                <tr className="text-base-content/70">
                  {displayColumns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shownRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {displayColumns.map((column) => (
                      <td key={`${rowIndex}-${column}`}>
                        {formatValue(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!error && result && displayColumns.length === 0 ? (
          <div className="text-sm text-base-content/60">
            Query executed. No rows returned.
          </div>
        ) : null}

        {displayRows.length > shownRows.length ? (
          <div className="text-xs text-base-content/50">
            Showing {shownRows.length} of {displayRows.length} rows.
          </div>
        ) : null}
      </div>
    </div>
  );
}
