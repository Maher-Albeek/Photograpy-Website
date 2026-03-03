"use client";

import { useState } from "react";

type Props = {
  libraryId: string;
  videoId: string;
};

export default function BunnyVideoPreview({
  libraryId,
  videoId,
}: Props) {
  const [play, setPlay] = useState(false);

  const thumbnailUrl =
      `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}/thumbnail.jpg?v=1`;;

  if (play) {
    return (
      <iframe
        src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true`}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="w-full h-48 rounded-lg bg-black"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="relative w-full h-48 rounded-lg overflow-hidden bg-black"
      aria-label="Play video"
    >
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="w-full h-full object-cover"
      />

      {/* Play icon */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <span className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black text-xl">
          ▶
        </span>
      </div>
    </button>
  );
}
