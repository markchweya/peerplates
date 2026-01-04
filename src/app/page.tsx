// src/app/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import ScrollShowcase from "@/app/ui/ScrollShowcase";
import HeroFade from "@/app/ui/HeroFade";
import { MotionDiv, MotionH1 } from "@/app/ui/motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function useCinematicSection(
  ref: React.RefObject<HTMLElement | null>,
  opts?: {
    enterStart?: number;
    enterEnd?: number;
    exitStart?: number;
    exitEnd?: number;

    yEnter?: number;
    yExit?: number;
    blurEnter?: number;
    blurExit?: number;

    stiffness?: number;
    damping?: number;
    mass?: number;
  }
) {
  const {
    enterStart = 0.96,
    enterEnd = 0.78,
    exitStart = 0.72,
    exitEnd = 0.24,
    yEnter = 16,
    yExit = -22,
    blurEnter = 3,
    blurExit = 8,
    stiffness = 260,
    damping = 30,
    mass = 0.6,
  } = opts || {};

  const oRaw = useMotionValue(1);
  const yRaw = useMotionValue(0);
  const bRaw = useMotionValue(0);

  const o = useSpring(oRaw, { stiffness, damping, mass });
  const y = useSpring(yRaw, { stiffness, damping, mass });
  const b = useSpring(bRaw, { stiffness, damping, mass });

  const filter = useMotionTemplate`blur(${b}px)`;

  useEffect(() => {
    let raf: number | null = null;

    const update = () => {
      raf = null;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = Math.max(1, window.innerHeight);

      const enterDen = Math.max(0.0001, (enterStart - enterEnd) * vh);
      const enterT = clamp01((enterStart * vh - rect.top) / enterDen);

      const exitDen = Math.max(0.0001, (exitStart - exitEnd) * vh);
      const exitT = clamp01((exitStart * vh - rect.bottom) / exitDen);

      const opacity = enterT * (1 - exitT);

      const yVal = (1 - enterT) * yEnter + exitT * yExit;
      const blurVal = (1 - enterT) * blurEnter + exitT * blurExit;

      oRaw.set(opacity);
      yRaw.set(yVal);
      bRaw.set(blurVal);
    };

    const schedule = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(update);
    };

    document.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedule, { passive: true });

    schedule();

    return () => {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      if (raf != null) window.cancelAnimationFrame(raf);
    };
  }, [
    ref,
    enterStart,
    enterEnd,
    exitStart,
    exitEnd,
    yEnter,
    yExit,
    blurEnter,
    blurExit,
    oRaw,
    yRaw,
    bRaw,
  ]);

  return { opacity: o, y, filter };
}

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

function TopGlassCarousel({
  images,
}: {
  images: Array<{ src: string; alt: string }>;
}) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const safeSet = (n: number, nextDir?: 1 | -1) => {
    const len = images.length;
    const v = ((n % len) + len) % len;
    if (typeof nextDir === "number") setDir(nextDir);
    setIdx(v);
  };

  const prev = images[(idx - 1 + images.length) % images.length];
  const cur = images[idx];
  const next = images[(idx + 1) % images.length];

  const arrowBtn =
    "select-none inline-flex items-center justify-center " +
    "h-14 w-14 rounded-full " +
    "border border-white/60 bg-white/28 backdrop-blur-2xl " +
    "shadow-[0_22px_70px_rgba(0,0,0,0.22)] " +
    "transition active:scale-[0.98] hover:bg-white/36";

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let acc = 0;
    let last = 0;

    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX);
      const dy = Math.abs(e.deltaY);
      const horizontalIntent = dx > dy || e.shiftKey;
      if (!horizontalIntent) return;

      const primary = dx > dy ? e.deltaX : e.deltaY;
      if (Math.abs(primary) < 3) return;

      e.preventDefault();

      const now = performance.now();
      if (now - last > 240) acc = 0;
      last = now;

      acc += primary;

      if (acc > 60) {
        acc = 0;
        safeSet(idx + 1, 1);
      } else if (acc < -60) {
        acc = 0;
        safeSet(idx - 1, -1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [idx, images.length]);

  return (
    <motion.div
      ref={rootRef}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") safeSet(idx + 1, 1);
        if (e.key === "ArrowLeft") safeSet(idx - 1, -1);
      }}
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.52, ease: [0.2, 0.9, 0.2, 1] }}
      className="w-full outline-none"
      aria-label="Gallery carousel"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          "rounded-[32px] border border-slate-200/70",
          "bg-white/60 backdrop-blur-xl",
          "shadow-[0_26px_90px_rgba(2,6,23,0.12)]"
        )}
      >
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-25"
          style={{ background: BRAND_ORANGE }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20"
          style={{ background: BRAND_BROWN }}
        />

        <div className="relative h-[360px] sm:h-[460px] md:h-[560px] lg:h-[620px] xl:h-[680px]">
          <button
            type="button"
            onClick={() => safeSet(idx - 1, -1)}
            className="absolute left-4 top-1/2 z-0 hidden md:block h-[88%] w-[34%] -translate-y-1/2 cursor-pointer"
            aria-label="Previous (peek)"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/40 bg-white/10 shadow-[0_18px_60px_rgba(2,6,23,0.18)]">
              <img
                src={prev.src}
                alt={prev.alt}
                className="h-full w-full object-cover opacity-75"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/5 to-transparent" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => safeSet(idx + 1, 1)}
            className="absolute right-4 top-1/2 z-0 hidden md:block h-[88%] w-[34%] -translate-y-1/2 cursor-pointer"
            aria-label="Next (peek)"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/40 bg-white/10 shadow-[0_18px_60px_rgba(2,6,23,0.18)]">
              <img
                src={next.src}
                alt={next.alt}
                className="h-full w-full object-cover opacity-75"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-white/5 to-transparent" />
            </div>
          </button>

          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              const t = info.offset.x;
              const v = info.velocity.x;
              if (t < -110 || v < -900) safeSet(idx + 1, 1);
              else if (t > 110 || v > 900) safeSet(idx - 1, -1);
            }}
            style={{ touchAction: "pan-y" }}
          >
            <div
              className={cn(
                "relative h-[94%] w-[99%]",
                "md:h-[93%] md:w-[90%]",
                "overflow-hidden rounded-[30px]",
                "border border-white/55 bg-white/10 backdrop-blur-2xl",
                "shadow-[0_32px_110px_rgba(2,6,23,0.22)]"
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img
                  key={cur.src}
                  src={cur.src}
                  alt={cur.alt}
                  className="h-full w-full object-cover"
                  draggable={false}
                  initial={{
                    opacity: 0,
                    x: dir === 1 ? 56 : -56,
                    scale: 0.992,
                    filter: "blur(6px)",
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{
                    opacity: 0,
                    x: dir === 1 ? -56 : 56,
                    scale: 0.992,
                    filter: "blur(6px)",
                  }}
                  transition={{ duration: 0.44, ease: [0.2, 0.9, 0.2, 1] }}
                />
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(0,0,0,0.10)_80%,rgba(0,0,0,0.16)_100%)]" />
            </div>
          </motion.div>

          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => safeSet(idx - 1, -1)}
              className={cn(arrowBtn, "absolute left-6 top-1/2 -translate-y-1/2 z-20")}
              style={{
                boxShadow:
                  "0 22px 70px rgba(0,0,0,0.22), 0 0 0 2px rgba(252,176,64,0.26) inset",
              }}
              aria-label="Previous image"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => safeSet(idx + 1, 1)}
              className={cn(arrowBtn, "absolute right-6 top-1/2 -translate-y-1/2 z-20")}
              style={{
                boxShadow:
                  "0 22px 70px rgba(0,0,0,0.22), 0 0 0 2px rgba(252,176,64,0.26) inset",
              }}
              aria-label="Next image"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="flex items-center justify-center gap-2.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => safeSet(i, i > idx ? 1 : -1)}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition",
                  i === idx ? "scale-110" : "opacity-60 hover:opacity-95 hover:scale-105"
                )}
                style={{
                  background: i === idx ? BRAND_ORANGE : "rgba(15,23,42,0.22)",
                  boxShadow: i === idx ? "0 12px 26px rgba(252,176,64,0.35)" : "none",
                }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>

          <div className="mt-2 text-center text-[11px] font-semibold text-slate-500">
            Swipe ↔ • Drag • ← → • Shift + scroll
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const showcaseRef = useRef<HTMLElement | null>(null);

  const galleryWrapRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: galleryP } = useScroll({
    target: galleryWrapRef,
    offset: ["start start", "end start"],
  });

  // gallery fades as overlay becomes the focus
  const galleryOpacity = useTransform(galleryP, [0, 0.25, 0.75, 1], [1, 0.92, 0.68, 0.42]);
  const galleryBlur = useTransform(galleryP, [0, 1], [0, 3]);
  const galleryScale = useTransform(galleryP, [0, 1], [1, 0.985]);
  const galleryFilter = useMotionTemplate`blur(${galleryBlur}px)`;
  const overlayY = useTransform(galleryP, [0, 0.6, 1], [0, -46, -96]);

  const heroFx = useCinematicSection(heroRef, {
    enterStart: 1.02,
    enterEnd: 0.88,
    exitStart: 0.74,
    exitEnd: 0.22,
    yEnter: 10,
    yExit: -24,
    blurEnter: 0,
    blurExit: 7,
    stiffness: 280,
    damping: 32,
    mass: 0.6,
  });

  const showcaseFx = useCinematicSection(showcaseRef, {
    enterStart: 0.98,
    enterEnd: 0.8,
    exitStart: 0.7,
    exitEnd: 0.2,
    yEnter: 14,
    yExit: -18,
    blurEnter: 2,
    blurExit: 6,
    stiffness: 300,
    damping: 34,
    mass: 0.58,
  });

  // Mobile menu (hamburger)
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Desktop dropdown menu
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

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
      { href: "/mission", label: "Mission" },
      { href: "/vision", label: "Vision" },
      { href: "/food-safety", label: "Food safety" },
      { href: "/queue", label: "Check queue" },
      { href: "/faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy" },
    ],
    []
  );

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost =
    "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <HeroFade
        directionDelta={7}
        className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto"
      >
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center min-w-0">
                <span className="min-w-0 max-w-[170px] sm:max-w-none overflow-hidden">
                  <span className="inline-flex shrink-0">
                    <LogoCinematic size={56} wordScale={1} />
                  </span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-3 ml-auto">
                <div className="relative" data-desktop-menu-root>
                  <button
                    type="button"
                    onClick={() => setDesktopMenuOpen((v) => !v)}
                    aria-label={desktopMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={desktopMenuOpen}
                    className={cn(btnBase, btnGhost, "gap-2")}
                  >
                    Menu
                    <ChevronDown open={desktopMenuOpen} />
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
                      "h-10 w-10 shadow-sm transition hover:-translate-y-[1px]",
                      "text-slate-900"
                    )}
                  >
                    <HamburgerIcon open={menuOpen} />
                  </button>
                </div>
              ) : null}
            </div>
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
      </HeroFade>

      <div className="h-[92px] sm:h-[96px]" />

      {/* HERO */}
      <motion.section
        ref={heroRef}
        style={{
          opacity: heroFx.opacity,
          y: heroFx.y,
          filter: heroFx.filter,
          willChange: "transform, opacity, filter",
        }}
      >
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="mt-6 sm:mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="pt-2">
              <div ref={galleryWrapRef} className="relative">
                {/* gallery (fades/blur as you scroll) */}
                <motion.div style={{ opacity: galleryOpacity, filter: galleryFilter, scale: galleryScale }}>
                  <div className="-mx-2 sm:mx-0">
                    <TopGlassCarousel
                      images={[
                        { src: "/images/gallery/gallery11.png", alt: "Gallery 11" },
                        { src: "/images/gallery/gallery12.png", alt: "Gallery 12" },
                        { src: "/images/gallery/gallery13.png", alt: "Gallery 13" },
                        { src: "/images/gallery/gallery14.png", alt: "Gallery 14" },
                        { src: "/images/gallery/gallery15.png", alt: "Gallery 15" },
                      ]}
                    />
                  </div>
                </motion.div>

                {/* overlay text + normal buttons (come over gallery) */}
                <motion.div
                  style={{ y: overlayY }}
                  initial={{ opacity: 0, y: 16, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1], delay: 0.05 }}
                  className={cn("relative z-30", "-mt-24 sm:-mt-28 md:-mt-32")}
                >
                  <div className="sticky top-[112px]">
                    <div
                      className={cn(
                        "relative overflow-hidden",
                        "rounded-[38px] border border-slate-200/70",
                        "bg-white/92 backdrop-blur-xl",
                        "shadow-[0_30px_110px_rgba(2,6,23,0.16)]",
                        "p-7 sm:p-8"
                      )}
                    >
                      {/* subtle warm back glow */}
                      <div className="pointer-events-none absolute inset-0">
                        <div
                          className="absolute -top-28 -left-28 h-80 w-80 rounded-full blur-3xl opacity-25"
                          style={{ background: "rgba(252,176,64,0.55)" }}
                        />
                        <div
                          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-18"
                          style={{ background: "rgba(138,107,67,0.42)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/65 via-white/88 to-white" />
                      </div>

                      <MotionH1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={cn(
                          "relative font-extrabold tracking-tight leading-[0.96]",
                          "text-slate-900",
                          "text-[clamp(2.3rem,4.3vw,3.6rem)]"
                        )}
                      >
                        Eat better and back local:
                        <br />
                        authentic home-cooked meals
                        <br />
                        from trusted cooks and bakers.
                      </MotionH1>

                      {/* ✅ NORMAL BUTTONS (your original simple ones) */}
                      <MotionDiv
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.18 }}
                        className="relative mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
                      >
                        <Link
                          href="/join"
                          className="rounded-2xl bg-[#fcb040] px-7 py-3 text-center font-extrabold text-slate-900 shadow-sm transition hover:opacity-95 hover:-translate-y-[1px]"
                        >
                          Join waitlist
                        </Link>

                        <Link
                          href="/queue"
                          className="rounded-2xl border border-slate-200 px-7 py-3 text-center font-extrabold transition hover:bg-slate-50 hover:-translate-y-[1px]"
                        >
                          Check queue
                        </Link>
                      </MotionDiv>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right card */}
            <MotionDiv
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.18 }}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm"
            >
              <div>
                <div className="text-xl font-extrabold">How it works</div>
                <div className="mt-2 text-slate-600 font-semibold">
                  Join in minutes. Get a code. Share. Move up the waitlist.
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {[
                  { n: "1", t: "Pick your role", d: "Consumer or vendor." },
                  { n: "2", t: "Answer a few questions", d: "Only complete entries count." },
                  { n: "3", t: "Get your link", d: "Share it to move up the waitlist." },
                  { n: "4", t: "Safety first", d: "Vendors follow UK hygiene rules." },
                ].map((s, i) => (
                  <MotionDiv
                    key={s.n}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.22 + i * 0.06 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fcb040] text-slate-900 font-extrabold">
                        {s.n}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-lg">{s.t}</div>
                        <div className="mt-1 text-slate-600 font-semibold">{s.d}</div>
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </MotionDiv>
          </div>
        </div>
      </motion.section>

      {/* SHOWCASE */}
      <motion.section
        ref={showcaseRef}
        style={{
          opacity: showcaseFx.opacity,
          y: showcaseFx.y,
          filter: showcaseFx.filter,
          willChange: "transform, opacity, filter",
        }}
      >
        <ScrollShowcase
          heading="App Previews"
          subheading="See how PeerPlates makes ordering and managing home-cooked food effortless."
          direction="ltr"
          snap={true}
          tilt={false}
          nav={[
            { label: "Ordering", index: 0 },
            { label: "Storefront", index: 2 },
            { label: "Vendor", index: 3 },
            { label: "Analytics", index: 4 },
            { label: "Operations", index: 6 },
          ]}
          items={[
            {
              image: "/images/gallery/gallery1.jpeg",
              kicker: "Scroll-first menu",
              title: "TikTok-style scroll experience, built for ordering.",
              subtitle: "Scroll. Crave. Add to cart.",
              desc: 'Discover home-cooked meals in short, shoppable videos — tap “Add to cart” straight from the video.',
            },
            {
              image: "/images/gallery/gallery2.jpeg",
              kicker: "Quick picks",
              title: "Highlights that make choosing effortless.",
              subtitle: "See it. Want it. Order fast.",
              desc: "Short, snackable previews that help you decide in seconds — perfect for busy students.",
            },
            {
              image: "/images/gallery/gallery3.jpeg",
              kicker: "Storefront",
              title: "No back-and-forth. Just orders.",
              subtitle: "Browse. Prices upfront. Checkout in seconds.",
              desc: "A proper storefront for home-cooked meals: browse categories, see prices upfront, and checkout in seconds.",
            },
            {
              image: "/images/gallery/gallery4.jpeg",
              kicker: "Vendor profiles",
              title: "Grow your community.",
              subtitle: "Your profile. Your followers. Your drops.",
              desc: "Build a loyal following with your own vendor profile — customers can follow, view your posts, and stay updated on your collection days and latest drops.",
            },
            {
              image: "/images/gallery/gallery5.jpeg",
              kicker: "Analytics",
              title: "Eliminate the guesswork — PeerPlates tracks it for you.",
              subtitle: "Orders, earnings, and what’s trending.",
              desc: "Orders, revenue, customer activity, peak times — all in one clean dashboard.",
            },
            {
              image: "/images/gallery/gallery6.png",
              kicker: "Insights",
              title: "Make smarter decisions with live performance stats.",
              subtitle: "See your top sellers — fast.",
              desc: "Know what’s working. See what’s moving fastest — and double down on the dishes that drive revenue.",
            },
            {
              image: "/images/gallery/gallery7.jpeg",
              kicker: "Vendor control",
              title: "Set a cutoff. Stay in control.",
              subtitle: "Orders close when you say so.",
              desc: "Choose how far in advance customers must order — so you’ve got time to prep and don’t get overloaded.",
            },
            {
              image: "/images/gallery/gallery9.png",
              kicker: "Your kitchen. Your rules.",
              title: "Set slots. Cap orders. Keep control.",
              subtitle: "You decide when you’re taking orders and when you’re not.",
              desc: "PeerPlates fits around your life — not the other way round.",
            },
            {
              image: "/images/gallery/gallery10.png",
              kicker: "Order management",
              title: "Stay organised. Avoid mix-ups.",
              subtitle: "Filter by pickup date — today, this week, or any day.",
              desc: "Filter orders by pickup date so you can track what’s due today, this week, or a specific day — and make sure each order goes to the right customer.",
            },
          ]}
        />

        <div className="md:hidden h-[28vh]" aria-hidden="true" />
      </motion.section>

      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 sm:mt-12 border-t border-slate-200 pt-6 pb-10 text-sm text-slate-500">
          © {new Date().getFullYear()} PeerPlates
        </div>
      </div>
    </main>
  );
}
