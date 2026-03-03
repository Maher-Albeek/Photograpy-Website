"use client";

import { useState } from "react";

export default function ProjectImageThumbnailButton({
  mediaId,
  active,
  onDone,
}: {
  mediaId: number;
  active: boolean;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSet() {
    setLoading(true);

    const res = await fetch(
      `/api/projects/media/${mediaId}/thumbnail`,
      { method: "POST" }
    );

    setLoading(false);

    if (res.ok) {
      onDone();
    } else {
      alert("Failed to set thumbnail");
    }
  }

  return (
    <button
      onClick={handleSet}
      disabled={loading || active}
      title={active ? "Thumbnail" : "Set as thumbnail"}
      style={{
        position: "absolute",
        bottom: 6,
        left: 6,
        background: active ? "#22c55e" : "#111",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "4px 6px",
        cursor: active ? "default" : "pointer",
        fontSize: "12px",
        opacity: active ? 0.9 : 1,
      }}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
