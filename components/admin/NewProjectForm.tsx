"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

export default function NewProjectForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category_id: categoryId || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Create failed");
      return;
    }

    const data = await res.json();
    router.push(`/admin/projects/${data.id}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Project</h1>

      <input
        className="input input-bordered w-full"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="textarea textarea-bordered w-full"
        rows={4}
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        className="select select-bordered w-full"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">- No Category -</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleCreate}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? (
          <span className="loading loading-spinner" />
        ) : (
          "Create project"
        )}
      </button>
    </div>
  );
}
