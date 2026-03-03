"use client";
import { FormEvent, useEffect, useState } from "react";
import { uploadWithProgress } from "@/lib/client/upload";
import { normalizeImageFile } from "@/lib/client/image";

type PhotoAlbum = {
  name: string;
  date?: string;
  description?: string;
  photos: string[];
  coverPhoto?: string;
};

type PhotoGalleryContentPage = {
  title: string;
  description?: string;
  albums: PhotoAlbum[];
};

export default function AdminPhotoGalleryContentPage() {
  const [data, setData] = useState<PhotoGalleryContentPage>({
    title: "",
    description: "",
    albums: [],
  });
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [savingAlbumIndex, setSavingAlbumIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadPreviews, setUploadPreviews] = useState<string[][]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[][]>([]);
  const [contentUploadProgress, setContentUploadProgress] = useState(0);
  const [albumUploadProgress, setAlbumUploadProgress] = useState<Record<number, number>>({});
  const [collapsedAlbums, setCollapsedAlbums] = useState<boolean[]>([]);
  const [draggedExisting, setDraggedExisting] = useState<{
    albumIndex: number;
    photoIndex: number;
  } | null>(null);
  const [draggedUpload, setDraggedUpload] = useState<{
    albumIndex: number;
    photoIndex: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/photogallery/content", { cache: "no-store" });
        if (!res.ok) {
          let message = "Failed to fetch gallery content";
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
          const albums = jsonData.albums || [];
          setData({
            title: jsonData.title || "",
            description: jsonData.description || "",
            albums,
          });
          setUploadPreviews(albums.map(() => []));
          setUploadFiles(albums.map(() => []));
          setCollapsedAlbums(albums.map(() => false));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load gallery content"
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function saveContent(
    nextData: PhotoGalleryContentPage = data,
    nextUploadFiles: File[][] = uploadFiles
  ) {
    setSavingContent(true);
    setMessage(null);
    setError(null);
    setContentUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("action", "full");
      formData.append("title", nextData.title);
      formData.append("description", nextData.description || "");
      const albumsMeta = nextData.albums.map((album) => ({
        name: album.name,
        date: album.date || "",
        description: album.description || "",
        photos: album.photos || [],
        coverPhoto: album.coverPhoto || "",
      }));
      formData.append("albums", JSON.stringify(albumsMeta));
      nextUploadFiles.forEach((files, index) => {
        files.forEach((file) => {
          formData.append(`albumUploads_${index}`, file);
        });
      });
      const res = await uploadWithProgress({
        url: "/api/photogallery/content",
        method: "POST",
        body: formData,
        onProgress: (event) => setContentUploadProgress(event.percent),
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
      const albums = json.albums || [];
      setData({
        title: json.title || "",
        description: json.description || "",
        albums,
      });
      setUploadPreviews(albums.map(() => []));
      setUploadFiles(albums.map(() => []));
      setCollapsedAlbums(albums.map(() => false));
      setMessage("Content saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save gallery content."
      );
    } finally {
      setSavingContent(false);
      setContentUploadProgress(0);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveContent();
  }

  async function saveAlbum(index: number) {
    setSavingAlbumIndex(index);
    setMessage(null);
    setError(null);
    setAlbumUploadProgress((prev) => ({ ...prev, [index]: 0 }));
    try {
      const album = data.albums[index];
      if (!album) {
        throw new Error("Album not found");
      }
      const formData = new FormData();
      formData.append("action", "album");
      formData.append("albumIndex", String(index));
      formData.append(
        "album",
        JSON.stringify({
          name: album.name,
          date: album.date || "",
          description: album.description || "",
          photos: album.photos || [],
          coverPhoto: album.coverPhoto || "",
        })
      );
      const files = uploadFiles[index] || [];
      files.forEach((file) => {
        formData.append("albumUploads", file);
      });

      const res = await uploadWithProgress({
        url: "/api/photogallery/content",
        method: "POST",
        body: formData,
        onProgress: (event) =>
          setAlbumUploadProgress((prev) => ({ ...prev, [index]: event.percent })),
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
      const responseAlbum = Array.isArray(json.albums) ? json.albums[index] : undefined;
      setData((prev) => {
        const nextAlbums = [...prev.albums];
        if (responseAlbum) {
          nextAlbums[index] = responseAlbum;
        }
        return { ...prev, albums: nextAlbums };
      });
      setUploadPreviews((prev) => {
        const next = [...prev];
        next[index] = [];
        return next;
      });
      setUploadFiles((prev) => {
        const next = [...prev];
        next[index] = [];
        return next;
      });
      setMessage("Album saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save album.");
    } finally {
      setSavingAlbumIndex(null);
      setAlbumUploadProgress((prev) => ({ ...prev, [index]: 0 }));
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(
    albumIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;
    setError(null);
    if (!files || files.length === 0) {
      return;
    }
    const rawFiles = Array.from(files);
    const normalized = await Promise.all(rawFiles.map((file) => normalizeImageFile(file)));
    if (normalized.some((file) => !file)) {
      setError(
        "This image format is not supported. Please upload JPG or PNG, or set your iPhone camera to Most Compatible."
      );
      return;
    }
    const fileList = normalized as File[];
    const previews = await Promise.all(fileList.map((file) => readFileAsDataUrl(file)));
    setUploadPreviews((prev) => {
      const next = [...prev];
      next[albumIndex] = previews;
      return next;
    });
    setUploadFiles((prev) => {
      const next = [...prev];
      next[albumIndex] = fileList;
      return next;
    });
  }

  function handleAddAlbum() {
    setData((prev) => ({
      ...prev,
      albums: [
        ...prev.albums,
        { name: "", date: "", description: "", photos: [], coverPhoto: "" },
      ],
    }));
    setUploadPreviews((prev) => [...prev, []]);
    setUploadFiles((prev) => [...prev, []]);
    setCollapsedAlbums((prev) => [...prev, false]);
  }

  function handleAlbumChange(
    index: number,
    field: "name" | "date" | "description",
    value: string
  ) {
    setData((prev) => {
      const nextAlbums = [...prev.albums];
      nextAlbums[index] = { ...nextAlbums[index], [field]: value };
      return { ...prev, albums: nextAlbums };
    });
  }

  function handleSetCoverPhoto(index: number, photoUrl: string) {
    setData((prev) => {
      const nextAlbums = [...prev.albums];
      nextAlbums[index] = { ...nextAlbums[index], coverPhoto: photoUrl };
      return { ...prev, albums: nextAlbums };
    });
  }

  async function handleRemoveAlbum(index: number) {
    const albumName = data.albums[index]?.name || `Album ${index + 1}`;
    const ok = confirm(
      `Delete "${albumName}"?\nThis will remove the album and delete its images.`
    );
    if (!ok) return;

    const nextAlbums = data.albums.filter((_, i) => i !== index);
    const nextData = { ...data, albums: nextAlbums };
    const nextUploadPreviews = uploadPreviews.filter((_, i) => i !== index);
    const nextUploadFiles = uploadFiles.filter((_, i) => i !== index);
    const nextCollapsed = collapsedAlbums.filter((_, i) => i !== index);

    setData(nextData);
    setUploadPreviews(nextUploadPreviews);
    setUploadFiles(nextUploadFiles);
    setCollapsedAlbums(nextCollapsed);

    await saveContent(nextData, nextUploadFiles);
  }

  function handleToggleAlbum(index: number) {
    setCollapsedAlbums((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  function handleRemoveExistingPhoto(albumIndex: number, photoIndex: number) {
    setData((prev) => {
      const nextAlbums = [...prev.albums];
      const album = nextAlbums[albumIndex];
      if (!album) {
        return prev;
      }
      const removedPhoto = album.photos?.[photoIndex];
      const nextPhotos = (album.photos || []).filter((_, idx) => idx !== photoIndex);
      const nextCover =
        removedPhoto && album.coverPhoto === removedPhoto
          ? nextPhotos[0] || ""
          : album.coverPhoto || "";
      nextAlbums[albumIndex] = { ...album, photos: nextPhotos, coverPhoto: nextCover };
      return { ...prev, albums: nextAlbums };
    });
  }

  function handleRemoveUploadPreview(albumIndex: number, previewIndex: number) {
    setUploadPreviews((prev) => {
      const next = [...prev];
      const nextPreviews = [...(next[albumIndex] || [])];
      nextPreviews.splice(previewIndex, 1);
      next[albumIndex] = nextPreviews;
      return next;
    });
    setUploadFiles((prev) => {
      const next = [...prev];
      const nextFiles = [...(next[albumIndex] || [])];
      nextFiles.splice(previewIndex, 1);
      next[albumIndex] = nextFiles;
      return next;
    });
  }

  function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }

  function handleExistingDragStart(albumIndex: number, photoIndex: number) {
    setDraggedExisting({ albumIndex, photoIndex });
  }

  function handleExistingDrop(albumIndex: number, photoIndex: number) {
    if (!draggedExisting || draggedExisting.albumIndex !== albumIndex) {
      setDraggedExisting(null);
      return;
    }
    if (draggedExisting.photoIndex === photoIndex) {
      setDraggedExisting(null);
      return;
    }
    setData((prev) => {
      const nextAlbums = [...prev.albums];
      const album = nextAlbums[albumIndex];
      if (!album || !album.photos) {
        return prev;
      }
      const nextPhotos = moveItem(album.photos, draggedExisting.photoIndex, photoIndex);
      nextAlbums[albumIndex] = { ...album, photos: nextPhotos };
      return { ...prev, albums: nextAlbums };
    });
    setDraggedExisting(null);
  }

  function handleUploadDragStart(albumIndex: number, photoIndex: number) {
    setDraggedUpload({ albumIndex, photoIndex });
  }

  function handleUploadDrop(albumIndex: number, photoIndex: number) {
    if (!draggedUpload || draggedUpload.albumIndex !== albumIndex) {
      setDraggedUpload(null);
      return;
    }
    if (draggedUpload.photoIndex === photoIndex) {
      setDraggedUpload(null);
      return;
    }
    setUploadPreviews((prev) => {
      const next = [...prev];
      const list = next[albumIndex] || [];
      next[albumIndex] = moveItem(list, draggedUpload.photoIndex, photoIndex);
      return next;
    });
    setUploadFiles((prev) => {
      const next = [...prev];
      const list = next[albumIndex] || [];
      next[albumIndex] = moveItem(list, draggedUpload.photoIndex, photoIndex);
      return next;
    });
    setDraggedUpload(null);
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm uppercase text-base-content/60">Photo Gallery</p>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-sm text-base-content/60">
          Manage the gallery page copy and album photos.
        </p>
      </header>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body space-y-6">
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Title</span>
              </div>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="input input-bordered w-full"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-semibold">Description</span>
              </div>
              <textarea
                value={data.description || ""}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
                className="textarea textarea-bordered w-full"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingContent || savingAlbumIndex !== null}
                className="btn btn-primary"
              >
                {savingContent ? "Saving..." : "Save Content"}
              </button>
              <button
                type="button"
                onClick={handleAddAlbum}
                className="btn btn-outline"
              >
                Add Album
              </button>
            </div>

            {savingContent && (
              <div className="space-y-1">
                <progress
                  className="progress progress-primary w-full"
                  value={contentUploadProgress}
                  max="100"
                />
                <p className="text-xs text-base-content/60">
                  {contentUploadProgress}%
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="space-y-6">
        {data.albums.map((album, index) => (
          <div key={index} className="card bg-base-100 border border-base-300">
            <div className="card-body space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-base-content/60">
                    Album {index + 1}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {album.name || "Untitled Album"}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveAlbum(index)}
                    disabled={savingContent || savingAlbumIndex !== null}
                    className="btn btn-primary btn-sm"
                  >
                    {savingAlbumIndex === index ? "Saving..." : "Save Album"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAlbum(index)}
                    disabled={savingContent || savingAlbumIndex !== null}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAlbum(index)}
                    className="btn btn-ghost btn-sm"
                  >
                    {collapsedAlbums[index] ? "Expand" : "Collapse"}
                  </button>
                </div>
              </div>

              {savingAlbumIndex === index && (
                <div className="space-y-1">
                  <progress
                    className="progress progress-primary w-full"
                    value={albumUploadProgress[index] ?? 0}
                    max="100"
                  />
                  <p className="text-xs text-base-content/60">
                    {albumUploadProgress[index] ?? 0}%
                  </p>
                </div>
              )}

              {!collapsedAlbums[index] && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="form-control">
                      <div className="label">
                        <span className="label-text font-semibold">Album Name</span>
                      </div>
                      <input
                        type="text"
                        value={album.name || ""}
                        onChange={(e) =>
                          handleAlbumChange(index, "name", e.target.value)
                        }
                        className="input input-bordered w-full"
                      />
                    </label>

                    <label className="form-control">
                      <div className="label">
                        <span className="label-text font-semibold">Album Date</span>
                      </div>
                      <input
                        type="text"
                        value={album.date || ""}
                        onChange={(e) =>
                          handleAlbumChange(index, "date", e.target.value)
                        }
                        className="input input-bordered w-full"
                      />
                    </label>
                  </div>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text font-semibold">Album Description</span>
                    </div>
                    <textarea
                      value={album.description || ""}
                      onChange={(e) =>
                        handleAlbumChange(index, "description", e.target.value)
                      }
                      className="textarea textarea-bordered w-full"
                    />
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text font-semibold">Add Photos</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(event) => handleFileChange(index, event)}
                      className="file-input file-input-bordered w-full"
                    />
                  </label>

                  {album.photos && album.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-base-content/70 mb-2">
                        Existing Photos
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {album.photos.map((src, photoIndex) => (
                          <div
                            key={photoIndex}
                            className="rounded-lg border border-base-300 bg-base-200 p-2 flex flex-col items-center gap-2 cursor-move"
                            draggable
                            onDragStart={() =>
                              handleExistingDragStart(index, photoIndex)
                            }
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleExistingDrop(index, photoIndex)}
                            title="Drag to reorder"
                          >
                            <img
                              src={src}
                              alt={`Existing ${photoIndex + 1}`}
                              className="w-full h-auto rounded"
                            />
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(index, src)}
                                className={`btn btn-xs ${
                                  album.coverPhoto === src
                                    ? "btn-success"
                                    : "btn-ghost"
                                }`}
                              >
                                {album.coverPhoto === src ? "Cover" : "Set Cover"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingPhoto(index, photoIndex)}
                                className="btn btn-xs btn-ghost text-error"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadPreviews[index] && uploadPreviews[index].length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-base-content/70 mb-2">
                        New Uploads
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {uploadPreviews[index].map((src, previewIndex) => (
                          <div
                            key={previewIndex}
                            className="rounded-lg border border-base-300 bg-base-200 p-2 flex flex-col items-center gap-2 cursor-move"
                            draggable
                            onDragStart={() =>
                              handleUploadDragStart(index, previewIndex)
                            }
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleUploadDrop(index, previewIndex)}
                            title="Drag to reorder"
                          >
                            <img
                              src={src}
                              alt={`Preview ${previewIndex + 1}`}
                              className="w-full h-auto rounded"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveUploadPreview(index, previewIndex)
                              }
                              className="btn btn-xs btn-ghost text-error"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {data.albums.length === 0 && (
          <div className="text-base-content/60">
            No albums yet. Click "Add Album" to create one.
          </div>
        )}
      </div>
    </main>
  );
}
