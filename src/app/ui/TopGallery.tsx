"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function SmartImg({
  name,
  alt,
  className,
}: {
  name: string;
  alt: string;
  className?: string;
}) {
  const candidates = useMemo(() => [`/images/gallery/${name}`, `/images/${name}`], [name]);
  const [srcIdx, setSrcIdx] = useState(0);
  const src = candidates[srcIdx] ?? candidates[candidates.length - 1];

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setSrcIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
    />
  );
}

function useIsCoarsePointer() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const apply = () => setCoarse(mq.matches);
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

  return coarse;
}

export default function TopGallery({
  images,
  className = "",
}: {
  images: Array<{ name: string; alt: string }>;
  className?: string;
}) {
  const coarse = useIsCoarsePointer(); // ✅ phone/tablet
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const safeSet = (n: number, nextDir?: 1 | -1) => {
    const len = images.length || 1;
    const v = ((n % len) + len) % len;
    if (typeof nextDir === "number") setDir(nextDir);
    setIdx(v);
  };

  // ✅ Keep idx in range if images change
  useEffect(() => {
    if (!images?.length) return;
    setIdx((i) => Math.max(0, Math.min(images.length - 1, i)));
  }, [images?.length]);

  // ✅ Desktop-only wheel support (hook always runs, but exits early on mobile)
  useEffect(() => {
    if (coarse) return;

    const el = rootRef.current;
    if (!el) return;

    let acc = 0;
    let last = 0;

    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX);
      const dy = Math.abs(e.deltaY);
      const horizontalIntent = dx > dy * 1.25 || e.shiftKey;
      if (!horizontalIntent) return;

      const primary = dx > dy ? e.deltaX : e.deltaY;
      if (Math.abs(primary) < 6) return;

      e.preventDefault();

      const now = performance.now();
      if (now - last > 240) acc = 0;
      last = now;

      acc += primary;

      if (acc > 70) {
        acc = 0;
        safeSet(idx + 1, 1);
      } else if (acc < -70) {
        acc = 0;
        safeSet(idx - 1, -1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [coarse, idx, images.length]);

  // ✅ Mobile: update idx from native scroll
  const onMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    if (clamped !== idx) setIdx(clamped);
  };

  const scrollToIndex = (i: number) => {
    const el = stripRef.current;
    if (!el) return;

    const w = el.clientWidth || 1;
    el.scrollTo({ left: i * w, behavior: "smooth" });
    setIdx(i);
  };

  if (!images?.length) return null;

  const arrowBtn =
    "select-none inline-flex items-center justify-center " +
    "h-14 w-14 rounded-full " +
    "border border-white/60 bg-white/26 backdrop-blur-2xl " +
    "shadow-[0_22px_70px_rgba(0,0,0,0.22)] " +
    "transition active:scale-[0.98] hover:bg-white/34";

  const prev = images[(idx - 1 + images.length) % images.length];
  const cur = images[idx];
  const next = images[(idx + 1) % images.length];

  return (
    <div
      ref={rootRef}
      data-no-pull
      className={cn("w-full", className)}
      aria-label="Top Gallery"
      tabIndex={coarse ? -1 : 0}
      onKeyDown={(e) => {
        if (coarse) return;
        if (e.key === "ArrowRight") safeSet(idx + 1, 1);
        if (e.key === "ArrowLeft") safeSet(idx - 1, -1);
      }}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          "rounded-[32px] border border-slate-200/70",
          "bg-white/60 backdrop-blur-xl",
          "shadow-[0_26px_90px_rgba(2,6,23,0.12)]"
        )}
      >
        {/* glow */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl opacity-25"
          style={{ background: BRAND_ORANGE }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-20"
          style={{ background: BRAND_BROWN }}
        />

        {/* =========================================================
            ✅ MOBILE RENDER (native scroll)
           ========================================================= */}
        {coarse ? (
          <>
            <div
              ref={stripRef}
              className={cn(
                "relative flex gap-4 px-4 py-4",
                "overflow-x-auto overflow-y-hidden",
                "snap-x snap-mandatory"
              )}
              style={{
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                touchAction: "pan-x pan-y",
                scrollbarWidth: "none",
              }}
              onScroll={onMobileScroll}
            >
              {/* hide scrollbar (webkit) */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {images.map((img) => (
                <div
                  key={img.name}
                  className={cn("snap-center shrink-0", "w-[92%] sm:w-[80%]", "h-[360px]")}
                >
                  <div
                    className={cn(
                      "h-full w-full overflow-hidden rounded-[28px]",
                      "border border-white/55 bg-white/10 backdrop-blur-2xl",
                      "shadow-[0_26px_90px_rgba(2,6,23,0.18)]"
                    )}
                  >
                    <SmartImg name={img.name} alt={img.alt} className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>

            {/* dots */}
            <div className="px-5 pb-5 pt-1">
              <div className="flex items-center justify-center gap-2.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToIndex(i)}
                    className={cn("h-2.5 w-2.5 rounded-full transition", i === idx ? "scale-110" : "opacity-60")}
                    style={{
                      background: i === idx ? BRAND_ORANGE : "rgba(15,23,42,0.22)",
                      boxShadow: i === idx ? "0 12px 26px rgba(252,176,64,0.35)" : "none",
                    }}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>

              <div className="mt-2 text-center text-[11px] font-semibold text-slate-500">
                Swipe ↔ to scroll
              </div>
            </div>
          </>
        ) : (
          /* =========================================================
             ✅ DESKTOP RENDER (cinematic drag + peeks + arrows)
             ========================================================= */
          <>
            <div className="relative h-[360px] sm:h-[460px] md:h-[560px] lg:h-[620px] xl:h-[680px]">
              {/* left peek */}
              <button
                type="button"
                onClick={() => safeSet(idx - 1, -1)}
                className="absolute left-4 top-1/2 z-0 hidden md:block h-[88%] w-[34%] -translate-y-1/2 cursor-pointer"
                aria-label="Previous (peek)"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/40 bg-white/10 shadow-[0_18px_60px_rgba(2,6,23,0.18)]">
                  <SmartImg name={prev.name} alt={prev.alt} className="h-full w-full object-cover opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/5 to-transparent" />
                </div>
              </button>

              {/* right peek */}
              <button
                type="button"
                onClick={() => safeSet(idx + 1, 1)}
                className="absolute right-4 top-1/2 z-0 hidden md:block h-[88%] w-[34%] -translate-y-1/2 cursor-pointer"
                aria-label="Next (peek)"
              >
                <div className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/40 bg-white/10 shadow-[0_18px_60px_rgba(2,6,23,0.18)]">
                  <SmartImg name={next.name} alt={next.alt} className="h-full w-full object-cover opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-white/5 to-transparent" />
                </div>
              </button>

              {/* center slide */}
              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={(_, info) => {
                  const t = info.offset.x;
                  const v = info.velocity.x;
                  if (t < -110 || v < -900) safeSet(idx + 1, 1);
                  else if (t > 110 || v > 900) safeSet(idx - 1, -1);
                }}
                style={{ touchAction: "pan-y pinch-zoom" }}
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
                    <motion.div
                      key={cur.name}
                      className="h-full w-full"
                      initial={{ opacity: 0, x: dir === 1 ? 56 : -56, scale: 0.992, filter: "blur(6px)" }}
                      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: dir === 1 ? -56 : 56, scale: 0.992, filter: "blur(6px)" }}
                      transition={{ duration: 0.44, ease: [0.2, 0.9, 0.2, 1] }}
                    >
                      <SmartImg name={cur.name} alt={cur.alt} className="h-full w-full object-cover" />
                    </motion.div>
                  </AnimatePresence>

                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(0,0,0,0.10)_80%,rgba(0,0,0,0.16)_100%)]" />
                </div>
              </motion.div>

              {/* arrows */}
              <div className="hidden md:block">
                <button
                  type="button"
                  onClick={() => safeSet(idx - 1, -1)}
                  className={cn(arrowBtn, "absolute left-6 top-1/2 -translate-y-1/2 z-20")}
                  style={{
                    boxShadow: "0 22px 70px rgba(0,0,0,0.22), 0 0 0 2px rgba(252,176,64,0.26) inset",
                  }}
                  aria-label="Previous image"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => safeSet(idx + 1, 1)}
                  className={cn(arrowBtn, "absolute right-6 top-1/2 -translate-y-1/2 z-20")}
                  style={{
                    boxShadow: "0 22px 70px rgba(0,0,0,0.22), 0 0 0 2px rgba(252,176,64,0.26) inset",
                  }}
                  aria-label="Next image"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* dots */}
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
                Drag • ← → • Shift + scroll
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
