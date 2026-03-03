"use client";

import { useState } from "react";

export default function ProjectImageDeleteButton({
  mediaId,
  onDeleted,
}: {
  mediaId: number;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this image?")) return;

    setLoading(true);
    const res = await fetch(`/api/projects/media/${mediaId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (res.ok) {
      onDeleted();
    } else {
      alert("Delete failed");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "4px 6px",
        cursor: "pointer",
        fontSize: "12px",
      }}
    >
      {loading ? "..." : "✕"}
    </button>
  );
}
