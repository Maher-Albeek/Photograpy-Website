import { NextResponse } from "next/server"
import { sql } from "@/lib/db2"

const normalizeImagePath = (value: string) =>
  /^https?:\/\//i.test(value)
    ? value
    : "/" + value.replace(/^\/+/, "")

export async function GET() {
  try {
    // settings text
    const settings = await sql`
      SELECT key_name, value_content FROM settings
    `

    const map: Record<string, string> = {}
    settings.forEach((s: any) => {
      map[s.key_name] = s.value_content
    })

    // Hero images
    const images = await sql`
      SELECT value_content, imgcat
      FROM settings
      WHERE key_name LIKE 'hero_image_%'
      ORDER BY imgcat ASC, id ASC
    `

    const heroImages = images
      .filter((img: any) => img.value_content)
      .map((img: any) => ({
        name: "hero",
        path: normalizeImagePath(img.value_content),
        type: img.imgcat === 1 ? "desktop" : "mobile",
      }))

    return NextResponse.json({
      title: map.hero_main_title ?? "Welcome",
      description: map.hero_description ?? "",
      images: heroImages,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Hero load failed" }, { status: 500 })
  }
}
