export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";


type ProjectRow = {
  id: number;
  title: string;
  category_name: string | null;
  thumbnail_path: string | null;
};

export default async function ProjectsPage() {
  const rows = await sql`
    SELECT
      p.id,
      p.title,
      c.name AS category_name,
      pm.file_path AS thumbnail_path
    FROM projects p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN project_media pm
      ON pm.project_id = p.id
      AND pm.is_thumbnail = 1
    ORDER BY p.created_at DESC
  `;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>

      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(rows, null, 2)}
      </pre>
    </main>
  );
}
