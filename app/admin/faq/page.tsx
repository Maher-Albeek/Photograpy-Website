export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";
import { getFaqImagePaths } from "@/lib/faqImages";
import AddFaqForm from "@/components/admin/AddFaqForm";
import FaqListClient from "@/components/admin/FaqListClient";
import FaqImageUploader from "@/components/admin/FaqImageUploader";

type FaqDbRow = {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
};

export default async function AdminFaqPage() {
  const { desktop, mobile } = await getFaqImagePaths();
  const rows = (await sql`
    SELECT
      id,
      question,
      answer,
      sort_order
    FROM faq
    ORDER BY sort_order ASC
  `) as FaqDbRow[];

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">FAQ</h1>
        <p className="text-base-content/60 mt-1">
          Manage your frequently asked questions
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-base-300 bg-base-100 p-5">
        <AddFaqForm />
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra [&_tbody_tr:hover]:bg-base-200">
            <thead className="border-b border-base-300">
              <tr className="text-base-content/70">
                <th>Question</th>
                <th className="w-32 text-center">Order</th>
                <th className="w-40 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <FaqListClient initialRows={rows} />
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="py-10 text-center text-base-content/60">
            No FAQ items yet
          </div>
        )}
      </div>

      <div className="mt-10 rounded-lg border border-base-300 bg-base-100 p-5">
        <h2 className="text-lg font-semibold mb-2">
          FAQ section image
        </h2>
        <p className="text-base-content/60 text-sm mb-4">
          Upload a desktop image (shown on larger screens) and a mobile image
          (used as the background on small screens).
        </p>
        <FaqImageUploader
          initialDesktopImage={desktop}
          initialMobileImage={mobile}
        />
      </div>
    </main>
  );
}
