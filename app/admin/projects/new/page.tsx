export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";
import NewProjectForm from "@/components/admin/NewProjectForm";

type CategoryRow = {
  id: number;
  name: string;
};

async function getCategories(): Promise<CategoryRow[]> {
  const rows = (await sql`
    SELECT id, name FROM categories ORDER BY name ASC
  `) as CategoryRow[];
  return rows;
}

export default async function NewProjectPage() {
  const categories = await getCategories();

   return (
    <main className="max-w-xl mx-auto px-6 py-8">
      <div className="rounded-lg border border-base-300 bg-base-100 p-6">
        <NewProjectForm categories={categories} />
      </div>
    </main>
  );
}
