export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";
import AddCategoryForm from "@/components/admin/AddCategoryForm";
import CategoryListClient from "@/components/admin/CategoryListClient";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
};

export default async function AdminCategoriesPage() {
  const rows = (await sql`
    SELECT id, name, slug
    FROM categories
    ORDER BY id ASC
  `) as CategoryRow[];

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Categories</h1>
        <p className="text-base-content/60 mt-1">
          Manage your product categories
        </p>
      </div>

      {/* Add form */}
      <div className="mb-8 rounded-lg border border-base-300 bg-base-100 p-4">
        <AddCategoryForm />
      </div>


      {/* Table container */}
      <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra [&_tbody_tr:hover]:bg-base-200">
            <thead>
              <tr className="text-base-content/70">
                <th>Name</th>
                <th>Slug</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <CategoryListClient initialRows={rows} />
            </tbody>
          </table>
        </div>


        {/* Empty state */}
        {rows.length === 0 && (
          <div className="p-6 text-center text-base-content/60">
            No categories yet
          </div>
        )}
      </div>
    </main>
  );
}
