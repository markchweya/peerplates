// src/app/ui/LogoFullScreen.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Lobster } from "next/font/google";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_BROWN = "#8a6b43";
const BRAND_ORANGE = "#fcb040";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

const logoWordmarkFont = Lobster({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
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

/* --- tiny inline icons --- */
function IconTaste() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
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
      className="h-4 w-4"
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
      className="h-4 w-4"
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

/* ------------ reveal wrapper (scroll-driven open/close) ------------ */
function RevealFromBehind({
  size,
  wordScale,
  isMobile,
  tilt,
  open,
}: {
  size: number;
  wordScale: number;
  isMobile: boolean;
  tilt: { rx: number; ry: number };
  open: boolean;
}) {
  const [cycleKey, setCycleKey] = useState(0);
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // ⚠️ LogoCinematic particles fly to the right; on mobile we shift left when open.
  const OPEN_SHIFT = isMobile ? -120 : -70;

  // match LogoCinematic layout proportions
  // ✅ FIX: give the circles/mark more breathing room away from "PeerPlates"
  const gap = isMobile ? 24 : 36; // was 12
  const wordW = 420 * wordScale;
  const fullW = size + gap + wordW;

  const openWidth = isMobile ? `min(${Math.round(fullW)}px, 92vw)` : `${Math.round(fullW)}px`;
  const closedWidth = `${Math.round(size)}px`;

  // when we open, restart particles once (so it feels intentional)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (open) setCycleKey((k) => k + 1);
  }, [open]);

  // Desktop hover can temporarily open, but scroll state remains source of truth
  const onEnter = () => {
    if (!canHover) return;
  };
  const onLeave = () => {
    if (!canHover) return;
  };

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
      {/* Center anchor; expansion stays centered */}
      <motion.div
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="absolute left-1/2 top-0"
        style={{
          transform: "translateX(-50%)",
          overflow: "hidden",
          width: open ? openWidth : closedWidth,
          willChange: "width",
        }}
        animate={{ width: open ? openWidth : closedWidth }}
        transition={{ duration: open ? 0.85 : 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* shift left when open so dots stay inside phone viewport */}
        <motion.div
          initial={false}
          animate={{ x: open ? OPEN_SHIFT : 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: "transform" }}
        >
          <div className="relative">
            {/* ✅ Only show the blob mark; suppress LogoCinematic's built-in word */}
            <LogoCinematic key={cycleKey} size={size} wordScale={0.001} />
          </div>
        </motion.div>

        {/* Word overlay (single wordmark) */}
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="behind-word"
              className="pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2"
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.985,
                filter: "blur(10px)",
                clipPath: "inset(0 50% 0 50% round 22px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                clipPath: "inset(0 0% 0 0% round 22px)",
              }}
              exit={{
                opacity: 0,
                y: 6,
                scale: 0.99,
                filter: "blur(10px)",
                clipPath: "inset(0 50% 0 50% round 22px)",
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: isMobile ? 0.1 : 0.08,
              }}
              style={{
                width: isMobile ? "92vw" : "720px",
                maxWidth: "92vw",
              }}
            >
              <div className="text-center">
                <div
                  className={cn(logoWordmarkFont.className, "leading-none")}
                  style={{
                    fontSize: isMobile ? 28 : 34,
                    letterSpacing: "-0.02em",
                  }}
                >
                  <span style={{ color: "#0f172a" }}>Peer</span>
                  <span style={{ color: BRAND_ORANGE }}>Plates</span>
                </div>

             <div
  className="mt-1 font-semibold"
  style={{
    color: "rgba(15,23,42,0.70)",
    fontSize: isMobile ? 13 : 14,
  }}
>
  authentic{" "}
  <span
    style={{
      display: "inline-block",
      width: 5,
      height: 5,
      borderRadius: "50%",
      backgroundColor: "#fcb040",
      verticalAlign: "middle",
      margin: "0 6px",
    }}
  />
  affordable{" "}
  <span
    style={{
      display: "inline-block",
      width: 5,
      height: 5,
      borderRadius: "50%",
      backgroundColor: "#fcb040",
      verticalAlign: "middle",
      margin: "0 6px",
    }}
  />
  local
</div>

              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* spacer */}
      <div style={{ width: Math.max(size, 1), height: size }} />
    </motion.div>
  );
}

export default function LogoFullScreen({
  size = 130,
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

  // Touch tracking (X + Y) so horizontal swipes don't affect header
  const touchXRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  // Center parallax / tilt
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  // ✅ Scroll-driven logo open/close (blob on scroll down, reveal word on scroll up)
  const [logoOpen, setLogoOpen] = useState(true);
  const lastScrollForLogo = useRef<number>(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // ✅ ensure it opens after page settles (reload -> open)
  useEffect(() => {
    const t = window.setTimeout(() => setLogoOpen(true), 180);
    return () => window.clearTimeout(t);
  }, []);

  // keep header visible when any menu is open
  useEffect(() => {
    if (menuOpen || desktopMenuOpen) setHeaderHidden(false);
  }, [menuOpen, desktopMenuOpen]);

  // ✅ Logo open/close based on vertical scroll direction (more sensitive; still ignores hard horizontal)
  useEffect(() => {
    lastScrollForLogo.current = window.scrollY || 0;

    const onScroll = () => {
      if (menuOpen || desktopMenuOpen) return;

      const y = window.scrollY || 0;
      const last = lastScrollForLogo.current;
      const delta = y - last;
      lastScrollForLogo.current = y;

      // more sensitive so “scroll up” reliably triggers
      if (Math.abs(delta) < 1) return;

      if (delta > 0) setLogoOpen(false); // down -> blob only
      else setLogoOpen(true); // up -> reveal word

      if (y <= 6) setLogoOpen(true);
    };

    const onWheel = (e: WheelEvent) => {
      if (menuOpen || desktopMenuOpen) return;

      const dx = e.deltaX || 0;
      const dy = e.deltaY || 0;

      // Still ignore strong horizontal-only gestures, but allow diagonal trackpad scrolls
      if (Math.abs(dx) > Math.abs(dy) * 2.25) return;
      if (Math.abs(dy) < 1) return;

      if (dy > 0) setLogoOpen(false);
      else setLogoOpen(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
    };
  }, [menuOpen, desktopMenuOpen]);

  // ✅ Hide on vertical down intent, show only on vertical up intent.
  // ✅ Ignore horizontal-dominant wheel/touch gestures.
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

      // Ignore horizontal-dominant gestures (trackpad side scroll)
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
      const dy = prevY - t.clientY; // finger up => dy positive => scroll down intent

      // Ignore horizontal-dominant swipes
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

  // Close menus when switching modes
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

  // Pointer tilt for the center logo (desktop only)
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

      const clamp1 = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
      const ndx = clamp1(dx, -1, 1);
      const ndy = clamp1(dy, -1, 1);

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
  
    ],
    []
  );

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost =
    "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  const wordScale = isMobile ? 0.86 : 1;

  // ✅ reduce hero logo size (screen only)
  const heroSize = Math.max(64, Math.round((isMobile ? 0.78 : 0.62) * size));

  const pillWrap: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
  };

  const steps = useMemo(
    () => [
      { title: "Taste", subtitle: "Discover peer-loved dishes.", icon: <IconTaste /> },
      { title: "Tap", subtitle: "Pick fast, no long forms.", icon: <IconTap /> },
      { title: "Order", subtitle: "Pickup or delivery — done.", icon: <IconOrder /> },
    ],
    []
  );

  return (
    <section className="relative isolate h-screen w-screen flex items-center justify-center overflow-hidden">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            // ✅ removed radial gradients (circles); keep only the vertical wash
            background: `
              linear-gradient(180deg,
                rgba(255,255,255,1) 0%,
                rgba(251,248,242,1) 55%,
                rgba(255,255,255,1) 100%)
            `,
          }}
        />

        <div className="absolute inset-0 bg-slate-950/5" />

        {/* hides the “split” into the next white section */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* ================= HEADER ================= */}
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
      <div className="pointer-events-auto bg-transparent">

          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 min-w-0"
            >
              <Link href="/" className="flex items-center min-w-0">
                <span className="min-w-0 max-w-[170px] sm:max-w-none overflow-visible">
                  <span className="inline-flex shrink-0 overflow-visible py-1 -my-1">
                    <LogoCinematic size={64} wordScale={1} />
                  </span>
                </span>
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
                      "rounded-full border border-slate-200 bg-white/95 backdrop-blur",
                      "h-10 w-10 shadow-sm transition hover:-translate-y-[1px]"
                    )}
                    style={{
                      color: BRAND_ORANGE,
                      borderColor: "rgba(252,176,64,0.35)",
                    }}
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

      {/* ================= CENTER HERO ================= */}
      <motion.div
        className={cn("relative z-10 select-none w-full", className)}
        initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
        animate={mounted ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div ref={wrapRef} className="relative mx-auto flex flex-col items-center" style={{ maxWidth: "92vw" }}>
          {/* ✅ Scroll-driven open/close */}
          <div className="relative mt-16" style={{ height: heroSize }}>
            <RevealFromBehind size={heroSize} wordScale={wordScale} isMobile={isMobile} tilt={tilt} open={logoOpen} />
          </div>

          {/* 3 steps (no boxes) */}
          <motion.div className="mt-10 w-full" variants={pillWrap} initial="hidden" animate={mounted ? "show" : "hidden"}>
            <div className={cn("mx-auto w-full", isMobile ? "max-w-[420px]" : "max-w-[980px]")}>
              <div className={cn("grid items-start gap-10", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                {steps.map((s, i) => (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: easeOut }}
                    className="text-center"
                  >
                    <div
                      className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-2xl border border-slate-200/70 bg-white/65 backdrop-blur"
                      style={{
                        color: BRAND_BROWN,
                        boxShadow: "0 14px 40px rgba(2,6,23,0.06)",
                      }}
                    >
                      {s.icon}
                    </div>
                    <div className="text-[12px] font-black uppercase tracking-[0.22em] text-slate-900">{s.title}</div>
                    <div className="mt-2 text-[12px] font-semibold text-slate-600">{s.subtitle}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
