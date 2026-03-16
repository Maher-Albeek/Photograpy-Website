import { NextResponse } from "next/server"
import { sql } from "@/lib/db2"

type ContactBody = {
  name?: string
  email?: string
  category?: string
  message?: string
  privacyAccepted?: boolean
  website?: string
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") return ""
  return value.trim()
}

async function hasCategoryColumn(): Promise<boolean> {
  try {
    const rows = (await sql.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'contact_messages'"
    )) as Array<{ COLUMN_NAME: string }>
    return rows.some(
      (row) => row.COLUMN_NAME.toLowerCase() === "category"
    )
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody

    const name = normalizeText(body.name)
    const email = normalizeText(body.email)
    const category = normalizeText(body.category)
    const message = normalizeText(body.message)
    const website = normalizeText(body.website)
    const privacyAccepted = body.privacyAccepted === true

    if (website) {
      return NextResponse.json({ success: true })
    }

    if (!name || !email || !message || !privacyAccepted) {
      return NextResponse.json(
        { error: "Pflichtfelder oder Datenschutzeinwilligung fehlen" },
        { status: 400 }
      )
    }

    const hasCategory = category ? await hasCategoryColumn() : false

    if (hasCategory) {
      await sql`
        INSERT INTO contact_messages (sender_name, sender_email, message_text, category)
        VALUES (${name}, ${email}, ${message}, ${category})
      `
    } else {
      const messageText = category
        ? `Kategorie: ${category}\n\n${message}`
        : message
      await sql`
        INSERT INTO contact_messages (sender_name, sender_email, message_text)
        VALUES (${name}, ${email}, ${messageText})
      `
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("CONTACT ERROR:", e)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
