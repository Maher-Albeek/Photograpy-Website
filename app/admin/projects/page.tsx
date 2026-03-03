export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";
import Link from "next/link";

type ProjectRow = {
  id: number;
  title: string;
  category_name: string | null;
  images_count: number;
};

async function getProjects(): Promise<ProjectRow[]> {
  const rows = (await sql`
    SELECT
      p.id,
      p.title,
      c.name AS category_name,
      COUNT(pm.id) AS images_count
    FROM projects p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN project_media pm ON pm.project_id = p.id
      AND pm.media_type = 'image'
    GROUP BY p.id, p.title, c.name
    ORDER BY p.id DESC
  `) as ProjectRow[];

  return rows;
}

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="text-base-content/60 mt-1">
            Manage portfolio projects
          </p>
        </div>

        <Link href="/admin/projects/new" className="btn btn-primary">
          + Add Project
        </Link>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra [&_tbody_tr:hover]:bg-base-200">
            <thead className="border-b border-base-300">
              <tr className="text-base-content/70">
                <th className="w-16">#</th>
                <th>Title</th>
                <th>Category</th>
                <th className="w-24">Images</th>
                <th className="w-24">Action</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  className="odd:bg-base-200/40 hover:bg-base-200/60 transition"
                >
                  <td className="py-4">{p.id}</td>
                  <td className="py-4 font-medium">{p.title}</td>
                  <td className="py-4 opacity-70">
                    {p.category_name ?? "-"}
                  </td>
                  <td className="py-4">
                    <span className="badge badge-ghost">
                      {p.images_count}
                    </span>
                  </td>
                  <td className="py-4">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="btn btn-xs btn-ghost text-info"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center opacity-60">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
