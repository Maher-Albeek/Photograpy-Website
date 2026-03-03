"use client";

import { useEffect, useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";

type Props = {
  initialDesktopImage: string | null;
  initialMobileImage: string | null;
};

type Variant = "desktop" | "mobile";

export default function FaqImageUploader({
  initialDesktopImage,
  initialMobileImage,
}: Props) {
  const [desktopPreview, setDesktopPreview] = useState(
    initialDesktopImage || ""
  );
  const [mobilePreview, setMobilePreview] = useState(
    initialMobileImage || ""
  );
  const [cacheBust, setCacheBust] = useState(0);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Record<Variant, "idle" | "uploading" | "error" | "done">>({
    desktop: "idle",
    mobile: "idle",
  });
  const [message, setMessage] = useState<Record<Variant, string | null>>({
    desktop: null,
    mobile: null,
  });
  const [progress, setProgress] = useState<Record<Variant, number>>({
    desktop: 0,
    mobile: 0,
  });

  useEffect(() => {
    if (initialDesktopImage || initialMobileImage) {
      setCacheBust(Date.now());
    }
  }, [initialDesktopImage, initialMobileImage]);

  function withCacheBust(src: string) {
    if (!src) return src;
    if (src.startsWith("blob:")) return src;
    if (src.includes("?")) return src;
    return cacheBust ? `${src}?v=${cacheBust}` : src;
  }

  function onFileChange(variant: Variant, e: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = e.target.files?.[0] ?? null;
    if (variant === "desktop") {
      setDesktopFile(nextFile);
      if (nextFile) setDesktopPreview(URL.createObjectURL(nextFile));
    } else {
      setMobileFile(nextFile);
      if (nextFile) setMobilePreview(URL.createObjectURL(nextFile));
    }
    setMessage((current) => ({ ...current, [variant]: null }));
    setProgress((current) => ({ ...current, [variant]: 0 }));
  }

  async function handleUpload(variant: Variant) {
    const file = variant === "desktop" ? desktopFile : mobileFile;
    if (!file) {
      setMessage((current) => ({
        ...current,
        [variant]: "Please choose an image first.",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("variant", variant);

    setStatus((current) => ({ ...current, [variant]: "uploading" }));
    setMessage((current) => ({ ...current, [variant]: null }));
    setProgress((current) => ({ ...current, [variant]: 0 }));

    try {
      const res = await uploadWithProgress({
        url: "/api/faq/image",
        method: "POST",
        body: formData,
        onProgress: (event) =>
          setProgress((current) => ({ ...current, [variant]: event.percent })),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Upload failed");
      }

      const data = await res.json();
      if (variant === "desktop") {
        setDesktopPreview(data.path);
      } else {
        setMobilePreview(data.path);
      }
      setCacheBust(Date.now());
      setStatus((current) => ({ ...current, [variant]: "done" }));
      setMessage((current) => ({ ...current, [variant]: "Image updated." }));
    } catch (err: any) {
      setStatus((current) => ({ ...current, [variant]: "error" }));
      setMessage((current) => ({
        ...current,
        [variant]: err.message || "Failed to upload image.",
      }));
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">
          Desktop image
        </h3>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={(e) => onFileChange("desktop", e)}
            className="file-input file-input-bordered w-full"
          />

          <button
            type="button"
            onClick={() => handleUpload("desktop")}
            disabled={status.desktop === "uploading"}
            className="btn btn-primary"
          >
            {status.desktop === "uploading" ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Upload"
            )}
          </button>

          {status.desktop === "uploading" && (
            <div className="space-y-1">
              <progress
                className="progress progress-primary w-full"
                value={progress.desktop}
                max="100"
              />
              <p className="text-xs text-base-content/60">{progress.desktop}%</p>
            </div>
          )}

          {message.desktop && (
            <p className={`text-sm ${status.desktop === "error" ? "text-error" : "text-success"}`}>
              {message.desktop}
            </p>
          )}
        </div>

        <div>
          {desktopPreview ? (
            <img
              src={withCacheBust(desktopPreview)}
              alt="FAQ desktop preview"
              className="w-full max-h-64 object-cover rounded-lg border border-base-300 bg-base-200"
            />
          ) : (
            <div className="w-full h-64 rounded-lg border border-dashed border-base-300 bg-base-200/50 grid place-items-center text-base-content/60 text-sm">
              No desktop image uploaded yet
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">
          Mobile image
        </h3>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            onChange={(e) => onFileChange("mobile", e)}
            className="file-input file-input-bordered w-full"
          />

          <button
            type="button"
            onClick={() => handleUpload("mobile")}
            disabled={status.mobile === "uploading"}
            className="btn btn-primary"
          >
            {status.mobile === "uploading" ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Upload"
            )}
          </button>

          {status.mobile === "uploading" && (
            <div className="space-y-1">
              <progress
                className="progress progress-primary w-full"
                value={progress.mobile}
                max="100"
              />
              <p className="text-xs text-base-content/60">{progress.mobile}%</p>
            </div>
          )}

          {message.mobile && (
            <p className={`text-sm ${status.mobile === "error" ? "text-error" : "text-success"}`}>
              {message.mobile}
            </p>
          )}
        </div>

        <div>
          {mobilePreview ? (
            <img
              src={withCacheBust(mobilePreview)}
              alt="FAQ mobile preview"
              className="w-full max-h-64 object-cover rounded-lg border border-base-300 bg-base-200"
            />
          ) : (
            <div className="w-full h-64 rounded-lg border border-dashed border-base-300 bg-base-200/50 grid place-items-center text-base-content/60 text-sm">
              No mobile image uploaded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
