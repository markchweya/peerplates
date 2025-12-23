export function vendorPriorityScoreFromAnswers(answers: any): number {
  const compliance: string[] = Array.isArray(answers?.compliance_readiness)
    ? answers.compliance_readiness
    : [];

  const hasNone = compliance.includes("None of the above");
  const complianceCount = hasNone ? 0 : compliance.length; // 0..4

  const ig = String(answers?.instagram_handle || "").trim();
  const hasIG = ig.length > 0 && !ig.toLowerCase().includes("don’t have");

  const minsRaw = Number(answers?.bus_minutes);
  const mins = Number.isFinite(minsRaw) ? minsRaw : null;

  // Simple 0–10 scoring:
  // - Compliance readiness: up to 6
  // - Has IG: +2
  // - Closer by bus: up to +2
  let score = 0;

  score += Math.min(6, complianceCount * 2); // 0,2,4,6
  if (hasIG) score += 2;

  if (mins !== null) {
    if (mins <= 15) score += 2;
    else if (mins <= 30) score += 1;
  }

  return Math.max(0, Math.min(10, score));
}
