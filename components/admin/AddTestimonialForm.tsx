"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadWithProgress } from "@/lib/client/upload";

export default function AddTestimonialForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("content", content);
    if (image) formData.append("image", image);

    const res = await uploadWithProgress({
      url: "/api/testimonials",
      method: "POST",
      body: formData,
      onProgress: (event) => setProgress(event.percent),
    });

    setLoading(false);
    setProgress(0);

    if (res.ok) {
      setName("");
      setContent("");
      setImage(null);
      router.refresh();
    } else {
      alert("Failed to add testimonial");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Add testimonial</h2>
        <p className="text-sm text-base-content/60">
          Create a new testimonial
        </p>
      </div>

      <input
        type="text"
        placeholder="Name"
        required
        className="input input-bordered w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        placeholder="Content"
        required
        rows={4}
        className="textarea textarea-bordered w-full"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        type="file"
        accept="image/*"
        className="file-input file-input-bordered w-full"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? <span className="loading loading-spinner"></span> : "Add"}
      </button>

      {loading && (
        <div className="space-y-1">
          <progress
            className="progress progress-primary w-full"
            value={progress}
            max="100"
          />
          <p className="text-xs text-base-content/60">{progress}%</p>
        </div>
      )}
    </form>
  );
}
