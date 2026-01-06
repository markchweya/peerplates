// src/app/page.tsx
"use client";

import { useMotionTemplate } from "framer-motion";
import TopGallery from "@/app/ui/TopGallery";
import PeerWorks from "@/app/ui/PeerWorks";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";


const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

// Deterministic 0..1 “random” based on index + salt (stable across SSR + client)
function rand01(i: number, salt = 0) {
  const x = Math.sin((i + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

/** ✅ Food cinematic “seed → droplets → kettle + steam” (recurring) */
function FoodCinematic({
  mode = "ambient", // "intro" draws + blooms; "ambient" breathes + steam flows
  className = "",
}: {
  mode?: "intro" | "ambient";
  className?: string;
}) {
  const reduce = useReducedMotion();

  // Kettle outline (single-ish stroke vibe)
  const kettleOutline =
    "M 318 262 C 302 238 306 212 328 196 C 360 172 440 166 486 182 C 526 196 552 222 548 258 C 544 292 512 316 470 324 C 424 334 360 324 334 298 C 326 290 322 278 318 262 Z";

  const kettleLid = "M 360 170 C 392 142 456 142 488 170";
  const kettleKnob = { cx: 424, cy: 152, r: 10 };

  const kettleHandle = "M 548 220 C 602 214 636 250 636 286 C 636 322 606 350 560 344";
  const kettleSpout = "M 318 220 C 276 224 252 246 246 270 C 241 290 260 304 286 304";

  // Steam lines (separate paths for nicer animation)
  const steam1 = "M 370 138 C 352 118 352 98 370 78 C 388 58 388 38 370 18";
  const steam2 = "M 424 132 C 406 110 408 92 426 72 C 444 52 444 34 426 14";
  const steam3 = "M 478 138 C 460 118 462 98 480 78 C 498 58 498 38 480 18";

  const introDur = 5.1;
  const ambientDur = 10.5;

  const commonSvg = "w-[min(980px,92vw)] h-auto overflow-visible pointer-events-none select-none";

  // Reduced motion: show a tasteful static kettle
  if (reduce) {
    return (
      <div className={cn("pointer-events-none", className)} aria-hidden="true">
        <svg viewBox="0 0 800 400" className={commonSvg}>
          <defs>
            <linearGradient
              id="ppFoodGradStatic"
              x1="260"
              y1="90"
              x2="600"
              y2="340"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor={BRAND_ORANGE} stopOpacity="0.9" />
              <stop offset="1" stopColor={BRAND_BROWN} stopOpacity="0.9" />
            </linearGradient>
            <filter id="ppFoodGlowStatic" x="-50%" y="-80%" width="200%" height="260%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.55 0"
                result="g"
              />
              <feMerge>
                <feMergeNode in="g" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g opacity="0.13" filter="url(#ppFoodGlowStatic)">
            <path
              d={kettleOutline}
              fill="none"
              stroke="url(#ppFoodGradStatic)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path d={kettleLid} fill="none" stroke="url(#ppFoodGradStatic)" strokeWidth="8" strokeLinecap="round" />
            <path
              d={kettleHandle}
              fill="none"
              stroke="url(#ppFoodGradStatic)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path d={kettleSpout} fill="none" stroke="url(#ppFoodGradStatic)" strokeWidth="9" strokeLinecap="round" />
            <circle
              cx={kettleKnob.cx}
              cy={kettleKnob.cy}
              r={kettleKnob.r}
              fill="none"
              stroke="url(#ppFoodGradStatic)"
              strokeWidth="7"
            />
          </g>
        </svg>
      </div>
    );
  }

  if (mode === "ambient") {
    return (
      <div className={cn("pointer-events-none", className)} aria-hidden="true">
        <motion.svg
          viewBox="0 0 800 400"
          className={commonSvg}
          initial={{ opacity: 0, scale: 0.985, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: easeOut }}
        >
          <defs>
            <linearGradient
              id="ppFoodGradAmbient"
              x1="260"
              y1="90"
              x2="600"
              y2="340"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor={BRAND_ORANGE} stopOpacity="1" />
              <stop offset="1" stopColor={BRAND_BROWN} stopOpacity="1" />
            </linearGradient>

            <filter id="ppFoodGlowAmbient" x="-55%" y="-110%" width="210%" height="320%">
              <feGaussianBlur stdDeviation="12" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.60 0"
                result="g"
              />
              <feMerge>
                <feMergeNode in="g" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="ppFoodHalo" cx="50%" cy="56%" r="62%">
              <stop offset="0" stopColor={BRAND_ORANGE} stopOpacity="0.18" />
              <stop offset="1" stopColor={BRAND_BROWN} stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* soft halo behind kettle */}
          <motion.ellipse
            cx="420"
            cy="255"
            rx="210"
            ry="110"
            fill="url(#ppFoodHalo)"
            animate={{ opacity: [0.06, 0.12, 0.06], rx: [200, 220, 200] }}
            transition={{ duration: ambientDur, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* kettle (faint) */}
          <g filter="url(#ppFoodGlowAmbient)">
            <motion.path
              d={kettleOutline}
              fill="none"
              stroke="url(#ppFoodGradAmbient)"
              strokeWidth="12"
              strokeLinecap="round"
              opacity={0.1}
              animate={{ opacity: [0.08, 0.14, 0.08] }}
              transition={{ duration: ambientDur, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d={kettleOutline}
              fill="none"
              stroke="url(#ppFoodGradAmbient)"
              strokeWidth="9"
              strokeLinecap="round"
              opacity={0.14}
              animate={{ opacity: [0.12, 0.18, 0.12] }}
              transition={{ duration: ambientDur, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path d={kettleLid} fill="none" stroke="url(#ppFoodGradAmbient)" strokeWidth="7" strokeLinecap="round" opacity={0.12} />
            <motion.path d={kettleHandle} fill="none" stroke="url(#ppFoodGradAmbient)" strokeWidth="10" strokeLinecap="round" opacity={0.12} />
            <motion.path d={kettleSpout} fill="none" stroke="url(#ppFoodGradAmbient)" strokeWidth="9" strokeLinecap="round" opacity={0.12} />
            <motion.circle
              cx={kettleKnob.cx}
              cy={kettleKnob.cy}
              r={kettleKnob.r}
              fill="none"
              stroke="url(#ppFoodGradAmbient)"
              strokeWidth="6"
              opacity={0.12}
            />
          </g>

          {/* steam flow (dash offset looping) */}
          {[
            { d: steam1, delay: 0.0, w: 6, o: 0.14 },
            { d: steam2, delay: 0.35, w: 6, o: 0.16 },
            { d: steam3, delay: 0.7, w: 6, o: 0.13 },
          ].map((s, idx) => (
            <motion.path
              key={idx}
              d={s.d}
              fill="none"
              stroke="url(#ppFoodGradAmbient)"
              strokeWidth={s.w}
              strokeLinecap="round"
              opacity={s.o}
              strokeDasharray="14 16"
              animate={{
                strokeDashoffset: [0, -90],
                opacity: [s.o * 0.7, s.o, s.o * 0.7],
              }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "linear",
                delay: s.delay,
              }}
            />
          ))}
        </motion.svg>
      </div>
    );
  }

  // INTRO: seed → droplets → kettle draw → steam pulse (repeat)
  return (
    <div className={cn("pointer-events-none", className)} aria-hidden="true">
      <motion.svg viewBox="0 0 800 400" className={commonSvg}>
        <defs>
          <linearGradient
            id="ppFoodGradIntro"
            x1="260"
            y1="90"
            x2="600"
            y2="340"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor={BRAND_ORANGE} stopOpacity="1" />
            <stop offset="1" stopColor={BRAND_BROWN} stopOpacity="1" />
          </linearGradient>

          <filter id="ppFoodGlowIntro" x="-60%" y="-120%" width="220%" height="340%">
            <feGaussianBlur stdDeviation="15" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 0.70 0"
              result="g"
            />
            <feMerge>
              <feMergeNode in="g" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="ppFoodBlob" cx="42%" cy="34%" r="70%">
            <stop offset="0" stopColor={BRAND_ORANGE} stopOpacity="0.95" />
            <stop offset="0.62" stopColor={BRAND_BROWN} stopOpacity="0.55" />
            <stop offset="1" stopColor={BRAND_BROWN} stopOpacity="0.12" />
          </radialGradient>

          <radialGradient id="ppFoodDrop" cx="38%" cy="34%" r="70%">
            <stop offset="0" stopColor={BRAND_ORANGE} stopOpacity="0.9" />
            <stop offset="1" stopColor={BRAND_BROWN} stopOpacity="0.06" />
          </radialGradient>
        </defs>

        {/* SEED / blob */}
        <motion.path
          d="M 410 92
             C 475 104 548 150 560 220
             C 570 286 520 332 452 340
             C 382 348 300 324 274 264
             C 246 204 274 124 340 98
             C 368 87 390 87 410 92 Z"
          fill="url(#ppFoodBlob)"
          filter="url(#ppFoodGlowIntro)"
          initial={{ opacity: 0, scale: 0.84, rotate: -10, y: 10 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.84, 1.05, 1.12],
            rotate: [-12, 8, 18],
            y: [12, 0, -6],
          }}
          transition={{
            duration: introDur,
            ease: "easeInOut",
            times: [0, 0.18, 0.42],
            repeat: Infinity,
          }}
          style={{ transformOrigin: "400px 200px" }}
        />

        {/* DROPLETS split */}
        <motion.circle
          cx="400"
          cy="200"
          r="60"
          fill="url(#ppFoodDrop)"
          filter="url(#ppFoodGlowIntro)"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{
            opacity: [0, 0, 0.75, 0.95, 0],
            scale: [0.75, 0.75, 1, 1.06, 1.06],
            cx: [400, 400, 348, 330, 330],
            cy: [200, 200, 190, 210, 210],
          }}
          transition={{
            duration: introDur,
            ease: "easeInOut",
            times: [0, 0.2, 0.36, 0.52, 0.74],
            repeat: Infinity,
          }}
        />
        <motion.circle
          cx="400"
          cy="200"
          r="60"
          fill="url(#ppFoodDrop)"
          filter="url(#ppFoodGlowIntro)"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{
            opacity: [0, 0, 0.75, 0.95, 0],
            scale: [0.75, 0.75, 1, 1.06, 1.06],
            cx: [400, 400, 456, 490, 490],
            cy: [200, 200, 214, 200, 200],
          }}
          transition={{
            duration: introDur,
            ease: "easeInOut",
            times: [0, 0.2, 0.36, 0.52, 0.74],
            repeat: Infinity,
          }}
        />

        {/* KETTLE DRAW (glow) */}
        <g filter="url(#ppFoodGlowIntro)">
          <motion.path
            d={kettleOutline}
            fill="none"
            stroke="url(#ppFoodGradIntro)"
            strokeWidth="18"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              opacity: [0, 0, 0, 0.9, 0.25, 0],
              pathLength: [0, 0, 0, 1, 1, 0],
            }}
            transition={{
              duration: introDur,
              ease: "easeInOut",
              times: [0, 0.33, 0.46, 0.64, 0.84, 1],
              repeat: Infinity,
            }}
          />

          <motion.path
            d={kettleOutline}
            fill="none"
            stroke="url(#ppFoodGradIntro)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              opacity: [0, 0, 0, 1, 0.7, 0],
              pathLength: [0, 0, 0, 1, 1, 0],
            }}
            transition={{
              duration: introDur,
              ease: "easeInOut",
              times: [0, 0.34, 0.48, 0.66, 0.86, 1],
              repeat: Infinity,
            }}
          />

          <motion.path
            d={kettleLid}
            fill="none"
            stroke="url(#ppFoodGradIntro)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0, 0.9, 0.55, 0] }}
            transition={{ duration: introDur, ease: "easeInOut", times: [0, 0.38, 0.52, 0.68, 0.86, 1], repeat: Infinity }}
          />
          <motion.path
            d={kettleHandle}
            fill="none"
            stroke="url(#ppFoodGradIntro)"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0, 0.9, 0.55, 0] }}
            transition={{ duration: introDur, ease: "easeInOut", times: [0, 0.38, 0.52, 0.68, 0.86, 1], repeat: Infinity }}
          />
          <motion.path
            d={kettleSpout}
            fill="none"
            stroke="url(#ppFoodGradIntro)"
            strokeWidth="9"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0, 0.9, 0.55, 0] }}
            transition={{ duration: introDur, ease: "easeInOut", times: [0, 0.38, 0.52, 0.68, 0.86, 1], repeat: Infinity }}
          />
          <motion.circle
            cx={kettleKnob.cx}
            cy={kettleKnob.cy}
            r={kettleKnob.r}
            fill="none"
            stroke="url(#ppFoodGradIntro)"
            strokeWidth="7"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0, 0.9, 0.55, 0] }}
            transition={{ duration: introDur, ease: "easeInOut", times: [0, 0.4, 0.54, 0.7, 0.86, 1], repeat: Infinity }}
          />
        </g>

        {/* STEAM “pulse” when kettle is present */}
        {[steam1, steam2, steam3].map((sd, i) => (
          <motion.path
            key={i}
            d={sd}
            fill="none"
            stroke="url(#ppFoodGradIntro)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="14 16"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0, 0, 0.22, 0.12, 0],
              strokeDashoffset: [0, 0, 0, -90, -140, -200],
            }}
            transition={{
              duration: introDur,
              ease: "easeInOut",
              times: [0, 0.42, 0.58, 0.72, 0.86, 1],
              repeat: Infinity,
              delay: i * 0.06,
            }}
          />
        ))}

        {/* tiny “spark crumbs” (finishes the intro nicely — no highlights/blocks) */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = 400 + (rand01(i, 3) - 0.5) * 120;
          const y = 150 + (rand01(i, 7) - 0.5) * 60;
          const r = 1.2 + rand01(i, 11) * 2.0;
          const delay = rand01(i, 19) * 0.35;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill={BRAND_ORANGE}
              opacity={0}
              animate={{ opacity: [0, 0, 0.55, 0, 0], scale: [0.8, 0.8, 1.2, 1.4, 1.4] }}
              transition={{
                duration: introDur,
                ease: "easeInOut",
                times: [0, 0.46, 0.62, 0.78, 1],
                repeat: Infinity,
                delay,
              }}
              filter="url(#ppFoodGlowIntro)"
            />
          );
        })}
      </motion.svg>
    </div>
  );
}

function FloatingDotsBackdrop({ zIndex = 0 }: { zIndex?: number }) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const velRef = useRef(0);
  const lastPtrRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
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
      const v = (dist / dt) * 1000;

      velRef.current = velRef.current * 0.84 + v * 0.16;
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

    type Dot = { x: number; y: number; r: number; vx: number; vy: number; mix: number; wob: number };
    const dots: Dot[] = [];

    const mixColor = (mix: number, a: number) => {
      const o = { r: 252, g: 176, b: 64 };
      const b = { r: 138, g: 107, b: 67 };
      const rr = Math.round(o.r * (1 - mix) + b.r * mix);
      const gg = Math.round(o.g * (1 - mix) + b.g * mix);
      const bb = Math.round(o.b * (1 - mix) + b.b * mix);
      return `rgba(${rr},${gg},${bb},${a})`;
    };

    const seed = () => {
      const w = Math.max(1, globalThis.innerWidth);
      const h = Math.max(1, globalThis.innerHeight);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = reduce ? 34 : Math.round(clamp((w * h) / 26000, 50, 120));
      dots.length = 0;

      for (let i = 0; i < target; i++) {
        const ang = Math.random() * Math.PI * 2;
        const base = reduce ? 0.010 : 0.016;
        const sp = base * (0.65 + Math.random() * 1.25);

        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: reduce ? 1.6 + Math.random() * 1.2 : 1.8 + Math.random() * 1.6,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          mix: Math.random(),
          wob: Math.random() * 1000,
        });
      }
    };

    seed();
    const onResize = () => seed();
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

      const rawV = velRef.current;
      const boost = reduce ? 1 : 1 + clamp(rawV / 850, 0, 3.2);

      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.wob += dt * 0.001;

        const drift = reduce ? 0.00006 : 0.00010;
        d.vx += Math.sin(d.wob * 1.8) * drift;
        d.vy += Math.cos(d.wob * 1.6) * drift;

        d.x += d.vx * dt * boost;
        d.y += d.vy * dt * boost;

        if (d.x < -20) d.x = w + 20;
        if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        if (d.y > h + 20) d.y = -20;

        const a = reduce ? 0.35 : 0.42;

        ctx.beginPath();
        ctx.fillStyle = mixColor(d.mix, a);
        ctx.shadowColor = mixColor(d.mix, reduce ? 0.18 : 0.22);
        ctx.shadowBlur = reduce ? 6 : 10;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = globalThis.requestAnimationFrame(tick);

    return () => {
      globalThis.cancelAnimationFrame(raf);
      globalThis.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex }} aria-hidden="true" />;
}

function PeerPlatesWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="select-none text-center">
      <div className={cn("flex items-baseline justify-center gap-1", compact ? "text-[34px]" : "text-[clamp(56px,8.5vw,86px)]")}>
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

      <div className={cn("mt-2 font-semibold text-slate-500", compact ? "text-[13px]" : "text-[15px]")}>
        authentic • affordable • local
      </div>
    </div>
  );
}

// ✅ Reversible scroll-in/out animation using IntersectionObserver
function useInViewAmount<T extends HTMLElement>(amount = 0.55) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: amount });
    obs.observe(el);
    return () => obs.disconnect();
  }, [amount]);

  return { ref, inView };
}

// ✅ “Eat better…” section
function EatBetterSection() {
  const { ref, inView } = useInViewAmount<HTMLElement>(0.35);

  return (
   <section
  ref={ref}
  className="
    relative w-full
    px-6
    pt-24 pb-16
    sm:pt-32 sm:pb-24
    flex items - center
    justify-center
  "
>

      <motion.div
        initial={false}
        animate={
          inView
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 22, scale: 0.985, filter: "blur(12px)" }
        }
        transition={{ duration: 0.75, ease: easeOut }}
        className="w-full max-w-3xl text-center"
      >
        {/* Title “on its own” */}
        <h2 className="text-[clamp(30px,4vw,54px)] font-black tracking-tight leading-[1.05]">
          <span
            style={{
              backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE} 10%, ${BRAND_BROWN} 90%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Eat better and back local:
          </span>
        </h2>

        {/* Space between title and subtitle */}
        <div className="h-5 sm:h-6" />

        {/* Subtitle stays as-is */}
        <p className="text-[clamp(18px,2.2vw,26px)] font-semibold leading-[1.25]">
          <span
            style={{
              backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE} 12%, ${BRAND_BROWN} 88%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            authentic home-cooked meals from trusted cooks and bakers.
          </span>
        </p>

        {/* Buttons below */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/join"
            className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] bg-[#fcb040] text-slate-900"
          >
            Join waitlist
          </a>

          <a
            href="/queue"
            className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50"
          >
            Check queue
          </a>
        </div>
      </motion.div>
    </section>
  );
}



/** Optional: next section example (pops/fades in/out the same way) */
function NextSectionPlaceholder() {
  const { ref, inView } = useInViewAmount<HTMLElement>(0.45);

  return (
    <section ref={ref} className="relative mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 pb-20">
      <motion.div
        initial={false}
        animate={
          inView
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 28, scale: 0.985, filter: "blur(10px)" }
        }
        transition={{ duration: 0.6, ease: easeOut }}
        className="rounded-[34px] border border-slate-200 bg-white p-6 sm:p-10"
        style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.06)" }}
      >
        <div className="text-xs font-extrabold tracking-[0.22em] text-slate-500 uppercase">Next page</div>
        <div className="mt-3 text-[clamp(22px,3vw,38px)] font-black tracking-tight text-slate-900">
          This section pops in as you arrive
        </div>
        <p className="mt-3 max-w-2xl text-[15px] sm:text-[16px] font-semibold text-slate-600 leading-relaxed">
          Replace this with your real content. It will fade out when you scroll away, and fade back in when you return.
        </p>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const reduce = useReducedMotion();

  // Intro overlay on refresh
  const [introOpen, setIntroOpen] = useState(!reduce);
  useEffect(() => {
    if (reduce) return;
    const t = globalThis.setTimeout(() => setIntroOpen(false), 1550);
    return () => globalThis.clearTimeout(t);
  }, [reduce]);

  const landed = !introOpen;

  // Desktop menu (top-right)
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-menu-root]")) return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();

    if (menuOpen) {
      globalThis.addEventListener("mousedown", onDown);
      globalThis.addEventListener("keydown", onKey);
      return () => {
        globalThis.removeEventListener("mousedown", onDown);
        globalThis.removeEventListener("keydown", onKey);
      };
    }
  }, [menuOpen, closeMenu]);

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  // Smooth pop/fade-in variants (after refresh intro)
  const wrap = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { duration: 0.6, ease: easeOut, when: "beforeChildren", staggerChildren: 0.08 },
      },
    }),
    []
  );

  const pop = useMemo(
    () => ({
      hidden: { opacity: 0, y: 14, scale: 0.985, filter: "blur(10px)" },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: easeOut },
      },
    }),
    []
  );

  const popFast = useMemo(
    () => ({
      hidden: { opacity: 0, y: 10, scale: 0.99, filter: "blur(8px)" },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.55, ease: easeOut },
      },
    }),
    []
  );

  // ✅ HERO fade-out (PeerPlates + kettle) driven by scroll
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Hold for a bit, then fade / lift / blur away
  const heroOpacityRaw = useTransform(heroProg, [0, 0.55, 0.88, 1], [1, 1, 0.28, 0]);
  const heroYRaw = useTransform(heroProg, [0, 1], [0, -26]);
  const heroBlurRaw = useTransform(heroProg, [0, 1], [0, 12]);
  

  const heroOpacity = useSpring(heroOpacityRaw, { stiffness: 140, damping: 26, mass: 0.6 });
  const heroY = useSpring(heroYRaw, { stiffness: 140, damping: 26, mass: 0.6 });
  const heroBlur = useSpring(heroBlurRaw, { stiffness: 140, damping: 26, mass: 0.6 });
  const heroBlurFilter = useMotionTemplate`blur(${heroBlur}px)`;

  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      {/* Dots backdrop (behind everything) */}
    

      {/* Subtle page glow (also fades in) */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={landed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.02 }}
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 h-[140vmin] w-[140vmin] rounded-full blur-3xl opacity-[0.08]"
          style={{ background: `radial-gradient(circle at 48% 46%, ${BRAND_ORANGE}, transparent 62%)` }}
        />
        <div
          className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 h-[160vmin] w-[160vmin] rounded-full blur-3xl opacity-[0.06]"
          style={{ background: `radial-gradient(circle at 54% 56%, ${BRAND_BROWN}, transparent 64%)` }}
        />
      </motion.div>

      {/* Top-right actions (fade/pop in after intro) */}
      <motion.div className="relative z-20" initial="hidden" animate={landed ? "show" : "hidden"} variants={wrap}>
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-end gap-3" data-menu-root>
            <motion.div variants={popFast} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                className={cn(btnBase, btnGhost, "gap-2")}
              >
                Menu <span className={cn("transition", menuOpen ? "rotate-180" : "rotate-0")}>▾</span>
              </button>

              <AnimatePresence initial={false}>
                {menuOpen ? (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: easeOut }}
                    className="absolute right-0 mt-3 w-[320px] origin-top-right z-[50]"
                  >
                    <div
                      className="rounded-[28px] border border-slate-200 bg-white/92 backdrop-blur p-3 shadow-sm"
                      style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                    >
                      <div className="grid gap-2">
                        {[
                          { href: "/mission", label: "Mission" },
                          { href: "/vision", label: "Vision" },
                          { href: "/faq", label: "FAQ" },
                          { href: "/food-safety", label: "Food safety" },
                          { href: "/queue", label: "Check queue" },
                          { href: "/privacy", label: "Privacy" },
                        ].map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(btnBase, btnGhost, "px-5 py-3 justify-start w-full")}
                          >
                            {l.label}
                          </a>
                        ))}
                      </div>
                      <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

            <motion.a href="/join" variants={popFast} className={cn(btnBase, btnPrimary, "hidden md:inline-flex")}>
              Join waitlist
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* ✅ HERO (PeerPlates + kettle) — now fades OUT smoothly as you scroll */}
      <motion.section
        ref={heroRef}
        className="relative z-10 min-h-[calc(100svh-110px)] flex items-center justify-center px-6"
        initial="hidden"
        animate={landed ? "show" : "hidden"}
        variants={wrap}
      >
        <motion.div
          variants={pop}
          className="relative"
          style={{
            opacity: heroOpacity,
            y: heroY,
          filter: heroBlurFilter,

          }}
        >
          {/* ambient kettle behind the wordmark */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[56%] -z-10 opacity-[0.85]">
            <FoodCinematic mode="ambient" />
          </div>
          <PeerPlatesWordmark />
        </motion.div>
      </motion.section>

      {/* ✅ “Eat Better” section (own section, pushed up on mobile, fades in/out) */}
      <EatBetterSection />
<TopGallery />

  {/* ✅ HOW IT WORKS */}
      <PeerWorks />
      
      {/* ✅ Next section (optional) */}
      <NextSectionPlaceholder />

      {/* Reload intro overlay */}
      <AnimatePresence initial={false}>
        {introOpen ? (
          <motion.div
            key="intro"
            className="fixed inset-0 bg-white"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <div className="relative h-full w-full flex items-center justify-center px-6 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <FoodCinematic mode="intro" className="opacity-[0.95]" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.65, ease: easeOut }}
                className="relative"
              >
                <PeerPlatesWordmark />

                {/* “Open” ring expansion */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{
                    width: ["0px", "74vmin", "122vmin"],
                    height: ["0px", "74vmin", "122vmin"],
                    opacity: [0, 0.16, 0],
                  }}
                  transition={{ duration: 1.05, ease: easeOut }}
                  style={{
                    border: `2px solid rgba(252,176,64,0.28)`,
                    boxShadow: "0 0 0 2px rgba(138,107,67,0.12) inset",
                  }}
                />

                {/* Tiny underline pop */}
                <motion.div
                  aria-hidden="true"
                  className="mt-5 flex justify-center"
                  initial={{ opacity: 0, scaleX: 0.65 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.12, duration: 0.55, ease: easeOut }}
                >
                  <div
                    className="h-[2px] w-[min(340px,78vw)] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(252,176,64,0), rgba(252,176,64,0.70), rgba(138,107,67,0.60), rgba(252,176,64,0))",
                      opacity: 0.55,
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
