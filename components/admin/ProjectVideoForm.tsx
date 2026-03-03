"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type VideoSource = "bunny" | "youtube" | "vimeo" | "embed";

function extractYouTubeId(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/
  );
  if (match?.[1]) return match[1];
  return /^[A-Za-z0-9_-]{6,}$/.test(trimmed) ? trimmed : "";
}

function extractVimeoId(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match?.[1]) return match[1];
  return /^\d+$/.test(trimmed) ? trimmed : "";
}

export default function ProjectVideoForm({
  projectId,
}: {
  projectId: number;
}) {
  const router = useRouter();
  const [source, setSource] = useState<VideoSource>("bunny");
  const [libraryId, setLibraryId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (source === "bunny") {
      if (!libraryId || !videoId) {
        alert("Bunny Library ID and Video ID are required");
        return;
      }
    } else if (source === "youtube") {
      const id = extractYouTubeId(videoId);
      if (!id) {
        alert("Please enter a valid YouTube URL or ID");
        return;
      }
    } else if (source === "vimeo") {
      const id = extractVimeoId(videoId);
      if (!id) {
        alert("Please enter a valid Vimeo URL or ID");
        return;
      }
    } else if (source === "embed") {
      if (!url.trim()) {
        alert("Embed URL is required");
        return;
      }
    }

    setLoading(true);

    const normalizedVideoId =
      source === "youtube"
        ? extractYouTubeId(videoId)
        : source === "vimeo"
          ? extractVimeoId(videoId)
          : videoId.trim();

    const res = await fetch("/api/projects/media/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        source,
        library_id: libraryId.trim(),
        video_id: normalizedVideoId,
        url: url.trim(),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to add video");
      return;
    }

    setLibraryId("");
    setVideoId("");
    setUrl("");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3">
      <h3 className="font-semibold text-sm text-base-content/80">Add Video</h3>

      <select
        className="select select-bordered w-full"
        value={source}
        onChange={(e) => setSource(e.target.value as VideoSource)}
      >
        <option value="bunny">Bunny</option>
        <option value="youtube">YouTube</option>
        <option value="vimeo">Vimeo</option>
        <option value="embed">Embed URL</option>
      </select>

      {source === "bunny" ? (
        <>
          <input
            className="input input-bordered w-full"
            placeholder="Bunny Library ID"
            value={libraryId}
            onChange={(e) => setLibraryId(e.target.value)}
          />

          <input
            className="input input-bordered w-full"
            placeholder="Bunny Video ID"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
          />
        </>
      ) : null}

      {source === "youtube" ? (
        <input
          className="input input-bordered w-full"
          placeholder="YouTube URL or ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
      ) : null}

      {source === "vimeo" ? (
        <input
          className="input input-bordered w-full"
          placeholder="Vimeo URL or ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
      ) : null}

      {source === "embed" ? (
        <input
          className="input input-bordered w-full"
          placeholder="Embed URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      ) : null}

      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="btn btn-secondary btn-sm"
      >
        {loading ? "Adding..." : "Add video"}
      </button>
    </div>
  );
}
