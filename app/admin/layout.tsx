import { sql } from "@/lib/db2";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

async function getSiteLogo(): Promise<string | null> {
  if (process.env.SKIP_DB === "1") return null;

  const rows = (await sql`
    SELECT value_content
    FROM settings
    WHERE key_name = 'logo'
    LIMIT 1
  `) as Array<{ value_content: string | null }>;

  return rows.length ? rows[0].value_content : null;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logo = await getSiteLogo();

  return (
    <AdminShell logo={logo}>{children}</AdminShell>

  );
}
