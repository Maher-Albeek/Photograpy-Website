import { sql } from "@/lib/db2"
import HeroSectionClient from "./HeroSectionClient"

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

type HeroImageRow = {
  value_content: string | null
  imgcat: number | null
}

const normalizeImagePath = (value: string) =>
  /^https?:\/\//i.test(value)
    ? value
    : "/" + value.replace(/^\/+/, "")

export default async function HeroSection() {
  let settings: any[] = []
  let images: HeroImageRow[] = []
  if (process.env.SKIP_DB !== "1") {
    settings = await sql`
      SELECT key_name, value_content FROM settings
    `
  }

  const map: Record<string, string> = {}
  settings.forEach((s: any) => {
    map[s.key_name] = s.value_content
  })

  if (process.env.SKIP_DB !== "1") {
    images = (await sql`
      SELECT value_content, imgcat
      FROM settings
      WHERE key_name LIKE 'hero_image_%'
      ORDER BY imgcat ASC, id ASC
    `) as HeroImageRow[]
  }

  const heroImages: HeroImage[] = images
    .filter((img: any) => img.value_content)
    .map((img: HeroImageRow) => {
      const imageType: HeroImage["type"] =
        img.imgcat === 1 ? "desktop" : "mobile"
      return {
        name: "hero",
        path: normalizeImagePath(img.value_content as string),
        type: imageType,
      }
    })

  const data: HeroData = {
    title: map.hero_main_title ?? "Welcome",
    description: map.hero_description ?? "",
    images: heroImages,
  }

  return <HeroSectionClient data={data} />
}
