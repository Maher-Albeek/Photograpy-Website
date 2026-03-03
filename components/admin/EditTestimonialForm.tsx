"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadWithProgress } from "@/lib/client/upload";

type Props = {
  id: number;
  initialName: string;
  initialContent: string;
  onCancel: () => void;
};

export default function EditTestimonialForm({
  id,
  initialName,
  initialContent,
  onCancel,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
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
      url: `/api/testimonials/${id}`,
      method: "PUT",
      body: formData,
      onProgress: (event) => setProgress(event.percent),
    });

    setLoading(false);
    setProgress(0);

    if (res.ok) {
      router.refresh();
      onCancel();
    } else {
      alert("Failed to update testimonial");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        className="input input-bordered w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        rows={4}
        className="textarea textarea-bordered w-full"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <input
        type="file"
        accept="image/*"
        className="file-input file-input-bordered w-full"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost"
        >
          Cancel
        </button>
      </div>

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
