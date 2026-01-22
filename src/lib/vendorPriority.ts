// src/lib/vendorPriority.ts
// Vendor priority scoring (0–10) based on actionable, non-guesswork signals.
// Updated to match the NEW vendorQuestions keys/options.
//
// Scoring buckets:
// - Compliance readiness: 0..4
// - Proof (sell history): 0..2
// - Reliability (portions/week): 0..2
// - Proximity (postcode area present): 0..1
// - Social proof (has_food_ig + ig_handle): 0..1
//
// Total capped to 10.

export type VendorAnswers = Record<string, unknown>;

export type VendorPriorityBreakdown = {
  complianceScore: number; // 0..4
  proofScore: number; // 0..2
  reliabilityScore: number; // 0..2
  proximityScore: number; // 0..1
  socialScore: number; // 0..1
  notes?: string[];
};

export type VendorPriorityResult = {
  total: number; // 0..10
  breakdown: VendorPriorityBreakdown;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => asString(x)).filter(Boolean);
}

function normalizeLower(s: string) {
  return s.trim().toLowerCase();
}

function firstNonEmptyString(answers: VendorAnswers, keys: string[]): string {
  for (const k of keys) {
    const s = asString(answers[k]);
    if (s) return s;
  }
  return "";
}

function firstStringArray(answers: VendorAnswers, keys: string[]): string[] {
  for (const k of keys) {
    const arr = asStringArray(answers[k]);
    if (arr.length) return arr;
  }
  return [];
}

function hasInstagramHandle(raw: string): boolean {
  const s = normalizeLower(raw);
  if (!s) return false;

  const noIgHints = ["dont have", "don’t have", "do not have", "no instagram", "none", "n/a", "na"];
  if (noIgHints.some((h) => s.includes(h))) return false;

  return s.startsWith("@") || s.includes("instagram.com") || s.length >= 2;
}

function portionsTierToMinEstimate(portions: string): number | null {
  // We only use the exact options you provided.
  // This is NOT guessing; it’s mapping the selected bucket.
  const s = portions.trim();

  if (s === "0") return 0;
  if (s === "1–5" || s === "1-5") return 1;
  if (s === "6–10" || s === "6-10") return 6;
  if (s === "11–20" || s === "11-20") return 11;
  if (s === "21–40" || s === "21-40") return 21;
  if (s === "40+") return 40;

  return null;
}

export function vendorPriorityScore(answers: VendorAnswers): VendorPriorityResult {
  const notes: string[] = [];

  // =========================
  // 1) Compliance readiness (0..4)
  // =========================
  const compliance = [
    ...firstStringArray(answers, ["compliance_readiness", "compliance", "compliance_docs", "complianceChecklist"]),
  ]
    .map((x) => x.trim())
    .filter(Boolean);

  const hasNone = compliance.some((x) => {
    const s = normalizeLower(x);
    return s === "none" || s === "none of the above";
  });

  const complianceCount = hasNone ? 0 : compliance.length;

  // 1 item = 2, 2 items = 3, 3+ = 4
  let complianceScore = 0;
  if (complianceCount === 1) complianceScore = 2;
  else if (complianceCount === 2) complianceScore = 3;
  else if (complianceCount >= 3) complianceScore = 4;

  notes.push(hasNone ? "Compliance: 'None of the above' selected → 0" : `Compliance items: ${complianceCount} → ${complianceScore}`);

  // =========================
  // 2) Proof (0..2) — now based on "currently_sell"
  // =========================
  const currentlySell = normalizeLower(firstNonEmptyString(answers, ["currently_sell"]));
  // Yes = strong proof they’re already operational
  const proofScore = currentlySell === "yes" ? 2 : 0;
  notes.push(proofScore ? "Proof: currently selling food (+2)" : "Proof: not currently selling (0)");

  // =========================
  // 3) Reliability (0..2) — portions_per_week buckets
  // =========================
  const portionsRaw = firstNonEmptyString(answers, ["portions_per_week"]);
  const portionsMin = portionsTierToMinEstimate(portionsRaw);

  let reliabilityScore = 0;
  if (portionsMin !== null) {
    // Simple, consistent thresholds:
    // 0 → 0
    // 1–5 / 6–10 → 1
    // 11–20 and above → 2
    if (portionsMin >= 11) reliabilityScore = 2;
    else if (portionsMin >= 1) reliabilityScore = 1;
  }

  notes.push(
    portionsMin === null
      ? "Reliability: portions/week missing (0)"
      : `Reliability: portions/week '${portionsRaw}' → ${reliabilityScore}/2`
  );

  // =========================
  // 4) Proximity (0..1) — we only have postcode_area now
  // =========================
  // Without a campus-minutes question, we can’t do distance scoring.
  // So we give a small point if postcode_area is provided (it is required in your form).
  const postcode = firstNonEmptyString(answers, ["postcode_area"]);
  const proximityScore = postcode ? 1 : 0;
  notes.push(proximityScore ? `Proximity: postcode area present (${postcode}) (+1)` : "Proximity: postcode area missing (0)");

  // =========================
  // 5) Social proof (0..1) — has_food_ig + ig_handle
  // =========================
  const hasFoodIg = normalizeLower(firstNonEmptyString(answers, ["has_food_ig"]));
  const igHandle = firstNonEmptyString(answers, ["ig_handle", "instagram_handle", "instagram", "ig"]);

  const socialScore = hasFoodIg === "yes" && hasInstagramHandle(igHandle) ? 1 : 0;
  notes.push(socialScore ? "Social: food IG provided (+1)" : "Social: no valid food IG (0)");

  const total = clamp(complianceScore + proofScore + reliabilityScore + proximityScore + socialScore, 0, 10);

  return {
    total,
    breakdown: {
      complianceScore,
      proofScore,
      reliabilityScore,
      proximityScore,
      socialScore,
      notes,
    },
  };
}
