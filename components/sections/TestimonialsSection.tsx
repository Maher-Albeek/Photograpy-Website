import { sql } from "@/lib/db2"
import TestimonialsSectionClient from "./TestimonialsSectionClient"

type Testimonial = {
  name: string
  content: string
  image: string
}

export default async function TestimonialsSection({ txtcolor }: { txtcolor?: string }) {
  let rows: any[] = []
  if (process.env.SKIP_DB !== "1") {
    rows = await sql`
      SELECT name, content, image
      FROM testimonials
      ORDER BY id DESC
    `
  }

  const items: Testimonial[] = rows.map((row: any) => {
    const image = row.image || ""
    const isRemote = /^https?:\/\//i.test(image)
    return {
      name: row.name,
      content: row.content,
      image: image
        ? isRemote
          ? image
          : "/" + image.replace(/^\/+/, "")
        : "/admin/avatar.png",
    }
  })

  if (!items.length) return null

  return <TestimonialsSectionClient items={items} txtcolor={txtcolor} />
}
