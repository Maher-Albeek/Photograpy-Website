"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";

type VideoSource = "bunny" | "youtube" | "vimeo" | "embed";

type VideoItem = {
  source: VideoSource;
  title?: string;
  libraryId?: string;
  videoId?: string;
  url?: string;
};

type VideoGalleryContent = {
  title: string;
  content: string;
  imageUrl: string;
  videos?: VideoItem[];
  videoUrls?: { url: string; title: string }[];
};

const VIDEO_SOURCE_OPTIONS: { value: VideoSource; label: string }[] = [
  { value: "bunny", label: "Bunny" },
  { value: "youtube", label: "YouTube" },
  { value: "vimeo", label: "Vimeo" },
  { value: "embed", label: "Embed URL" },
];

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

function mapIncomingVideos(payload: any): VideoItem[] {
  if (Array.isArray(payload?.videos)) {
    return payload.videos.map((video: any) => {
      const source = VIDEO_SOURCE_OPTIONS.some((opt) => opt.value === video?.source)
        ? (video.source as VideoSource)
        : "embed";
      return {
        source,
        title: typeof video?.title === "string" ? video.title : "",
        libraryId: video?.libraryId != null ? String(video.libraryId) : "",
        videoId: video?.videoId != null ? String(video.videoId) : "",
        url: video?.url != null ? String(video.url) : "",
      };
    });
  }

  if (Array.isArray(payload?.videoUrls)) {
    return payload.videoUrls.map((video: any) => ({
      source: "embed" as VideoSource,
      title: typeof video?.title === "string" ? video.title : "",
      url: typeof video?.url === "string" ? video.url : "",
    }));
  }

  return [];
}

function normalizeVideoForSave(video: VideoItem): VideoItem | null {
  const title = (video.title || "").trim();
  if (video.source === "bunny") {
    const libraryId = (video.libraryId || "").trim();
    const videoId = (video.videoId || "").trim();
    if (!libraryId || !videoId) return null;
    return { source: "bunny", title, libraryId, videoId };
  }
  if (video.source === "youtube") {
    const videoId = extractYouTubeId(video.videoId || "");
    if (!videoId) return null;
    return { source: "youtube", title, videoId };
  }
  if (video.source === "vimeo") {
    const videoId = extractVimeoId(video.videoId || "");
    if (!videoId) return null;
    return { source: "vimeo", title, videoId };
  }
  if (video.source === "embed") {
    const url = (video.url || "").trim();
    if (!url) return null;
    return { source: "embed", title, url };
  }
  return null;
}

export default function AdminVideoGalleryContentPage() {
  const [data, setData] = useState<VideoGalleryContent>({
    title: "",
    content: "",
    imageUrl: "",
    videos: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/videoGallery", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load content");
        const json = await res.json();
        if (active) {
          setData({
            title: json.title ?? "",
            content: json.content ?? "",
            imageUrl: json.imageUrl ?? "",
            videos: mapIncomingVideos(json),
          });
        }
      } catch {
        if (active) setError("Could not load Video Gallery content.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setFileObj(null);
      setFilePreview(null);
      return;
    }
    setFileObj(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("imageUrl", data.imageUrl || "");
      const cleanedVideos = (data.videos || [])
        .map(normalizeVideoForSave)
        .filter((video): video is VideoItem => Boolean(video));
      formData.append("videos", JSON.stringify(cleanedVideos));
      if (fileObj) {
        formData.append("imageFile", fileObj);
      }
      const res = await uploadWithProgress({
        url: "/api/videoGallery",
        method: "POST",
        body: formData,
        onProgress: (event) => setUploadProgress(event.percent),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = await res.json();
      setData({
        title: json.title ?? data.title,
        content: json.content ?? data.content,
        imageUrl: json.imageUrl ?? data.imageUrl,
        videos: mapIncomingVideos(json),
      });
      setFileObj(null);
      setFilePreview(null);
      setMessage("Video Gallery content saved.");
    } catch {
      setError("Could not save Video Gallery content.");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  }

  function updateVideo(index: number, patch: Partial<VideoItem>) {
    setData((prev) => {
      const videos = [...(prev.videos || [])];
      const current = videos[index] || { source: "bunny" as VideoSource };
      videos[index] = { ...current, ...patch };
      return { ...prev, videos };
    });
  }

  function changeVideoSource(index: number, source: VideoSource) {
    setData((prev) => {
      const videos = [...(prev.videos || [])];
      const current = videos[index] || { title: "" };
      const base = { source, title: current.title || "" };
      if (source === "bunny") {
        videos[index] = {
          ...base,
          libraryId: current.libraryId || "",
          videoId: current.videoId || "",
        };
      } else if (source === "youtube" || source === "vimeo") {
        videos[index] = {
          ...base,
          videoId: current.videoId || "",
        };
      } else {
        videos[index] = {
          ...base,
          url: current.url || "",
        };
      }
      return { ...prev, videos };
    });
  }

  function addVideo() {
    setData((prev) => ({
      ...prev,
      videos: [
        ...(prev.videos || []),
        { source: "bunny", title: "", libraryId: "", videoId: "" },
      ],
    }));
  }

  function removeVideo(index: number) {
    setData((prev) => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase text-base-content/60">Video Gallery</p>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-sm text-base-content/60">
          Update the hero image, copy, and videos.
        </p>
      </header>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body space-y-4">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Hero image</span>
              </div>
              <input
                id="heroImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full"
              />
            </label>

            {(filePreview || data.imageUrl) ? (
              <div className="mt-2">
                <img
                  src={filePreview || data.imageUrl}
                  alt="Hero preview"
                  className="max-w-full h-auto rounded-lg border border-base-300"
                />
                <p className="text-xs text-base-content/60 mt-2">
                  Current path: {filePreview ? "local preview" : data.imageUrl}
                </p>
              </div>
            ) : null}

            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Title</span>
              </div>
              <input
                id="title"
                type="text"
                className="input input-bordered w-full"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Content</span>
              </div>
              <textarea
                id="content"
                className="textarea textarea-bordered w-full"
                value={data.content}
                onChange={(e) => setData({ ...data, content: e.target.value })}
                required
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Videos</h2>
                <button type="button" className="btn btn-outline btn-sm" onClick={addVideo}>
                  Add video
                </button>
              </div>

              {data.videos && data.videos.length ? (
                <div className="space-y-4">
                  {data.videos.map((video, index) => (
                    <div
                      key={`${video.source}-${index}`}
                      className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Video {index + 1}</p>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => removeVideo(index)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">Title</span>
                          </div>
                          <input
                            className="input input-bordered w-full"
                            value={video.title || ""}
                            onChange={(e) => updateVideo(index, { title: e.target.value })}
                          />
                        </label>

                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">Source</span>
                          </div>
                          <select
                            className="select select-bordered w-full"
                            value={video.source}
                            onChange={(e) =>
                              changeVideoSource(index, e.target.value as VideoSource)
                            }
                          >
                            {VIDEO_SOURCE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {video.source === "bunny" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className="form-control">
                            <div className="label">
                              <span className="label-text">Bunny Library ID</span>
                            </div>
                            <input
                              className="input input-bordered w-full"
                              value={video.libraryId || ""}
                              onChange={(e) => updateVideo(index, { libraryId: e.target.value })}
                            />
                          </label>
                          <label className="form-control">
                            <div className="label">
                              <span className="label-text">Bunny Video ID</span>
                            </div>
                            <input
                              className="input input-bordered w-full"
                              value={video.videoId || ""}
                              onChange={(e) => updateVideo(index, { videoId: e.target.value })}
                            />
                          </label>
                        </div>
                      ) : null}

                      {video.source === "youtube" ? (
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">YouTube URL or ID</span>
                          </div>
                          <input
                            className="input input-bordered w-full"
                            value={video.videoId || ""}
                            onChange={(e) => updateVideo(index, { videoId: e.target.value })}
                            placeholder="https://youtu.be/VIDEO_ID"
                          />
                          <p className="text-xs text-base-content/60 mt-1">
                            Paste a YouTube link or just the video ID.
                          </p>
                        </label>
                      ) : null}

                      {video.source === "vimeo" ? (
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">Vimeo URL or ID</span>
                          </div>
                          <input
                            className="input input-bordered w-full"
                            value={video.videoId || ""}
                            onChange={(e) => updateVideo(index, { videoId: e.target.value })}
                            placeholder="https://vimeo.com/123456789"
                          />
                          <p className="text-xs text-base-content/60 mt-1">
                            Paste a Vimeo link or the numeric video ID.
                          </p>
                        </label>
                      ) : null}

                      {video.source === "embed" ? (
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">Embed URL</span>
                          </div>
                          <input
                            className="input input-bordered w-full"
                            value={video.url || ""}
                            onChange={(e) => updateVideo(index, { url: e.target.value })}
                            placeholder="https://example.com/embed/..."
                          />
                        </label>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-base-content/60">
                  No videos yet. Add one to start building the gallery.
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Content"}
            </button>

            {saving && (
              <div className="space-y-1">
                <progress
                  className="progress progress-primary w-full"
                  value={uploadProgress}
                  max="100"
                />
                <p className="text-xs text-base-content/60">
                  {uploadProgress}%
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
