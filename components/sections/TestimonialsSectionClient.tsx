"use client"

import { useState } from "react"
import styles from "@/app/css/sections/TestimonialsSection.module.css"

type Testimonial = {
  name: string
  content: string
  image: string
}

export default function TestimonialsSectionClient({
  items,
  txtcolor,
}: {
  items: Testimonial[]
  txtcolor?: string
}) {
  const [current, setCurrent] = useState(0)

  const total = items.length
  const next = () => setCurrent((current + 1) % total)
  const prev = () => setCurrent((current - 1 + total) % total)
  const textColor = txtcolor ?? "var(--color-ink)"

  return (
    <section id="feedback" className="py-14">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative h-96 flex items-center justify-center">
            {items.map((item, i) => {
              let pos = i - current
              if (pos < 0) pos += total

              let cls = "absolute transition-all duration-500 rounded-tl-lg rounded-br-lg overflow-hidden shadow-[0_12px_30px_rgba(255,255,255,0.35)]"

              if (pos === 0) cls += " w-66 h-auto z-30"
              else if (pos === 1) cls += " w-44 h-auto translate-y-24 opacity-70"
              else if (pos === 2) cls += " w-30 h-auto translate-y-44 opacity-40"
              else cls += " opacity-0 scale-50"

              return (
                <img
                  key={`${item.name}-${i}`}
                  src={item.image}
                  alt={item.name}
                  className={cls}
                  loading="lazy"
                />
              )
            })}
          </div>

          <div style={{ color: textColor }}>
            <p className="text-lg italic mb-6">
              &ldquo;{items[current].content}&rdquo;
            </p>

            <h3 className="font-bold text-xl">
              {items[current].name}
            </h3>

            <div className="flex gap-3 mt-8 justify-center">
              <button
                type="button"
                onClick={prev}
                className={styles.arrowButton}
                aria-label="Previous testimonial"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={next}
                className={styles.arrowButton}
                aria-label="Next testimonial"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
