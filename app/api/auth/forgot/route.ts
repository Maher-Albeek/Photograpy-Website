import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/resetToken";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const rows = (await sql`
      SELECT id
      FROM users
      WHERE email = ${email}
      LIMIT 1
      `) as Array<{ id: number }>;

    if (rows.length) {
      const token = createResetToken(email);
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        req.headers.get("origin") ||
        "http://localhost:3000";
      const resetUrl = new URL("/admin/reset", origin);
      resetUrl.searchParams.set("token", token);

      const subject = "Reset your password";
      const html = `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl.toString()}">Click here to set a new password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `;
      const text = `You requested a password reset.\nOpen this link to set a new password: ${resetUrl.toString()}\nIf you did not request this, you can ignore this email.`;

      await sendBrevoEmail({
        to: email,
        subject,
        html,
        text,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Reset request failed" },
      { status: 500 }
    );
  }
}
