"use client";

import { useEffect, useMemo, useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";
import { normalizeImageFile } from "@/lib/client/image";

type BeforeAfterStyle = {
  id: string;
  name: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
};

export default function AdminPhotoGalleryBeforeAfterPage() {
  const [styles, setStyles] = useState<BeforeAfterStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStyleId, setSavingStyleId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [beforePreviews, setBeforePreviews] = useState<Record<string, string | null>>({});
  const [afterPreviews, setAfterPreviews] = useState<Record<string, string | null>>({});
  const [beforeFiles, setBeforeFiles] = useState<Record<string, File | null>>({});
  const [afterFiles, setAfterFiles] = useState<Record<string, File | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const nextStyleName = useMemo(
    () => `Style ${styles.length + 1}`,
    [styles.length]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/photogallery/before-after", { cache: "no-store" });
        if (!res.ok) {
          let message = "Failed to fetch before/after data";
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
        if (active) {
          const incoming = Array.isArray(json.styles) ? json.styles : [];
          setStyles(
            incoming.map((style: BeforeAfterStyle, index: number) => ({
              id: style.id || `style-${index + 1}`,
              name: style.name || `Style ${index + 1}`,
              description: style.description || "",
              beforeImageUrl: style.beforeImageUrl || "",
              afterImageUrl: style.afterImageUrl || "",
            }))
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load before/after data"
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function saveStyle(styleId: string) {
    const style = styles.find((item) => item.id === styleId);
    if (!style) return;
    setSavingStyleId(styleId);
    setMessage(null);
    setError(null);
    setUploadProgress((prev) => ({ ...prev, [styleId]: 0 }));
    try {
      const formData = new FormData();
      formData.append("action", "style");
      formData.append("style", JSON.stringify(style));
      const beforeFile = beforeFiles[style.id];
      const afterFile = afterFiles[style.id];
      if (beforeFile) formData.append("beforeImage", beforeFile);
      if (afterFile) formData.append("afterImage", afterFile);

      const res = await uploadWithProgress({
        url: "/api/photogallery/before-after",
        method: "POST",
        body: formData,
        onProgress: (event) =>
          setUploadProgress((prev) => ({ ...prev, [styleId]: event.percent })),
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
      const incoming = Array.isArray(json.styles) ? json.styles : [];
      setStyles(
        incoming.map((item: BeforeAfterStyle, index: number) => ({
          id: item.id || `style-${index + 1}`,
          name: item.name || `Style ${index + 1}`,
          description: item.description || "",
          beforeImageUrl: item.beforeImageUrl || "",
          afterImageUrl: item.afterImageUrl || "",
        }))
      );
      setBeforeFiles((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setAfterFiles((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setBeforePreviews((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setAfterPreviews((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setMessage(`Style "${style.name || "Untitled"}" saved successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save this style.");
    } finally {
      setSavingStyleId(null);
      setUploadProgress((prev) => ({ ...prev, [styleId]: 0 }));
    }
  }

  async function handleBeforeChange(
    styleId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const rawFile = event.target.files?.[0] || null;
    setError(null);
    if (!rawFile) {
      setBeforeFiles((prev) => ({ ...prev, [styleId]: null }));
      setBeforePreviews((prev) => ({ ...prev, [styleId]: null }));
      return;
    }
    const file = await normalizeImageFile(rawFile);
    if (!file) {
      setBeforeFiles((prev) => ({ ...prev, [styleId]: null }));
      setBeforePreviews((prev) => ({ ...prev, [styleId]: null }));
      setError(
        "This image format is not supported. Please upload a JPG or PNG, or set your iPhone camera to Most Compatible."
      );
      return;
    }
    setBeforeFiles((prev) => ({ ...prev, [styleId]: file }));
    const reader = new FileReader();
    reader.onloadend = () =>
      setBeforePreviews((prev) => ({ ...prev, [styleId]: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleAfterChange(
    styleId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const rawFile = event.target.files?.[0] || null;
    setError(null);
    if (!rawFile) {
      setAfterFiles((prev) => ({ ...prev, [styleId]: null }));
      setAfterPreviews((prev) => ({ ...prev, [styleId]: null }));
      return;
    }
    const file = await normalizeImageFile(rawFile);
    if (!file) {
      setAfterFiles((prev) => ({ ...prev, [styleId]: null }));
      setAfterPreviews((prev) => ({ ...prev, [styleId]: null }));
      setError(
        "This image format is not supported. Please upload a JPG or PNG, or set your iPhone camera to Most Compatible."
      );
      return;
    }
    setAfterFiles((prev) => ({ ...prev, [styleId]: file }));
    const reader = new FileReader();
    reader.onloadend = () =>
      setAfterPreviews((prev) => ({ ...prev, [styleId]: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function handleAddStyle() {
    const id = `style-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setStyles((prev) => [
      ...prev,
      { id, name: nextStyleName, description: "", beforeImageUrl: "", afterImageUrl: "" },
    ]);
  }

  async function handleRemoveStyle(styleId: string) {
    const target = styles.find((style) => style.id === styleId);
    const label = target?.name?.trim() ? `"${target.name}"` : "this style";
    const confirmed = window.confirm(
      `Are you sure you want to remove ${label}? This will delete its images.`
    );
    if (!confirmed) return;

    const nextStyles = styles.filter((style) => style.id !== styleId);
    setSavingStyleId("__bulk__");
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("styles", JSON.stringify(nextStyles));
      nextStyles.forEach((style) => {
        const beforeFile = beforeFiles[style.id];
        const afterFile = afterFiles[style.id];
        if (beforeFile) formData.append(`beforeImage_${style.id}`, beforeFile);
        if (afterFile) formData.append(`afterImage_${style.id}`, afterFile);
      });

      const res = await uploadWithProgress({
        url: "/api/photogallery/before-after",
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let message = "Remove failed";
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
      const incoming = Array.isArray(json.styles) ? json.styles : [];
      setStyles(
        incoming.map((style: BeforeAfterStyle, index: number) => ({
          id: style.id || `style-${index + 1}`,
          name: style.name || `Style ${index + 1}`,
          description: style.description || "",
          beforeImageUrl: style.beforeImageUrl || "",
          afterImageUrl: style.afterImageUrl || "",
        }))
      );
      setBeforeFiles((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setAfterFiles((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setBeforePreviews((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setAfterPreviews((prev) => {
        const next = { ...prev };
        delete next[styleId];
        return next;
      });
      setMessage("Style removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove this style.");
    } finally {
      setSavingStyleId(null);
    }
  }

  function handleNameChange(styleId: string, value: string) {
    setStyles((prev) =>
      prev.map((style) => (style.id === styleId ? { ...style, name: value } : style))
    );
  }

  function handleDescriptionChange(styleId: string, value: string) {
    setStyles((prev) =>
      prev.map((style) => (style.id === styleId ? { ...style, description: value } : style))
    );
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase text-base-content/60">Photo Gallery</p>
        <h1 className="text-2xl font-bold">Before and After Styles</h1>
        <p className="text-sm text-base-content/60">
          Upload two images. They will be converted and saved as AVIF.
        </p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Styles</h2>
        <button type="button" onClick={handleAddStyle} className="btn btn-outline btn-sm">
          Add Style
        </button>
      </div>

      <div className="space-y-6">
        {styles.map((style, index) => (
          <div key={style.id} className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-base-content/60">
                    Style {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold">
                    {style.name || `Style ${index + 1}`}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveStyle(style.id)}
                    disabled={savingStyleId !== null}
                    className="btn btn-primary btn-sm"
                  >
                    {savingStyleId === style.id ? "Saving..." : "Save Style"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStyle(style.id)}
                    disabled={savingStyleId !== null}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-semibold">Style name</span>
                  </div>
                  <input
                    type="text"
                    value={style.name}
                    onChange={(event) => handleNameChange(style.id, event.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-semibold">Style description</span>
                  </div>
                  <textarea
                    value={style.description}
                    onChange={(event) =>
                      handleDescriptionChange(style.id, event.target.value)
                    }
                    className="textarea textarea-bordered w-full"
                  />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-semibold">Before image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleBeforeChange(style.id, event)}
                    className="file-input file-input-bordered w-full"
                  />
                  {(beforePreviews[style.id] || style.beforeImageUrl) && (
                    <div className="mt-3">
                      <img
                        src={beforePreviews[style.id] || style.beforeImageUrl}
                        alt={`${style.name} before preview`}
                        className="w-full max-w-sm rounded-lg border border-base-300"
                      />
                    </div>
                  )}
                </label>

                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-semibold">After image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleAfterChange(style.id, event)}
                    className="file-input file-input-bordered w-full"
                  />
                  {(afterPreviews[style.id] || style.afterImageUrl) && (
                    <div className="mt-3">
                      <img
                        src={afterPreviews[style.id] || style.afterImageUrl}
                        alt={`${style.name} after preview`}
                        className="w-full max-w-sm rounded-lg border border-base-300"
                      />
                    </div>
                  )}
                </label>
              </div>

              {savingStyleId === style.id && (
                <div className="space-y-1">
                  <progress
                    className="progress progress-primary w-full"
                    value={uploadProgress[style.id] ?? 0}
                    max="100"
                  />
                  <p className="text-xs text-base-content/60">
                    {uploadProgress[style.id] ?? 0}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {styles.length === 0 && (
          <div className="text-base-content/60">
            No styles yet. Click "Add Style".
          </div>
        )}
      </div>
    </main>
  );
}
