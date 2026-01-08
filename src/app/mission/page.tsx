"use client";

import Link from "next/link";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

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

/** Vendor icon: chef hat only (NO person) */
function ChefHatIcon(props: React.SVGProps<SVGSVGElement>) {
  const { className = "", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true" {...rest}>
      <path
        d="M7.4 10.4c-1.7 0-3.1-1.3-3.1-2.9 0-1.4 1.1-2.6 2.6-2.8
           .3-1.7 1.9-3.1 4-3.1 1.1 0 2.1.4 2.9 1.1
           .8-.7 1.8-1.1 2.9-1.1 2.1 0 3.7 1.4 4 3.1
           1.5.2 2.6 1.4 2.6 2.8 0 1.6-1.4 2.9-3.1 2.9H7.4Z"
        fill="currentColor"
        opacity="0.98"
      />
      <path
        d="M7.4 10.4h13.2v3.2c0 .7-.5 1.2-1.2 1.2H8.6c-.7 0-1.2-.5-1.2-1.2v-3.2Z"
        fill="currentColor"
        opacity="0.98"
      />
      <path
        d="M10 11.2v2.6M12 11.2v2.6M14 11.2v2.6"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CustomerIcon(props: React.SVGProps<SVGSVGElement>) {
  const { className = "", ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true" {...rest}>
      <path
        d="M12 13.7c-3.2 0-5.8 2.2-5.8 4.9V20h11.6v-1.4c0-2.7-2.6-4.9-5.8-4.9Z"
        fill="currentColor"
        opacity="0.98"
      />
      <path
        d="M12 13.2c2 0 3.6-1.6 3.6-3.5S14 6.2 12 6.2 8.4 7.8 8.4 9.7 10 13.2 12 13.2Z"
        fill="currentColor"
        opacity="0.98"
      />
    </svg>
  );
}

/**
 * ScrollFade wrapper (NO scroll fade effects anymore)
 * Kept only to avoid touching the rest of the page structure.
 */
function ScrollFade({
  children,
  className = "",
  amount = 0.55,
  y = 18,
  blur = 10,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  y?: number;
  blur?: number;
}) {
  void amount;
  void y;
  void blur;
  return <div className={className}>{children}</div>;
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
        <ScrollFade className="mx-auto max-w-4xl">
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
        </ScrollFade>
      </div>
    </section>
  );
}

export default function MissionPage() {
  // ✅ EXACT same header behavior as Vision
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ✅ header fade on scroll down / show on scroll up (also works with wheel/touch intent)
  const [headerHidden, setHeaderHidden] = useState(false);
  const downAccumRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const touchYRef = useRef<number | null>(null);

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

  // keep header visible when any menu is open
  useEffect(() => {
    if (menuOpen || desktopMenuOpen) setHeaderHidden(false);
  }, [menuOpen, desktopMenuOpen]);

  // ✅ hide on down intent, show on up intent
  useEffect(() => {
    lastYRef.current = window.scrollY || 0;

    const show = () => {
      downAccumRef.current = 0;
      setHeaderHidden(false);
    };

    const hideAfterThreshold = (deltaDown: number) => {
      downAccumRef.current += deltaDown;
      if (!headerHidden && downAccumRef.current > 18) setHeaderHidden(true);
    };

    const onScroll = () => {
      if (menuOpen || desktopMenuOpen) return;

      const y = window.scrollY || 0;

      // always show near top
      if (y <= 8) {
        if (headerHidden) show();
        lastYRef.current = y;
        return;
      }

      const last = lastYRef.current;
      const delta = y - last;
      lastYRef.current = y;

      if (Math.abs(delta) < 2) return;

      if (delta < 0) show();
      else hideAfterThreshold(delta);
    };

    const onWheel = (e: WheelEvent) => {
      if (menuOpen || desktopMenuOpen) return;

      const dy = e.deltaY;
      if (Math.abs(dy) < 2) return;

      if (dy < 0) show();
      else hideAfterThreshold(dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches?.[0]) return;
      touchYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (menuOpen || desktopMenuOpen) return;
      const t = e.touches?.[0];
      if (!t) return;

      const prev = touchYRef.current;
      touchYRef.current = t.clientY;

      if (prev == null) return;
      const dy = prev - t.clientY; // finger up => dy positive => down intent
      if (Math.abs(dy) < 2) return;

      if (dy < 0) show();
      else hideAfterThreshold(dy);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [menuOpen, desktopMenuOpen, headerHidden]);

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
      { href: "/food-safety", label: "Food safety", variant: "ghost" as const },
      { href: "/faq", label: "FAQ", variant: "ghost" as const },
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
      {/* Header (EXACT Vision) */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[100]"
        initial={false}
        animate={{ opacity: headerHidden ? 0 : 1 }}
        transition={{ duration: 0.22, ease: easeOut }}
        style={{
          willChange: "opacity",
          pointerEvents: headerHidden ? "none" : "auto",
        }}
      >
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{
                duration: 1.1, // slower, more cinematic
                ease: [0.25, 0.1, 0.25, 1], // gentle ease-in-out
              }}
              className="flex items-center gap-3 min-w-0"
            >
              <Link href="/" className="flex items-center min-w-0">
                {/* ✅ FIX (same as Vision): remove any clipping during fade/slide/glow */}
                <span className="min-w-0 max-w-[170px] sm:max-w-none overflow-visible">
                  {/* give the logo a tiny vertical buffer so filters/glow never get cut */}
                  <span className="inline-flex shrink-0 overflow-visible py-1 -my-1">
                    <LogoCinematic size={64} wordScale={1} />
                  </span>
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
                        transition={{ duration: 0.16, ease: easeOut }}
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

                          <div className="mt-3 text-center text-xs font-semibold text-slate-500">
                            Taste. Tap. Order.
                          </div>
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
                  transition={{ duration: 0.22, ease: easeOut }}
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
      </motion.div>

      {/* spacer */}
      <div className="h-[84px]" />

      {/* ✅ Page-refresh-only fade-in for the main content */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: easeOut }}
      >
        {/* ===================== */}
        {/* Mission */}
        {/* ===================== */}
        <PageShell
          kicker="Mission"
          title="Why we started"
          highlight="PeerPlates."
          body="University life moves fast — and cooking proper meals consistently just wasn’t realistic. Takeaways were expensive, meal-prep often felt like poor value… and not the kind of food we actually craved."
        >
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <ScrollFade>
              <div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/75 backdrop-blur p-7 shadow-sm">
                <div
                  className="absolute -top-14 -right-14 h-56 w-56 rounded-full blur-3xl opacity-25"
                  style={{ background: BRAND_ORANGE }}
                />
                <div className="text-sm font-extrabold text-slate-500">The moment it clicked</div>
                <div className="mt-2 text-lg font-extrabold" style={{ color: BRAND_BROWN }}>
                  The solution already existed — it just wasn’t easy to access.
                </div>
                <div className="mt-3 text-slate-600 font-semibold leading-relaxed">
                  We ordered a big bowl of jollof rice from a local home cook — and realised: authentic, great-value food
                  is nearby… but discovery + ordering needed to feel effortless.
                </div>
              </div>
            </ScrollFade>

            <ScrollFade className="h-full">
              <div className="relative h-full flex flex-col overflow-hidden rounded-[34px] border border-slate-200 bg-white/75 backdrop-blur p-7 shadow-sm">
                <div
                  className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl opacity-20"
                  style={{ background: BRAND_BROWN }}
                />
                <div className="text-sm font-extrabold text-slate-500">What PeerPlates is</div>
                <div className="mt-2 text-lg font-extrabold" style={{ color: BRAND_BROWN }}>
                  A community-driven marketplace for home cooks &amp; bakers.
                </div>
                <div className="mt-3 text-slate-600 font-semibold leading-relaxed">
                  Independent vendors sell authentic, affordable meals to nearby customers — built for speed, clarity,
                  and trust.
                </div>
              </div>
            </ScrollFade>
          </div>
        </PageShell>

        {/* ===================== */}
        {/* Vision (under Mission) */}
        {/* ===================== */}
        <PageShell
          kicker=""
          title="Our mission is"
          highlight="two-sided."
          body="We’re building a platform that works for both sides of the marketplace — vendors and customers — with the same level of care."
        >
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <ScrollFade>
              <div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/75 backdrop-blur p-7 shadow-sm">
                <div
                  className="absolute -top-14 -right-14 h-56 w-56 rounded-full blur-3xl opacity-25"
                  style={{ background: BRAND_ORANGE }}
                />
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white/80 flex items-center justify-center shadow-sm"
                    style={{ boxShadow: "0 16px 40px rgba(252,176,64,0.18)" }}
                  >
                    <ChefHatIcon className="h-7 w-7" style={{ color: BRAND_ORANGE }} />
                  </div>
                  <div className="text-lg font-extrabold" style={{ color: BRAND_BROWN }}>
                    For vendors
                  </div>
                </div>
                <div className="mt-4 text-slate-600 font-semibold leading-relaxed">
                  To empower local food entrepreneurs with the tools, visibility, and support to grow — turning passion
                  into meaningful income.
                </div>
              </div>
            </ScrollFade>

            <ScrollFade>
              <div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/75 backdrop-blur p-7 shadow-sm">
                <div
                  className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl opacity-20"
                  style={{ background: BRAND_BROWN }}
                />
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white/80 flex items-center justify-center shadow-sm"
                    style={{ boxShadow: "0 16px 40px rgba(138,107,67,0.16)" }}
                  >
                    <CustomerIcon className="h-7 w-7" style={{ color: BRAND_BROWN }} />
                  </div>
                  <div className="text-lg font-extrabold" style={{ color: BRAND_BROWN }}>
                    For customers
                  </div>
                </div>
                <div className="mt-4 text-slate-600 font-semibold leading-relaxed">
                  To make it easy to find great-value, home-cooked meals that taste authentic — made with real warmth,
                  not factory production.
                </div>
              </div>
            </ScrollFade>
          </div>
        </PageShell>

        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-t border-slate-200 py-10 text-sm text-slate-500">
            © {new Date().getFullYear()} PeerPlates
          </div>
        </div>
      </motion.div>
    </main>
  );
}
