"use client";

import { useEffect, useRef, useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";

type Props = {
  initialImage: string | null;
};

export default function ContactImageUploader({ initialImage }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(initialImage || "");
  const [cacheBust, setCacheBust] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (initialImage) {
      setCacheBust(Date.now());
    }
  }, [initialImage]);

  function withCacheBust(src: string) {
    if (!src) return src;
    if (src.startsWith("blob:")) return src;
    if (src.includes("?")) return src;
    return cacheBust ? `${src}?v=${cacheBust}` : src;
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = e.target.files?.[0] ?? null;
    setFile(nextFile);
    setMessage(null);
    setProgress(0);
    if (nextFile) {
      setPreview(URL.createObjectURL(nextFile));
    }
  }

  async function handleUpload() {
    if (!file) {
      setMessage("Please choose an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setStatus("uploading");
    setMessage(null);
    setProgress(0);

    try {
      const res = await uploadWithProgress({
        url: "/api/contact/image",
        method: "POST",
        body: formData,
        onProgress: (event) => setProgress(event.percent),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Upload failed");
      }

      const data = await res.json();
      setPreview(data.path);
      setCacheBust(Date.now());
      setStatus("done");
      setMessage("Image updated.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to upload image.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onFileChange}
            className="file-input file-input-bordered w-full"
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={status === "uploading"}
            className="btn btn-primary"
          >
            {status === "uploading" ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Upload"
            )}
          </button>

          {status === "uploading" && (
            <div className="space-y-1">
              <progress
                className="progress progress-primary w-full"
                value={progress}
                max="100"
              />
              <p className="text-xs text-base-content/60">{progress}%</p>
            </div>
          )}

          {message && (
            <p className={`text-sm ${status === "error" ? "text-error" : "text-success"}`}>
              {message}
            </p>
          )}
        </div>

        <div className="w-full md:w-1/2">
          {preview ? (
            <img
              src={withCacheBust(preview)}
              alt="Contact section preview"
              className="w-full max-h-64 object-cover rounded-lg border border-base-300 bg-base-200"
            />
          ) : (
            <div className="w-full h-64 rounded-lg border border-dashed border-base-300 bg-base-200/50 grid place-items-center text-base-content/60 text-sm">
              No image uploaded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
