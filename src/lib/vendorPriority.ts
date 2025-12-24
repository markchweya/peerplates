// src/lib/vendorPriority.ts
// PeerPlates vendor priority scoring (0–10) based on vendor waitlist answers.
// Supports multiple key names to match the evolving form without breaking scoring.

export type VendorAnswers = Record<string, unknown>;

export type VendorPriorityBreakdown = {
  complianceScore: number; // 0..6
  hasInstagramScore: number; // 0..2
  proximityScore: number; // 0..2
  notes?: string[]; // optional debug notes you can log in admin later
};

export type VendorPriorityResult = {
  total: number; // 0..10
  breakdown: VendorPriorityBreakdown;
};

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => asString(x)).filter(Boolean) : [];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function firstNonEmptyString(answers: VendorAnswers, keys: string[]): string {
  for (const k of keys) {
    const s = asString(answers[k]);
    if (s) return s;
  }
  return "";
}

function firstNumber(answers: VendorAnswers, keys: string[]): number | null {
  for (const k of keys) {
    const n = asNumber(answers[k]);
    if (n !== null) return n;
  }
  return null;
}

function hasInstagramHandle(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (!s) return false;

  // treat these as "no IG"
  const noIgHints = ["dont have", "don’t have", "do not have", "no instagram", "none", "n/a", "na"];
  if (noIgHints.some((h) => s.includes(h))) return false;

  // Accept @handle OR link OR any non-empty decent value
  return s.startsWith("@") || s.includes("instagram.com") || s.length >= 2;
}

function parseMinutesFromText(raw: string): number | null {
  const s = raw.toLowerCase();
  if (!s) return null;

  // Look for things like: "20 minutes", "20 mins", "20min"
  const m1 = s.match(/(\d{1,3})\s*(minutes|minute|mins|min)\b/);
  if (m1?.[1]) return clamp(Number(m1[1]), 0, 999);

  // Or: "about 15" (weak fallback)
  const m2 = s.match(/\b(\d{1,3})\b/);
  if (m2?.[1]) return clamp(Number(m2[1]), 0, 999);

  return null;
}

export function vendorPriorityScore(answers: VendorAnswers): VendorPriorityResult {
  const notes: string[] = [];

  // ✅ Compliance readiness (tickboxes)
  // Primary key: compliance_readiness
  // Also allow: compliance, compliance_docs, complianceChecklist
  const compliance = [
    ...asStringArray(answers["compliance_readiness"]),
    ...asStringArray(answers["compliance"]),
    ...asStringArray(answers["compliance_docs"]),
    ...asStringArray(answers["complianceChecklist"]),
  ].filter(Boolean);

  const hasNone = compliance.some((x) => x.toLowerCase() === "none of the above" || x.toLowerCase() === "none");
  const complianceCount = hasNone ? 0 : compliance.length;

  // 0..6 (each valid item = +2, capped at 6)
  const complianceScore = Math.min(6, complianceCount * 2);
  if (hasNone) notes.push("Compliance: 'None of the above' selected → 0");

  // ✅ Instagram presence (0..2)
  // Primary key: instagram_handle
  // Also allow: instagram, ig, ig_handle, instagramHandle, social_instagram
  const igRaw = firstNonEmptyString(answers, [
    "instagram_handle",
    "instagram",
    "ig",
    "ig_handle",
    "instagramHandle",
    "social_instagram",
  ]);
  const hasIG = hasInstagramHandle(igRaw);
  const hasInstagramScore = hasIG ? 2 : 0;
  if (!igRaw) notes.push("Instagram: missing (0)");
  else if (hasIG) notes.push("Instagram: detected (+2)");
  else notes.push("Instagram: looks like 'no IG' (0)");

  // ✅ Proximity by bus minutes (0..2)
  // Primary key: bus_minutes
  // Also allow: bus_time_minutes, minutes_to_campus, campus_bus_minutes, proximity_minutes
  // If missing, try parsing from text fields like campus_bus (e.g., "Jubilee Campus, 20 minutes")
  let mins =
    firstNumber(answers, [
      "bus_minutes",
      "bus_time_minutes",
      "minutes_to_campus",
      "campus_bus_minutes",
      "proximity_minutes",
    ]) ?? null;

  if (mins === null) {
    const campusBusText = firstNonEmptyString(answers, ["campus_bus", "campusBus", "bus_time", "distance_to_campus"]);
    const parsed = parseMinutesFromText(campusBusText);
    if (parsed !== null) {
      mins = parsed;
      notes.push(`Proximity: parsed minutes from text (${mins})`);
    } else if (campusBusText) {
      notes.push("Proximity: could not parse minutes from campus_bus text (0)");
    } else {
      notes.push("Proximity: missing (0)");
    }
  }

  let proximityScore = 0;
  if (mins !== null) {
    if (mins <= 15) proximityScore = 2;
    else if (mins <= 30) proximityScore = 1;
  }

  const total = clamp(complianceScore + hasInstagramScore + proximityScore, 0, 10);

  return {
    total,
    breakdown: {
      complianceScore,
      hasInstagramScore,
      proximityScore,
      notes,
    },
  };
}
