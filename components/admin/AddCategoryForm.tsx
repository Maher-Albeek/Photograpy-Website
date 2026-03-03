"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    setLoading(false);
    setName("");
    setSlug("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end"
    >
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Name</span>
        </div>
        <input
          placeholder="Name"
          required
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Slug</span>
        </div>
        <input
          placeholder="Slug"
          required
          className="input input-bordered w-full"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? (
          <span className="loading loading-spinner" />
        ) : (
          "Add"
        )}
      </button>
    </form>
  );
}
