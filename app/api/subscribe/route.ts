import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, privacyAccepted } = await req.json()

    if (!email || privacyAccepted !== true) {
      return NextResponse.json(
        { error: "E-Mail oder Datenschutzeinwilligung fehlt" },
        { status: 400 }
      )
    }

    const rawKey =
      process.env.BREVO_API_KEY ??
      process.env.BRAVO_API_KEY ??
      ""
    const API_KEY = rawKey.trim().replace(/^"+|"+$/g, "")

    const rawListId =
      process.env.BREVO_LIST_ID ??
      process.env.BRAVO_LIST_ID ??
      ""
    const LIST_ID = Number(String(rawListId).trim())

    if (!API_KEY || !Number.isFinite(LIST_ID) || LIST_ID <= 0) {
      return NextResponse.json(
        { error: "Brevo config missing or invalid" },
        { status: 500 }
      )
    }

    const baseUrl =
      process.env.BREVO_API_URL ??
      process.env.BREVO_BASE_URL ??
      "https://api.brevo.com/v3"
    const endpoint = `${baseUrl.replace(/\/$/, "")}/contacts`

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [LIST_ID],
        updateEnabled: true,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("BREVO ERROR:", err)
      return NextResponse.json(
        { error: "Subscription failed", details: err },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("SUBSCRIBE ERROR:", e)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}
