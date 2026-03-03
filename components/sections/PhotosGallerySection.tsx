import { sql } from "@/lib/db2"
import PhotosGallerySectionClient from "./PhotosGallerySectionClient"

type Photo = {
  id: number
  title: string
  description: string
  category: string
  path: string
}

const normalizeImagePath = (value?: string | null) => {
  if (!value) return ""
  return /^https?:\/\//i.test(value)
    ? value
    : "/" + value.replace(/^\/+/, "")
}

export default async function PhotosGallerySection() {
  let categories: any[] = []
  let images: any[] = []
  if (process.env.SKIP_DB !== "1") {
    categories = await sql`
      SELECT DISTINCT c.name
      FROM categories c
      INNER JOIN projects p ON c.id = p.category_id
      INNER JOIN project_media m ON m.project_id = p.id
      WHERE m.media_type = 'image'
      ORDER BY c.name
    `

    images = await sql`
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
  }

  const photos: Photo[] = images.map((img: any) => ({
    id: img.id,
    title: img.title,
    description: img.description,
    category: img.category,
    path: normalizeImagePath(img.file_path),
  }))

  const categoryNames = categories.map((c: any) => c.name)

  return <PhotosGallerySectionClient photos={photos} categories={categoryNames} />
}
