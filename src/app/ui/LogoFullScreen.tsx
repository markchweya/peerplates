// src/app/ui/LogoFullScreen.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import SiteHeader from "./SiteHeader";
import { Lobster } from "next/font/google";

/* ================= CONSTANTS ================= */

const BRAND_BROWN = "#8a6b43";
const BRAND_ORANGE = "#fcb040";

const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

const logoWordmarkFont = Lobster({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

/* ================= MAIN COMPONENT ================= */

export default function LogoFullScreen({
  size = 130,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const reduceMotion = useMemo(() => {
    if (!mounted) return true;
    return prefersReducedMotion();
  }, [mounted]);

  return (
    <section className={cn("relative isolate h-screen w-screen overflow-hidden", className)}>
      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* base page texture */}
        <div className="absolute inset-0">
          <Image src="/images/gallery/gallery12.png" fill alt="" className="object-cover" priority />
          <div className="absolute inset-0 bg-white/30" />
          <div className="absolute inset-0" style={{ backdropFilter: "blur(10px)" }} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 95% at 18% 18%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.30) 42%, rgba(255,255,255,0.10) 76%, rgba(255,255,255,0.00) 100%)",
            }}
          />
        </div>

        {/* ✅ DESKTOP/TABLET ONLY: floating cards stay absolute */}
        <div className="absolute inset-0 hidden sm:block">
          <div className="absolute right-2 sm:right-8 top-[88px] sm:top-[94px] bottom-10 w-[66%] sm:w-[58%] md:w-[54%] max-w-[760px]">
            <div className="relative h-full">
              <div
                className="absolute right-0 bottom-0 h-[260px] w-[66%] rounded-[28px] blur-2xl opacity-70"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />

              <div className="absolute right-3 sm:right-4 top-10 sm:top-12 w-[64%] sm:w-[60%] md:w-[58%]">
                <div className="flex flex-col gap-2 sm:gap-3">
                  {/* TOP CARD */}
                  <div
                    className={cn(
                      "relative w-full overflow-hidden",
                      "rounded-[18px] sm:rounded-[20px]",
                      "shadow-[0_22px_66px_rgba(2,6,23,0.24)]"
                    )}
                    style={{ border: "6px solid rgba(255,255,255,0.82)" }}
                  >
                    <div className="relative aspect-[4/2.55] w-full">
                      <Image src="/images/gallery/gallery11.png" fill alt="" className="object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/18" />
                    </div>
                  </div>

                  {/* BOTTOM CARD */}
                  <div
                    className={cn(
                      "relative w-full overflow-hidden",
                      "rounded-[18px] sm:rounded-[20px]",
                      "shadow-[0_22px_66px_rgba(2,6,23,0.22)]"
                    )}
                    style={{ border: "6px solid rgba(255,255,255,0.82)" }}
                  >
                    <div className="relative aspect-[4/2.55] w-full">
                      <Image src="/images/gallery/gallery14.png" fill alt="" className="object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/18" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left-to-right page fade */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.86) 34%, rgba(255,255,255,0.58) 56%, rgba(255,255,255,0.20) 72%, rgba(255,255,255,0.05) 86%, rgba(255,255,255,0.00) 100%)",
          }}
        />

        {/* soft brand haze on left */}
        <div
          className="absolute -left-44 top-12 h-[620px] w-[620px] rounded-full blur-3xl opacity-60"
          style={{ background: "rgba(252,176,64,0.16)" }}
        />
        <div
          className="absolute -left-36 top-28 h-[680px] w-[680px] rounded-full blur-3xl opacity-55"
          style={{ background: "rgba(138,107,67,0.09)" }}
        />

        {/* Bottom blend to white */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-white/70 to-white" />
      </div>

      {/* ================= HEADER (UNCHANGED) ================= */}
      <SiteHeader />
      <div className="h-[84px]" />

      {/* ================= CONTENT ================= */}
     <div className="relative z-10 h-[calc(100%-84px)] flex items-center pt-14 pb-10 sm:pt-0 sm:pb-0">
  <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
    <div className="grid grid-cols-12 items-center gap-6 sm:gap-8">

            {/* LEFT TEXT (mobile: full width, with right padding reserved for the image stack) */}
            <div className="relative col-span-12 sm:col-span-7 md:col-span-6 lg:col-span-5 pr-[46%] sm:pr-0">
              {/* ✅ PHONE: image stack overlays to the right like the inspo */}
             <motion.div
  className="pointer-events-none absolute -right-6 -top-19 w-[49%] max-w-[280px] sm:hidden"

                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: easeOut }}
              >
                <div className="flex flex-col gap-2.5">
                  {/* BIG TOP IMAGE (bigger + closer to edge) */}
                  <div
                    className={cn(
                      "relative w-full overflow-hidden",
                      "rounded-[18px]",
                      "shadow-[0_22px_66px_rgba(2,6,23,0.24)]"
                    )}
                    style={{ border: "7px solid rgba(255,255,255,0.86)" }}
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image src="/images/gallery/gallery11.png" fill alt="" className="object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/6 via-transparent to-black/14" />
                    </div>
                  </div>

                  {/* LOWER IMAGE (slightly narrower, aligned right, tight spacing) */}
                  <div
                    className={cn(
                      "relative ml-auto w-[94%] overflow-hidden",
                      "rounded-[18px]",
                      "shadow-[0_22px_66px_rgba(2,6,23,0.22)]"
                    )}
                    style={{ border: "7px solid rgba(255,255,255,0.86)" }}
                  >
                    <div className="relative aspect-[4/3.25] w-full">
                      <Image src="/images/gallery/gallery14.png" fill alt="" className="object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/6 via-transparent to-black/14" />
                    </div>
                  </div>
                </div>
              </motion.div>

       <div className="max-w-xl -mt-40 sm:mt-0">
<h1 className="font-black tracking-tight leading-[0.98] text-[clamp(40px,9.2vw,66px)] sm:text-[clamp(44px,5.4vw,72px)]">
  <span className="text-slate-900 block">Eat better</span>

  {/* centered "and" */}
  <span className="text-slate-900 block text-center">and</span>

  {/* back + local on one line */}
  <span className="block whitespace-nowrap">
    <span style={{ color: BRAND_ORANGE }}>back</span>{" "}
    <span style={{ color: BRAND_BROWN }}>local</span>
  </span>
</h1>


                <p className="mt-5 text-[clamp(16px,1.7vw,20px)] font-semibold text-slate-700 leading-relaxed">
                  authentic home-cooked meals from trusted cooks and bakers.
                </p>

                <div className="mt-7 flex flex-col gap-3 w-full max-w-[340px] sm:max-w-[520px]">
                  <Link
                    href="/join"
                    className={cn(
                      "rounded-2xl px-7 py-3.5 font-extrabold",
                      "bg-[#fcb040]",
                      "shadow-[0_16px_40px_rgba(252,176,64,0.25)]",
                      "hover:opacity-95 transition"
                    )}
                  >
                    Join waitlist
                  </Link>

                  <Link
                    href="/queue"
                    className={cn(
                      "rounded-2xl px-7 py-3.5 font-extrabold",
                      "border border-slate-200",
                      "bg-white/65 backdrop-blur",
                      "shadow-[0_16px_40px_rgba(2,6,23,0.10)]",
                      "hover:bg-white/75 transition"
                    )}
                  >
                    Check queue
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT VISUAL COLUMN (sm+ only; mobile handled by overlay above) */}
            <div className="hidden sm:block col-span-5 md:col-span-6 lg:col-span-7" />
          </div>
        </div>
      </div>
    </section>
  );
}
