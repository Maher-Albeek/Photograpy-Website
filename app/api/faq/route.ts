import { NextResponse } from "next/server";
import { sql } from "@/lib/db2";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await sql`
      SELECT question, answer
      FROM faq
      ORDER BY sort_order ASC
    `;

    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load FAQ" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let question: string | null = null;
    let answer: string | null = null;
    let sortOrderRaw: any = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      question = body.question?.toString().trim() ?? null;
      answer = body.answer?.toString().trim() ?? null;
      sortOrderRaw = body.sort_order;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      question = formData.get("question")?.toString().trim() ?? null;
      answer = formData.get("answer")?.toString().trim() ?? null;
      sortOrderRaw = formData.get("sort_order");
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required." },
        { status: 400 }
      );
    }

    const sortOrder = Number(sortOrderRaw) || 0;

    await sql`
      INSERT INTO faq (question, answer, sort_order)
      VALUES (${question}, ${answer}, ${sortOrder})
      `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
