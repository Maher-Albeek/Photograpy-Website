"use client";

import { useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";

type UploadItem = {
  name: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
};

export default function ProjectImageUploader({
  projectId,
  onUploaded,
}: {
  projectId: number;
  onUploaded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const fileList = Array.from(files);
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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", String(projectId));

      const res = await uploadWithProgress({
        url: "/api/projects/upload",
        method: "POST",
        body: formData,
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
        alert(`Upload failed: ${file.name}`);
        setUploadQueue((prev) =>
          prev.map((item, index) =>
            index === i ? { ...item, status: "error" } : item
          )
        );
        break;
      }
      setUploadQueue((prev) =>
        prev.map((item, index) =>
          index === i ? { ...item, status: "done", progress: 100 } : item
        )
      );
    }

    setLoading(false);
    e.target.value = "";

    onUploaded();
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <label className="btn btn-outline mb-4">
        {loading ? "Uploading..." : "Upload images"}
        <input type="file" multiple hidden onChange={handleUpload} />
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
