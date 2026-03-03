"use client";

import { useState } from "react";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export default function CategoryRow({ item }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [slug, setSlug] = useState(item.slug);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    await fetch(`/api/categories/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    setSaving(false);
    setEditing(false);
  }

  // shared row style (striped)
  const rowClass =
    "odd:bg-base-200/40 even:bg-transparent hover:bg-base-200/60 transition";

  if (editing) {
    return (
      <tr className={rowClass}>
        <td className="py-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-sm input-bordered w-full"
          />
        </td>

        <td className="py-4">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input input-sm input-bordered w-full"
          />
        </td>

        <td className="py-4 text-right space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-xs btn-ghost text-success"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={() => setEditing(false)}
            className="btn btn-xs btn-ghost"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className={rowClass}>
      <td className="py-4 font-medium">{item.name}</td>

      <td className="py-4">
        <code className="opacity-60">{item.slug}</code>
      </td>

      <td className="py-4 text-right space-x-3">
        <button
          onClick={() => setEditing(true)}
          className="btn btn-xs btn-ghost text-info"
        >
          Edit
        </button>

        <DeleteCategoryButton id={item.id} />
      </td>
    </tr>
  );
}
