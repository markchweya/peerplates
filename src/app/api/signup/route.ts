// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { vendorPriorityScoreFromAnswers } from "@/lib/vendorPriorityScore";

// email
import { sendEmail } from "@/lib/email";
import { vendorWaitlistEmail } from "@/lib/emails/vendorWaitlist";
import { consumerWaitlistEmail } from "@/lib/emails/consumerWaitlist";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// localhost ok for dev; production should be your real domain
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Role = "consumer" | "vendor";
const REFERRAL_POINTS_PER_SIGNUP = 10;

function supabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

// Use anon key for sending auth emails (kept for later use in /api/queue-link or similar)
function supabaseAuthMailer() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function randomCode(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function generateUniqueCode(
  sb: ReturnType<typeof supabaseAdmin>,
  column: "referral_code" | "queue_code",
  len = 10
) {
  for (let i = 0; i < 10; i++) {
    const code = randomCode(len);
    const { data, error } = await sb.from("waitlist_entries").select("id").eq(column, code).maybeSingle();
    if (error) break;
    if (!data) return code;
  }
  return `${randomCode(Math.max(4, len - 2))}${Date.now().toString().slice(-2)}`;
}

function normalizeStudent(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "yes" || s === "true") return true;
    if (s === "no" || s === "false") return false;
  }
  return null;
}

function pickUniversity(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const u = raw.trim();
  return u ? u : null;
}

function normalizeBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "on";
  }
  return false;
}

function normalizeYesNo(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "yes" || s === "true" || s === "1") return true;
    if (s === "no" || s === "false" || s === "0") return false;
  }
  if (typeof v === "number") {
    if (v === 1) return true;
    if (v === 0) return false;
  }
  return null;
}

function cleanIgHandle(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s) return null;

  if (s.startsWith("@")) s = s.slice(1).trim();
  if (!s) return null;

  if (/\s/.test(s)) return null;
  return s;
}

function enforceMax3Cuisines(answers: any) {
  const keys = ["top_cuisines", "cuisines", "sell_categories", "favourite_cuisine", "favorite_cuisine"];
  for (const k of keys) {
    const v = answers?.[k];
    if (Array.isArray(v) && v.length > 3) throw new Error("Please select up to 3 cuisines.");
  }
}

/**
 * NOTE:
 * We are NOT sending any Supabase magic link from /api/signup anymore.
 * Magic links should only be sent from the "Check Queue" action/endpoint.
 *
 * Kept here so the file remains ready if you move it to /api/queue-link.
 */
async function sendQueueMagicLink(email: string, queueCode: string) {
  const auth = supabaseAuthMailer();
  const emailRedirectTo = `${SITE_URL}/queue?code=${encodeURIComponent(queueCode)}`;

  const { error } = await auth.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });

  if (error) console.warn("[queue-link] Supabase magic link send failed:", error.message);
}

export async function POST(req: Request) {
  const sb = supabaseAdmin();

  try {
    const ct = req.headers.get("content-type") || "";

    let roleRaw: unknown;
    let fullNameRaw: unknown;
    let emailRaw: unknown;
    let phoneRaw: unknown;
    let refRaw: unknown;

    let acceptedPrivacyRaw: unknown;
    let marketingConsentRaw: unknown;
    let hpRaw: unknown;

    let answers: any = {};
    let certificateFile: File | null = null;

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();

      roleRaw = fd.get("role");
      fullNameRaw = fd.get("fullName") ?? fd.get("full_name");
      emailRaw = fd.get("email");
      phoneRaw = fd.get("phone");
      refRaw = fd.get("ref") ?? fd.get("referred_by") ?? fd.get("referredBy");

      acceptedPrivacyRaw = fd.get("accepted_privacy");
      marketingConsentRaw = fd.get("marketing_consent");
      hpRaw = fd.get("hp");

      const answersRaw = String(fd.get("answers") || "{}");
      try {
        answers = JSON.parse(answersRaw);
      } catch {
        answers = {};
      }

      const maybeFile = fd.get("certificate_upload");
      certificateFile = maybeFile instanceof File ? maybeFile : null;
    } else {
      const body = await req.json();

      roleRaw = body?.role;
      fullNameRaw = body?.fullName ?? body?.full_name;
      emailRaw = body?.email;
      phoneRaw = body?.phone;
      refRaw = body?.ref ?? body?.referred_by ?? body?.referredBy;

      acceptedPrivacyRaw = body?.accepted_privacy;
      marketingConsentRaw = body?.marketing_consent;
      hpRaw = body?.hp;

      answers = body?.answers || {};
    }

    const hp = String(hpRaw || "").trim();
    if (hp) return jsonError("Bot detected.", 400);

    const role = String(roleRaw || "").trim().toLowerCase() as Role;
    const fullName = String(fullNameRaw || "").trim();
    const email = String(emailRaw || "").trim().toLowerCase();
    const phone = phoneRaw ? String(phoneRaw).trim() : null;
    const ref = refRaw ? String(refRaw).trim() : null;

    console.log("[signup] ROLE FROM REQUEST:", role, "EMAIL:", email);

    const accepted_privacy = normalizeBool(acceptedPrivacyRaw);
    const marketing_consent = normalizeBool(marketingConsentRaw);

    if (role !== "consumer" && role !== "vendor") return jsonError("Invalid role.");
    if (!fullName) return jsonError("Full name is required.");
    if (!email) return jsonError("Email is required.");
    if (!accepted_privacy) return jsonError("Privacy/Terms acceptance is required.");

    enforceMax3Cuisines(answers);

    // Student fields
    const isStudent = normalizeStudent(answers?.is_student);
    let university = pickUniversity(answers?.university);
    if (isStudent === false) university = null;

    // Instagram logic
    const hasFoodIg = normalizeYesNo(answers?.has_food_ig);
    const igRaw = answers?.ig_handle ?? answers?.instagram_handle ?? answers?.instagram;
    const igHandle = cleanIgHandle(igRaw);

    if (hasFoodIg === true && !igHandle) {
      return jsonError("Please provide your IG handle.", 400);
    }

    if (typeof answers === "object" && answers) {
      if (hasFoodIg !== null) answers.has_food_ig = hasFoodIg ? "Yes" : "No";
      if (igHandle) answers.ig_handle = igHandle;
      if (hasFoodIg === false) answers.ig_handle = "";
    }

    // Validate referral code
    let referred_by: string | null = null;
    let referrer_id: string | null = null;

    if (ref) {
      const { data: referrer, error: refErr } = await sb
        .from("waitlist_entries")
        .select("id, email")
        .eq("referral_code", ref)
        .maybeSingle();

      if (!refErr && referrer && String(referrer.email || "").toLowerCase() !== email) {
        referred_by = ref;
        referrer_id = referrer.id as string;
      }
    }

    const referral_code = await generateUniqueCode(sb, "referral_code", 8);
    const queue_code = await generateUniqueCode(sb, "queue_code", 10);

    const vendor_priority_score = role === "vendor" ? vendorPriorityScoreFromAnswers(answers) : 0;

    let certificate_url: string | null = null;
    void certificateFile;

    const insertPayload: any = {
      role,
      full_name: fullName,
      email,
      phone: phone || null,

      is_student: isStudent,
      university,

      answers,

      referral_code,
      referred_by,
      queue_code,

      vendor_priority_score,
      certificate_url,

      accepted_privacy,
      consented_at: new Date().toISOString(),

      marketing_consent,
      accepted_marketing: marketing_consent,
    };

    const { data, error } = await sb
      .from("waitlist_entries")
      .insert(insertPayload)
      .select("id, referral_code, queue_code, role, full_name, email")
      .single();

    if (error) {
      const msg = String(error.message || "");
      console.error("[signup] INSERT ERROR:", msg);
      if (msg.toLowerCase().includes("duplicate") || msg.includes("23505")) {
        return jsonError("This email is already on the waitlist.", 409);
      }
      return jsonError(msg || "Database insert failed.", 500);
    }

    console.log("[signup] INSERT OK:", data?.id, "ROLE:", data?.role);

    // ✅ Send welcome email for consumer + vendor (your own emails, not Supabase)
    if (data?.role === "vendor") {
      try {
        console.log("[signup] ABOUT TO SEND VENDOR EMAIL:", data.email);
        const { subject, text, html } = vendorWaitlistEmail({ fullName: data.full_name || fullName });
        const r = await sendEmail({ to: data.email || email, subject, text, html });
        console.log("[signup] Vendor email result:", r);
      } catch (e) {
        console.error("[signup] Vendor email failed FULL:", e);
      }
    }

    if (data?.role === "consumer") {
      try {
        const referralLink = data.referral_code
          ? `${SITE_URL}/join?ref=${encodeURIComponent(data.referral_code)}`
          : null;

        console.log("[signup] ABOUT TO SEND CONSUMER EMAIL:", data.email, "REF:", referralLink);

        const { subject, text, html } = consumerWaitlistEmail({
          fullName: data.full_name || fullName,
          referralLink,
        });

        const r = await sendEmail({ to: data.email || email, subject, text, html });
        console.log("[signup] Consumer email result:", r);
      } catch (e) {
        console.error("[signup] Consumer email failed FULL:", e);
      }
    }

    // Award referral points
    if (referrer_id) {
      const { error: rpcErr } = await sb.rpc("increment_referral_stats", {
        p_referrer_id: referrer_id,
        p_points: REFERRAL_POINTS_PER_SIGNUP,
      });
      if (rpcErr) console.error("[signup] Referral award failed:", rpcErr);
    }

    // ❌ IMPORTANT: do NOT send Supabase magic link here anymore.
    // await sendQueueMagicLink(email, data.queue_code);

    return NextResponse.json({
      id: data.id,
      referral_code: data.referral_code,
      queue_code: data.queue_code,
    });
  } catch (e: any) {
    console.error("[signup] FAIL:", e);
    return jsonError(e?.message || "Unexpected server error.", 500);
  }
}
