// src/app/ui/PeerPlatesWordmarkHero.tsx
"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

export default function PeerPlatesWordmarkHero({
  className = "",
  accentA = "#fcb040",
  accentB = "#8a6b43",
  title = "PeerPlates",
  tagline = "Authentic home-cooked meals from trusted cooks and bakers — join, share, and move up the waitlist.",
}: {
  className?: string;
  accentA?: string;
  accentB?: string;
  title?: string;
  tagline?: string;
}) {
  const reduce = useReducedMotion();

  const parts = useMemo(() => {
    // split "PeerPlates" -> "Peer" + "Plates" (fallback if name changes)
    const m = title.match(/^(\D+?)([A-Z].*)$/);
    if (!m) return { a: title, b: "" };
    return { a: m[1], b: m[2] };
  }, [title]);

  const draw = reduce
    ? {}
    : {
        hidden: { pathLength: 0, opacity: 0 },
        show: { pathLength: 1, opacity: 1 },
      };

  return (
    <section
      className={cn(
        "relative isolate overflow-visible",
        "py-6 sm:py-10",
        className
      )}
      aria-label="PeerPlates hero"
    >
      {/* soft glow background (no box / no outline) */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${accentA} 0%, transparent 60%)` }}
        />
        <div
          className="absolute left-[60%] top-[35%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-12"
          style={{ background: `radial-gradient(circle, ${accentB} 0%, transparent 62%)` }}
        />
      </div>

      {/* plate + spoon scene */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-visible">
        <motion.svg
          viewBox="0 0 900 260"
          className={cn(
            "w-[min(920px,96vw)]",
            // keep it visible on mobile; the old one got clipped by height
            "h-[160px] sm:h-[190px] md:h-[210px]"
          )}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          initial={reduce ? false : "hidden"}
          animate={reduce ? undefined : "show"}
        >
          <defs>
            <linearGradient id="pp_ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={accentA} stopOpacity="0.95" />
              <stop offset="0.55" stopColor={accentA} stopOpacity="0.45" />
              <stop offset="1" stopColor={accentB} stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="pp_metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#eef2f7" />
              <stop offset="0.45" stopColor="#cfd6df" />
              <stop offset="1" stopColor="#f8fafc" />
            </linearGradient>

            <radialGradient id="pp_plate_fill" cx="50%" cy="45%" r="55%">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#f3f4f6" stopOpacity="0.85" />
            </radialGradient>

            <filter id="pp_soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feColorMatrix
                in="b"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 0.35 0"
              />
            </filter>

            <filter id="pp_shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#020617" floodOpacity="0.14" />
            </filter>
          </defs>

          {/* subtle shadow */}
          <ellipse cx="410" cy="175" rx="175" ry="22" fill="#0b1220" opacity="0.10" filter="url(#pp_soft)" />

          {/* PLATE */}
          <g filter="url(#pp_shadow)">
            {/* outer ring */}
            <motion.circle
              cx="410"
              cy="120"
              r="132"
              fill="none"
              stroke="url(#pp_ring)"
              strokeWidth="18"
              strokeLinecap="round"
              variants={draw as any}
              transition={{ duration: 1.05, ease: [0.2, 0.9, 0.2, 1] }}
            />
            {/* inner rim */}
            <motion.circle
              cx="410"
              cy="120"
              r="104"
              fill="none"
              stroke="#d7dde6"
              strokeOpacity="0.85"
              strokeWidth="6"
              variants={draw as any}
              transition={{ duration: 0.95, delay: 0.08, ease: [0.2, 0.9, 0.2, 1] }}
            />
            {/* plate fill */}
            <circle cx="410" cy="120" r="96" fill="url(#pp_plate_fill)" />
            {/* highlight arc */}
            <path
              d="M305 98c26-42 66-60 118-58 54 2 92 28 112 70"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.65"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </g>

          {/* SPOON (always visible: placed within viewBox margins) */}
          <motion.g
            initial={reduce ? false : { opacity: 0, x: 30, rotate: -10 }}
            animate={reduce ? undefined : { opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.75, delay: 0.18, ease: [0.2, 0.9, 0.2, 1] }}
            style={{ transformOrigin: "760px 128px" }}
          >
            {/* spoon head */}
            <path
              d="M730 122c0-20 18-34 40-34s40 14 40 34-18 36-40 36-40-16-40-36z"
              fill="url(#pp_metal)"
              stroke="#cfd6df"
              strokeWidth="2"
              opacity="0.98"
            />
            {/* spoon neck + handle */}
            <path
              d="M708 124c18-10 44-9 60 2"
              fill="none"
              stroke="#cfd6df"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M690 120c-56-8-106-20-148-38"
              fill="none"
              stroke="url(#pp_metal)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M690 120c-56-8-106-20-148-38"
              fill="none"
              stroke="#0b1220"
              strokeOpacity="0.06"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* tiny accent sparkle */}
            <motion.circle
              cx="774"
              cy="108"
              r="4"
              fill={accentA}
              opacity="0.35"
              animate={reduce ? undefined : { opacity: [0.12, 0.38, 0.12] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.g>

          {/* shimmer sweep over plate (subtle) */}
          {!reduce ? (
            <motion.path
              d="M250 138c70-52 160-58 260-34 74 18 118 36 168 78"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.16"
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1], opacity: [0, 0.16, 0] }}
              transition={{ duration: 1.8, delay: 0.35, ease: [0.2, 0.9, 0.2, 1] }}
            />
          ) : null}
        </motion.svg>
      </div>

      {/* WORDMARK + TAGLINE */}
      <div className="mx-auto w-full max-w-4xl px-4 text-center">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
          className={cn(
            "relative z-10 font-extrabold tracking-tight",
            "text-slate-900",
            "text-[clamp(1.85rem,5vw,3.1rem)]",
            "leading-[1.02]"
          )}
        >
          <span className="text-slate-900">{parts.a}</span>
          <span
            className="text-slate-900"
            style={{
              backgroundImage: `linear-gradient(90deg, ${accentA}, ${accentB})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {parts.b}
          </span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.2, 0.9, 0.2, 1] }}
          className="relative z-10 mt-3 text-slate-600 font-semibold text-[13.5px] sm:text-[15px] leading-relaxed"
        >
          {tagline}
        </motion.p>
      </div>
    </section>
  );
}
