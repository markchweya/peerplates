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
};

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
  items: ShowcaseItem[];
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);

  const isRTL = direction === "rtl";

  const snapClass = snap ? "snap-x snap-mandatory scroll-smooth" : "scroll-smooth";

  const trackPadding = "px-4 sm:px-6 lg:px-8"; // matches your page paddings nicely

  const orderedItems = useMemo(() => {
    if (!isRTL) return items;
    return [...items].reverse();
  }, [items, isRTL]);

  const orderedNav = useMemo(() => {
    if (!nav?.length) return [];
    if (!isRTL) return nav;

    // If we reverse the visual order, we need to map nav indexes to reversed indexes
    // newIndex = (items.length - 1) - oldIndex
    return nav.map((n) => ({
      ...n,
      index: Math.max(0, items.length - 1 - n.index),
    }));
  }, [nav, isRTL, items.length]);

  function scrollToIndex(idx: number) {
    const el = cardRefs.current[idx];
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }

  // Track active card by observing visibility inside the scroller
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // pick the most visible
        let bestIdx = active;
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
      {
        root,
        threshold: [0.25, 0.35, 0.5, 0.65, 0.8],
      }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <div className={`mx-auto w-full max-w-6xl 2xl:max-w-7xl ${trackPadding} py-12 sm:py-16`}>
        {/* Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-5 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#fcb040]" />
            {heading}
          </div>

          <h2 className="mt-6 font-extrabold tracking-tight leading-[0.98] text-[clamp(2.2rem,4.8vw,3.4rem)] text-slate-900">
            App Previews
          </h2>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 font-semibold">{subheading}</p>
        </div>

        {/* Nav pills */}
        {orderedNav.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
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
        <div className="mt-8">
          <div
            ref={scrollerRef}
            className={[
              "relative",
              "flex gap-4 sm:gap-6",
              "overflow-x-auto overflow-y-visible",
              "pb-4",
              snapClass,
              "[-webkit-overflow-scrolling:touch]",
              "items-stretch", // ✅ make all cards same height
            ].join(" ")}
            style={{
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            {orderedItems.map((it, idx) => (
              <div
                key={`${it.kicker}-${idx}`}
                data-index={idx}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className={[
  "snap-start",
  "shrink-0",
  "w-[86vw] sm:w-[520px] lg:w-[560px]",
  "self-stretch",
  "flex",
].join(" ")}

              >
                <ShowcaseCard item={it} tilt={tilt} />
              </div>
            ))}
          </div>

          {/* Gradient fade edges */}
          <div className="pointer-events-none relative -mt-4 h-0">
            <div className="absolute left-0 top-0 h-16 w-10 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute right-0 top-0 h-16 w-10 bg-gradient-to-l from-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ item, tilt }: { item: ShowcaseItem; tilt: boolean }) {
  // Optional “tilt” effect (kept off by default in your usage)
  const [hovered, setHovered] = useState(false);

  const tiltStyle = tilt
    ? {
        transform: hovered
          ? "perspective(900px) rotateX(2deg) rotateY(-3deg)"
          : "perspective(900px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 180ms ease",
      }
    : undefined;

  return (
    <motion.div
      className="group relative overflow-hidden rounded-[34px] border border-slate-200 bg-white/90 backdrop-blur shadow-sm h-full min-h-[640px] flex flex-col" // ✅ equal height baseline + fill
      style={{
        boxShadow: "0 18px 60px rgba(2,6,23,0.08)",
        ...tiltStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
    >
      {/* Image */}
      <div className="relative h-[420px] sm:h-[460px] bg-slate-50 shrink-0">
        {/* IMPORTANT: keep "contain" so screenshots never look zoomed */}
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-contain"
          loading="lazy"
          draggable={false}
        />

        {/* Soft glow overlays */}
        <div
          className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full blur-3xl opacity-20"
          style={{ background: "rgba(252,176,64,0.32)" }}
        />
        <div
          className="pointer-events-none absolute -right-16 -bottom-16 h-60 w-60 rounded-full blur-3xl opacity-15"
          style={{ background: "rgba(138,107,67,0.30)" }}
        />
      </div>

      {/* Copy */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        <div className="text-xs font-extrabold tracking-[0.22em] text-slate-500 uppercase">{item.kicker}</div>

        <div className="mt-3 text-[18px] sm:text-[20px] font-extrabold text-slate-900 leading-snug">{item.title}</div>

        <div className="mt-2 text-slate-700 font-semibold">{item.subtitle}</div>

        <div className="mt-3 text-slate-600 font-semibold leading-relaxed">{item.desc}</div>

        {/* ✅ keeps bottom spacing consistent even when text is short */}
        <div className="mt-auto" />
      </div>
    </motion.div>
  );
}
