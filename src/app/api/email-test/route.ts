import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function GET() {
  try {
    const to = "YOUR_EMAIL_HERE@gmail.com"; // put your real email
    const r = await sendEmail({
      to,
      subject: "PeerPlates test email",
      text: "If you got this, Resend is working.",
      html: "<b>If you got this, Resend is working.</b>",
    });
    return NextResponse.json({ ok: true, result: r });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
