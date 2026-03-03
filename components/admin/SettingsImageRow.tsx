"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadWithProgress } from "@/lib/client/upload";

type Setting = {
  id: number;
  key_name: string;
  value_content: string | null;
};

type Props = {
  item: Setting;
};

export default function SettingsImageRow({ item }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const imgSrc = item.value_content
    ? item.value_content.startsWith("http")
      ? item.value_content
      : `/${item.value_content.replace(/^\/+/, "")}`
    : null;

  async function handleChange(file: File) {
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    const isSiteLogo = item.key_name === "site_logo";
    formData.append(isSiteLogo ? "file" : "image", file);

    const res = await uploadWithProgress({
      url: isSiteLogo ? "/api/settings/site_logo" : `/api/settings/${item.key_name}`,
      method: "PUT",
      body: formData,
      onProgress: (event) => setProgress(event.percent),
    });

    setLoading(false);
    setProgress(0);

    if (!res.ok) {
      alert("Upload failed");
    } else {
      router.refresh();
    }
  }

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-4 space-y-4">
      <div className="text-sm font-mono text-base-content/60">
        {item.key_name}
      </div>

      {imgSrc ? (
        <div className="flex justify-center">
          <img
            src={imgSrc}
            alt=""
            className="max-h-40 object-contain rounded"
          />
        </div>
      ) : (
        <div className="text-sm opacity-50">
          No image uploaded
        </div>
      )}

      <label className="btn btn-sm btn-outline w-full">
        {loading ? "Uploading..." : "Change image"}
        <input
          type="file"
          accept="image/*"
          hidden
          multiple
          disabled={loading}
          onChange={(e) =>
            e.target.files && handleChange(e.target.files[0])
          }
        />
      </label>

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
    </div>
  );
}
