'use client'

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import styles from "@/app/css/sections/FAQSection.module.css"

type FAQ = {
  question: string
  answer: string
}

type Props = {
  faqs: FAQ[]
  imageSrc?: string | null
}

export default function FAQAccordion({ faqs, imageSrc }: Props) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    )
  }

  useEffect(() => {
    const section = containerRef.current?.closest("section")
    if (!section) return
    const zoom = 100 + openIndexes.length * 20
    section.style.setProperty("--faq-zoom", `${zoom}%`)
  }, [openIndexes])

  return (
    <div className={styles.layout} ref={containerRef}>
      <div className={styles.imagePanel}>
        {imageSrc ? (
          <div className={styles.imageFrame}>
            <Image
              src={imageSrc}
              alt="FAQ section illustration"
              fill
              sizes="(max-width: 1024px) 80vw, 40vw"
              className={styles.image}
            />
          </div>
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderBadge}>Image</span>
            <p className="text-sm opacity-70">
              Add an image in the admin FAQ page to showcase it here.
            </p>
          </div>
        )}
      </div>

      <div className={styles.textPanel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Looking for answer?</h2>
         
        </div>

        <div className={styles.listWrapper}>
          <div className={styles.list}>
            {faqs.map((faq, i) => {
              const isOpen = openIndexes.includes(i)

              return (
                <div
                  key={`${faq.question}-${i}`}
                  className={styles.item}
                  data-open={isOpen}
                >
                  <button
                    type="button"
                    className={styles.trigger}
                    onClick={() => handleToggle(i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span className={styles.question}>{faq.question}</span>
                    <svg
                      className={styles.icon}
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div
                    id={`faq-panel-${i}`}
                    className={`${styles.answer} ${isOpen ? styles.answerOpen : ""}`}
                    role="region"
                    aria-hidden={!isOpen}
                  >
                    <p className="whitespace-pre-line opacity-80">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
