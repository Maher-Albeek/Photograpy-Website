export const dynamic = "force-dynamic";
export const revalidate = 0;

import StatCard from "@/components/admin/StatCard";
import { sql } from "@/lib/db2";

type CountRow = {
  total: number;
};

async function getCount(query: string): Promise<number> {
  const rows = (await sql.query(query)) as CountRow[];
  const total = rows[0]?.total ?? 0;
  return Number(total);
}

export default async function AdminDashboard() {
  const projects = await getCount(
    "SELECT COUNT(*) as total FROM projects"
  );
  const messages = await getCount(
    "SELECT COUNT(*) as total FROM contact_messages"
  );
  const categories = await getCount(
    "SELECT COUNT(*) as total FROM categories"
  );
  const testimonials = await getCount(
    "SELECT COUNT(*) as total FROM testimonials"
  );
  const faq = await getCount(
    "SELECT COUNT(*) as total FROM faq"
  );

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard  title="Projects" value={projects} />
        <StatCard title="Messages" value={messages} />
        <StatCard title="Categories" value={categories} />
        <StatCard title="Testimonials" value={testimonials} />
        <StatCard title="FAQ" value={faq} />
      </div>
    </main>
  );
}
