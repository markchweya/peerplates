"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MotionDiv } from "@/app/ui/motion";

const BRAND = "#fcb040";

type QueueResult = {
  email: string;
  role: "consumer" | "vendor";
  review_status: "pending" | "reviewed" | "approved" | "rejected";
  position: number | null;
  score: number;
  created_at: string;

  referral_code: string | null;
  referral_link: string | null;
};

const inputBase =
  "h-12 w-full rounded-2xl border border-[#fcb040] bg-white px-4 font-semibold text-black outline-none " +
  "focus:ring-4 focus:ring-[rgba(252,176,64,0.30)]";

const buttonBase =
  "w-full rounded-2xl bg-[#fcb040] px-6 py-3 text-center font-extrabold text-black transition " +
  "hover:opacity-95 hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed";

const subtleButton =
  "w-full rounded-2xl border border-black/10 bg-white px-6 py-3 text-center font-extrabold text-black " +
  "hover:bg-black/5 transition";

function formatStatus(s: QueueResult["review_status"]) {
  if (s === "approved") return "Approved ✅";
  if (s === "rejected") return "Rejected ❌";
  if (s === "reviewed") return "Reviewed 🔎";
  return "Pending ⏳";
}

function cleanCode(v: string) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export default function QueuePage() {
  const sp = useSearchParams();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<QueueResult | null>(null);

  const [toast, setToast] = useState<string>("");

  // Pre-fill code from /queue?code=XXXX
  useEffect(() => {
    const c = cleanCode(sp.get("code") || "");
    if (c) setCode(c);
  }, [sp]);

  const fetchStatus = async () => {
    setErr("");
    setResult(null);

    const c = cleanCode(code);
    if (!c) return setErr("Please enter your code.");

    setLoading(true);
    try {
      const res = await fetch(`/api/queue-status?code=${encodeURIComponent(c)}`);
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Failed to fetch status.");
      setResult(payload as QueueResult);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied!");
      setTimeout(() => setToast(""), 1400);
    } catch {
      setToast("Copy failed");
      setTimeout(() => setToast(""), 1400);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between gap-4"
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl" style={{ background: BRAND }} />
            <div className="text-lg font-semibold tracking-tight">PeerPlates</div>
          </Link>
          <div className="text-sm text-black/60 whitespace-nowrap">Queue</div>
        </MotionDiv>

        {/* Toast */}
        {toast ? (
          <MotionDiv
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="mt-4 inline-flex rounded-2xl border border-black/10 bg-black/5 px-4 py-2 text-sm font-semibold"
          >
            {toast}
          </MotionDiv>
        ) : null}

        {/* Card */}
        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-extrabold tracking-tight font-heading">Check your queue status</h1>
          <p className="mt-2 text-sm text-black/60">
            Paste the code you received after signing up to view your status and position.
          </p>

          {err ? (
            <MotionDiv
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-black/10 bg-black/5 p-3 text-sm text-black"
            >
              {err}
            </MotionDiv>
          ) : null}

          {!result ? (
            <div className="mt-5 grid gap-3">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Your code</label>
                <input
                  className={inputBase}
                  placeholder="E.g. 8F3K9M2Q"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="text"
                />
              </div>

              <button className={buttonBase} onClick={fetchStatus} disabled={loading}>
                {loading ? "Checking…" : "View status"}
              </button>

              <div className="text-xs text-black/50">
                Tip: if you got a link in email, it should open this page with the code pre-filled.
              </div>
            </div>
          ) : (
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 grid gap-3"
            >
              <div className="rounded-3xl border border-[#fcb040] bg-white p-4">
                <div className="text-sm font-extrabold">Your status</div>

                <div className="mt-2 grid gap-2 text-sm text-black/80">
                  <div>
                    <span className="font-semibold">Email:</span> {result.email}
                  </div>
                  <div>
                    <span className="font-semibold">Role:</span> {result.role}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {formatStatus(result.review_status)}
                  </div>

                  <div>
                    <span className="font-semibold">Queue position:</span>{" "}
                    {result.position ? (
                      <span className="font-extrabold">#{result.position}</span>
                    ) : (
                      <span className="text-black/60">Not available</span>
                    )}
                  </div>

                  <div>
                    <span className="font-semibold">
                      {result.role === "consumer" ? "Referral points" : "Vendor score"}:
                    </span>{" "}
                    <span className="font-extrabold">{result.score}</span>
                  </div>

                  <div className="text-xs text-black/50">
                    Joined: {new Date(result.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Referral link (goes to /join?ref=... so they choose role first) */}
              {result.referral_link ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 }}
                  className="rounded-3xl border border-black/10 bg-white p-4"
                >
                  <div className="text-sm font-extrabold">Your referral link</div>
                  <div className="mt-2 grid gap-2">
                    <div className="flex items-center gap-2">
                      <input className={inputBase} readOnly value={result.referral_link} />
                    </div>
                    <button className={subtleButton} onClick={() => copy(result.referral_link!)}>
                      Copy referral link
                    </button>
                    <div className="text-xs text-black/50">
                      Share this link. They’ll land on the role chooser (Consumer/Vendor) first.
                    </div>
                  </div>
                </MotionDiv>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <button className={buttonBase} onClick={fetchStatus} disabled={loading}>
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  className={subtleButton}
                  onClick={() => {
                    setResult(null);
                    setErr("");
                  }}
                  disabled={loading}
                >
                  Check a different code
                </button>
              </div>
            </MotionDiv>
          )}
        </MotionDiv>
      </div>
    </main>
  );
}
