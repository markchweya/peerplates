// src/app/ui/ScrollShowcase.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type Direction = "ltr" | "rtl";

export type ShowcaseNavItem = {
  label: string;
  index: number;
};

export type ShowcaseItem = {
  image: string;
  kicker: string;
  title: string;
  subtitle: string;
  desc: string;

  // kept for compatibility
  stackedDesktop?: boolean;
};

function clampStyle(lines: number): React.CSSProperties {
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as any,
    WebkitLineClamp: lines as any,
    overflow: "hidden",
  };
}

export default function ScrollShowcase({
  heading,
  subheading,
  direction = "ltr",
  snap = true,
  tilt = false,
  nav,
  items,
}: {
  heading: string;
  subheading: string;
  direction?: Direction;
  snap?: boolean;
  tilt?: boolean;
  nav?: ShowcaseNavItem[];
  items?: ShowcaseItem[];
}) {
  const safeItems = Array.isArray(items) ? items : [];

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);

  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const isRTL = direction === "rtl";
  const snapClass = snap ? "snap-x snap-mandatory scroll-smooth" : "scroll-smooth";
  const trackPadding = "px-4 sm:px-6 lg:px-8";

  const title = (heading || "").trim() ? heading : "App Previews";

  const orderedItems = useMemo(() => {
    if (!isRTL) return safeItems;
    return [...safeItems].reverse();
  }, [safeItems, isRTL]);

  const orderedNav = useMemo(() => {
    if (!nav?.length) return [];
    if (!isRTL) return nav;

    return nav.map((n) => ({
      ...n,
      index: Math.max(0, safeItems.length - 1 - n.index),
    }));
  }, [nav, isRTL, safeItems.length]);

  function scrollToIndex(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeRef.current;
        let bestRatio = 0;

        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.index || 0);
          if (e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            bestIdx = idx;
          }
        }

        if (bestRatio > 0.35) setActive(bestIdx);
      },
      { root, threshold: [0.25, 0.35, 0.5, 0.65, 0.8] }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [orderedItems.length]);

  return (
    <section className="relative">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-white" />
        <div
          className="absolute -left-44 top-10 h-[520px] w-[520px] rounded-full blur-3xl opacity-20"
          style={{ background: "rgba(138,107,67,0.22)" }}
        />
        <div
          className="absolute -right-44 bottom-[-140px] h-[560px] w-[560px] rounded-full blur-3xl opacity-20"
          style={{ background: "rgba(252,176,64,0.28)" }}
        />
      </div>

      <div className={`mx-auto w-full max-w-6xl 2xl:max-w-7xl ${trackPadding} py-10 sm:py-12`}>
        <div className="min-h-[100svh] flex flex-col justify-center">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="mt-2 font-extrabold tracking-tight leading-[0.98] text-[clamp(2.2rem,4.8vw,3.4rem)]"
              style={{
                color: "#B8833A",
                textShadow: "0 1px 0 rgba(255,255,255,0.92), 0 10px 26px rgba(184,131,58,0.18)",
              }}
            >
              {title}
            </h2>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 font-semibold">
              {subheading}
            </p>
          </div>

          {/* Nav pills */}
          {orderedNav.length ? (
            <div className="mt-6 sm:mt-7 flex flex-wrap gap-2 justify-center">
              {orderedNav.map((n) => {
                const on = active === n.index;
                return (
                  <button
                    key={n.label}
                    type="button"
                    onClick={() => scrollToIndex(n.index)}
                    className={[
                      "inline-flex items-center justify-center",
                      "rounded-full px-4 py-2 text-sm font-extrabold",
                      "border shadow-sm transition hover:-translate-y-[1px]",
                      on
                        ? "bg-[#fcb040] text-slate-900 border-[#fcb040]"
                        : "bg-white/85 text-slate-800 border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {n.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Horizontal scroller */}
          <div className="mt-6 sm:mt-7">
            <div
              ref={scrollerRef}
              className={[
                "relative",
                "flex gap-5 sm:gap-6",
                "overflow-x-auto overflow-y-visible",
                "pb-8",
                snapClass,
                "[-webkit-overflow-scrolling:touch]",
                "[--cardw:86vw] sm:[--cardw:520px] lg:[--cardw:560px]",
                "lg:[scroll-padding-inline:calc((100%_-_var(--cardw))/_2)]",
                "sm:[scroll-padding-inline:24px] [scroll-padding-inline:16px]",
              ].join(" ")}
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              {orderedItems.map((it, idx) => (
                <div
                  key={`${it.kicker}-${idx}`}
                  data-index={idx}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className="snap-center shrink-0 w-[86vw] sm:w-[520px] lg:w-[560px] flex"
                >
                  <ShowcaseCard item={it} tilt={tilt} />
                </div>
              ))}
            </div>

            {/* Gradient fade edges */}
            <div className="pointer-events-none relative -mt-8 h-0">
              <div className="absolute left-0 top-0 h-16 w-10 bg-gradient-to-r from-white to-transparent" />
              <div className="absolute right-0 top-0 h-16 w-10 bg-gradient-to-l from-white to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ item, tilt }: { item: ShowcaseItem; tilt: boolean }) {
  const [hovered, setHovered] = useState(false);

  const tiltStyle = tilt
    ? {
        transform: hovered
          ? "perspective(900px) rotateX(2deg) rotateY(-3deg)"
          : "perspective(900px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 180ms ease",
      }
    : undefined;

  // same stacked layout everywhere
  const sharedW = "w-full lg:max-w-[340px] xl:max-w-[360px]";

  const imageBG =
    "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(252,176,64,0.18) 42%, rgba(138,107,67,0.16) 100%)";

  return (
    <motion.div
      className="group relative w-full flex flex-col items-center overflow-visible"
      style={{ ...tiltStyle }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
    >
      {/* IMAGE BOX */}
      <div className={`${sharedW} mx-auto`}>
        <div className="relative aspect-[9/16] rounded-[30px] overflow-hidden border border-slate-200 bg-white shadow-[0_18px_55px_rgba(2,6,23,0.14)]">
          <div className="absolute inset-0" style={{ background: imageBG }} />

          {/* Padding + object-contain => no side cropping */}
          <div className="absolute inset-0 p-3 sm:p-4">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-contain"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* TEXT BOX (fixed sizing + clamped text so all boxes match) */}
      <div
        className={[
          sharedW,
          "mx-auto mt-5 sm:mt-6",
          "rounded-[30px] border border-slate-200 bg-white/95 backdrop-blur px-6 py-6",
          "shadow-[0_14px_45px_rgba(2,6,23,0.09)]",
          "flex flex-col",
          // ✅ equalize height across cards
          "min-h-[220px] sm:min-h-[230px]",
        ].join(" ")}
      >
        <div className="text-xs font-extrabold tracking-[0.22em] text-slate-500 uppercase">
          {item.kicker}
        </div>

        <div
          className="mt-3 text-[18px] sm:text-[20px] font-extrabold text-slate-900 leading-snug break-words"
          style={clampStyle(2)} // ✅ clamp title
          title={item.title}
        >
          {item.title}
        </div>

        <div
          className="mt-3 text-slate-600 font-semibold leading-relaxed break-words"
          style={clampStyle(3)} // ✅ clamp desc
          title={item.desc}
        >
          {item.desc}
        </div>

        {/* keeps spacing consistent even if text is shorter */}
        <div className="mt-auto" />
      </div>
    </motion.div>
  );
}
