"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BeforeAfterStyle = {
  id: string;
  name: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
};

function StyleComparison({
  style,
  index,
}: {
  style: BeforeAfterStyle;
  index: number;
}) {
  const [position, setPosition] = useState(50);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const textOnLeft = index % 2 === 0;

  const setPositionFromClient = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    const next = rect.width > 0 ? (x / rect.width) * 100 : 50;
    setPosition(next);
  }, []);

  useEffect(() => {
    setPosition(50);
    setAspectRatio(null);
  }, [style.beforeImageUrl, style.afterImageUrl]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    const target = event.currentTarget;
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
    setPositionFromClient(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setPositionFromClient(event.clientX);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    const target = event.currentTarget;
    if (target.releasePointerCapture) {
      target.releasePointerCapture(event.pointerId);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!event.touches[0]) return;
    draggingRef.current = true;
    setPositionFromClient(event.touches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !event.touches[0]) return;
    event.preventDefault();
    setPositionFromClient(event.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    draggingRef.current = false;
  };

  return (
    <article className="space-y-4">
      <h3 className="text-xl font-semibold text-[var(--color-ink)] text-center font-bodoni-moda">
        {style.name}
      </h3>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-8 lg:grid-rows-[repeat(7,minmax(0,1fr))] items-start content-start">
        <div
          className={`flex flex-col gap-3 ${
            textOnLeft
              ? "lg:col-span-3 lg:row-span-7 lg:row-start-1 lg:col-start-1"
              : "lg:col-span-3 lg:row-span-7 lg:row-start-1 lg:col-start-6 lg:text-right"
          }`}
        >
          {style.description ? (
            <p className="text-base leading-relaxed text-[var(--color-ink)] sm:text-lg font-bodoni-moda">
              {style.description}
            </p>
          ) : null}
        </div>
        <div
          className={`min-w-0 ${
            textOnLeft
              ? "lg:col-span-5 lg:row-span-7 lg:row-start-1 lg:col-start-4"
              : "lg:col-span-5 lg:row-span-7 lg:row-start-1 lg:col-start-1"
          }`}
        >
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50 touch-none"
            style={aspectRatio ? { aspectRatio, touchAction: "none" } : { touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div className="absolute inset-0">
              <img
                alt={`${style.name} after`}
                src={style.afterImageUrl}
                className="h-full w-full object-contain object-top select-none"
                loading="lazy"
                onLoad={(event) => {
                  if (aspectRatio) return;
                  const img = event.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
                  }
                }}
              />
            </div>
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <img
                alt={`${style.name} before`}
                src={style.beforeImageUrl}
                className="h-full w-full object-contain object-top select-none"
                loading="lazy"
                onLoad={(event) => {
                  if (aspectRatio) return;
                  const img = event.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
                  }
                }}
              />
            </div>
            <div
              className="absolute top-0 bottom-0 z-10 w-[2px] bg-white/70"
              style={{ left: `${position}%` }}
              aria-hidden="true"
            />
            <div
              className="absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md"
              style={{ left: `${position}%` }}
              role="slider"
              aria-label={`Image comparison slider for ${style.name}`}
            />
          </div>
          
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs uppercase tracking-[0.2em] text-white/60">
            <span className="text-left">Before</span>
            <span className="text-right">After</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PhotoGalleryBeforeAfter() {
  const [styles, setStyles] = useState<BeforeAfterStyle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/photogallery/before-after", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to load before/after content");
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
            })),
          );
        }
      } catch {
        // Keep defaults if fetch fails
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const hasStyles = styles.some((style) => style.beforeImageUrl && style.afterImageUrl);
  return (
    <section className="py-12 px-4 bg-[#0f0f0f]">
      <div className="max-w-6xl mx-auto">

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
              Loading comparison...
            </div>
          ) : hasStyles ? (
            <div>
              {styles
                .filter((style) => style.beforeImageUrl && style.afterImageUrl)
                .map((style, index, filtered) => (
                  <div key={style.id}>
                    <StyleComparison style={style} index={index} />
                    {index < filtered.length - 1 ? (
                      <hr className="my-12 border-0 h-px bg-[#ff5a00]/80" />
                    ) : null}
                  </div>
                ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/60">
              Add before and after images in the admin panel to display the comparison here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
