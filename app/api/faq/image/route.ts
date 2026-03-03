import { NextResponse } from "next/server"
import path from "path"
import { keepOnlyFiles, saveAvifImage } from "@/lib/image"
import { sql } from "@/lib/db2"
import { del, put } from "@vercel/blob"
import sharp from "sharp"

export const runtime = "nodejs"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "faq")

const SETTINGS_KEYS = {
  desktop: "faq_image_desktop",
  mobile: "faq_image_mobile",
} as const

type Variant = keyof typeof SETTINGS_KEYS

type SettingRow = {
  value_content?: string | null
}

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
)

const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

function isRemoteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

async function getExistingFaqImage(keyName: string) {
  const rows = (await sql`
    SELECT value_content
    FROM settings
    WHERE key_name = ${keyName}
    LIMIT 1
  `) as SettingRow[]

  return rows.length ? rows[0].value_content ?? null : null
}

async function upsertFaqImage(keyName: string, value: string) {
  await sql`
    INSERT INTO settings (key_name, value_content, last_updated)
    VALUES (${keyName}, ${value}, NOW())
    ON DUPLICATE KEY UPDATE
      value_content = ${value},
      last_updated = NOW()
  `
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const variantField = formData.get("variant")
    const variant = (typeof variantField === "string"
      ? variantField
      : "desktop") as Variant

    if (variant !== "desktop" && variant !== "mobile") {
      return NextResponse.json({ error: "Invalid variant" }, { status: 400 })
    }

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Basic validation
    // @ts-ignore - file.type exists on Blob
    const mime = (file as any).type || ""
    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      )
    }

    if (isServerless && !hasBlobToken) {
      return NextResponse.json(
        { error: "Uploads require BLOB_READ_WRITE_TOKEN in this environment." },
        { status: 500 }
      )
    }

    if (hasBlobToken) {
      const keyName = SETTINGS_KEYS[variant]
      const existing = await getExistingFaqImage(keyName)

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const avifBuffer = await sharp(buffer)
        .avif({ quality: 60 })
        .toBuffer()

      const filename = `${keyName}-${Date.now()}.avif`
      const { url } = await put(`faq/${filename}`, avifBuffer, {
        access: "public",
        contentType: "image/avif",
      })

      await upsertFaqImage(keyName, url)

      if (existing && isRemoteUrl(existing)) {
        await del(existing).catch(() => null)
      }

      return NextResponse.json({ path: url })
    }

    const targetName =
      variant === "mobile"
        ? "section-image-mobile.avif"
        : "section-image-desktop.avif"
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const publicPath = await saveAvifImage({
      buffer,
      targetDir: UPLOAD_DIR,
      filename: targetName,
      publicPathPrefix: "/uploads/faq",
      quality: 60,
    })

    // Keep only the known image variants in the folder
    await keepOnlyFiles(UPLOAD_DIR, [
      "section-image-desktop.avif",
      "section-image-mobile.avif",
    ])

    return NextResponse.json({ path: publicPath })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
}
