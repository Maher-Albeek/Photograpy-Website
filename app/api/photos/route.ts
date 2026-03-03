import { NextResponse } from "next/server"
import { sql } from "@/lib/db2"

const normalizeImagePath = (value?: string | null) => {
  if (!value) return ""
  return /^https?:\/\//i.test(value)
    ? value
    : "/" + value.replace(/^\/+/, "")
}

export async function GET() {
  try {
    const categories = await sql`
      SELECT DISTINCT c.name
      FROM categories c
      INNER JOIN projects p ON c.id = p.category_id
      INNER JOIN project_media m ON m.project_id = p.id
      WHERE m.media_type = 'image'
      ORDER BY c.name
      `

    const images = await sql`
      SELECT 
        p.id,
        p.title,
        p.description,
        c.name AS category,
        m.file_path
      FROM projects p
      INNER JOIN categories c ON c.id = p.category_id
      INNER JOIN project_media m ON m.project_id = p.id
      WHERE m.media_type = 'image'
      ORDER BY p.id DESC
      `

    return NextResponse.json({
      categories,
      images: images.map((img: any) => ({
        id: img.id,
        title: img.title,
        description: img.description,
        category: img.category,
        path: normalizeImagePath(img.file_path),
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 })
  }
}
