"use client";

import { useEffect, useState } from "react";

type AboutMeContent = {
  title: string;
  content: string;
};

export default function AboutContent() {
  const [data, setData] = useState<AboutMeContent | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/aboutMe/content", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load content");
        const json = await res.json();
        if (active) setData({ title: json.title ?? "", content: json.content ?? "" });
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
    <main className="container mx-auto px-6 py-24 max-w-3xl">
      <h1 className="text-4xl font-bold mb-10">{data?.title || "About Me"}</h1>
      <section className="space-y-6 opacity-80 leading-relaxed ">
        {paragraphs.length
          ? paragraphs.map((p, idx) => (
              <p key={idx} className="whitespace-pre-wrap ">
                {p}
              </p>
            ))
          : null}
      </section>
    </main>
  );
}
