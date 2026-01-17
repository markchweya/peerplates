// src/lib/email.ts
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const MAIL_FROM_RAW = process.env.MAIL_FROM || "";

/**
 * Basic safety checks:
 * - MAIL_FROM should look like: "PeerPlates <peerplates@garooyaneu.resend.app>"
 * - If it’s missing, we warn and skip (same as missing API key).
 */
function getMailFrom() {
  const from = MAIL_FROM_RAW.trim();

  if (!from) return null;

  // minimal format check: must include an email in <>
  const m = from.match(/<([^>]+)>/);
  const email = m?.[1]?.trim() || "";

  // basic sanity: contains @ and a dot after it (not perfect, but catches most mistakes)
  const ok = email.includes("@") && email.split("@")[1]?.includes(".");
  if (!ok) return null;

  return from;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string }) {
  const to = String(opts.to || "").trim();
  const subject = String(opts.subject || "").trim();

  if (!to) throw new Error("[email] Missing 'to' address.");
  if (!subject) throw new Error("[email] Missing email subject.");

  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY missing. Skipping email send.");
    return { skipped: true };
  }

  const from = getMailFrom();
  if (!from) {
    console.warn(
      "[email] MAIL_FROM missing/invalid. Set MAIL_FROM like: PeerPlates <peerplates@garooyaneu.resend.app>. Skipping send."
    );
    return { skipped: true };
  }

  const resend = new Resend(RESEND_API_KEY);

  // Helpful log for debugging delivery issues
  console.log("[email] sending", { from, to, subject });

  try {
    const r = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: opts.html,
      text: opts.text,
    });

    // Resend returns { id } on success
    console.log("[email] sent result:", r);
    return r;
  } catch (err: any) {
    console.error("[email] send failed:", err?.message || err, err);
    // don’t break signup flow unless you want it to:
    // throw err;
    return { error: true, message: err?.message || "Email send failed" };
  }
}
