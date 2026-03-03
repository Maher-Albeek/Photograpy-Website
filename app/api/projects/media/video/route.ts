import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";

export async function POST(req: Request) {
  const {
    project_id,
    source,
    library_id,
    video_id,
    url,
  } = await req.json();

  if (!project_id) {
    return NextResponse.json(
      { error: "Missing data" },
      { status: 400 }
    );
  }

  const videoSource =
    source === "bunny" || source === "youtube" || source === "vimeo" || source === "embed"
      ? source
      : "bunny";

  if (videoSource === "bunny") {
    if (!library_id || !video_id) {
      return NextResponse.json(
        { error: "Missing Bunny IDs" },
        { status: 400 }
      );
    }
  }

  if ((videoSource === "youtube" || videoSource === "vimeo") && !video_id) {
    return NextResponse.json(
      { error: "Missing video ID" },
      { status: 400 }
    );
  }

  if (videoSource === "embed" && !url) {
    return NextResponse.json(
      { error: "Missing embed URL" },
      { status: 400 }
    );
  }

  await sql`
    INSERT INTO project_media
      (
        project_id,
        media_type,
        bunny_library_id,
        bunny_video_id,
        video_source,
        video_id,
        video_url,
        sort_order,
        created_at
      )
    VALUES
      (
        ${project_id},
        'video',
        ${videoSource === "bunny" ? library_id : null},
        ${videoSource === "bunny" ? video_id : null},
        ${videoSource},
        ${videoSource === "youtube" || videoSource === "vimeo" ? video_id : null},
        ${videoSource === "embed" ? url : null},
        999,
        NOW()
      )
    `;

  return NextResponse.json({ success: true });
}
