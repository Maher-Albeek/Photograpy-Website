"use client";

import { useEffect, useState } from "react";
import ExternalMediaEmbed from "@/components/cookie-consent/ExternalMediaEmbed";

type VideoSource = "bunny" | "youtube" | "vimeo" | "embed";

type VideoItem = {
  source: VideoSource;
  title?: string;
  libraryId?: string;
  videoId?: string;
  url?: string;
};

type VideoGalleryContent = {
  content: string;
  videos: VideoItem[];
  videoUrls?: { url: string; title: string }[];
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

function mapIncomingVideos(payload: any): VideoItem[] {
  if (Array.isArray(payload?.videos)) {
    return payload.videos.map((video: any) => ({
      source:
        video?.source === "bunny" ||
        video?.source === "youtube" ||
        video?.source === "vimeo" ||
        video?.source === "embed"
          ? video.source
          : "embed",
      title: typeof video?.title === "string" ? video.title : "",
      libraryId: video?.libraryId != null ? String(video.libraryId) : "",
      videoId: video?.videoId != null ? String(video.videoId) : "",
      url: video?.url != null ? String(video.url) : "",
    }));
  }

  if (Array.isArray(payload?.videoUrls)) {
    return payload.videoUrls.map((video: any) => ({
      source: "embed" as VideoSource,
      title: typeof video?.title === "string" ? video.title : "",
      url: typeof video?.url === "string" ? video.url : "",
    }));
  }

  return [];
}

function getEmbedUrl(video: VideoItem) {
  if (video.source === "bunny") {
    if (!video.libraryId || !video.videoId) return "";
    return `https://iframe.mediadelivery.net/embed/${video.libraryId}/${video.videoId}?autoplay=false`;
  }
  if (video.source === "youtube") {
    const id = extractYouTubeId(video.videoId || "");
    if (!id) return "";
    return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (video.source === "vimeo") {
    const id = extractVimeoId(video.videoId || "");
    if (!id) return "";
    return `https://player.vimeo.com/video/${id}`;
  }
  if (video.source === "embed") {
    return video.url || "";
  }
  return "";
}

function getVideoProvider(video: VideoItem) {
  if (video.source === "bunny") return "Bunny Stream";
  if (video.source === "youtube") return "YouTube";
  if (video.source === "vimeo") return "Vimeo";
  return "einen externen Anbieter";
}

export default function VideoGalleryContent() {
  const [data, setData] = useState<VideoGalleryContent | null>(null);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/videoGallery", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load content");
        const json = await res.json();
        if (active)
          setData({
            content: json.content ?? "",
            videos: mapIncomingVideos(json),
          });
      } catch {
        // keep null to avoid flicker
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const paragraphs =
    data?.content
      ?.split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean) ?? [];
  return (
    <main className="container mx-auto px-6 py-24 max-w-5xl">
      <section className="space-y-6 opacity-80 leading-relaxed ">
        {paragraphs.length
          ? paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-wrap ">
                {p}
              </p>
            ))
          : null}
      </section>
      {data?.videos && data.videos.length ? (
        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.videos.map((video, idx) => {
            const embedUrl = getEmbedUrl(video);
            if (!embedUrl) return null;
            return (
              <div key={`${video.source}-${idx}`} className="w-full aspect-w-16 aspect-h-9">
                <ExternalMediaEmbed
                  title={video.title || `Video ${idx + 1}`}
                  provider={getVideoProvider(video)}
                >
                  <iframe
                    src={embedUrl}
                    title={video.title || `Video ${idx + 1}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full rounded-md shadow-md"
                  ></iframe>
                </ExternalMediaEmbed>
              </div>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
