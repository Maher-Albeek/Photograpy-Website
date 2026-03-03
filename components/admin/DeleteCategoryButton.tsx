"use client";

import { useRouter } from "next/navigation";

export default function DeleteCategoryButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(
      "Are you sure? This category will be deleted permanently."
    );

    if (!ok) return;

    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      alert(
        data?.error ||
          "Cannot delete category. It may be linked to projects."
      );
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="btn btn-xs btn-ghost text-error"
    >
      Delete
    </button>
  );
}
