// src/app/page.tsx
"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

import ScrollShowcase from "@/app/ui/ScrollShowcase";
import HeroFade from "@/app/ui/HeroFade";
import TopGallery from "@/app/ui/TopGallery";
import { MotionDiv, MotionH1 } from "@/app/ui/motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** ✅ Don’t let pull-to-refresh steal taps/clicks on interactive elements */
function isInteractiveTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return Boolean(
    el.closest(
      'a,button,input,textarea,select,option,label,[role="button"],[role="link"],[data-no-pull]'
    )
  );
}

/**
 * Cinematic section fade:
 * - fades IN quickly as section enters
 * - holds while you're "in" the section
 * - fades OUT only when leaving viewport
 */
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

    document.addEventListener("scroll", schedule, { capture: true, passive: true });
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

/** Hamburger icon animates into X */
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

/** ✅ Brand-colored cinematic three-dot loader */
function LoadingDots({ className, dotSize = 5 }: { className?: string; dotSize?: number }) {
  const mixed = `linear-gradient(135deg, ${BRAND_ORANGE} 0%, ${BRAND_BROWN} 100%)`;
  const colors = [{ bg: BRAND_ORANGE }, { bg: mixed }, { bg: BRAND_BROWN }];

  return (
    <span className={cn("inline-flex items-end gap-2", className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            background: colors[i]!.bg,
            boxShadow:
              i === 1
                ? "0 8px 22px rgba(252,176,64,0.22), 0 8px 22px rgba(138,107,67,0.18)"
                : "0 10px 26px rgba(2,6,23,0.10)",
          }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.35, 1, 0.35],
            scale: [0.96, 1.06, 0.96],
          }}
          transition={{
            duration: 0.95,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.16,
          }}
        />
      ))}
    </span>
  );
}

/**
 * INTRO OVERLAY HERO (CINEMATIC)
 */
function PeerPlatesCinematicHero({ headerOffsetPx = 96 }: { headerOffsetPx?: number }) {
  const reduce = useReducedMotion();

  const shimmerX = useMotionValue(-40);
  const s2 = useTransform(shimmerX, (v) => Math.min(110, v + 18));
  const s3 = useTransform(shimmerX, (v) => Math.min(120, v + 38));

  const shimmer = useMotionTemplate`linear-gradient(90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0) ${shimmerX}%,
    rgba(255,255,255,0.95) ${s2}%,
    rgba(255,255,255,0) ${s3}%,
    rgba(255,255,255,0) 100%
  )`;

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const tick = () => {
      const v = shimmerX.get();
      shimmerX.set(v >= 140 ? -40 : v + 1.3);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduce, shimmerX]);

  return (
    <section
      className="relative overflow-hidden bg-white"
      style={{
        height: `calc(100svh - ${headerOffsetPx}px)`,
        minHeight: 620,
      }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 h-[140vmin] w-[140vmin] rounded-full blur-3xl opacity-[0.11]"
          style={{
            background: `radial-gradient(circle at 48% 46%, ${BRAND_ORANGE}, transparent 62%)`,
          }}
        />
        <div
          className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 h-[160vmin] w-[160vmin] rounded-full blur-3xl opacity-[0.08]"
          style={{
            background: `radial-gradient(circle at 54% 56%, ${BRAND_BROWN}, transparent 64%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_55%,rgba(2,6,23,0.06)_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2"
          initial={reduce ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.2, 0.9, 0.2, 1] }}
          style={{ opacity: 0.26 }}
        >
          <motion.svg
            viewBox="0 0 520 520"
            className="block w-[104vmin] max-w-[980px] h-[104vmin] max-h-[980px]"
            animate={reduce ? {} : { rotate: 360 }}
            transition={reduce ? undefined : { duration: 96, ease: "linear", repeat: Infinity }}
          >
            <defs>
              <linearGradient id="pp-ring-cine" x1="80" y1="80" x2="440" y2="440" gradientUnits="userSpaceOnUse">
                <stop stopColor={BRAND_ORANGE} stopOpacity="0.9" />
                <stop offset="0.55" stopColor="#e9e9e9" stopOpacity="0.35" />
                <stop offset="1" stopColor={BRAND_BROWN} stopOpacity="0.35" />
              </linearGradient>
            </defs>

            <circle cx="260" cy="260" r="206" fill="none" stroke="url(#pp-ring-cine)" strokeWidth="30" />
            <circle cx="260" cy="260" r="164" fill="none" stroke="#e7e7e7" strokeOpacity="0.7" strokeWidth="11" />
          </motion.svg>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/35 to-white" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.2, 0.9, 0.2, 1], delay: 0.06 }}
          className="relative text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-[0.16]"
            style={{
              width: "min(980px, 96vw)",
              height: 260,
              background: `radial-gradient(circle at 48% 45%, rgba(252,176,64,0.24), transparent 62%),
                           radial-gradient(circle at 58% 56%, rgba(138,107,67,0.18), transparent 64%)`,
            }}
          />

          <h1
            className="relative font-black tracking-tight leading-none"
            style={{
              fontSize: "clamp(3.2rem, 8.6vw, 6.8rem)",
              letterSpacing: "-0.04em",
              color: "#0f172a",
              textShadow: "0 10px 32px rgba(2,6,23,0.10)",
            }}
          >
            <span className="text-slate-900">Peer</span>
            <span className="inline-block w-3" aria-hidden="true" />
            <span
              className="relative inline-block"
              style={{
                backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE} 10%, ${BRAND_BROWN} 90%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Plates
              <span
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: shimmer as any,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  opacity: 0.35,
                  mixBlendMode: "screen",
                }}
              />
            </span>
          </h1>

          <div className="mt-5 flex justify-center">
            <div
              className="h-[2px] w-[min(320px,72vw)] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(252,176,64,0), rgba(252,176,64,0.70), rgba(138,107,67,0.60), rgba(252,176,64,0))",
                opacity: 0.45,
              }}
            />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Entering experience…</span>
            <LoadingDots />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const showcaseRef = useRef<HTMLElement | null>(null);

  // ✅ Intro overlay
  const [introOpen, setIntroOpen] = useState(true);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (introOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [introOpen]);

  useEffect(() => {
    if (!introOpen) return;
    const t = window.setTimeout(() => setIntroOpen(false), 2100);
    return () => window.clearTimeout(t);
  }, [introOpen]);

  const landed = !introOpen;
  const showHeaderActions = !introOpen;

  // ✅ If intro starts, force-close menus
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  useEffect(() => {
    if (introOpen) {
      setMenuOpen(false);
      setDesktopMenuOpen(false);
    }
  }, [introOpen]);

  // ✅ Cinematic fades on scroll
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

  // ✅ Responsive check
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
  const btnGhost = "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  // ✅ Hero overlay scroll effect (gallery fades, text/card floats)
  const galleryWrapRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: galleryP } = useScroll({
    target: galleryWrapRef,
    offset: ["start start", "end start"],
  });

  const galleryOpacity = useTransform(galleryP, [0, 0.25, 0.75, 1], [1, 0.92, 0.68, 0.42]);
  const galleryBlur = useTransform(galleryP, [0, 1], [0, 3]);
  const galleryScale = useTransform(galleryP, [0, 1], [1, 0.985]);
  const galleryFilter = useMotionTemplate`blur(${galleryBlur}px)`;
  const overlayY = useTransform(galleryP, [0, 0.6, 1], [0, -46, -96]);

  // =========================================================
  // ✅ Pull-to-refresh — FIXED: only works when TOP is settled
  // (prevents "refresh" while just scrolling up)
  // =========================================================
  const pullRaw = useMotionValue(0);
  const pullY = useSpring(pullRaw, { stiffness: 260, damping: 26, mass: 0.7 });
  const [pullNow, setPullNow] = useState(0);

  const startYRef = useRef<number | null>(null);
  const armedRef = useRef(false);
  const triggeredRef = useRef(false);

  const mouseDownRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const capturedRef = useRef(false);

  const wheelSettleTimer = useRef<number | null>(null);

  // Wheel arming (two-stage) + "energy" gate to stop accidental trackpad triggers
  const wheelArmedRef = useRef(false);
  const wheelArmTimerRef = useRef<number | null>(null);
  const wheelEnergyRef = useRef(0);

  // TOP-settle tracking (must be at top for a tiny moment before arming)
  const atTopRef = useRef(false);
  const topSinceRef = useRef<number | null>(null);

  const PULL_MAX = 130;
  const PULL_TRIGGER = 92; // slightly higher to avoid accidental triggers
  const START_DRAG_PX = 12;
  const TOP_SETTLE_MS = 140;

  const setPull = (v: number) => {
    const vv = clamp(v, 0, PULL_MAX);
    pullRaw.set(vv);
    setPullNow(vv);
  };

  const resetWheelArm = () => {
    wheelArmedRef.current = false;
    wheelEnergyRef.current = 0;
    if (wheelArmTimerRef.current) window.clearTimeout(wheelArmTimerRef.current);
    wheelArmTimerRef.current = null;
  };

  const topSettled = () => {
    if (!atTopRef.current) return false;
    if (topSinceRef.current == null) return false;
    return performance.now() - topSinceRef.current >= TOP_SETTLE_MS;
  };

  const triggerMagicRefresh = () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }

    setIntroOpen(true);

    window.setTimeout(() => {
      triggeredRef.current = false;
    }, 1700);
  };

  // Track when we're "settled" at top
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;

      if (y <= 1) {
        if (!atTopRef.current) {
          atTopRef.current = true;
          topSinceRef.current = performance.now();
        }
      } else {
        atTopRef.current = false;
        topSinceRef.current = null;
        resetWheelArm();
        if (pullRaw.get() > 0) setPull(0);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MOBILE touch
  const onTouchStart = (e: React.TouchEvent) => {
    if (isInteractiveTarget(e.target)) return;

    // ✅ only allow pull when top is SETTLED
    if (topSettled()) {
      armedRef.current = true;
      startYRef.current = e.touches[0]?.clientY ?? null;
    } else {
      armedRef.current = false;
      startYRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!armedRef.current) return;
    if (startYRef.current == null) return;

    const yNow = e.touches[0]?.clientY ?? startYRef.current;
    const dy = yNow - startYRef.current;

    if (dy <= 0) {
      setPull(0);
      return;
    }

    if (dy < START_DRAG_PX) return;

    e.preventDefault();

    const elastic = Math.min(PULL_MAX, (dy - START_DRAG_PX) * 0.5);
    setPull(elastic);
  };

  const onTouchEnd = () => {
    if (!armedRef.current) return;

    if (pullRaw.get() >= PULL_TRIGGER) triggerMagicRefresh();

    setPull(0);
    armedRef.current = false;
    startYRef.current = null;
  };

  const onTouchCancel = onTouchEnd;

  // PC mouse drag
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (e.button !== 0) return;
    if (isInteractiveTarget(e.target)) return;

    // ✅ only start if top is settled
    if (!topSettled()) return;

    mouseDownRef.current = true;
    armedRef.current = true;
    startYRef.current = e.clientY;
    pointerIdRef.current = e.pointerId;
    capturedRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!mouseDownRef.current) return;
    if (!armedRef.current) return;
    if (startYRef.current == null) return;

    // ✅ if user left top, abort
    if ((window.scrollY || 0) > 1) {
      setPull(0);
      armedRef.current = false;
      return;
    }

    const dy = e.clientY - startYRef.current;
    if (dy <= 0) {
      setPull(0);
      return;
    }

    if (dy < START_DRAG_PX) return;

    if (!capturedRef.current && pointerIdRef.current != null) {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(pointerIdRef.current);
        capturedRef.current = true;
      } catch {}
    }

    e.preventDefault();
    const elastic = Math.min(PULL_MAX, (dy - START_DRAG_PX) * 0.55);
    setPull(elastic);
  };

  const endPointer = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;

    if (capturedRef.current && pointerIdRef.current != null) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(pointerIdRef.current);
      } catch {}
    }

    if (mouseDownRef.current && armedRef.current) {
      if (pullRaw.get() >= PULL_TRIGGER) triggerMagicRefresh();
    }

    mouseDownRef.current = false;
    armedRef.current = false;
    startYRef.current = null;
    pointerIdRef.current = null;
    capturedRef.current = false;
    setPull(0);
  };

  // ✅ PC wheel/trackpad pull (2-stage + energy gate, only when top is settled)
  const onWheel = (e: React.WheelEvent) => {
    if (isInteractiveTarget(e.target)) return;

    const y = window.scrollY || 0;

    // Not at top => normal scrolling, clear any arming
    if (y > 1) {
      resetWheelArm();
      return;
    }

    // At top but not settled yet => do nothing (prevents "scroll-up refresh")
    if (!topSettled()) return;

    // User scrolls UP at the top
    if (e.deltaY < 0) {
      // First "up" gesture arms only (no indicator jerk)
      if (!wheelArmedRef.current) {
        wheelArmedRef.current = true;

        if (wheelArmTimerRef.current) window.clearTimeout(wheelArmTimerRef.current);
        wheelArmTimerRef.current = window.setTimeout(() => {
          resetWheelArm();
        }, 700);

        return;
      }

      // Armed: now allow actual pulling, but require meaningful delta (trackpad noise filter)
      const mag = Math.abs(e.deltaY);
      if (mag < 10) return;

      e.preventDefault();

      // accumulate "effort" so tiny nudges don't trigger
      wheelEnergyRef.current += mag;

      // gentler pull mapping
      const add = Math.min(16, mag * 0.16);
      setPull(pullRaw.get() + add);

      if (wheelSettleTimer.current) window.clearTimeout(wheelSettleTimer.current);
      wheelSettleTimer.current = window.setTimeout(() => {
        const ok = pullRaw.get() >= PULL_TRIGGER && wheelEnergyRef.current >= 220;
        if (ok) triggerMagicRefresh();
        setPull(0);
        resetWheelArm();
      }, 140);
    } else {
      // Scrolling DOWN cancels
      resetWheelArm();
      if (pullRaw.get() > 0) setPull(0);
    }
  };

  useEffect(() => {
    return () => {
      if (wheelSettleTimer.current) window.clearTimeout(wheelSettleTimer.current);
      if (wheelArmTimerRef.current) window.clearTimeout(wheelArmTimerRef.current);
    };
  }, []);

  const pullOpacity = useTransform(pullY, [0, 18, 60], [0, 0.85, 1]);
  const pullScale = useTransform(pullY, [0, 60], [0.98, 1]);
  const pullBlur = useTransform(pullY, [0, 70], [10, 0]);
  const pullFilter = useMotionTemplate`blur(${pullBlur}px)`;

  // =========================================================
  // ✅ Landing animations (snappier on phone)
  // =========================================================
  const easeOut = [0.2, 0.9, 0.2, 1] as any;

  const landingWrap = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeOut, when: "beforeChildren", staggerChildren: 0.09 },
    },
  };

  const pop = {
    hidden: { opacity: 0, y: 18, scale: 0.985, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.65, ease: easeOut } },
  };

  const slideL = {
    hidden: { opacity: 0, x: -16, scale: 0.99, filter: "blur(10px)" },
    show: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.65, ease: easeOut } },
  };

  const slideR = {
    hidden: { opacity: 0, x: 16, scale: 0.99, filter: "blur(10px)" },
    show: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.65, ease: easeOut } },
  };

  // ✅ extra smooth section transitions on mobile
  const sectionEnter = {
    initial: { opacity: 0, y: 18, scale: 0.99, filter: "blur(10px)" },
    whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    transition: { duration: 0.7, ease: easeOut },
    viewport: { once: true, amount: 0.28 },
  } as const;

  return (
    <main
      className="min-h-screen bg-white text-slate-900"
      style={{
        touchAction: "pan-x pan-y",
        overscrollBehaviorY: "contain",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onWheel={onWheel}
    >
      {/* Header */}
      <HeroFade directionDelta={7} className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto">
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-[72px] shrink-0 md:w-[120px]" aria-hidden="true" />

              {/* Desktop actions (hidden during intro) */}
              <div
                className={cn(
                  "hidden md:flex items-center gap-3 ml-0 transition-opacity duration-200",
                  showHeaderActions ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                aria-hidden={!showHeaderActions}
              >
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
                        transition={{ duration: 0.16, ease: easeOut }}
                        className="absolute left-0 mt-3 w-[320px] origin-top-left"
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

              {/* Mobile hamburger (hidden during intro) */}
              {!isDesktop ? (
                <div
                  className={cn(
                    "ml-auto shrink-0 relative md:hidden transition-opacity duration-200",
                    showHeaderActions ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  )}
                  aria-hidden={!showHeaderActions}
                >
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
              ) : (
                <div className="ml-auto" />
              )}
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

                        <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}
        </div>
      </HeroFade>

      {/* Spacer for fixed header */}
      <div className="h-[92px] sm:h-[96px]" />

      {/* ✅ Pull-to-refresh indicator */}
      <motion.div
        className="fixed left-0 right-0 z-[90] pointer-events-none"
        style={{
          top: 96,
          opacity: pullOpacity,
          scale: pullScale,
          filter: pullFilter,
          transformOrigin: "50% 0%",
        }}
        aria-hidden="true"
      >
        <div className="mx-auto max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-2xl",
              "border border-slate-200 bg-white/90 backdrop-blur-xl",
              "px-4 py-2 shadow-sm"
            )}
            style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${BRAND_ORANGE}, ${BRAND_BROWN})`,
                boxShadow: "0 10px 24px rgba(252,176,64,0.18), 0 10px 24px rgba(138,107,67,0.12)",
              }}
            />
            <span className="text-xs font-extrabold text-slate-700">
              {pullNow >= PULL_TRIGGER
                ? "Release to refresh"
                : wheelArmedRef.current
                ? "Pull again to refresh"
                : "Pull to refresh"}
            </span>
            <LoadingDots dotSize={4} />
          </div>
        </div>
      </motion.div>

      {/* ✅ INTRO OVERLAY */}
      <AnimatePresence initial={false}>
        {introOpen ? (
          <motion.div
            key="intro-overlay"
            className="fixed left-0 right-0 z-[80] bg-white"
            style={{
              top: 96,
              height: "calc(100svh - 96px)",
            }}
            initial={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -28, filter: "blur(8px)" }}
            transition={{ duration: 0.85, ease: easeOut }}
          >
            <PeerPlatesCinematicHero headerOffsetPx={0} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ✅ Whole page content gets pulled down on "refresh pull" */}
      <motion.div style={{ y: pullY }}>
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={introOpen ? { opacity: 0, y: 34 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: introOpen ? 0 : 0.05 }}
        >
          {/* HERO CONTENT */}
          <motion.section
            id="hero-content"
            ref={heroRef}
            style={{
              opacity: heroFx.opacity,
              y: heroFx.y,
              filter: heroFx.filter,
              willChange: "transform, opacity, filter",
            }}
          >
            <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              <motion.div
                variants={landingWrap}
                initial="hidden"
                animate={landed ? "show" : "hidden"}
                className="mt-3 sm:mt-10 grid gap-8 lg:gap-10 lg:grid-cols-2 lg:items-start"
              >
                {/* Left column */}
                <motion.div variants={slideL} className="pt-1 sm:pt-2">
                  <div ref={galleryWrapRef} className="relative">
                    <motion.div style={{ opacity: galleryOpacity, filter: galleryFilter, scale: galleryScale }}>
                      <div className="-mx-2 sm:mx-0">
                        <TopGallery
                          images={[
                            { name: "gallery11.png", alt: "Gallery 11" },
                            { name: "gallery12.png", alt: "Gallery 12" },
                            { name: "gallery13.png", alt: "Gallery 13" },
                            { name: "gallery14.png", alt: "Gallery 14" },
                            { name: "gallery15.png", alt: "Gallery 15" },
                          ]}
                        />
                      </div>
                    </motion.div>

                    {/* ✅ Mobile: less “magazine” overlap + smoother entry */}
                    <motion.div
                      style={{ y: overlayY }}
                      className={cn("relative z-30", "-mt-16 sm:-mt-28 md:-mt-32")}
                      {...sectionEnter}
                    >
                      {/* sticky only on sm+ (phone looks cleaner without sticky stacking) */}
                      <div className="sm:sticky sm:top-[112px]">
                        <div
                          className={cn(
                            "relative overflow-hidden",
                            "rounded-[32px] sm:rounded-[38px] border border-slate-200/70",
                            "bg-white/92 backdrop-blur-xl",
                            "shadow-[0_26px_90px_rgba(2,6,23,0.16)]",
                            "p-6 sm:p-8"
                          )}
                        >
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
                            initial={false}
                            animate={landed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.6, ease: easeOut, delay: 0.05 }}
                            className={cn(
                              "relative font-extrabold tracking-tight leading-[0.98]",
                              "text-slate-900",
                             "text-[clamp(2.05rem,7.8vw,5.8rem)]"

                            )}
                          >
                            Eat better and back local:
                            <br />
                            authentic home-cooked meals
                            <br />
                            from trusted cooks and bakers.
                          </MotionH1>

                          <MotionDiv
                            initial={false}
                            animate={landed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                            transition={{ duration: 0.55, ease: easeOut, delay: 0.12 }}
                            className="relative mt-6 sm:mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
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
                </motion.div>

                {/* Right column */}
                <motion.div variants={slideR} {...sectionEnter}>
                  <MotionDiv
                    initial={false}
                    animate={landed ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
                    transition={{ duration: 0.7, ease: easeOut, delay: 0.08 }}
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
                          initial={{ opacity: 0, y: 14, scale: 0.99, filter: "blur(10px)" }}
                          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          viewport={{ once: true, amount: 0.35 }}
                          transition={{ duration: 0.55, ease: easeOut, delay: 0.02 + i * 0.06 }}
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
                </motion.div>
              </motion.div>
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
            <motion.div
              variants={landingWrap}
              initial="hidden"
              animate={landed ? "show" : "hidden"}
              className="mx-auto w-full"
            >
              <motion.div variants={pop} {...sectionEnter}>
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
              </motion.div>

              <div className="md:hidden h-[20vh]" aria-hidden="true" />
            </motion.div>
          </motion.section>

          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mt-10 sm:mt-12 border-t border-slate-200 pt-6 pb-10 text-sm text-slate-500">
              © {new Date().getFullYear()} PeerPlates
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
