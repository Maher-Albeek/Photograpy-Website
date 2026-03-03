import { NextResponse } from "next/server"
import { sql } from "@/lib/db2"

export async function GET() {
  try {
    const rows = await sql`
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


    const videos = rows
      .map((row: any) => {
        const source =
          row.video_source ||
          (row.bunny_library_id && row.bunny_video_id ? "bunny" : null)

        if (!source) return null

        if (source === "bunny") {
          if (!row.bunny_library_id || !row.bunny_video_id) return null
          return {
            title: row.title,
            source,
            libraryId: row.bunny_library_id,
            videoId: row.bunny_video_id,
          }
        }

        if (source === "youtube" || source === "vimeo") {
          if (!row.video_id) return null
          return {
            title: row.title,
            source,
            videoId: row.video_id,
          }
        }

        if (source === "embed") {
          if (!row.video_url) return null
          return {
            title: row.title,
            source,
            url: row.video_url,
          }
        }

        return null
      })
      .filter(Boolean)

    return NextResponse.json(videos)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Failed to load videos" },
      { status: 500 }
    )
  }
}
