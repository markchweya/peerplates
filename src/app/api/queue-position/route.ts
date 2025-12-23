import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function supabaseAdmin() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing Supabase env vars. Check .env.local");
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  try {
    const sb = supabaseAdmin();

    const { searchParams } = new URL(req.url);
    const id = (searchParams.get("id") || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Find the entry first (we need role + created_at)
    const { data: entry, error: entryErr } = await sb
      .from("waitlist_entries")
      .select("id, role, created_at")
      .eq("id", id)
      .single();

    if (entryErr || !entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Queue position = count of entries in same role with created_at <= this entry
    // (simple MVP: order by created_at)
    const { count, error: countErr } = await sb
      .from("waitlist_entries")
      .select("id", { count: "exact", head: true })
      .eq("role", entry.role)
      .lte("created_at", entry.created_at);

    if (countErr) {
      return NextResponse.json(
        { error: countErr.message || "Count failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: entry.id,
      role: entry.role,
      position: count ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
