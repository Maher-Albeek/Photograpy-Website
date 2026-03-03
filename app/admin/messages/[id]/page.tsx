export const dynamic = "force-dynamic";
export const revalidate = 0;

import DeleteMessageButton from "@/components/admin/DeleteMessageButton";
import { sql } from "@/lib/db2";
import { notFound } from "next/navigation";
import Link from "next/link";

type MessageRow = {
  id: number;
  sender_name: string;
  sender_email: string;
  message_text: string;
  sent_at: string;
};

async function getMessage(id: string): Promise<MessageRow | null> {
  const rows = (await sql`
    SELECT 
      id,
      sender_name,
      sender_email,
      message_text,
      sent_at
     FROM contact_messages
     WHERE id = ${id}
     LIMIT 1
  `) as MessageRow[];

  return rows.length ? rows[0] : null;
}

export default async function AdminMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await getMessage(id);

  if (!message) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">
          Message #{message.id}
        </h1>
        <p className="text-base-content/60 mt-1">
          Received at{" "}
          {new Date(message.sent_at).toLocaleString()}
        </p>
      </div>

      {/* Message card */}
      <div className="rounded-lg border border-base-300 bg-base-100 p-6 space-y-4">
        <div>
          <span className="font-medium">Name:</span>{" "}
          {message.sender_name}
        </div>

        <div>
          <span className="font-medium">Email:</span>{" "}
          <a
            href={`mailto:${message.sender_email}`}
            className="link link-primary"
          >
            {message.sender_email}
          </a>
        </div>

        <div className="divider"></div>

        <p className="whitespace-pre-wrap leading-relaxed">
          {message.message_text}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <DeleteMessageButton id={message.id} />

        <Link href="/admin/messages" className="btn btn-ghost">
          Back
        </Link>
      </div>
    </main>
  );
}
