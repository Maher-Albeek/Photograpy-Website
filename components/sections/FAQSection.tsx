import { db } from "@/lib/db"
import { getFaqImagePaths } from "@/lib/faqImages"
import type { CSSProperties } from "react"
import type { RowDataPacket } from "mysql2"
import styles from "@/app/css/sections/FAQSection.module.css"
import FAQAccordion from "./FAQAccordion"
type FAQ = {
  question: string
  answer: string
  bgcolor: string
}

export default async function FAQSection({ bgcolor }: { bgcolor?: string }) {
  const { desktop, mobile } = await getFaqImagePaths()
  const normalizeImage = (imagePath: string | null) => {
    if (!imagePath) return null
    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("data:")
    ) return imagePath
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  }

  const normalizedDesktop = normalizeImage(desktop)
  const normalizedMobile = normalizeImage(mobile)
  const desktopImage = normalizedDesktop ?? normalizedMobile
  const mobileImage = normalizedMobile ?? normalizedDesktop

  let rows: RowDataPacket[] = []
  if (process.env.SKIP_DB !== "1") {
    const result = await db.query<RowDataPacket[]>(`
      SELECT question, answer
      FROM faq
      ORDER BY sort_order ASC
    `)
    rows = result[0]
  }

  const faqs = rows as FAQ[]

  if (!faqs.length) return null

  return (
    <section
      id="faq-section"
      className={`py-14 ${styles.section}`}
      data-has-image={desktopImage || mobileImage ? "true" : "false"}
      style={{
        backgroundColor: bgcolor,
        ...(desktopImage
          ? ({ "--faq-image-desktop": `url(${desktopImage})` } as CSSProperties)
          : null),
        ...(mobileImage
          ? ({ "--faq-image-mobile": `url(${mobileImage})` } as CSSProperties)
          : null),
      }}
    >
      <div className="mx-auto px-[5%]">
        <FAQAccordion faqs={faqs} imageSrc={desktopImage} />
      </div>
    </section>
  )
}
