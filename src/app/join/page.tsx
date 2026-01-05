// src/app/join/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

function ConsumerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 12.9c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Z" fill="currentColor" />
      <path
        d="M12 14.2c-4.2 0-7.6 2.6-7.6 5.9V21h15.2v-.9c0-3.3-3.4-5.9-7.6-5.9Z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  );
}

/** ✅ Chef HAT ONLY (vendor icon) */
function ChefHatIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7.2 9.3c-1.8-.4-3.2-2-3.2-4 0-2.2 1.8-4 4-4 1.1 0 2.1.4 2.8 1.1.7-.7 1.7-1.1 2.8-1.1s2.1.4 2.8 1.1c.7-.7 1.7-1.1 2.8-1.1 2.2 0 4 1.8 4 4 0 2-1.4 3.6-3.2 4v2.2H7.2V9.3Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M7.2 11.5h13.6v2H7.2v-2Z" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

const ORANGE = "#fcb040";
const BROWN = "#8a6b43";

function HamburgerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 7h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5 17h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function JoinPage() {
  const searchParams = useSearchParams();
  const ref = (searchParams?.get("ref") || "").trim();

  const consumerHref = ref ? `/join/consumer?ref=${encodeURIComponent(ref)}` : "/join/consumer";
  const vendorHref = ref ? `/join/vendor?ref=${encodeURIComponent(ref)}` : "/join/vendor";

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/mission", label: "Mission" },
      { href: "/vision", label: "Vision" },
      { href: "/food-safety", label: "Food safety" },
      { href: "/queue", label: "Check queue" },
      { href: "/faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy" },
    ],
    []
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  // ✅ lock scroll only when the menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <style>{`
        summary::-webkit-details-marker { display:none; }
        .pp-tap { -webkit-tap-highlight-color: transparent; user-select:none; }
        details[open] .pp-chevron { transform: rotate(180deg); }
        .pp-chevron { transition: transform 180ms ease; }

        @media (min-width: 768px) { .pp-mobile-only { display:none !important; } }
        @media (max-width: 767px) { .pp-desktop-only { display:none !important; } }
      `}</style>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto">
        <div className="border-b border-slate-200/60 bg-white">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex items-center gap-3"
            >
              {/* Logo (left) */}
              <Link href="/" className="flex items-center gap-3 min-w-0">
                <span className="shrink-0">
                  <LogoCinematic size={56} wordScale={1} />
                </span>
              </Link>

              {/* Desktop: dropdown + join */}
              <div className="pp-desktop-only ml-auto hidden md:flex items-center gap-3">
                <details
                  className="relative"
                  open={desktopMenuOpen}
                  onToggle={(e) => setDesktopMenuOpen((e.target as HTMLDetailsElement).open)}
                >
                  <summary className={["pp-tap", btnBase, btnGhost, "gap-2 cursor-pointer"].join(" ")} aria-label="Open menu">
                    Menu <ChevronDown className="pp-chevron h-5 w-5" />
                  </summary>

                  <div className="absolute right-0 mt-3 w-[320px] origin-top-right">
                    <div
                      className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm"
                      style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                    >
                      <div className="grid gap-2">
                        {navLinks.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setDesktopMenuOpen(false)}
                            className={["w-full", btnBase, "px-5 py-3", btnGhost, "justify-start"].join(" ")}
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                    </div>
                  </div>
                </details>

                <Link href="/join" className={[btnBase, btnPrimary].join(" ")}>
                  Join waitlist
                </Link>
              </div>

              {/* Mobile hamburger (ICON ONLY) */}
              <div className="pp-mobile-only md:hidden ml-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className={[
                    "pp-tap inline-flex items-center justify-center",
                    "rounded-full border border-slate-200 bg-white",
                    "h-10 w-10 shadow-sm transition hover:-translate-y-[1px]",
                    "text-slate-900",
                  ].join(" ")}
                  aria-label="Open menu"
                >
                  <HamburgerIcon className="h-5 w-5" />
                </button>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[84px]" />

      {/* ✅ Mobile menu: SOLID WHITE sheet */}
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[120] bg-white"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* top bar */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className={[
                  "pp-tap h-10 w-10 rounded-full",
                  "border border-slate-200 bg-white shadow-sm",
                  "flex items-center justify-center text-slate-900",
                ].join(" ")}
              >
                <XIcon className="h-5 w-5" />
              </button>

              {/* ✅ Icon on the LEFT (brand block) */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                  <LogoCinematic size={34} wordScale={0.72} />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold leading-none">PeerPlates</div>
                  <div className="text-xs font-semibold text-slate-500">authentic • affordable • local</div>
                </div>
              </div>
            </div>

            {/* menu content */}
            <div className="px-4 pt-5">
              <div
                className="mx-auto w-full max-w-[420px] rounded-[34px] border border-slate-200 bg-white shadow-sm p-4"
                style={{ boxShadow: "0 26px 90px rgba(2,6,23,0.12)" }}
              >
                <div className="grid gap-3">
                  {navLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={[
                        "w-full rounded-2xl border border-slate-200 bg-white",
                        "px-5 py-3.5 text-center font-extrabold text-slate-900 shadow-sm",
                      ].join(" ")}
                    >
                      {l.label}
                    </Link>
                  ))}

                  <Link
                    href="/join"
                    onClick={() => setMobileMenuOpen(false)}
                    className={[
                      "w-full rounded-2xl border border-[#fcb040]/70 bg-[#fcb040]",
                      "px-5 py-3.5 text-center font-extrabold text-slate-900 shadow-sm",
                    ].join(" ")}
                  >
                    Join waitlist
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-2 sm:mt-4 rounded-3xl border border-[#fcb040] bg-white p-6 sm:p-8 shadow-sm"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-[#fcb040]" />
            Choose your role
          </div>

          <h1 className="mt-6 font-extrabold tracking-tight leading-[0.95] text-[clamp(2.4rem,5vw,4.2rem)]">
            Eat better.{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${ORANGE}, ${BROWN})` }}>
              Join the waitlist.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-slate-900/70 font-semibold leading-relaxed">
            Consumers move up by referrals. Vendors are reviewed via questionnaire — built for safety, trust, and real home-cooked food.
          </p>

          {ref ? (
            <div className="mt-6 rounded-2xl border border-[#fcb040] bg-white p-4 text-sm">
              <span className="font-semibold">Referral detected:</span> <span className="font-mono">{ref}</span>
            </div>
          ) : null}

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Link
              href={consumerHref}
              className="group rounded-[34px] border border-[#fcb040]/55 bg-white p-7 shadow-sm transition hover:-translate-y-[2px]"
              style={{ boxShadow: "0 18px 50px rgba(2,6,23,0.08)" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center shadow-sm">
                  <ConsumerIcon className="h-7 w-7 text-slate-900" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold">Consumer</div>
                  <div className="mt-1 text-slate-900/70 font-semibold">Buy food • Refer friends • Move up</div>
                </div>
              </div>
              <div className="mt-6 h-[2px] w-36 bg-slate-200 group-hover:w-44 transition-all" />
            </Link>

            <Link
              href={vendorHref}
              className="group rounded-[34px] border border-[#fcb040]/55 bg-white p-7 shadow-sm transition hover:-translate-y-[2px]"
              style={{ boxShadow: "0 18px 50px rgba(2,6,23,0.08)" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center shadow-sm">
                  <ChefHatIcon className="h-7 w-7 text-slate-900" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold">Vendor</div>
                  <div className="mt-1 text-slate-900/70 font-semibold">Sell food • Review • Queue position</div>
                </div>
              </div>
              <div className="mt-6 h-[2px] w-36 bg-slate-200 group-hover:w-44 transition-all" />
            </Link>
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex rounded-2xl border border-[#fcb040] bg-white px-7 py-3 text-center font-extrabold text-slate-900 transition hover:-translate-y-[1px]"
            >
              Back
            </Link>
          </div>
        </MotionDiv>
      </div>
    </main>
  );
}
