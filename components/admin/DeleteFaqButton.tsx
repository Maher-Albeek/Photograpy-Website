"use client";

import { useRouter } from "next/navigation";

export default function DeleteFaqButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    await fetch(`/api/faq/${id}`, {
      method: "DELETE",
    });

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete} className="btn btn-xs btn-ghost text-error">Delete</button>

  );
}
