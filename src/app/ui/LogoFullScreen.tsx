"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_BROWN = "#8a6b43";
const BRAND_ORANGE = "#fcb040";

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

function IconTaste() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v10" />
      <path d="M12 13l-2-2a2 2 0 0 0-3 1l1 5a4 4 0 0 0 4 3h3a4 4 0 0 0 4-4v-3a2 2 0 0 0-2-2h-1" />
      <path d="M12 7h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconOrder() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 7h15l-1.5 13h-12L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
      <path d="M10 12h6" />
      <path d="M10 15h6" />
    </svg>
  );
}

function StepChip({
  label,
  icon,
  index,
}: {
  label: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      className={cn(
        "relative group",
        "rounded-2xl border border-slate-200/70",
        "bg-white/70 backdrop-blur",
        "px-4 py-2.5",
        "shadow-sm"
      )}
      style={{
        boxShadow: "0 18px 70px rgba(2,6,23,0.08)",
      }}
      variants={{
        hidden: { opacity: 0, y: 10, scale: 0.96 },
        show: { opacity: 1, y: 0, scale: 1 },
      }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* gradient border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow: "0 0 0 1px rgba(252,176,64,0.14) inset",
          opacity: 1,
        }}
      />
      {/* little step dot */}
      <div
        className="absolute -top-2 left-3 h-5 w-5 rounded-full border border-white/70 bg-white/85 backdrop-blur grid place-items-center shadow-sm"
        style={{ boxShadow: "0 12px 35px rgba(2,6,23,0.10)" }}
      >
        <span className="text-[11px] font-black text-slate-800">{index + 1}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className="grid place-items-center h-8 w-8 rounded-xl border border-slate-200/70 bg-white/70"
          style={{ color: BRAND_BROWN, boxShadow: "0 10px 30px rgba(2,6,23,0.06)" }}
        >
          {icon}
        </span>

        <div className="leading-tight">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-900">
            {label}
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            {label === "Taste" ? "Browse peer-loved food" : label === "Tap" ? "One-tap selection" : "Pickup or delivery"}
          </div>
        </div>
      </div>
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

  // Center logo parallax / tilt
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // keep header visible when any menu is open
  useEffect(() => {
    if (menuOpen || desktopMenuOpen) setHeaderHidden(false);
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
      if (isMobile) return; // keep mobile stable
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);

      const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
      const ndx = clamp(dx, -1, 1);
      const ndy = clamp(dy, -1, 1);

      setTilt({ rx: -ndy * 5.5, ry: ndx * 7 });
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

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost =
    "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  const steps = useMemo(
    () => [
      { label: "Taste", icon: <IconTaste /> },
      { label: "Tap", icon: <IconTap /> },
      { label: "Order", icon: <IconOrder /> },
    ],
    []
  );

  const stepsWrapVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
  };

  return (
    <section className="relative isolate h-screen w-screen flex items-center justify-center overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(900px 520px at 50% 45%,
                rgba(252,176,64,0.22) 0%,
                rgba(252,176,64,0.10) 42%,
                rgba(255,255,255,0.00) 72%),

              radial-gradient(720px 420px at 18% 28%,
                rgba(252,176,64,0.16) 0%,
                rgba(252,176,64,0.06) 48%,
                rgba(255,255,255,0.00) 78%),

              radial-gradient(760px 520px at 82% 72%,
                rgba(138,107,67,0.12) 0%,
                rgba(138,107,67,0.05) 52%,
                rgba(255,255,255,0.00) 78%),

              linear-gradient(180deg,
                rgba(255,255,255,1) 0%,
                rgba(251,248,242,1) 55%,
                rgba(255,255,255,1) 100%)
            `,
          }}
        />
        <div className="absolute inset-0 bg-slate-950/5" />

        {/* glow drift */}
        <motion.div
          className="absolute -left-44 top-10 h-[520px] w-[520px] rounded-full blur-3xl opacity-18"
          style={{ background: "rgba(252,176,64,0.40)" }}
          animate={{ x: [0, 60, 0], y: [0, 22, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-52 bottom-[-140px] h-[560px] w-[560px] rounded-full blur-3xl opacity-12"
          style={{ background: "rgba(138,107,67,0.26)" }}
          animate={{ x: [0, -64, 0], y: [0, -24, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* blend into next section */}
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
        <div className="pointer-events-auto border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
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
                                className={cn(
                                  "w-full",
                                  btnBase,
                                  "px-5 py-3",
                                  btnGhost,
                                  "justify-start"
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
                                btnBase,
                                "px-5 py-3",
                                btnPrimary,
                                "justify-start"
                              )}
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

      {/* ================= CENTER HERO (MORE CREATIVE) ================= */}
      <motion.div
        className={cn("relative z-10 select-none", className)}
        initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
        animate={mounted ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          ref={wrapRef}
          className="relative grid place-items-center"
          style={{ width: size * 2.35, height: size * 2.35 }}
        >
          {/* soft spotlight + subtle “stage” */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background: `
                radial-gradient(closest-side at 50% 38%, rgba(252,176,64,0.22), rgba(255,255,255,0) 70%),
                radial-gradient(closest-side at 50% 72%, rgba(2,6,23,0.10), rgba(255,255,255,0) 62%)
              `,
            }}
          />

          {/* “breathing” ring (super subtle) */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: size * 1.62,
              height: size * 1.62,
              border: "1px solid rgba(252,176,64,0.18)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.55) inset",
              opacity: 0.9,
            }}
            animate={{ scale: [1, 1.02, 1], opacity: [0.78, 0.92, 0.78] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* logo + tilt */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={mounted ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: "preserve-3d", perspective: "900px" }}
          >
            {/* base shadow */}
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2"
              style={{
                top: `calc(50% + ${Math.round(size * 0.58)}px)`,
                width: `${Math.round(size * 1.14)}px`,
                height: `${Math.round(size * 0.32)}px`,
                background:
                  "radial-gradient(closest-side, rgba(2,6,23,0.20), rgba(2,6,23,0))",
                filter: "blur(10px)",
                opacity: 0.5,
              }}
            />

            <motion.div
              className="relative"
              style={{
                rotateX: tilt.rx,
                rotateY: tilt.ry,
                borderRadius: 0,
                boxShadow:
                  "0 26px 90px rgba(2,6,23,0.14), 0 0 0 1px rgba(252,176,64,0.10)",
                willChange: "transform",
              }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
            >
              <Image
                src="/images/brand/logo.png"
                alt="PeerPlates logo"
                width={size}
                height={size}
                priority
                className="block"
              />

              {/* angled highlight */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.00) 10%, rgba(255,255,255,0.28) 42%, rgba(255,255,255,0.00) 70%)",
                  mixBlendMode: "soft-light",
                  opacity: 0.55,
                }}
              />
            </motion.div>
          </motion.div>

          {/* New creative “3-step” story rail (no big pill, no peer picks) */}
          <motion.div
            className="mt-7 w-full"
            variants={stepsWrapVariants}
            initial="hidden"
            animate={mounted ? "show" : "hidden"}
          >
            <div className="mx-auto w-full max-w-[520px]">
              {/* top tiny label */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  show: { opacity: 1, y: 0 },
                }}
                className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.26em] text-slate-700"
              >
                How it works
              </motion.div>

              {/* rail background */}
              <div
                className={cn(
                  "relative rounded-[28px] border border-slate-200/70",
                  "bg-white/55 backdrop-blur",
                  "px-4 py-4",
                  "shadow-sm"
                )}
                style={{
                  boxShadow: "0 18px 70px rgba(2,6,23,0.08)",
                }}
              >
                {/* faint orange sweep */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[28px]"
                  style={{
                    background:
                      "radial-gradient(closest-side at 35% 20%, rgba(252,176,64,0.16), rgba(255,255,255,0) 70%)",
                    opacity: 0.9,
                  }}
                />

                {/* connector line */}
                <div
                  className="pointer-events-none absolute left-7 right-7 top-[28px] h-[2px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(252,176,64,0.00), rgba(252,176,64,0.55), rgba(252,176,64,0.00))",
                    opacity: 0.65,
                  }}
                />

                <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                  {steps.map((s, i) => (
                    <StepChip key={s.label} label={s.label} icon={s.icon} index={i} />
                  ))}
                </div>

                {/* tiny subline (optional vibe) */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="mt-4 text-center text-xs font-semibold text-slate-600"
                >
                  Taste what&apos;s trending. Tap fast. Order confidently.
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
