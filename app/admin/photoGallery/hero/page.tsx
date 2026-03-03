"use client";

import { FormEvent, useEffect, useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";
import { normalizeImageFile } from "@/lib/client/image";

type HeroSectionPage = {
  title: string;
  imageUrl: string;
};

export default function AdminHeroPage() {
  const [data, setData] = useState<HeroSectionPage>({
    title: "",
    imageUrl: "",
  });
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
        const res = await fetch("/api/photogallery/hero", { cache: "no-store" });
        if (!res.ok) {
          let message = "Failed to fetch hero data";
          try {
            const payload = (await res.json()) as { error?: string };
            if (payload?.error) {
              message = payload.error;
            }
          } catch {
            // ignore JSON parsing errors
          }
          throw new Error(message);
        }
        const jsonData = await res.json();
        if (active) {
          setData(jsonData);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load hero data"
          );
        }
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
        url: "/api/photogallery/hero",
        method: "POST",
        body: formData,
        onProgress: (event) => setUploadProgress(event.percent),
      });
      if (!res.ok) {
        let message = "Save failed";
        try {
          const payload = (await res.json()) as { error?: string };
          if (payload?.error) {
            message = payload.error;
          }
        } catch {
          // ignore JSON parsing errors
        }
        throw new Error(message);
      }
      const json = await res.json();
      setData((prev) => ({
        ...prev,
        imageUrl: json.imageUrl || prev.imageUrl,
      }));
      setMessage("Hero content saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save hero content."
      );
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = event.target.files?.[0] || null;
    setError(null);
    if (!rawFile) {
      setFileObj(null);
      setFilePreview(null);
      return;
    }
    const file = await normalizeImageFile(rawFile);
    if (!file) {
      setFileObj(null);
      setFilePreview(null);
      setError(
        "This image format is not supported. Please upload a JPG or PNG, or set your iPhone camera to Most Compatible."
      );
      return;
    }
    setFileObj(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase text-base-content/60">Photo Gallery</p>
        <h1 className="text-2xl font-bold">Hero Section</h1>
        <p className="text-sm text-base-content/60">
          Update the hero title and image shown on the Photo Gallery page.
        </p>
      </header>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body space-y-4">
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Title</span>
              </div>
              <input
                type="text"
                value={data.title}
                onChange={(e) =>
                  setData({ ...data, title: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full"
              />
            </label>

            {(filePreview || data.imageUrl) && (
              <div className="mt-2 w-80">
                <img
                  src={filePreview || data.imageUrl}
                  alt="Hero Preview"
                  className="max-w-full h-auto rounded-lg border border-base-300"
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
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
