"use client";

import { useState } from "react";
import DeleteTestimonialButton from "@/components/admin/DeleteTestimonialButton";
import EditTestimonialForm from "@/components/admin/EditTestimonialForm";

export default function TestimonialRow({ item }: any) {
  const [editing, setEditing] = useState(false);

  const rowClass =
    "odd:bg-base-200/40 hover:bg-base-200/60 transition";

  const imgSrc = item.image
    ? /^https?:\/\//i.test(item.image)
      ? item.image
      : item.image.startsWith("/")
        ? item.image
        : `/${item.image}`
    : null;

  if (editing) {
    return (
      <tr className={rowClass}>
        <td colSpan={5} className="py-4">
          <EditTestimonialForm
            id={item.id}
            initialName={item.name}
            initialContent={item.content}
            onCancel={() => setEditing(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className={rowClass}>
      <td className="py-4 font-medium">{item.name}</td>

      <td className="py-4 text-sm opacity-80">
        {item.content.slice(0, 80)}...
      </td>

      <td className="py-4">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <span className="text-sm opacity-50">No image</span>
        )}
      </td>

      <td className="py-4 text-sm opacity-60">
        {item.date_added}
      </td>

      <td className="py-4 text-right space-x-3">
        <button
          onClick={() => setEditing(true)}
          className="btn btn-xs btn-ghost text-info"
        >
          Edit
        </button>

        <DeleteTestimonialButton id={item.id} />
      </td>
    </tr>
  );
}
