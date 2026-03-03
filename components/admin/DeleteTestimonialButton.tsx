"use client";

import { useRouter } from "next/navigation";

export default function DeleteTestimonialButton({ id }: { id: number }) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm("Delete this testimonial?");
    if (!ok) return;

    await fetch(`/api/testimonials/${id}`, {
      method: "DELETE",
    });

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
