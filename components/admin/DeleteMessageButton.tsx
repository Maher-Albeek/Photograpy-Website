"use client";

import { useRouter } from "next/navigation";

export default function DeleteMessageButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this message?")) return;

    const res = await fetch(`/api/messages/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    console.log(data);

    if (res.ok && data.deleted === 1) {
      router.push("/admin/messages");
      router.refresh();
    } else {
      alert("Delete failed");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="btn btn-error btn-sm"
    >
      Delete
    </button>
  );
}
