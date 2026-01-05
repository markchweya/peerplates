// src/app/join/JoinClient.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function CustomerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 13.7c-3.2 0-5.8 2.2-5.8 4.9V20h11.6v-1.4c0-2.7-2.6-4.9-5.8-4.9Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M12 13.2c2 0 3.6-1.6 3.6-3.5S14 6.2 12 6.2 8.4 7.8 8.4 9.7 10 13.2 12 13.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** ✅ Vendor icon: CHEF HAT ONLY */
function ChefHatIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7.2 9.3c-1.8-.4-3.2-2-3.2-4 0-2.2 1.8-4 4-4 1.1 0 2.1.4 2.8 1.1.7-.7 1.7-1.1 2.8-1.1s2.1.4 2.8 1.1c.7-.7 1.7-1.1 2.8-1.1 2.2 0 4 1.8 4 4 0 2-1.4 3.6-3.2 4v2.2H7.2V9.3Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M7.2 11.5h13.6v2H7.2v-2Z" fill="currentColor" opacity="0.22" />
    </svg>
  );
}

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

/** Clean “not emoji” food glyphs (optional background accents) */
function FoodGlyph({
  className = "",
  variant,
}: {
  className?: string;
  variant: "bowl" | "pepper" | "croissant" | "taco";
}) {
  const paths = {
    bowl: (
      <>
        <path
          d="M6 13c0 4.2 3 7 6 7s6-2.8 6-7c0-.8-.1-1.6-.3-2.3H6.3C6.1 11.4 6 12.2 6 13Z"
          fill="url(#g)"
        />
        <path d="M7 10.6h10c-.4-2.8-2.4-5-5-5s-4.6 2.2-5 5Z" fill="rgba(255,255,255,0.55)" />
      </>
    ),
    pepper: (
      <>
        <path
          d="M12.5 6.3c.8-1.3 1.9-2.1 3.4-2.3"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M10 7.2c-2.6.8-4.2 3.2-3.8 6 .5 3.6 3.4 6.2 6.7 6 3.5-.2 6.3-3.2 6.1-6.8-.2-3.2-2.7-5.8-6-6.2-.7-.1-2.1.2-3 .6Z"
          fill="url(#g)"
        />
      </>
    ),
    croissant: (
      <>
        <path
          d="M7 14.3c-1.4-1.6-1.5-3.7-.2-5.3 1.5-1.9 4.2-2.4 6.1-1.2 1.8-1.2 4.5-.7 6 1.2 1.3 1.6 1.2 3.7-.2 5.3-1.9 2.2-6 3.7-8.8 3.7S8.9 16.5 7 14.3Z"
          fill="url(#g)"
        />
        <path
          d="M9 9.7c1.1.2 2.2.6 3 1.3 1-.7 2.1-1.1 3.1-1.3"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </>
    ),
    taco: (
      <>
        <path
          d="M6.3 13.2c.8-4.1 3.7-6.8 5.7-6.8s4.9 2.7 5.7 6.8c.4 2-1.1 3.8-3.1 3.8H9.4c-2 0-3.5-1.8-3.1-3.8Z"
          fill="url(#g)"
        />
        <path
          d="M8.4 12.1c1.1-.8 2.5-1.2 3.6-1.2s2.5.4 3.6 1.2"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </>
    ),
  }[variant];

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="4" y1="4" x2="20" y2="20">
          <stop stopColor={BRAND_ORANGE} />
          <stop offset="1" stopColor={BRAND_BROWN} />
        </linearGradient>
      </defs>
      {paths}
    </svg>
  );
}

function FloatingFood() {
  const items = [
    { variant: "bowl" as const, left: "8%", top: "18%", s: 56, d: 0.0 },
    { variant: "pepper" as const, left: "86%", top: "22%", s: 52, d: 0.2 },
    { variant: "croissant" as const, left: "12%", top: "78%", s: 58, d: 0.35 },
    { variant: "taco" as const, left: "88%", top: "76%", s: 56, d: 0.5 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-20"
        style={{ background: "rgba(252,176,64,0.35)" }}
        animate={{ x: [0, 60, 0], y: [0, 26, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-44 -bottom-48 h-[620px] w-[620px] rounded-full blur-3xl opacity-18"
        style={{ background: "rgba(138,107,67,0.22)" }}
        animate={{ x: [0, -70, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {items.map((it) => (
        <motion.div
          key={`${it.variant}-${it.left}-${it.top}`}
          className="absolute"
          style={{
            left: it.left,
            top: it.top,
            width: it.s,
            height: it.s,
            filter: "drop-shadow(0 16px 22px rgba(2,6,23,0.16))",
          }}
          animate={{ y: [-10, 10, -10], rotate: [-4, 4, -4], opacity: [0.6, 0.95, 0.6] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: it.d }}
        >
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-slate-200/70 p-2 shadow-sm">
            <FoodGlyph variant={it.variant} className="h-9 w-9" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function JoinClient({ referral }: { referral: string }) {
  const ref = String(referral || "").trim();

  const consumerHref = useMemo(
    () => (ref ? `/join/consumer?ref=${encodeURIComponent(ref)}` : "/join/consumer"),
    [ref]
  );
  const vendorHref = useMemo(
    () => (ref ? `/join/vendor?ref=${encodeURIComponent(ref)}` : "/join/vendor"),
    [ref]
  );

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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);

  // lock scroll only when the full-screen mobile menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  return (
    <main className="relative min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* Optional background accents */}
      <FloatingFood />

      <style>{`
        summary::-webkit-details-marker { display:none; }
        .pp-tap { -webkit-tap-highlight-color: transparent; user-select:none; }
        details[open] .pp-chevron { transform: rotate(180deg); }
        .pp-chevron { transition: transform 180ms ease; }
        @media (min-width: 768px) { .pp-mobile-only { display:none !important; } }
        @media (max-width: 767px) { .pp-desktop-only { display:none !important; } }
      `}</style>

      <div className="relative mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Top bar */}
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between gap-4"
        >
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <LogoCinematic size={64} wordScale={1} />
          </Link>

          {/* Desktop dropdown */}
          <div className="pp-desktop-only hidden md:flex items-center gap-3">
            <details
              className="relative"
              open={desktopOpen}
              onToggle={(e) => setDesktopOpen((e.target as HTMLDetailsElement).open)}
            >
              <summary className={cn("pp-tap", btnBase, btnGhost, "gap-2 cursor-pointer")} aria-label="Open menu">
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
                        onClick={() => setDesktopOpen(false)}
                        className={cn("w-full", btnBase, "px-5 py-3", btnGhost, "justify-start")}
                      >
                        {l.label}
                      </Link>
                    ))}
                    <Link
                      href="/join"
                      onClick={() => setDesktopOpen(false)}
                      className={cn("w-full", btnBase, "px-5 py-3", btnPrimary)}
                    >
                      Join waitlist
                    </Link>
                  </div>
                  <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                </div>
              </div>
            </details>
          </div>

          {/* Mobile hamburger */}
          <div className="pp-mobile-only md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className={cn(
                "pp-tap inline-flex items-center justify-center",
                "h-10 w-10 rounded-full border border-slate-200 bg-white shadow-sm",
                "transition hover:-translate-y-[1px] text-slate-900"
              )}
            >
              <HamburgerIcon className="h-5 w-5" />
            </button>
          </div>
        </MotionDiv>

        {/* Main card (SOLID white, no transparent overlay) */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.2, 0.9, 0.2, 1] }}
          className="mt-8 sm:mt-10"
        >
          <div
            className="relative rounded-[40px] border border-[#fcb040]/45 bg-white p-6 sm:p-8 shadow-sm"
            style={{
              boxShadow:
                "0 0 0 1px rgba(252,176,64,0.22), 0 22px 70px rgba(2,6,23,0.10), 0 14px 40px rgba(252,176,64,0.14)",
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-800 shadow-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: BRAND_ORANGE,
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.85), 0 0 18px rgba(252,176,64,0.45)",
                }}
              />
              Choose your role
            </div>

            <h1 className="mt-5 font-extrabold tracking-tight leading-[1.02] text-[clamp(2.2rem,4.8vw,3.6rem)]">
              Eat better.{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Join the waitlist.
              </span>
            </h1>

            <p className="mt-3 text-slate-900/70 font-semibold max-w-2xl">
              Consumers move up by referrals. Vendors are reviewed via questionnaire — built for safety, trust, and real
              home-cooked food.
            </p>

            {ref ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="mt-5 rounded-3xl border border-[#fcb040]/40 bg-white px-5 py-4 shadow-sm"
                style={{ boxShadow: "0 10px 28px rgba(252,176,64,0.10)" }}
              >
                <div className="text-sm font-extrabold text-slate-700">
                  Referral detected <span className="ml-2 font-mono text-slate-900">{ref}</span>
                </div>
              </motion.div>
            ) : null}

            {/* Role cards */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <RoleCard
                href={consumerHref}
                title="Consumer"
                subtitle="Buy food • Refer friends • Move up the queue"
                icon={<CustomerIcon className="h-7 w-7 text-slate-900" />}
                glow="rgba(252,176,64,0.18)"
              />

              <RoleCard
                href={vendorHref}
                title="Vendor"
                subtitle="Sell food • Questionnaire review • Manual queue position"
                icon={<ChefHatIcon className="h-7 w-7 text-slate-900" />}
                glow="rgba(138,107,67,0.14)"
              />
            </div>

            {/* Back */}
            <div className="mt-7">
              <Link
                href="/"
                className={cn(
                  "inline-flex rounded-2xl border border-[#fcb040]/55 bg-white px-6 py-3",
                  "text-center font-extrabold text-slate-900 transition hover:-translate-y-[1px]"
                )}
                style={{ boxShadow: "0 10px 24px rgba(2,6,23,0.10)" }}
              >
                Back
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 text-xs text-slate-500/70">© {new Date().getFullYear()} PeerPlates</div>
      </div>

      {/* ✅ Mobile full-screen menu (WHITE background, icon on left) */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[200] bg-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* top row: close + brand (icon on left) */}
            <div className="flex items-center gap-3 px-4 pt-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className={cn(
                  "pp-tap h-10 w-10 rounded-full",
                  "border border-slate-200 bg-white shadow-sm",
                  "flex items-center justify-center text-slate-900"
                )}
              >
                <XIcon className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                  <LogoCinematic size={36} wordScale={0.72} />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold leading-none">PeerPlates</div>
                  <div className="text-xs font-semibold text-slate-500">authentic • affordable • local</div>
                </div>
              </div>
            </div>

            {/* menu card */}
            <div className="px-4 pt-5">
              <div
                className="mx-auto w-full max-w-[420px] rounded-[34px] border border-slate-200 bg-white p-4 shadow-sm"
                style={{ boxShadow: "0 26px 90px rgba(2,6,23,0.12)" }}
              >
                <div className="grid gap-3">
                  {navLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "w-full rounded-2xl border border-slate-200 bg-white",
                        "px-5 py-3.5 text-center font-extrabold text-slate-900 shadow-sm"
                      )}
                    >
                      {l.label}
                    </Link>
                  ))}

                  <Link
                    href="/join"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "w-full rounded-2xl border border-[#fcb040]/70 bg-[#fcb040]",
                      "px-5 py-3.5 text-center font-extrabold text-slate-900 shadow-sm"
                    )}
                  >
                    Join waitlist
                  </Link>
                </div>

                <div className="mt-4 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function RoleCard({
  href,
  title,
  subtitle,
  icon,
  glow,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  glow: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
      <Link
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-[28px] border border-[#fcb040]/35 bg-white p-6 shadow-sm transition",
          "hover:-translate-y-[2px]"
        )}
        style={{ boxShadow: "0 14px 36px rgba(2,6,23,0.10)" }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: glow }}
        />

        <div className="relative flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <div className="min-w-0">
            <div className="text-xl font-extrabold tracking-tight">{title}</div>
            <div className="mt-1 text-slate-900/70 font-semibold">{subtitle}</div>
          </div>
        </div>

        <div className="relative mt-4 h-[2px] w-24 rounded-full bg-slate-200 overflow-hidden">
          <motion.div
            className="h-full w-full"
            style={{ background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})` }}
            initial={{ x: "-100%" }}
            whileHover={{ x: "0%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
