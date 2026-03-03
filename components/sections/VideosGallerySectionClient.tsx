"use client"

import { useCallback, useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import styles from "@/app/css/sections/VideosGallerySection.module.css"

type Video = {
  title: string
  source: "bunny" | "youtube" | "vimeo" | "embed"
  libraryId?: string
  videoId?: string
  url?: string
}

function extractYouTubeId(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ""
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/
  )
  if (match?.[1]) return match[1]
  return /^[A-Za-z0-9_-]{6,}$/.test(trimmed) ? trimmed : ""
}

function extractVimeoId(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ""
  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (match?.[1]) return match[1]
  return /^\d+$/.test(trimmed) ? trimmed : ""
}

function getEmbedUrl(video: Video) {
  if (video.source === "bunny") {
    if (!video.libraryId || !video.videoId) return ""
    return `https://iframe.mediadelivery.net/embed/${video.libraryId}/${video.videoId}?autoplay=false`
  }
  if (video.source === "youtube") {
    const id = extractYouTubeId(video.videoId || "")
    if (!id) return ""
    return `https://www.youtube.com/embed/${id}`
  }
  if (video.source === "vimeo") {
    const id = extractVimeoId(video.videoId || "")
    if (!id) return ""
    return `https://player.vimeo.com/video/${id}`
  }
  if (video.source === "embed") {
    return video.url || ""
  }
  return ""
}

export default function VideosGallerySectionClient({
  videos,
  bgcolor,
}: {
  videos: Video[]
  bgcolor?: string
}) {
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const swiperRef = useRef<any>(null)

  const bindNavigation = useCallback(() => {
    const swiper = swiperRef.current
    if (!swiper || !prevRef.current || !nextRef.current) return
    const nav = swiper.params.navigation
    if (!nav || typeof nav === "boolean") return
    nav.prevEl = prevRef.current
    nav.nextEl = nextRef.current
    swiper.navigation.init()
    swiper.navigation.update()
  }, [])

  useEffect(() => {
    bindNavigation()
  }, [bindNavigation])

  if (!videos.length) return null

  return (
    <section className={`py-14 ${styles.section}`} style={{ backgroundColor: bgcolor }}>
      <div className="w-full" style={{ paddingInline: "5%" }}>
        <div className={styles.sliderWrap}>
          <Swiper
            effect={"coverflow"}
            grabCursor
            centeredSlides
            slidesPerView={"auto"}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 120,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
              bindNavigation()
            }}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className={styles.mySwiper}
          >
            {videos.map((video, i) => {
              const embedUrl = getEmbedUrl(video)
              if (!embedUrl) return null
              return (
                <SwiperSlide key={`${video.source}-${i}`} className={styles.videoSlide}>
                  <div className={styles.frameShell}>
                    <iframe
                      className={styles.videoFrame}
                      src={embedUrl}
                      loading="lazy"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={video.title}
                    />
                  </div>
                  <h3 className={styles.videoTitle}>{video.title}</h3>
                </SwiperSlide>
              )
            })}
          </Swiper>

          <button
            ref={prevRef}
            className={`${styles.navButton} ${styles.navPrev}`}
            aria-label="Previous video"
            type="button"
          >
            &larr;
          </button>
          <button
            ref={nextRef}
            className={`${styles.navButton} ${styles.navNext}`}
            aria-label="Next video"
            type="button"
          >
            &rarr;
          </button>
        </div>
      </div>
    </section>
  )
}
