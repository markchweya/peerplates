"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

/** Hamburger icon (3 lines) that animates into an X when open */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.path
        d="M5 7h14"
        initial={false}
        animate={{ rotate: open ? 45 : 0, y: open ? 5 : 0 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ originX: 0.5, originY: 0.5 }}
      />
      <motion.path
        d="M5 12h14"
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.12, ease: "easeInOut" }}
      />
      <motion.path
        d="M5 17h14"
        initial={false}
        animate={{ rotate: open ? -45 : 0, y: open ? -5 : 0 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ originX: 0.5, originY: 0.5 }}
      />
    </svg>
  );
}

function PageShell({
  kicker,
  title,
  highlight,
  body,
  children,
}: {
  kicker: string;
  title: string;
  highlight: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative">
      {/* ✅ SAME shading as vision/page.tsx */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-white" />
        <div
          className="absolute -left-44 top-10 h-[520px] w-[520px] rounded-full blur-3xl opacity-20"
          style={{ background: "rgba(138,107,67,0.25)" }}
        />
        <div
          className="absolute -right-44 bottom-[-140px] h-[560px] w-[560px] rounded-full blur-3xl opacity-20"
          style={{ background: "rgba(252,176,64,0.35)" }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
          className="mx-auto max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-5 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full" style={{ background: BRAND_ORANGE }} />
            {kicker}
          </div>

          <h1 className="mt-6 font-extrabold tracking-tight leading-[0.95] text-[clamp(2.8rem,6vw,4.6rem)] text-slate-900">
            {title}{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, ${BRAND_BROWN}, ${BRAND_ORANGE})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {highlight}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 font-semibold">{body}</p>

          {children ? <div className="mt-10">{children}</div> : null}
        </motion.div>
      </div>
    </section>
  );
}

export default function MissionPage() {
  // mobile menu (never shows on desktop)
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    } else {
      // @ts-ignore
      mq.addListener(apply);
      // @ts-ignore
      return () => mq.removeListener(apply);
    }
  }, []);

  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home", variant: "ghost" as const },
      { href: "/mission", label: "Mission", variant: "ghost" as const },
      { href: "/vision", label: "Vision", variant: "ghost" as const },
      { href: "/food-safety", label: "Food safety", variant: "ghost" as const },
      { href: "/queue", label: "Check queue", variant: "ghost" as const },
      { href: "/join", label: "Join waitlist", variant: "primary" as const },
    ],
    []
  );

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto">
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 min-w-0"
            >
              <Link href="/" className="flex items-center min-w-0 overflow-hidden">
                <span className="shrink-0">
                  <LogoCinematic size={64} wordScale={1} />
                </span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-3 ml-auto">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={[btnBase, l.variant === "primary" ? btnPrimary : btnGhost].join(" ")}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Mobile icon */}
              {!isDesktop ? (
                <div className="ml-auto shrink-0 relative md:hidden">
                  <button
      type="button"
      onClick={() => setMenuOpen((v) => !v)}
      aria-label={menuOpen ? "Close menu" : "Open menu"}
      aria-expanded={menuOpen}
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-full border border-slate-200 bg-white/95 backdrop-blur",
        "h-10 w-10 shadow-sm transition hover:-translate-y-[1px]"
      )}
      // ✅ same as Vision: makes the bars orange
      style={{ color: BRAND_ORANGE, borderColor: "rgba(252,176,64,0.35)" }}
    >
      <HamburgerIcon open={menuOpen} />
    </button>
                </div>
              ) : null}
            </MotionDiv>
          </div>

          {/* Mobile dropdown */}
          {!isDesktop ? (
            <AnimatePresence initial={false}>
              {menuOpen ? (
                <motion.div
                  key="mobile-menu"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
                  className="md:hidden overflow-hidden"
                >
                  <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 pb-5">
                    <div className="mx-auto w-full max-w-[420px]">
                      <div
                        className="rounded-[28px] border border-slate-200 bg-white/92 backdrop-blur p-4 shadow-sm"
                        style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                      >
                        <div className="grid gap-2">
                          {navLinks.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                "w-full",
                                btnBase,
                                "px-5 py-3",
                                l.variant === "primary" ? btnPrimary : btnGhost
                              )}
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 text-center text-xs font-semibold text-slate-500">
                          Taste. Tap. Order.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}
        </div>
      </div>

      {/* spacer */}
      <div className="h-[84px]" />

      <PageShell
        kicker="Mission"
        title="Why we started"
        highlight="PeerPlates."
        body="University life moves fast — and cooking proper meals consistently just wasn’t realistic. Takeaways were expensive, meal-prep often felt like poor value… and not the kind of food we actually craved."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* ✅ Card 1 — styled like Vision card (orange glow blob) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/75 backdrop-blur p-7 shadow-sm"
          >
            <div
              className="absolute -top-14 -right-14 h-56 w-56 rounded-full blur-3xl opacity-25"
              style={{ background: BRAND_ORANGE }}
            />
            <div className="relative">
              <div className="text-sm font-extrabold text-slate-500">The moment it clicked</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">
                The solution already existed — it just wasn’t easy to access.
              </div>
              <div className="mt-3 text-slate-600 font-semibold leading-relaxed">
                We ordered a big bowl of jollof rice from a local home cook — and realised: authentic, great-value food
                is nearby… but discovery + ordering needed to feel effortless.
              </div>
            </div>
          </motion.div>

          {/* ✅ Card 2 — styled like Vision card (brown glow blob) */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/75 backdrop-blur p-7 shadow-sm"
          >
            <div
              className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl opacity-20"
              style={{ background: BRAND_BROWN }}
            />
            <div className="relative">
              <div className="text-sm font-extrabold text-slate-500">What PeerPlates is</div>
              <div className="mt-2 text-lg font-extrabold text-slate-900">
                A community-driven marketplace for home cooks & bakers.
              </div>
              <div className="mt-3 text-slate-600 font-semibold leading-relaxed">
                Independent vendors sell authentic, affordable meals to nearby customers — built for speed, clarity, and
                trust.
              </div>
            </div>
          </motion.div>
        </div>
      </PageShell>

      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 py-10 text-sm text-slate-500">
          © {new Date().getFullYear()} PeerPlates
        </div>
      </div>
    </main>
  );
}
