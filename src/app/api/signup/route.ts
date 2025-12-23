import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { vendorPriorityScoreFromAnswers } from "../../../lib/vendorPriorityScore";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Role = "consumer" | "vendor";

function supabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function randomCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function generateUniqueReferralCode(sb: ReturnType<typeof supabaseAdmin>) {
  for (let i = 0; i < 8; i++) {
    const code = randomCode(8);
    const { data, error } = await sb
      .from("waitlist_entries")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();

    if (error) break;
    if (!data) return code;
  }

  return `${randomCode(6)}${Date.now().toString().slice(-2)}`;
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

export async function POST(req: Request) {
  const sb = supabaseAdmin();

  try {
    const ct = req.headers.get("content-type") || "";

    let roleRaw: unknown;
    let fullNameRaw: unknown;
    let emailRaw: unknown;
    let phoneRaw: unknown;
    let refRaw: unknown;

    let answers: any = {};
    let certificateFile: File | null = null;

    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();

      roleRaw = fd.get("role");
      fullNameRaw = fd.get("fullName") ?? fd.get("full_name");
      emailRaw = fd.get("email");
      phoneRaw = fd.get("phone");
      refRaw = fd.get("ref") ?? fd.get("referred_by") ?? fd.get("referredBy");

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

      answers = body?.answers || {};
    }

    const role = String(roleRaw || "").trim().toLowerCase() as Role;
    const fullName = String(fullNameRaw || "").trim();
    const email = String(emailRaw || "").trim().toLowerCase();
    const phone = phoneRaw ? String(phoneRaw).trim() : null;
    const ref = refRaw ? String(refRaw).trim() : null;

    if (role !== "consumer" && role !== "vendor") return jsonError("Invalid role.");
    if (!fullName) return jsonError("Full name is required.");
    if (!email) return jsonError("Email is required.");

    const isStudent = normalizeStudent(answers?.is_student);
    const university = pickUniversity(answers?.university);

    const referral_code = await generateUniqueReferralCode(sb);

    const vendor_priority_score =
      role === "vendor" ? vendorPriorityScoreFromAnswers(answers) : 0;

    // Upload certificate (vendor only)
    let certificate_url: string | null = null;

    if (role === "vendor" && certificateFile) {
      const okTypes = ["application/pdf", "image/png", "image/jpeg"];
      if (!okTypes.includes(certificateFile.type)) {
        return jsonError("Certificate must be PDF, JPG, or PNG.");
      }

      const maxBytes = 5 * 1024 * 1024;
      if (certificateFile.size > maxBytes) {
        return jsonError("Certificate too large (max 5MB).");
      }

      const ext =
        certificateFile.type === "application/pdf"
          ? "pdf"
          : certificateFile.type === "image/png"
            ? "png"
            : "jpg";

      const path = `${email}/${Date.now()}-${randomCode(6)}.${ext}`;

      const arrayBuffer = await certificateFile.arrayBuffer();
      const up = await sb.storage
        .from("vendor-certificates")
        .upload(path, new Uint8Array(arrayBuffer), {
          contentType: certificateFile.type,
          upsert: false,
        });

      if (up.error) {
        return jsonError(`Upload failed: ${up.error.message}`, 500);
      }

      certificate_url = path; // private bucket path
    }

    const insertPayload = {
      role,
      full_name: fullName,
      email,
      phone: phone || null,

      is_student: isStudent,
      university,

      answers,

      referral_code,
      referred_by: ref || null,

      vendor_priority_score,
      certificate_url,
    };

    const { data, error } = await sb
      .from("waitlist_entries")
      .insert(insertPayload)
      .select("id, referral_code")
      .single();

    if (error) {
      const msg = String(error.message || "");
      if (msg.toLowerCase().includes("duplicate") || msg.includes("23505")) {
        return jsonError("This email is already on the waitlist.", 409);
      }
      return jsonError(msg || "Database insert failed.", 500);
    }

    return NextResponse.json({
      id: data.id,
      referral_code: data.referral_code,
    });
  } catch (e: any) {
    return jsonError(e?.message || "Unexpected server error.", 500);
  }
}
