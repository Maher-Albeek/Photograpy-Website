"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadWithProgress } from "@/lib/client/upload";

type ImageItem = {
  id: number;
  file_path: string;
  imgcat: number;
};

type UploadItem = {
  name: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
};

export default function SettingsHeroImagesRow({
  settingKey,
  images,
}: {
  settingKey: string;
  images: ImageItem[];
}) {
  const router = useRouter();
  const [imgcat, setImgcat] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  const filtered = images.filter((img) => img.imgcat === imgcat);

  async function uploadMultiple(files: FileList) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    setLoading(true);
    setUploadQueue(
      fileList.map((file) => ({
        name: file.name,
        progress: 0,
        status: "pending",
      }))
    );

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadQueue((prev) =>
        prev.map((item, index) =>
          index === i
            ? { ...item, status: "uploading", progress: 0 }
            : item
        )
      );

      const fd = new FormData();
      fd.append("image", file);
      fd.append("setting_key", settingKey);
      fd.append("imgcat", String(imgcat));

      const res = await uploadWithProgress({
        url: "/api/settings/images",
        method: "POST",
        body: fd,
        onProgress: (event) =>
          setUploadQueue((prev) =>
            prev.map((item, index) =>
              index === i
                ? { ...item, status: "uploading", progress: event.percent }
                : item
            )
          ),
      });

      if (!res.ok) {
        setUploadQueue((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "error" } : item
          )
        );
        continue;
      }

      setUploadQueue((prev) =>
        prev.map((item, index) =>
          index === i ? { ...item, status: "done", progress: 100 } : item
        )
      );
    }

    setLoading(false);
    router.refresh();
  }

  async function setPrimary(id: number) {
    await fetch(`/api/settings/images/${id}/primary`, {
      method: "POST",
    });
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm("Delete this image?")) return;

    const res = await fetch(`/api/settings/images/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Delete failed");
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Hero Images</h2>

        <select
          className="select select-sm select-bordered"
          value={imgcat}
          onChange={(e) => setImgcat(Number(e.target.value))}
        >
          <option value={1}>Desktop</option>
          <option value={2}>Mobile</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((img) => {
          const src = img.file_path.startsWith("http")
            ? img.file_path
            : `/${img.file_path.replace(/^\/+/, "")}`;
          return (
          <div
            key={img.id}
            className="relative rounded overflow-hidden border border-base-300"
          >
            <img
              src={src}
              className="h-32 w-full object-cover"
            />

            <button
              onClick={() => remove(img.id)}
              className="btn btn-xs btn-error absolute top-1 right-1"
            >
              X
            </button>
          </div>
        )})}
      </div>

      <label className="btn btn-outline btn-sm w-full">
        {loading ? "Uploading..." : "Add images"}
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          disabled={loading}
          onChange={(e) =>
            e.target.files &&
            uploadMultiple(e.target.files)
          }
        />
      </label>

      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item, index) => (
            <div key={`${item.name}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-base-content/70">
                <span className="truncate">{item.name}</span>
                <span>
                  {item.status === "error" ? "Failed" : `${item.progress}%`}
                </span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={item.progress}
                max="100"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
