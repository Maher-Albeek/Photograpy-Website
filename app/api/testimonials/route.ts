import { NextResponse } from "next/server"
import { sql } from "@/lib/db2"
import path from "path"
import { saveAvifImage } from "@/lib/image"
import { put } from "@vercel/blob"
import sharp from "sharp"

export const runtime = "nodejs"

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
)

const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

/* =========================
   GET - testimonials
========================= */
export async function GET() {
  try {
    const rows = await sql`
      SELECT name, content, image
      FROM testimonials
      ORDER BY id DESC
      `

    return NextResponse.json(
      rows.map((row: any) => {
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
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Failed to load testimonials" },
      { status: 500 }
    )
  }
}

/* =========================
   POST - testimonial
========================= */
export async function POST(req: Request) {
  const formData = await req.formData()

  const name = formData.get("name") as string
  const content = formData.get("content") as string
  const file = formData.get("image") as File | null

  if (!name || !content) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    )
  }

  let imagePath: string | null = null

  if (file) {
    if (isServerless && !hasBlobToken) {
      return NextResponse.json(
        { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
        { status: 500 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (hasBlobToken) {
      const avifBuffer = await sharp(buffer)
        .resize({ width: 300, withoutEnlargement: true })
        .avif({ quality: 50 })
        .toBuffer()
      const filename = `testimonials-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.avif`
      const { url } = await put(`testimonials/${filename}`, avifBuffer, {
        access: "public",
        contentType: "image/avif",
      })
      imagePath = url
    } else {
      const uploadsDir = path.join(
        process.cwd(),
        "public/uploads/testimonials"
      )
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.avif`
      const publicPath = await saveAvifImage({
        buffer,
        targetDir: uploadsDir,
        filename,
        publicPathPrefix: "/uploads/testimonials",
        quality: 50,
        resize: { width: 300 },
      })
      imagePath = publicPath.replace(/^\/+/, "")
    }
  }

  await sql`
    INSERT INTO testimonials (name, content, image)
    VALUES (${name}, ${content}, ${imagePath})
    `

  return NextResponse.json({ success: true })
}
