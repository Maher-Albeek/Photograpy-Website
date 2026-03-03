"use client";

import { useRouter } from "next/navigation";

import ProjectImageUploader from "./ProjectImageUploader";
import ProjectImageDeleteButton from "./ProjectImageDeleteButton";
import ProjectImageThumbnailButton from "./ProjectImageThumbnailButton";
import BunnyVideoPreview from "./BunnyVideoPreview";

type MediaItem = {
  id: number;
  media_type: "image" | "video";
  file_path: string | null;
  bunny_library_id: string | null;
  bunny_video_id: string | null;
  video_source: string | null;
  video_id: string | null;
  video_url: string | null;
  is_thumbnail: number;
};

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

function getEmbedUrl(item: MediaItem, source: string) {
  if (source === "bunny") {
    if (!item.bunny_library_id || !item.bunny_video_id) return "";
    return `https://iframe.mediadelivery.net/embed/${item.bunny_library_id}/${item.bunny_video_id}?autoplay=false`;
  }
  if (source === "youtube") {
    const id = extractYouTubeId(item.video_id || "");
    if (!id) return "";
    return `https://www.youtube.com/embed/${id}`;
  }
  if (source === "vimeo") {
    const id = extractVimeoId(item.video_id || "");
    if (!id) return "";
    return `https://player.vimeo.com/video/${id}`;
  }
  if (source === "embed") {
    return item.video_url || "";
  }
  return "";
}

function resolveImageSrc(value: string | null) {
  if (!value) return "";
  return /^https?:\/\//i.test(value)
    ? value
    : `/${value.replace(/^\/+/, "")}`;
}

export default function ProjectGalleryClient({
  projectId,
  media,
}: {
  projectId: number;
  media: MediaItem[];
}) {
  const router = useRouter();

  return (
    <>
      {/* Upload images */}
      <ProjectImageUploader
        projectId={projectId}
        onUploaded={() => router.refresh()}
      />

      {/* Empty state */}
      {(!media || media.length === 0) && (
        <p className="text-sm opacity-60 mt-4">
          No media added yet
        </p>
      )}

      {/* Gallery */}
      {media && media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative rounded-lg overflow-hidden border border-base-300 bg-base-100"
            >
              {/* Delete */}
              <ProjectImageDeleteButton
                mediaId={item.id}
                onDeleted={() => router.refresh()}
              />

              {/* Thumbnail button (images only) */}
              {item.media_type === "image" && (
                <ProjectImageThumbnailButton
                  mediaId={item.id}
                  active={item.is_thumbnail === 1}
                  onDone={() => router.refresh()}
                />
              )}

              {/* IMAGE */}
              {item.media_type === "image" && item.file_path && (
                <img
                  src={resolveImageSrc(item.file_path)}
                  alt=""
                  className="h-48 w-full object-cover"
                />
              )}

              {/* VIDEO (Bunny) */}
              {item.media_type === "video" && (() => {
                const source =
                  item.video_source ||
                  (item.bunny_library_id && item.bunny_video_id ? "bunny" : "embed");

                if (source === "bunny" && item.bunny_library_id && item.bunny_video_id) {
                  return (
                    <BunnyVideoPreview
                      libraryId={item.bunny_library_id}
                      videoId={item.bunny_video_id}
                    />
                  );
                }

                const embedUrl = getEmbedUrl(item, source);
                if (!embedUrl) return null;

                return (
                  <iframe
                    src={embedUrl}
                    title="Video preview"
                    className="w-full h-48 rounded-lg bg-black"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
