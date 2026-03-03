"use client";

import { FormEvent, useEffect, useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";

type HeroSection = {
  title: string;
  imageUrl: string;
};

export default function AdminHeroPage() {
  const [data, setData] = useState<HeroSection>({ title: "", imageUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/aboutMe/hero", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load hero content");
        const json = await res.json();
        if (active) {
          setData({
            title: json.title ?? "",
            imageUrl: json.imageUrl ?? "",
          });
        }
      } catch {
        if (active) setError("Could not load hero content.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (fileObj) {
        formData.append("image", fileObj);
      }

      const res = await uploadWithProgress({
        url: "/api/aboutMe/hero",
        method: "POST",
        body: formData,
        onProgress: (event) => setUploadProgress(event.percent),
      });

      if (!res.ok) throw new Error("Save failed");
      const json = await res.json();
      setData((prev) => ({
        ...prev,
        imageUrl: json.imageUrl || prev.imageUrl,
      }));
      setMessage("Hero content saved.");
    } catch {
      setError("Could not save hero content.");
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase text-base-content/60">About Me Page</p>
        <h1 className="text-2xl font-bold">Hero Title and Image</h1>
        <p className="text-sm text-base-content/60">
          Update the hero headline and image that appear on the About Me page.
        </p>
      </header>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Hero Title</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full"
                value={data.title}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter hero headline"
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text font-semibold">Hero Image</span>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-base-300 p-3">
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFileObj(file);
                    if (file) {
                      setFilePreview(URL.createObjectURL(file));
                    } else {
                      setFilePreview(null);
                    }
                  }}
                />
                <div className="label">
                  <span className="label-text-alt">
                    Upload a new image (stored in blob storage); existing image
                    stays if none selected.
                  </span>
                </div>
              </div>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Hero"}
              </button>
              {message && (
                <span className="text-success text-sm">{message}</span>
              )}
              {error && (
                <span className="text-error text-sm">{error}</span>
              )}
            </div>

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

      {filePreview || data.imageUrl ? (
        <div className="max-w-xl rounded-xl border border-base-300 bg-base-200 p-4">
          <p className="mb-2 text-sm font-semibold text-base-content/80">
            Preview
          </p>
          <img
            src={filePreview || data.imageUrl}
            alt="Hero preview"
            className="h-48 w-full rounded-lg object-cover"
          />
        </div>
      ) : null}
    </main>
  );
}
