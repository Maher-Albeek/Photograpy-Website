"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import RotatingText from "../RotatingText"

type HeroImage = {
  name: string
  path: string
  type: "desktop" | "mobile"
}

type HeroData = {
  title: string
  description: string
  images: HeroImage[]
}

export default function HeroSectionClient({ data }: { data: HeroData }) {
  const [isMobile, setIsMobile] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)")
    const sync = () => setIsMobile(mediaQuery.matches)
    sync()
    mediaQuery.addEventListener("change", sync)
    return () => mediaQuery.removeEventListener("change", sync)
  }, [])

  const slides = useMemo(() => {
    const type = isMobile ? "mobile" : "desktop"
    return data.images.filter(img => img.type === type)
  }, [data.images, isMobile])

  useEffect(() => {
    setActive(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length < 2) return
    const interval = window.setInterval(() => {
      setActive(prev => (prev + 1) % slides.length)
    }, 3000)
    return () => window.clearInterval(interval)
  }, [slides.length])

  return (
    <section className="hero-slider relative h-screen overflow-hidden">
      {slides.map((img, i) => (
        <div
          key={`${img.name}-${i}`}
          className={`absolute inset-0 transition-opacity duration-2500 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== active}
        >
          <Image
            src={img.path}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            fetchPriority={i === 0 ? "high" : undefined}
            className="object-cover"
          />
        </div>
      ))}

      <div className="relative z-10 flex flex-col h-full justify-end items-start text-left text-[var(--color-ink)] px-6 pb-16">
        <div className="w-full md:max-w-2xl mr-auto">
          <h1 className="text-5xl sm:text-6xl md:text-9xl font-serif mb-4 herotitle text-[#ffe7d0]">
            {data.title}
          </h1>
          <div className="flex flex-wrap items-baseline justify-start gap-3 leading-none">
            <span className="hero-rotating text-3xl sm:text-4xl md:text-5xl text-[#ffe7d0] leading-none">I'm</span>
            <RotatingText
              texts={["Photographer", "Videographer", "Art-Director"]}
              mainClassName="hero-rotating px-1 sm:px-2 md:px-2 text-[#ff5a00] overflow-hidden py-0 sm:py-0.5 md:py-0.5 justify-center text-3xl sm:text-4xl md:text-5xl leading-none"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
          <p className="hero-description max-w-2xl mt-4 mb-2 opacity-90 text-lg sm:text-xl md:text-2xl text-[#ffe7d0]">
            {data.description}
          </p>
        </div>
      </div>
    </section>
  )
}
