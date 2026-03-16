import mysql from "mysql2/promise";

type SqlValue = unknown;

type DbQueryResult<T = unknown> = Promise<[T, mysql.FieldPacket[]]>;

type DbClient = {
  query<T = unknown>(sql: string, values?: SqlValue[]): DbQueryResult<T>;
};

type GlobalWithDbPool = typeof globalThis & {
  _dbPool?: DbClient;
};

const globalForDb = globalThis as GlobalWithDbPool;

// Skip DB connection when SKIP_DB=1.
const skipDb = process.env.SKIP_DB === "1";

// No-op pool for builds and DB-free runs.
const noopDb: DbClient = {
  async query<T = unknown>() {
    return [[] as T, []];
  },
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing environment variable: ${name}. Add it to .env.local (local) or Vercel Environment Variables (production).`
    );
  }
  return v;
}

function createMysqlPool(): DbClient {
  // Skip pool creation when DB access is disabled.
  if (skipDb) return noopDb;

  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );

  const host = requireEnv("DB_HOST");
  const user = requireEnv("DB_USER");
  const password = requireEnv("DB_PASS");
  const database = requireEnv("DB_NAME");

  const port = Number(process.env.DB_PORT || "3306");
  if (!Number.isFinite(port)) {
    throw new Error(`Invalid DB_PORT: ${process.env.DB_PORT}`);
  }

  const connectionLimit = Number(
    process.env.DB_POOL_LIMIT || (isServerless ? "1" : "10")
  );
  if (!Number.isFinite(connectionLimit) || connectionLimit <= 0) {
    throw new Error(
      `Invalid DB_POOL_LIMIT: ${process.env.DB_POOL_LIMIT}`
    );
  }

  // Aiven requires TLS/SSL.
  // Set DB_SSL=0 to disable it locally.
  const sslEnabled = process.env.DB_SSL !== "0";

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,

    /**
     * Some providers include a self-signed CA in the chain.
     * rejectUnauthorized = false avoids connection failures.
     *
     * Use Aiven's CA certificate if you want full verification.
     */
    ...(sslEnabled
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });
}

// Reuse a single pool across hot reloads to avoid exhausting connections.
export const db: DbClient =
  skipDb ? noopDb : globalForDb._dbPool ?? createMysqlPool();

if (!skipDb && !globalForDb._dbPool) {
  globalForDb._dbPool = db;
}

type SqlTag = {
  <T = any>(strings: TemplateStringsArray, ...values: SqlValue[]): Promise<T>;
  query: <T = any>(text: string, values?: SqlValue[]) => Promise<T>;
};

function buildQuery(strings: TemplateStringsArray, values: SqlValue[]) {
  let text = "";
  const params: SqlValue[] = [];

  strings.forEach((part, i) => {
    text += part;
    if (i >= values.length) return;

    const value = values[i];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        text += "NULL";
      } else {
        text += value.map(() => "?").join(", ");
        params.push(...value);
      }
      return;
    }

    text += "?";
    params.push(value);
  });

  return { text, params };
}

export const sql = (async <T = any>(
  strings: TemplateStringsArray,
  ...values: SqlValue[]
): Promise<T> => {
  if (skipDb) return [] as unknown as T;
  const { text, params } = buildQuery(strings, values);
  const [rows] = await db.query(text, params);
  return rows as T;
}) as SqlTag;

sql.query = async <T = any>(
  text: string,
  values: SqlValue[] = []
): Promise<T> => {
  if (skipDb) return [] as unknown as T;
  const [rows] = await db.query(text, values);
  return rows as T;
};
