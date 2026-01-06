// ✅ NEW FILE: src/app/ui/LogoIntro.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Floating circles (cinematic) — speed increases with cursor velocity.
 * Renders behind everything (fixed canvas).
 */
function FloatingOrbs({
  className = "",
  zIndex = 0,
}: {
  className?: string;
  zIndex?: number;
}) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const velRef = useRef(0); // smoothed px/sec
  const lastPtrRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    // Pointer speed -> velRef
    const onMove = (e: PointerEvent) => {
      const t = performance.now();
      const p = lastPtrRef.current;
      const x = e.clientX;
      const y = e.clientY;

      if (!p) {
        lastPtrRef.current = { x, y, t };
        return;
      }

      const dt = Math.max(8, t - p.t);
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.hypot(dx, dy);
      const v = (dist / dt) * 1000; // px/sec

      // Smooth + clamp (keeps it cinematic, not jittery)
      const prev = velRef.current;
      velRef.current = prev * 0.84 + v * 0.16;

      lastPtrRef.current = { x, y, t };
    };

    document.addEventListener("pointermove", onMove, { passive: true, capture: true });
    return () => document.removeEventListener("pointermove", onMove, true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, globalThis.devicePixelRatio || 1));

    type Orb = {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      hueMix: number; // 0..1 blend between orange/brown
      wobble: number;
    };

    const orbs: Orb[] = [];

    const pickColor = (mix: number, alpha: number) => {
      // mix 0 => orange, 1 => brown
      const o = { r: 252, g: 176, b: 64 };
      const b = { r: 138, g: 107, b: 67 };
      const rr = Math.round(o.r * (1 - mix) + b.r * mix);
      const gg = Math.round(o.g * (1 - mix) + b.g * mix);
      const bb = Math.round(o.b * (1 - mix) + b.b * mix);
      return `rgba(${rr},${gg},${bb},${alpha})`;
    };

    const resize = () => {
      const w = Math.max(1, globalThis.innerWidth);
      const h = Math.max(1, globalThis.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-seed orbs based on area (keeps density stable)
      const target = reduce ? 26 : Math.round(clamp((w * h) / 35000, 34, 78));
      orbs.length = 0;

      for (let i = 0; i < target; i++) {
        const base = reduce ? 0.18 : 0.32;
        const ang = Math.random() * Math.PI * 2;
        const sp = base * (0.6 + Math.random() * 1.2);

        orbs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: reduce ? 2.2 + Math.random() * 1.4 : 2.4 + Math.random() * 2.0,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          hueMix: Math.random(),
          wobble: Math.random() * 1000,
        });
      }
    };

    resize();

    const onResize = () => resize();
    globalThis.addEventListener("resize", onResize, { passive: true });

    let raf = 0;
    let lastT = performance.now();

    const tick = () => {
      raf = globalThis.requestAnimationFrame(tick);

      const now = performance.now();
      const dt = Math.min(40, now - lastT);
      lastT = now;

      const w = Math.max(1, globalThis.innerWidth);
      const h = Math.max(1, globalThis.innerHeight);

      // Cursor-speed boost (subtle but noticeable)
      const rawV = velRef.current;
      const boost = reduce ? 1 : 1 + clamp(rawV / 900, 0, 2.75);

      // Soft clear (slight persistence = cinematic)
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const o of orbs) {
        // Random wandering (smooth)
        o.wobble += dt * 0.001;
        const drift = reduce ? 0.002 : 0.004;
        o.vx += (Math.sin(o.wobble * 1.8) * drift);
        o.vy += (Math.cos(o.wobble * 1.6) * drift);

        const spMul = boost * (reduce ? 0.65 : 1);
        o.x += o.vx * dt * spMul;
        o.y += o.vy * dt * spMul;

        // Wrap edges
        if (o.x < -40) o.x = w + 40;
        if (o.x > w + 40) o.x = -40;
        if (o.y < -40) o.y = h + 40;
        if (o.y > h + 40) o.y = -40;

        // Draw glow orb
        const a = reduce ? 0.16 : 0.22;
        const color = pickColor(o.hueMix, a);

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowColor = pickColor(o.hueMix, reduce ? 0.22 : 0.30);
        ctx.shadowBlur = reduce ? 10 : 16;
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    raf = globalThis.requestAnimationFrame(tick);

    return () => {
      globalThis.cancelAnimationFrame(raf);
      globalThis.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 pointer-events-none", className)}
      style={{ zIndex }}
      aria-hidden="true"
    />
  );
}

/** Wordmark — keep your logo fonts + “Peer / Plates” look */
function PeerPlatesWordmark({
  layoutId,
  compact = false,
}: {
  layoutId?: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      layoutId={layoutId}
      className={cn(
        "select-none",
        compact ? "leading-none" : "leading-tight"
      )}
    >
      <div className={cn("flex items-baseline gap-0.5", compact ? "text-[28px]" : "text-[clamp(44px,7.2vw,72px)]")}>
        <span className="font-black tracking-tight text-slate-900">Peer</span>
        <span
          className="font-black tracking-tight"
          style={{
            backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE} 10%, ${BRAND_BROWN} 90%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Plates
        </span>
      </div>

      <div
        className={cn(
          "mt-1 font-semibold text-slate-500",
          compact ? "text-[12px]" : "text-[14px]"
        )}
      >
        authentic • affordable • local
      </div>
    </motion.div>
  );
}

/**
 * ✅ Drop this into your landing page.
 * - On reload: logo starts centered, “opens”, then animates into its own top section and stays.
 * - Floating orbs roam behind the UI; cursor speed increases orb speed.
 */
export default function LogoIntroSection({
  rightSlot,
  className = "",
  zIndex = 30,
  introMs = 980,
}: {
  rightSlot?: React.ReactNode; // your Menu + Join buttons (optional)
  className?: string;
  zIndex?: number;
  introMs?: number;
}) {
  const reduce = useReducedMotion();
  const [intro, setIntro] = useState(!reduce);

  useEffect(() => {
    if (reduce) return;
    const t = globalThis.setTimeout(() => setIntro(false), introMs);
    return () => globalThis.clearTimeout(t);
  }, [introMs, reduce]);

  const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

  return (
    <LayoutGroup>
      {/* Background circles (cinematic) */}
      <FloatingOrbs zIndex={0} className="opacity-[0.55]" />

      {/* Logo “own section” (stays visible after intro) */}
      <div
        className={cn(
          "relative",
          "w-full",
          "border-b border-slate-200/60",
          "bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/55",
          className
        )}
        style={{ zIndex }}
      >
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* This is the “final” position the intro animates into */}
            <div className="min-w-0">
              <PeerPlatesWordmark layoutId="pp-wordmark" compact />
            </div>

            {/* Optional right actions */}
            {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
          </div>
        </div>
      </div>

      {/* Intro overlay: logo centered -> “opens” -> docks into the top section */}
      <AnimatePresence initial={false}>
        {intro ? (
          <motion.div
            key="pp-intro"
            className="fixed inset-0"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            {/* white stage */}
            <div className="absolute inset-0 bg-white" />

            {/* subtle radial glows */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[140vmin] w-[140vmin] rounded-full blur-3xl opacity-[0.10]"
                style={{ background: `radial-gradient(circle at 48% 46%, ${BRAND_ORANGE}, transparent 62%)` }}
              />
              <div
                className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 h-[160vmin] w-[160vmin] rounded-full blur-3xl opacity-[0.08]"
                style={{ background: `radial-gradient(circle at 54% 56%, ${BRAND_BROWN}, transparent 64%)` }}
              />
            </div>

            {/* Center logo that “opens” */}
            <div className="relative h-full w-full flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: -10 }}
                transition={{ duration: 0.6, ease: easeOut }}
                className="relative"
              >
                {/* The shared layoutId is what lets it fly into the top section */}
                <PeerPlatesWordmark layoutId="pp-wordmark" />

                {/* “Open” ring reveal */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  initial={{ width: 0, height: 0, opacity: 0.0 }}
                  animate={{
                    width: ["0px", "78vmin", "120vmin"],
                    height: ["0px", "78vmin", "120vmin"],
                    opacity: [0.0, 0.18, 0.0],
                  }}
                  transition={{ duration: 1.05, ease: easeOut }}
                  style={{
                    border: `2px solid rgba(252,176,64,0.28)`,
                    boxShadow: "0 0 0 2px rgba(138,107,67,0.12) inset",
                  }}
                />

                {/* tiny dot “swarm” near the top like your screenshot */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 -top-12"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.55, ease: easeOut }}
                >
                  <div className="relative h-10 w-[240px]">
                    {Array.from({ length: 42 }).map((_, i) => {
                      const x = (i / 42) * 240 + (Math.random() * 10 - 5);
                      const y = Math.sin(i * 0.45) * 10 + (Math.random() * 8 - 4);
                      const mix = Math.random();
                      const c =
                        mix < 0.5 ? BRAND_ORANGE : BRAND_BROWN;
                      const s = 3 + Math.random() * 3;
                      return (
                        <motion.span
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            left: x,
                            top: 14 + y,
                            width: s,
                            height: s,
                            background: c,
                            opacity: 0.9,
                            filter: "drop-shadow(0 10px 18px rgba(252,176,64,0.22))",
                          }}
                          animate={{ y: [0, -6, 0], opacity: [0.45, 1, 0.45] }}
                          transition={{
                            duration: 1.2 + Math.random() * 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.01,
                          }}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
