import { sql } from "@/lib/db2"
import VideosGallerySectionClient from "./VideosGallerySectionClient"
import SectionTitle from "./TitelSection"

type Video = {
  title: string
  source: "bunny" | "youtube" | "vimeo" | "embed"
  libraryId?: string
  videoId?: string
  url?: string
}

export default async function VideosGallerySection({ bgcolor }: { bgcolor?: string }) {
  let rows: any[] = []
  if (process.env.SKIP_DB !== "1") {
    rows = await sql`
      SELECT 
        p.title,
        pm.bunny_library_id,
        pm.bunny_video_id,
        pm.video_source,
        pm.video_id,
        pm.video_url
      FROM project_media pm
      INNER JOIN projects p ON p.id = pm.project_id
      WHERE pm.media_type = 'video'
      ORDER BY pm.id DESC
    `
  }

  const videos: Video[] = []
  for (const row of rows) {
    const source =
      row.video_source ||
      (row.bunny_library_id && row.bunny_video_id ? "bunny" : null)

    if (!source) continue

    if (source === "bunny") {
      if (!row.bunny_library_id || !row.bunny_video_id) continue
      videos.push({
        title: row.title,
        source,
        libraryId: row.bunny_library_id,
        videoId: row.bunny_video_id,
      })
      continue
    }

    if (source === "youtube" || source === "vimeo") {
      if (!row.video_id) continue
      videos.push({
        title: row.title,
        source,
        videoId: row.video_id,
      })
      continue
    }

    if (source === "embed") {
      if (!row.video_url) continue
      videos.push({
        title: row.title,
        source,
        url: row.video_url,
      })
    }
  }

  if (!videos.length) return null

  return (
    <>
      <SectionTitle title=" Videos Gallery" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
      <VideosGallerySectionClient videos={videos} bgcolor={bgcolor} />
    </>
  )
}
