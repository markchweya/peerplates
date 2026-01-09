"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_BROWN = "#8a6b43";
const BRAND_ORANGE = "#fcb040";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
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

/* --- tiny inline icons (no boxes) --- */
function IconTaste() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3v8" />
      <path d="M10 3v8" />
      <path d="M7 7h3" />
      <path d="M10 11c0 5-3 10-3 10" />
      <path d="M14 3c3 0 3 4 0 4v14" />
    </svg>
  );
}
function IconTap() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v10" />
      <path d="M12 13l-2-2a2 2 0 0 0-3 1l1 5a4 4 0 0 0 4 3h3a4 4 0 0 0 4-4v-3a2 2 0 0 0-2-2h-1" />
      <path d="M12 7h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconOrder() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 7h15l-1.5 13h-12L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
      <path d="M10 12h6" />
      <path d="M10 15h6" />
    </svg>
  );
}

function StepItem({
  title,
  subtitle,
  icon,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      className="text-center"
    >
      <div className="mx-auto flex items-center justify-center gap-2">
        <span style={{ color: BRAND_BROWN }}>{icon}</span>
        <span className="text-[12px] sm:text-[13px] font-black uppercase tracking-[0.22em] text-slate-900">
          {title}
        </span>
      </div>
      <div className="mt-1 text-[12px] font-semibold text-slate-600">{subtitle}</div>
    </motion.div>
  );
}

/**
 * ✅ FIX: stays centered while opening
 * - We anchor the clipping container at 50% and translateX(-50%)
 * - Width expands symmetrically (no drifting to the right)
 * - Removed the “right vignette” that was showing as a white block
 *
 * ✅ Also reduces overflow on mobile by capping width and allowing safe inner shift.
 */
function RevealFromBehind({
  size,
  wordScale,
  isMobile,
  tilt,
}: {
  size: number;
  wordScale: number;
  isMobile: boolean;
  tilt: { rx: number; ry: number };
}) {
  const [reveal, setReveal] = useState(false);
  const closeTimer = useRef<number | null>(null);

  // approximate inner geometry of LogoCinematic (from your reference file)
  const gap = 12; // ml-3
  const wordW = 420 * wordScale; // word area width
  const fullW = size + gap + wordW;

  const clearTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // sync with LogoCinematic auto-preview on mount
  useEffect(() => {
    if (prefersReducedMotion()) return;
    setReveal(true);
    clearTimer();
    closeTimer.current = window.setTimeout(() => setReveal(false), 1200);
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnter = () => {
    clearTimer();
    setReveal(true);
  };
  const onLeave = () => {
    clearTimer();
    setReveal(false);
  };
  const onTap = () => {
    const canHover = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? false;
    if (canHover) return;
    clearTimer();
    setReveal(true);
    closeTimer.current = window.setTimeout(() => setReveal(false), 1200);
  };

  // cap reveal width on mobile to stop overflow
  const openWidth = isMobile ? `min(${Math.round(fullW)}px, 92vw)` : `${Math.round(fullW)}px`;
  const closedWidth = `${Math.round(size)}px`;

  // small inner shift to keep the revealed word feeling “behind” the logo
  const revealExtra = Math.max(0, fullW - size);
  const shiftWhenOpen = isMobile
    ? -Math.min(84, Math.round(revealExtra * 0.24))
    : -Math.min(64, Math.round(revealExtra * 0.18));

  return (
    <motion.div
      className="relative mx-auto"
      style={{
        transformStyle: "preserve-3d",
        perspective: "900px",
        rotateX: tilt.rx,
        rotateY: tilt.ry,
      }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
    >
      {/* ✅ centered anchor */}
      <motion.div
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={onTap}
        className="absolute left-1/2 top-0"
        style={{
          transform: "translateX(-50%)",
          overflow: "hidden",
          // no background, no border
          width: reveal ? openWidth : closedWidth,
          willChange: "width",
        }}
        animate={{
          width: reveal ? openWidth : closedWidth,
        }}
        transition={{
          duration: reveal ? 0.7 : 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* inner shift so reveal feels like it’s coming from behind */}
        <motion.div
          initial={false}
          animate={{ x: reveal ? shiftWhenOpen : 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform" }}
        >
          <LogoCinematic size={size} wordScale={wordScale} />
        </motion.div>
      </motion.div>

      {/* spacer so absolute element doesn't collapse layout */}
      <div style={{ width: Math.max(size, 1), height: size }} />
    </motion.div>
  );
}

export default function LogoFullScreen({
  size = 110,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* Header state */
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Header show/hide
  const [headerHidden, setHeaderHidden] = useState(false);
  const downAccumRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);

  // Touch tracking (X + Y)
  const touchXRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  // Center tilt
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (menuOpen || desktopMenuOpen) setHeaderHidden(false);
  }, [menuOpen, desktopMenuOpen]);

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

      const dx = e.deltaX || 0;
      const dy = e.deltaY || 0;
      if (Math.abs(dx) > Math.abs(dy) * 1.15) return;
      if (Math.abs(dy) < 4) return;

      if (dy < 0) show();
      else hideAfterThreshold(dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches?.[0];
      if (!t) return;
      touchXRef.current = t.clientX;
      touchYRef.current = t.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (menuOpen || desktopMenuOpen) return;
      const t = e.touches?.[0];
      if (!t) return;

      const prevX = touchXRef.current;
      const prevY = touchYRef.current;

      touchXRef.current = t.clientX;
      touchYRef.current = t.clientY;

      if (prevX == null || prevY == null) return;

      const dx = prevX - t.clientX;
      const dy = prevY - t.clientY;

      if (Math.abs(dx) > Math.abs(dy) * 1.15) return;
      if (Math.abs(dy) < 4) return;

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

  // Mobile (<=640)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } else {
      // @ts-ignore
      mq.addListener(update);
      // @ts-ignore
      return () => mq.removeListener(update);
    }
  }, []);

  // Desktop (>=768)
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

  // Pointer tilt (desktop only)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      if (isMobile) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);

      const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
      const ndx = clamp(dx, -1, 1);
      const ndy = clamp(dy, -1, 1);

      setTilt({ rx: -ndy * 5.2, ry: ndx * 6.8 });
    };

    const onLeave = () => setTilt({ rx: 0, ry: 0 });

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [isMobile]);

  const navLinks = useMemo(
    () => [
      { href: "/mission", label: "Mission" },
      { href: "/food-safety", label: "Food safety" },
      { href: "/faq", label: "FAQ" },
      { href: "/queue", label: "Check queue" },
      { href: "/join", label: "Join waitlist" },
    ],
    []
  );

  const steps = useMemo(
    () => [
      { title: "Taste", subtitle: "Discover peer-loved dishes.", icon: <IconTaste /> },
      { title: "Tap", subtitle: "Pick fast, no long forms.", icon: <IconTap /> },
      { title: "Order", subtitle: "Pickup or delivery — done.", icon: <IconOrder /> },
    ],
    []
  );

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost =
    "border border-slate-200/70 bg-white/60 backdrop-blur text-slate-900 hover:bg-white/75";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  // reduce logo size on-screen only
  const HERO_LOGO_SIZE = isMobile ? Math.round(size * 0.74) : Math.round(size * 0.92);
  const HERO_WORD_SCALE = isMobile ? 0.92 : 1.02;

  return (
    <section className="relative isolate h-screen w-screen overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(1100px 620px at 52% 44%,
                rgba(252,176,64,0.18) 0%,
                rgba(252,176,64,0.08) 42%,
                rgba(255,255,255,0.00) 72%),

              radial-gradient(820px 520px at 20% 26%,
                rgba(252,176,64,0.13) 0%,
                rgba(252,176,64,0.05) 52%,
                rgba(255,255,255,0.00) 78%),

              radial-gradient(900px 640px at 84% 72%,
                rgba(138,107,67,0.11) 0%,
                rgba(138,107,67,0.05) 52%,
                rgba(255,255,255,0.00) 78%),

              linear-gradient(180deg,
                rgba(255,255,255,1) 0%,
                rgba(251,248,242,1) 52%,
                rgba(255,255,255,1) 100%)
            `,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* header */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[100]"
        initial={false}
        animate={{ opacity: headerHidden ? 0 : 1, y: headerHidden ? -10 : 0 }}
        transition={{ duration: 0.22, ease: easeOut }}
        style={{
          willChange: "opacity, transform",
          pointerEvents: headerHidden ? "none" : "auto",
        }}
      >
        <div className="pointer-events-auto">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 pt-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <Link href="/" className="flex items-center">
                <LogoCinematic size={60} wordScale={1} />
              </Link>

              {/* Desktop */}
              <div className="hidden md:flex items-center gap-3 ml-auto">
                <div className="relative" data-desktop-menu-root>
                  <button
                    type="button"
                    onClick={() => setDesktopMenuOpen((v) => !v)}
                    aria-label={desktopMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={desktopMenuOpen}
                    className={cn(btnBase, btnGhost, "gap-2")}
                    style={{ borderColor: "rgba(252,176,64,0.30)" }}
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
                        initial={{ opacity: 0, y: 10, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.985 }}
                        transition={{ duration: 0.16, ease: easeOut }}
                        className="absolute right-0 mt-3 w-[320px] origin-top-right"
                      >
                        <div
                          className="rounded-[26px] border border-slate-200 bg-white/92 backdrop-blur p-3 shadow-sm"
                          style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                        >
                          <div className="grid gap-2">
                            {navLinks.map((l) => (
                              <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setDesktopMenuOpen(false)}
                                className={cn(
                                  "w-full",
                                  "rounded-2xl px-5 py-3 font-extrabold",
                                  "border border-slate-200 bg-white/80 hover:bg-white",
                                  "transition"
                                )}
                              >
                                {l.label}
                              </Link>
                            ))}
                            <Link
                              href="/join"
                              onClick={() => setDesktopMenuOpen(false)}
                              className={cn(
                                "w-full",
                                "rounded-2xl px-5 py-3 font-extrabold",
                                btnPrimary
                              )}
                            >
                              Join waitlist
                            </Link>
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

              {/* Mobile */}
              {!isDesktop ? (
                <div className="ml-auto shrink-0 relative md:hidden">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    className={cn(
                      "inline-flex items-center justify-center",
                      "rounded-full border border-slate-200/70 bg-white/60 backdrop-blur",
                      "h-10 w-10 transition hover:-translate-y-[1px]"
                    )}
                    style={{
                      color: BRAND_ORANGE,
                      borderColor: "rgba(252,176,64,0.30)",
                    }}
                  >
                    <HamburgerIcon open={menuOpen} />
                  </button>
                </div>
              ) : null}
            </MotionDiv>

            {/* Mobile dropdown */}
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
                    <div className="pt-3">
                      <div
                        className="rounded-[26px] border border-slate-200 bg-white/92 backdrop-blur p-4 shadow-sm"
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
                                "rounded-2xl px-5 py-3 font-extrabold",
                                "border border-slate-200 bg-white/80 hover:bg-white",
                                "transition"
                              )}
                            >
                              {l.label}
                            </Link>
                          ))}
                          <Link
                            href="/join"
                            onClick={() => setMenuOpen(false)}
                            className={cn(
                              "w-full",
                              "rounded-2xl px-5 py-3 font-extrabold",
                              btnPrimary
                            )}
                          >
                            Join waitlist
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* hero */}
      <div className="relative z-10 h-full w-full flex items-center justify-center">
        <motion.div
          className={cn("w-full px-6", className)}
          initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(12px)" }}
          animate={mounted ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } : undefined}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto w-full max-w-3xl text-center">
            <div
              ref={wrapRef}
              className="relative mx-auto grid place-items-center"
              style={{
                width: isMobile ? size * 2.0 : size * 2.45,
                height: isMobile ? size * 2.0 : size * 2.45,
              }}
            >
              {/* rings */}
              <motion.div
                className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: size * 1.95,
                  height: size * 1.95,
                  border: "1px solid rgba(252,176,64,0.14)",
                  opacity: 0.9,
                }}
                animate={{ scale: [1, 1.02, 1], opacity: [0.65, 0.92, 0.65] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* ✅ centered opening */}
              <RevealFromBehind
                size={isMobile ? Math.round(size * 0.74) : Math.round(size * 0.92)}
                wordScale={isMobile ? 0.92 : 1.02}
                isMobile={isMobile}
                tilt={tilt}
              />
            </div>

            {/* Taste • Tap • Order */}
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={mounted ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.22, ease: easeOut }}
            >
              <div className="flex items-center justify-center gap-3">
                {(["Taste", "Tap", "Order"] as const).map((t, i) => (
                  <React.Fragment key={t}>
                    <span className="text-[12px] sm:text-[13px] font-black uppercase tracking-[0.28em] text-slate-900">
                      {t}
                    </span>
                    {i < 2 ? (
                      <span
                        className="inline-block h-[6px] w-[6px] rounded-full"
                        style={{ background: "rgba(252,176,64,0.95)" }}
                      />
                    ) : null}
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-3 flex justify-center">
                <motion.div
                  className="h-[2px] w-48 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(252,176,64,0.00), rgba(252,176,64,0.88), rgba(138,107,67,0.00))",
                    opacity: 0.85,
                  }}
                  animate={{ scaleX: [0.86, 1, 0.86] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              <div className="mt-3 text-[12px] font-semibold text-slate-600">
                Peer-picked food. Zero fuss.
              </div>
            </motion.div>

            {/* Steps */}
            <div className={cn("mt-8", isMobile ? "grid gap-5" : "grid grid-cols-3 gap-8")}>
              {steps.map((s, idx) => (
                <StepItem
                  key={s.title}
                  title={s.title}
                  subtitle={s.subtitle}
                  icon={s.icon}
                  delay={0.32 + idx * 0.08}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
