"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export default function ProjectEditForm({
  project,
  categories,
}: {
  project: {
    id: number;
    title: string;
    description: string | null;
    category_id: number | null;
  };
  categories: Category[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(
    project.description || ""
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    project.category_id
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category_id: categoryId,
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh();
      alert("Project updated");
    } else {
      alert("Update failed");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Edit project</h2>

      <input
        className="input input-bordered w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="textarea textarea-bordered w-full"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="select select-bordered w-full"
        value={categoryId ?? ""}
        onChange={(e) =>
          setCategoryId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">- No Category -</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button onClick={handleSave} disabled={loading} className="btn btn-primary">
        {loading ? <span className="loading loading-spinner" /> : "Save changes"}
      </button>
    </div>
  );
}
