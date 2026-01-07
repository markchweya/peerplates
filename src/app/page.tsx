// src/app/page.tsx
"use client";

import LogoFullScreen from "@/app/ui/LogoFullScreen";
import TopGallery from "@/app/ui/TopGallery";
import PeerWorks from "@/app/ui/PeerWorks";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";
const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

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
      </motion.div>
    </section>
  );
}

/* ---------------- HOME ---------------- */
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      <LogoFullScreen />
      <EatBetterSection />
      <TopGallery />
      <PeerWorks />
    </main>
  );
}
