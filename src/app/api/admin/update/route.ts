// src/app/api/admin/update/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

type ReviewStatus = "pending" | "reviewed" | "approved" | "rejected";
type Role = "consumer" | "vendor";

type WaitlistRow = {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone: string | null;
  is_student: boolean | null;
  university: string | null;

  answers: Record<string, unknown>;

  referral_code: string | null;
  referred_by: string | null;
  referrals_count: number | null;
  referral_points: number | null;

  vendor_priority_score: number | null;
  vendor_queue_override: number | null;
  certificate_url: string | null;

  postcode_area: string | null;
  instagram_handle: string | null;
  compliance_readiness: string[] | null;
  top_cuisines: string[] | null;
  delivery_area: string | null;
  dietary_preferences: string[] | null;

  review_status: ReviewStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;

  queue_code: string | null;

  created_at: string;
  updated_at: string;
};

function supabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

function requireAdmin(req: Request) {
  // dev-friendly: if ADMIN_SECRET not set, allow
  if (!ADMIN_SECRET) return null;

  const incoming = (req.headers.get("x-admin-secret") || "").trim();
  if (incoming !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const ALLOWED = new Set<ReviewStatus>(["pending", "reviewed", "approved", "rejected"]);

function safeStr(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export async function PATCH(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const sb = supabaseAdmin();

  try {
    const body = await req.json().catch(() => ({} as any));

    const id = safeStr(body?.id).trim();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const hasStatusField = Object.prototype.hasOwnProperty.call(body, "review_status");
    const hasNotesField = Object.prototype.hasOwnProperty.call(body, "admin_notes");
    const hasOverrideField = Object.prototype.hasOwnProperty.call(body, "vendor_queue_override");

    const review_status_raw = hasStatusField ? safeStr(body?.review_status).trim().toLowerCase() : "";
    const review_status = (review_status_raw || null) as ReviewStatus | null;

    if (review_status !== null && !ALLOWED.has(review_status)) {
      return NextResponse.json(
        { error: "Invalid review_status. Use pending|reviewed|approved|rejected" },
        { status: 400 }
      );
    }

    // notes: allow clearing by sending "" (we store NULL)
    const admin_notes =
      hasNotesField && typeof body?.admin_notes === "string" ? body.admin_notes.trim() : undefined;

    const reviewed_by =
      typeof body?.reviewed_by === "string" && body.reviewed_by.trim()
        ? body.reviewed_by.trim()
        : "admin";

    // override: allow null / "" to clear
    const vendor_queue_override_raw = hasOverrideField ? body?.vendor_queue_override : undefined;
    const vendor_queue_override =
      vendor_queue_override_raw === null ||
      vendor_queue_override_raw === undefined ||
      vendor_queue_override_raw === ""
        ? null
        : Number(vendor_queue_override_raw);

    if (hasOverrideField && vendor_queue_override !== null && Number.isNaN(vendor_queue_override)) {
      return NextResponse.json(
        { error: "vendor_queue_override must be a number or null" },
        { status: 400 }
      );
    }

    // Check role (so we only apply override to vendors)
    const { data: existing, error: existingErr } = await sb
      .from("waitlist_entries")
      .select("id, role")
      .eq("id", id)
      .maybeSingle<{ id: string; role: Role }>();

    if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const patch: Record<string, any> = {};

    if (hasNotesField) patch.admin_notes = admin_notes ? admin_notes : null;

    if (hasStatusField) {
      if (!review_status) {
        return NextResponse.json(
          { error: "review_status cannot be empty when provided" },
          { status: 400 }
        );
      }
      patch.review_status = review_status;
      patch.reviewed_by = reviewed_by;
      patch.reviewed_at = review_status !== "pending" ? new Date().toISOString() : null;
    }

    if (hasOverrideField && existing.role === "vendor") {
      patch.vendor_queue_override = vendor_queue_override;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update (send admin_notes, review_status, and/or vendor_queue_override)." },
        { status: 400 }
      );
    }

    const { data, error } = await sb
      .from("waitlist_entries")
      .update(patch)
      .eq("id", id)
      .select(
        [
          "id",
          "role",
          "full_name",
          "email",
          "phone",
          "is_student",
          "university",
          "answers",

          "referral_code",
          "referred_by",
          "referrals_count",
          "referral_points",

          "vendor_priority_score",
          "vendor_queue_override",
          "certificate_url",

          "postcode_area",
          "instagram_handle",
          "compliance_readiness",
          "top_cuisines",
          "delivery_area",
          "dietary_preferences",

          "review_status",
          "admin_notes",
          "reviewed_at",
          "reviewed_by",

          "queue_code",
          "created_at",
          "updated_at",
        ].join(",")
      )
      .single<WaitlistRow>();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Update returned no row" }, { status: 500 });

    const row = {
      ...data,
      score: data.role === "vendor" ? data.vendor_priority_score ?? 0 : data.referral_points ?? 0,
    };

    return NextResponse.json({ ok: true, row });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
