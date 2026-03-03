"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, Navigation, Pagination, Zoom } from "swiper/modules";
import "swiper/css/bundle";

type PhotoGalleryContent = {
  title: string;
  description?: string;
  albums?: {
    name: string;
    date?: string;
    description?: string;
    photos?: string[];
    coverPhoto?: string;
  }[];
};

export default function PhotoGalleryContent() {
    const [data, setData] = useState<PhotoGalleryContent | null>(null);
    const [lightbox, setLightbox] = useState<{ albumIndex: number; photoIndex: number } | null>(null);
    const [albumModal, setAlbumModal] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch("/api/photogallery/content", { cache: "no-store" });
                if (!res.ok) {
                    throw new Error("Failed to fetch gallery content");
                }
                const jsonData = await res.json();
                if (active) {
                    setData(jsonData);
                }
            } catch (err) {
                console.error("Failed to load gallery content");
            }
        })();
        return () => {
            active = false;
        };
    }, []);
    useEffect(() => {
        if (!lightbox && albumModal === null) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (lightbox) {
                    setLightbox(null);
                    return;
                }
                setAlbumModal(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [lightbox, albumModal]);

    if (!data) {
        return <div>Loading...</div>;
    }
    const activeLightboxAlbum = lightbox ? data.albums?.[lightbox.albumIndex] : null;
    const activeModalAlbum = albumModal !== null ? data.albums?.[albumModal] : null;
    return (
        <section className="py-12 px-4 bg-[#0f0f0f]">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-ephesis mb-6 text-center text-[var(--color-ink)]">{data.title}</h2>
                {data.description && (
                    <p className="text-center mb-8 text-[var(--color-ink)] opacity-80 font-ephesis text-2xl">{data.description}</p>
                )}
                {data.albums && data.albums.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {data.albums.map((album, albumIndex) => {
                            const coverImage = album.coverPhoto || album.photos?.[0];
                            return (
                                <div key={albumIndex} className="mx-auto w-full max-w-4xl">
                                    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg md:flex-row">
                                        <div className="w-full md:w-1/2 md:shrink-0">
                                            {coverImage ? (
                                                <img
                                                    src={coverImage}
                                                    alt={`${album.name} cover`}
                                                    className="h-64 w-full object-cover md:h-full"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-64 w-full items-center justify-center bg-white/10 text-sm text-gray-300">
                                                    No cover image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex w-full flex-col justify-between p-6">
                                            <h3 className="mb-2 text-3xl font-ephesis tracking-tight text-[var(--color-ink)]">
                                                {album.name || "Untitled Album"}
                                            </h3>
                                            {album.description && (
                                                <p className="mb-6 text-xl text-[var(--color-ink)] opacity-80 font-ephesis">{album.description}</p>
                                            )}
                                            {!album.description && (
                                                <p className="mb-6 text-sm text-white/70">
                                                    {album.photos?.length || 0} photos
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-white/60">
                                                {album.date && <span>{album.date}</span>}
                                                {album.photos && album.photos.length > 0 && (
                                                    <span>{album.photos.length} photos</span>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setAlbumModal(albumIndex)}
                                                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#ff5a00] hover:border-1 hover:border-[#ff5a00] hover:text-white"
                                                >
                                                    View album
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M5 12h14" />
                                                        <path d="m13 5 7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="col-span-full text-center text-gray-500">No albums available.</p>
                )}
            </div>
            {albumModal !== null && activeModalAlbum ? (
                <div
                    className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-8"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${activeModalAlbum.name} album`}
                    onClick={() => setAlbumModal(null)}
                >
                    <button
                        type="button"
                        className="fixed right-3 top-3 z-[100000] rounded-full border border-[#ff5a00] bg-black/80 p-1.5 text-white shadow-lg hover:bg-black/95"
                        onClick={() => setAlbumModal(null)}
                        aria-label="Close album"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-4 w-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div
                        className="relative w-full max-w-6xl max-h-[85vh] overflow-y-auto rounded-2xl  bg-[#0f0f0f] p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="text-center">
                            <h3 className="text-3xl font-ephesis text-[var(--color-ink)]">{activeModalAlbum.name}</h3>
                            {activeModalAlbum.date && (
                                <p className="text-sm uppercase tracking-wide text-white/60">{activeModalAlbum.date}</p>
                            )}
                            {activeModalAlbum.description && (
                                <p className="mt-2 text-[var(--color-ink)] opacity-80 font-ephesis text-xl">{activeModalAlbum.description}</p>
                            )}
                        </div>
                        <div className="mt-6">
                            {activeModalAlbum.photos && activeModalAlbum.photos.length > 0 ? (
                                <>
                                    <div className="md:hidden max-h-[70vh] overflow-y-auto pr-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            {activeModalAlbum.photos.map((imageUrl, index) => (
                                                <button
                                                    type="button"
                                                    key={`${albumModal}-mobile-${index}`}
                                                    className="relative overflow-hidden rounded-xl bg-white/5 shadow-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                                                    onClick={() => {
                                                        setLightbox({ albumIndex: albumModal, photoIndex: index });
                                                        setActiveIndex(index);
                                                    }}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${activeModalAlbum.name} Photo ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="hidden md:flex justify-center">
                                <div className="w-[120vmin] max-w-[1100px] h-[120vmin] max-h-[1100px] [container-type:inline-size]">
                                    <div className="relative h-full w-full grid gap-4 transition-all duration-500 ease-in-out md:grid-cols-[33.333cqmin_33.333cqmin_33.333cqmin] has-[>div:nth-child(1):hover]:md:grid-cols-[70cqmin_15cqmin_15cqmin] has-[>div:nth-child(2):hover]:md:grid-cols-[15cqmin_70cqmin_15cqmin] has-[>div:nth-child(3):hover]:md:grid-cols-[15cqmin_15cqmin_70cqmin] group before:bg-white/15 before:absolute before:inset-0 before:blur-[80px] hover:before:bg-white/5 before:transition-all before:ease-in-out before:duration-500 before:delay-300 before:rounded-xl p-4">
                                                {[0, 1, 2].map((columnIndex) => (
                                                    <div
                                                        key={`${albumModal}-column-${columnIndex}`}
                                                className="grid gap-4 transition-all duration-500 ease-in-out grid-rows-[33.333cqmin_33.333cqmin_33.333cqmin] has-[button:nth-child(1):hover]:grid-rows-[70cqmin_15cqmin_15cqmin] has-[button:nth-child(2):hover]:grid-rows-[15cqmin_70cqmin_15cqmin] has-[button:nth-child(3):hover]:grid-rows-[15cqmin_15cqmin_70cqmin]"
                                                    >
                                                        {[0, 1, 2].map((rowIndex) => {
                                                            const gridIndex = columnIndex * 3 + rowIndex;
                                                            const imageUrl = activeModalAlbum.photos?.[gridIndex];
                                                            if (!imageUrl) {
                                                                return (
                                                                    <div
                                                                        key={`${albumModal}-empty-${gridIndex}`}
                                                                        className="rounded-xl bg-white/5 shadow-2xl"
                                                                        aria-hidden="true"
                                                                    />
                                                                );
                                                            }
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={`${albumModal}-${gridIndex}`}
                                                                    className="relative overflow-hidden rounded-xl cursor-pointer h-full shadow-2xl bg-transparent text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                                                                    onClick={() => {
                                                                        setLightbox({ albumIndex: albumModal, photoIndex: gridIndex });
                                                                        setActiveIndex(gridIndex);
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={`${activeModalAlbum.name} Photo ${gridIndex + 1}`}
                                                                        className="w-full h-full object-cover transition-all duration-500 ease-in-out blur-0 group-hover:blur-[0.5px] group-hover:hover:blur-0 brightness-100 group-hover:brightness-50 group-hover:hover:brightness-100 contrast-100 group-hover:contrast-[1.2] group-hover:hover:contrast-110 saturate-[0.2] group-hover:saturate-0 group-hover:hover:saturate-100 scale-100 group-hover:scale-100 group-hover:hover:scale-[1.2] group-hover:delay-300"
                                                                        loading="lazy"
                                                                    />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-400">No photos in this album.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
            {lightbox && activeLightboxAlbum?.photos && activeLightboxAlbum.photos.length > 0 ? (
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 px-4 py-8"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${activeLightboxAlbum.name} photo viewer`}
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative w-full max-w-5xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="fixed right-3 top-3 z-[100000] flex items-center gap-2">
                            <button
                                type="button"
                                className="rounded-full border border-[#ff5a00] bg-black/80 p-1.5 text-white shadow-lg hover:bg-black/95"
                                onClick={() => setLightbox(null)}
                                aria-label="Close"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-4 w-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <Swiper
                            modules={[Navigation, Pagination, Keyboard, Zoom]}
                            navigation
                            pagination={{ clickable: true }}
                            keyboard={{ enabled: true }}
                            initialSlide={lightbox.photoIndex}
                            zoom={{ maxRatio: 1.25 }}
                            onSlideChange={(swiper) => {
                                setActiveIndex(swiper.activeIndex);
                                swiper.zoom?.out();
                            }}
                            className="h-[80vh]"
                        >
                            {activeLightboxAlbum.photos.map((imageUrl, index) => (
                                <SwiperSlide
                                    key={`${activeLightboxAlbum.name}-${index}`}
                                    className="flex h-full items-center justify-center"
                                >
                                    <div className="swiper-zoom-container">
                                        <img
                                            src={imageUrl}
                                            alt={`${activeLightboxAlbum.name} Photo ${index + 1}`}
                                            className="max-h-full w-auto max-w-full object-contain"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <p className="mt-3 text-center text-sm text-gray-300">
                            {activeLightboxAlbum.name} - {activeIndex + 1} / {activeLightboxAlbum.photos.length}
                        </p>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
