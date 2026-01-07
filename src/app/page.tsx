// src/app/page.tsx
"use client";

import LogoFullScreen from "@/app/ui/LogoFullScreen";
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
const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

/* ---------------- In-view helper ---------------- */
function useInViewAmount<T extends HTMLElement>(amount = 0.55) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: amount,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [amount]);

  return { ref, inView };
}

/* ---------------- Eat Better Section ---------------- */
function EatBetterSection() {
  const { ref, inView } = useInViewAmount<HTMLElement>(0.35);

  return (
    <section
      ref={ref}
      className="relative w-full px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 flex justify-center"
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

        <div className="h-6" />

        <p className="text-[clamp(18px,2.2vw,26px)] font-semibold leading-[1.25] text-slate-700">
          authentic home-cooked meals from trusted cooks and bakers.
        </p>

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

/* ---------------- Placeholder ---------------- */
function NextSectionPlaceholder() {
  const { ref, inView } = useInViewAmount<HTMLElement>(0.45);

  return (
    <section
      ref={ref}
      className="relative mx-auto w-full max-w-6xl px-5 pb-20"
    >
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
        <div className="text-xs font-extrabold tracking-[0.22em] text-slate-500 uppercase">
          Next page
        </div>
        <div className="mt-3 text-[clamp(22px,3vw,38px)] font-black tracking-tight text-slate-900">
          This section pops in as you arrive
        </div>
        <p className="mt-3 max-w-2xl text-[15px] sm:text-[16px] font-semibold text-slate-600 leading-relaxed">
          Replace this with your real content.
        </p>
      </motion.div>
    </section>
  );
}

/* ---------------- HOME ---------------- */
export default function Home() {
  const reduce = useReducedMotion();

  // Logo intro overlay
  const [introOpen, setIntroOpen] = useState(!reduce);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setIntroOpen(false), 1550);
    return () => clearTimeout(t);
  }, [reduce]);

  const landed = !introOpen;

  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      {/* ✅ FULLSCREEN LOGO — ONLY THING SHOWN ON LOAD */}
      <AnimatePresence initial={false}>
        {introOpen && <LogoFullScreen />}
      </AnimatePresence>

      {/* Subtle background glow */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={landed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: easeOut }}
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[140vmin] w-[140vmin] rounded-full blur-3xl opacity-[0.08]"
          style={{
            background: `radial-gradient(circle, ${BRAND_ORANGE}, transparent 62%)`,
          }}
        />
        <div
          className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 h-[160vmin] w-[160vmin] rounded-full blur-3xl opacity-[0.06]"
          style={{
            background: `radial-gradient(circle, ${BRAND_BROWN}, transparent 64%)`,
          }}
        />
      </motion.div>

      {/* CONTENT */}
      <LogoFullScreen />
      <EatBetterSection />
      <TopGallery />
      <PeerWorks />
      <NextSectionPlaceholder />
    </main>
  );
}
