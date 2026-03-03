export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";
import TestimonialListClient from "@/components/admin/TestimonialListClient";
import AddTestimonialForm from "@/components/admin/AddTestimonialForm";

type TestimonialRow = {
  id: number;
  name: string;
  content: string;
  image: string | null;
  date_added: string;
};

export default async function AdminTestimonialsPage() {
  const rows = (await sql`
    SELECT
      id,
      name,
      content,
      image,
      DATE_FORMAT(date_added, '%Y-%m-%d %H:%i') AS date_added
    FROM testimonials
    ORDER BY date_added DESC
  `) as TestimonialRow[];

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Testimonials</h1>
        <p className="text-base-content/60 mt-1">
          Manage customer testimonials
        </p>
      </div>

      {/* Add form (border only here) */}
      <div className="mb-8 rounded-lg border border-base-300 bg-base-100 p-5">
        <AddTestimonialForm />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra [&_tbody_tr:hover]:bg-base-200">
            <thead className="border-b border-base-300">
              <tr className="text-base-content/70">
                <th>Name</th>
                <th>Content</th>
                <th className="w-24">Image</th>
                <th className="w-40">Date</th>
                <th className="w-40 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <TestimonialListClient initialRows={rows} />
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="py-10 text-center text-base-content/60">
            No testimonials yet
          </div>
        )}
      </div>
    </main>
  );
}
