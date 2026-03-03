import { sql } from "@/lib/db2";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyResetToken } from "@/lib/resetToken";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    let email = "";
    try {
      const payload = verifyResetToken(token);
      email = payload.email;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT id
      FROM users
      WHERE email = ${email}
      LIMIT 1
      `;  

    if (!rows.length) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users
      SET password = ${hash}
      WHERE email = ${email}
      `;

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";
    const loginUrl = new URL("/admin/login", origin);
    const subject = "Your password was changed";
    const html = `
      <p>Your password has been changed successfully.</p>
      <p>If you did not do this, please contact support immediately.</p>
      <p><a href="${loginUrl.toString()}">Sign in</a></p>
    `;
    const text = `Your password has been changed successfully.\nIf you did not do this, please contact support immediately.\nSign in: ${loginUrl.toString()}`;

    await sendBrevoEmail({
      to: email,
      subject,
      html,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
