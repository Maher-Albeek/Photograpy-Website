"use client";

import { useEffect, useState } from "react";

type PhotoGalleryHero = {
  title: string;
  imageUrl: string;
};

export default function PhotoGalleryHero() {
  const [data, setData] = useState<PhotoGalleryHero>({ title: "", imageUrl: "" });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/photogallery/hero", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load hero content");
        const json = await res.json();
        if (active) setData({ title: json.title ?? "", imageUrl: json.imageUrl ?? "" });
      } catch {
        // Keep defaults if fetch fails
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const backgroundStyle = data.imageUrl
    ? { backgroundImage: `url(${data.imageUrl})` }
    : undefined;

  return (
    <section
      className="hero-section relative min-h-screen flex flex-col justify-center items-center text-center px-6 py-24 overflow-hidden bg-amber-900 bg-cover bg-center bg-no-repeat"
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div className="relative flex flex-col items-center justify-center space-y-6 text-amber-50">
        {data.title ? (
          <h1 className="text-3xl sm:text-5xl font-bold text-amber-50 max-w-2xl drop-shadow-lg">
            {data.title}
          </h1>
        ) : null}
      </div>
    </section>
  );
}
