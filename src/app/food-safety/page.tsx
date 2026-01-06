"use client";

import Link from "next/link";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
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

function ChevronDown({ open }: { open: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
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
      {/* ✅ match Vision shading order */}
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

export default function FoodSafetyPage() {
  // ✅ EXACT same header behavior as Vision
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
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
    if (!isDesktop) setDesktopMenuOpen(false);
  }, [isDesktop]);

  // Mobile menu: lock scroll + esc
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

  // Desktop dropdown: esc + outside click
  useEffect(() => {
    if (!desktopMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDesktopMenuOpen(false);
    };

    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-desktop-menu-root]")) return;
      setDesktopMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [desktopMenuOpen]);

  const navLinks = useMemo(
   () => [
      { href: "/", label: "Home", variant: "ghost" as const },
      { href: "/mission", label: "Mission", variant: "ghost" as const },
      { href: "/vision", label: "Vision", variant: "ghost" as const },
      {href: "/faq", label: "FAQ", variant: "ghost" as const },
      { href: "/queue", label: "Check queue", variant: "ghost" as const },
      { href: "/privacy", label: "Privacy", variant: "ghost" as const },
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
      {/* Header (EXACT Vision) */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto">
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 min-w-0"
            >
             <Link href="/" className="flex items-center min-w-0">
  <span className="relative inline-flex items-center overflow-visible">
    <LogoCinematic size={64} wordScale={1} />
  </span>
</Link>


              {/* Desktop: dropdown + primary button */}
              <div className="hidden md:flex items-center gap-3 ml-auto">
                <div className="relative" data-desktop-menu-root>
                  <button
                    type="button"
                    onClick={() => setDesktopMenuOpen((v) => !v)}
                    aria-label={desktopMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={desktopMenuOpen}
                    className={cn(btnBase, btnGhost, "gap-2")}
                    style={{ borderColor: "rgba(252,176,64,0.35)" }}
                  >
                    <span style={{ color: BRAND_BROWN }}>Menu</span>
                    <span style={{ color: BRAND_ORANGE }}>
                      <ChevronDown open={desktopMenuOpen} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {desktopMenuOpen ? (
                      <motion.div
                        key="desktop-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: [0.2, 0.9, 0.2, 1] }}
                        className="absolute right-0 mt-3 w-[320px] origin-top-right"
                      >
                        <div
                          className="rounded-[28px] border border-slate-200 bg-white/92 backdrop-blur p-3 shadow-sm"
                          style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                        >
                          <div className="grid gap-2">
                            {navLinks.map((l) => (
                              <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setDesktopMenuOpen(false)}
                                className={cn("w-full", btnBase, "px-5 py-3", btnGhost, "justify-start")}
                              >
                                {l.label}
                              </Link>
                            ))}
                            <Link
                              href="/join"
                              onClick={() => setDesktopMenuOpen(false)}
                              className={cn("w-full", btnBase, "px-5 py-3", btnPrimary, "justify-start")}
                            >
                              Join waitlist
                            </Link>
                          </div>

                          <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <Link href="/join" className={cn(btnBase, btnPrimary)}>
                  Join waitlist
                </Link>
              </div>

              {/* Mobile: hamburger */}
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
                    style={{ color: BRAND_ORANGE, borderColor: "rgba(252,176,64,0.35)" }}
                  >
                    <HamburgerIcon open={menuOpen} />
                  </button>
                </div>
              ) : null}
            </MotionDiv>
          </div>

          {/* Mobile dropdown (EXACT Vision) */}
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
                              className={cn("w-full", btnBase, "px-5 py-3", btnGhost)}
                            >
                              {l.label}
                            </Link>
                          ))}

                          <Link
                            href="/join"
                            onClick={() => setMenuOpen(false)}
                            className={cn("w-full", btnBase, "px-5 py-3", btnPrimary)}
                          >
                            Join waitlist
                          </Link>
                        </div>

                        <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}
        </div>
      </div>

      <div className="h-[84px]" />

      <PageShell
        kicker="Food safety"
        title="Food safety comes"
        highlight="first."
        body="Food safety isn’t optional on PeerPlates — it’s the baseline. Customers can trust every order comes from a vendor who meets clear UK health & safety requirements."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ✅ Vision-style tinted container */}
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

            <div className="text-sm font-extrabold text-slate-500">Before selling on PeerPlates</div>
            <div className="mt-2 text-lg font-extrabold" style={{ color: BRAND_BROWN }}>
              Every vendor must:
            </div>

            <ul className="mt-4 space-y-3 text-slate-600 font-semibold">
              {[
                "Register their food business with their local council",
                "Complete Level 2 Food Hygiene Certification",
                "Have a Food Safety Management System in place (e.g., SFBB / HACCP-style plan)",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: BRAND_ORANGE }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ✅ Vision-style tinted container */}
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

            <div className="text-sm font-extrabold text-slate-500">Ongoing support & standards</div>
            <div className="mt-2 text-lg font-extrabold" style={{ color: BRAND_BROWN }}>
              Standards stay high as vendors scale.
            </div>

            <div className="mt-4 text-slate-600 font-semibold leading-relaxed">
              Our team works closely with vendors as they grow — with priority onboarding, practical guidance, and clear resources on
              best-practice food safety, so quality remains consistent as businesses expand.
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm font-extrabold text-slate-700">
              <span className="h-2 w-2 rounded-full" style={{ background: BRAND_BROWN }} />
              Safety checks built into onboarding
            </div>
          </motion.div>
        </div>
      </PageShell>

      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-200 py-10 text-sm text-slate-500">© {new Date().getFullYear()} PeerPlates</div>
      </div>
    </main>
  );
}
