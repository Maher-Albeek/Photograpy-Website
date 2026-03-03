export const dynamic = "force-dynamic";
export const revalidate = 0;

import { sql } from "@/lib/db2";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import ContactImageUploader from "@/components/admin/ContactImageUploader";

type MessageRow = {
  id: number;
  sender_name: string;
  sender_email: string;
  message_text: string;
  sent_at: string;
};

async function getMessages(): Promise<MessageRow[]> {
  const rows = (await sql`
    SELECT 
      id,
      sender_name,
      sender_email,
      message_text,
      sent_at
     FROM contact_messages
     ORDER BY id DESC
  `) as MessageRow[];

  return rows;
}

async function getContactImagePath() {
  const dir = path.join(process.cwd(), "public", "uploads", "contact");
  try {
    const files = await fs.readdir(dir);
    const found = files.find((name) => /\.(avif|webp|png|jpe?g|gif)$/i.test(name));
    return found ? `/uploads/contact/${found}` : null;
  } catch {
    return null;
  }
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  const contactImage = await getContactImagePath();

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="text-base-content/60 mt-1">
          Messages sent from contact form
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full table-zebra [&_tbody_tr:hover]:bg-base-200">
            <thead className="border-b border-base-300">
              <tr className="text-base-content/70">
                <th className="w-16">#</th>
                <th>Name</th>
                <th>Email</th>
                <th className="w-32">Action</th>
                <th className="w-32">Date</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((msg, index) => (
                <tr
                  key={msg.id}
                  className="odd:bg-base-200/40 hover:bg-base-200/60 transition"
                >
                  <td className="py-4">{msg.id}</td>
                  <td className="py-4 font-medium">{msg.sender_name}</td>
                  <td className="py-4 opacity-70">{msg.sender_email}</td>
                  <td className="py-4">
                    <Link
                      href={`/admin/messages/${msg.id}`}
                      className="btn btn-xs btn-ghost text-info"
                    >
                      View
                    </Link>
                  </td>
                  <td className="py-4 opacity-60">
                    {new Date(msg.sent_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {messages.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center opacity-60">
                    No messages found
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
