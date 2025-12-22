"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MotionDiv } from "../ui/motion";

type Role = "consumer" | "vendor";

export default function JoinPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const roleFromUrl = (sp.get("role") || "").toLowerCase() as Role | "";

  // ✅ If role exists in URL, skip this page entirely (no repetition)
  useEffect(() => {
    if (roleFromUrl === "consumer") router.replace("/join/consumer");
    if (roleFromUrl === "vendor") router.replace("/join/vendor");
  }, [roleFromUrl, router]);

  const defaultRole: Role = useMemo(() => {
    return roleFromUrl === "vendor" ? "vendor" : "consumer";
  }, [roleFromUrl]);

  const [role, setRole] = useState<Role>(defaultRole);

  const cardBase =
    "rounded-2xl border p-5 text-left transition will-change-transform";
  const selected = "border-[#fcb040] bg-[#fff7ed] shadow-sm";
  const unselected =
    "border-slate-200 hover:bg-slate-50 hover:-translate-y-[2px]";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between"
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#fcb040]" />
            <div className="text-lg font-semibold tracking-tight">PeerPlates</div>
          </Link>
          <div className="text-sm text-slate-500">Join waitlist</div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            Choose your role
          </h1>
          <p className="mt-2 text-slate-600">
            Consumers move up by referrals. Vendors are reviewed via questionnaire.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <MotionDiv
              whileHover={{ scale: role === "consumer" ? 1.01 : 1.02 }}
              whileTap={{ scale: 0.99 }}
            >
              <button
                type="button"
                onClick={() => setRole("consumer")}
                className={`${cardBase} ${
                  role === "consumer" ? selected : unselected
                }`}
              >
                <div className="text-xl font-extrabold">Consumer</div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  Buy food • Refer friends • Move up the queue
                </div>
              </button>
            </MotionDiv>

            <MotionDiv
              whileHover={{ scale: role === "vendor" ? 1.01 : 1.02 }}
              whileTap={{ scale: 0.99 }}
            >
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`${cardBase} ${
                  role === "vendor" ? selected : unselected
                }`}
              >
                <div className="text-xl font-extrabold">Vendor</div>
                <div className="mt-1 text-sm font-semibold text-slate-600">
                  Sell food • Questionnaire review • Manual queue position
                </div>
              </button>
            </MotionDiv>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href={`/join/${role}`}
              className="rounded-2xl bg-[#fcb040] px-6 py-3 text-center font-extrabold text-slate-900 transition hover:opacity-95 hover:-translate-y-[1px]"
            >
              Continue
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-slate-200 px-6 py-3 text-center font-extrabold transition hover:bg-slate-50 hover:-translate-y-[1px]"
            >
              Back
            </Link>
          </div>
        </MotionDiv>
      </div>
    </main>
  );
}
