"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "@fancyapps/ui/dist/fancybox/fancybox.css"

import styles from "@/app/css/sections/PhotosGallerySection.module.css"

type Photo = {
  id: number
  title: string
  description: string
  category: string
  path: string
}

type Props = {
  photos: Photo[]
  categories: string[]
}

export default function PhotosGallerySectionClient({ photos, categories }: Props) {
  const [filter, setFilter] = useState("all")
  const fancyboxBound = useRef(false)
  const swiperRef = useRef<any>(null)
  const prevRef = useRef<HTMLButtonElement | null>(null)
  const nextRef = useRef<HTMLButtonElement | null>(null)

  const filters = useMemo(
    () => [{ value: "all", label: "All" }, ...categories.map((cat) => ({ value: cat, label: cat }))],
    [categories]
  )
  const selectedIndex = useMemo(
    () => filters.findIndex((item) => item.value === filter),
    [filters, filter]
  )

  useEffect(() => {
    let mounted = true
    let cleanup: (() => void) | null = null

    if (fancyboxBound.current) return

    void (async () => {
      const mod = await import("@fancyapps/ui")
      if (!mounted) return
      mod.Fancybox.bind("[data-fancybox='gallery']", {})
      fancyboxBound.current = true
      cleanup = () => {
        mod.Fancybox.destroy()
        fancyboxBound.current = false
      }
    })()

    return () => {
      mounted = false
      cleanup?.()
    }
  }, [])

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

  const filtered = useMemo(
    () => (filter === "all" ? photos : photos.filter((p) => p.category === filter)),
    [photos, filter]
  )

  return (
    <section id="projects" className="py-14 overflow-hidden">
      <div className="w-full" style={{ paddingInline: "5%" }}>
        <div className={styles.filterWrapper}>
          <div
            className={styles.filterBar}
            style={{
              ["--total-radio" as any]: filters.length,
              ["--selected-index" as any]: selectedIndex,
            }}
          >
            <div className={styles.gliderContainer}>
              <div className={styles.glider} />
            </div>

            {filters.map((item) => (
              <label key={item.value} className={styles.filterLabel}>
                <input
                  type="radio"
                  name="photo-filter"
                  value={item.value}
                  checked={filter === item.value}
                  onChange={() => setFilter(item.value)}
                  className={styles.filterInput}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.sliderWrap}>
          <Swiper
            slidesPerView={"auto"}
            centeredSlides={true}
            spaceBetween={30}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
              bindNavigation()
            }}
            modules={[Pagination, Navigation]}
            className={styles.mySwiper}
          >
            {filtered.map((photo) => (
              <SwiperSlide key={`${photo.id}-${photo.path}`} className={styles.slide}>
                <a
                  href={photo.path}
                  data-fancybox="gallery"
                  data-caption={photo.title}
                  className={styles.card}
                >
                  <Image
                    src={photo.path}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 80vw, 30vw"
                    className={`${styles.image} hover:scale-105 transition`}
                  />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            ref={prevRef}
            className={`${styles.navButton} ${styles.navPrev}`}
            aria-label="Previous photo"
            type="button"
          >
            &larr;
          </button>
          <button
            ref={nextRef}
            className={`${styles.navButton} ${styles.navNext}`}
            aria-label="Next photo"
            type="button"
          >
            &rarr;
          </button>
        </div>
      </div>
    </section>
  )
}
