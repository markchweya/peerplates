// src/app/ui/LogoFullScreen.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
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

/* ================= ICONS (UNCHANGED) ================= */

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
    >
      <motion.path
        d="M5 7h14"
        animate={{ rotate: open ? 45 : 0, y: open ? 5 : 0 }}
        transition={{ duration: 0.18 }}
      />
      <motion.path d="M5 12h14" animate={{ opacity: open ? 0 : 1 }} />
      <motion.path
        d="M5 17h14"
        animate={{ rotate: open ? -45 : 0, y: open ? -5 : 0 }}
        transition={{ duration: 0.18 }}
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
      animate={{ rotate: open ? 180 : 0 }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
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
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    setMounted(true);
    setReduceMotion(prefersReducedMotion());
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  };

  return (
    <section className={cn("relative isolate h-screen w-screen overflow-hidden", className)}>
      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0">
          <Image src="/images/gallery/gallery17.jpeg" fill alt="" className="object-cover" priority />

          {/* Background treatment (kept light so the image still reads on the right) */}
          <div className="absolute inset-0 bg-white/18" />
          <div className="absolute inset-0" style={{ backdropFilter: "blur(8px)" }} />

          {/* ✅ Remove blur/fade ONLY on the food/hero background area (top-right black-marked region) */}
          <div className="absolute inset-0">
            <Image
              src="/images/gallery/gallery17.jpeg"
              fill
              alt=""
              className="object-cover"
              quality={100}
              style={{
                WebkitMaskImage:
                  "radial-gradient(70% 62% at 74% 22%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 82%)",
                maskImage:
                  "radial-gradient(70% 62% at 74% 22%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 82%)",
                opacity: 0.99,
                transform: "translateZ(0)",
                filter: "contrast(1.06) saturate(1.06)",
              }}
            />
          </div>

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 95% at 18% 18%, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.18) 42%, rgba(255,255,255,0.06) 76%, rgba(255,255,255,0.00) 100%)",
            }}
          />
        </div>

        {/* ✅ LEFT SIDE FADE (almost completely) — BUT it no longer washes out the TOP-RIGHT background */}
        <div
          className="absolute inset-y-0 left-0 w-[72%] sm:w-[62%] lg:w-[58%]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 30%, rgba(255,255,255,0.82) 52%, rgba(255,255,255,0.42) 70%, rgba(255,255,255,0.14) 82%, rgba(255,255,255,0.05) 90%, rgba(255,255,255,0.00) 100%)",
          }}
        />

        {/* brand haze left */}
        <div
          className="absolute -left-44 top-12 h-[620px] w-[620px] rounded-full blur-3xl opacity-60"
          style={{ background: "rgba(252,176,64,0.16)" }}
        />
        <div
          className="absolute -left-36 top-28 h-[680px] w-[680px] rounded-full blur-3xl opacity-55"
          style={{ background: "rgba(138,107,67,0.09)" }}
        />

        {/* Bottom blend (lighter + shorter so it doesn’t wash out the hero) */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-white/30 to-white/45" />
      </div>

      {/* ================= HEADER (UNCHANGED) ================= */}
      <SiteHeader />
      <div className="h-[84px]" />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 h-[calc(100%-84px)]">
        {/* ✅ Tall phones center; ONLY very short viewports use top alignment */}
        <div
          className={cn(
            "mx-auto flex h-full w-full max-w-7xl px-6 sm:px-10 sm:pt-0 sm:pb-0",
            "items-center",
            "[@media_(max-height:640px)]:items-start",
            "[@media_(max-height:640px)]:pt-[clamp(10px,3.2vh,28px)]",
            "[@media_(max-height:640px)]:pb-[clamp(10px,3.2vh,24px)]"
          )}
        >
          <div className="w-full">
            <div className="grid w-full grid-cols-12 items-center gap-6 sm:gap-10">
              {/* LEFT: Text */}
              <div
                className={cn(
                  "relative col-span-12 sm:col-span-6 lg:col-span-5",
                  // ✅ lift headline + buttons significantly (this is the fix)
                  "-translate-y-4",
                  "sm:-translate-y-10 lg:-translate-y-12",
                  // ✅ on very short heights, don't lift (avoid clipping)
                  "[@media_(max-height:640px)]:translate-y-0",
                  // ✅ reserve space for overlay stack on phones
                  "pr-[calc(var(--stackW)+18px)] sm:pr-0"
                )}
                style={
                  {
                    "--stackW": "clamp(148px, 40vw, 240px)",
                  } as React.CSSProperties
                }
              >
                {/* ✅ PHONE ONLY: overlay image stack */}
                <motion.div
                  className={cn(
                    "pointer-events-none absolute sm:hidden",
                    "right-[clamp(-18px,-4vw,-8px)]",
                    "top-[clamp(104px,12vh,150px)]",
                    "w-[var(--stackW)]"
                  )}
                  initial={reduceMotion ? false : "hidden"}
                  animate={reduceMotion ? undefined : "show"}
                  variants={fadeInUp}
                >
                  <div className="flex flex-col gap-2 max-[380px]:gap-2.5">
                    {/* TOP CARD */}
                    <div
                      className={cn(
                        "relative w-full overflow-hidden rounded-[18px]",
                        "shadow-[0_22px_66px_rgba(2,6,23,0.24)]"
                      )}
                      style={{ border: "7px solid rgba(255,255,255,0.86)" }}
                    >
                      <div className="relative aspect-[4/3] w-full">
                        <Image src="/images/gallery/gallery11.png" fill alt="" className="object-cover object-center" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/6 via-transparent to-black/14" />
                      </div>
                    </div>

                    {/* BOTTOM CARD */}
                    <div
                      className={cn(
                        "relative ml-auto w-[94%] overflow-hidden rounded-[18px]",
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

                {/* TEXT BLOCK */}
                <div className="max-w-xl">
                  <h1 className="font-black tracking-tight leading-[0.98] text-[clamp(34px,8.8vw,60px)] sm:text-[clamp(54px,4.8vw,76px)]">
                    <span className="block text-slate-900">Eat better</span>
                    <span className="block text-slate-900 text-center sm:text-left">and</span>

                    <span className="block whitespace-normal min-[370px]:whitespace-nowrap">
                      <span style={{ color: BRAND_ORANGE }}>back</span>{" "}
                      <span style={{ color: BRAND_BROWN }}>local</span>
                    </span>
                  </h1>

                  <p className="mt-4 sm:mt-5 text-[clamp(14px,3.4vw,18px)] sm:text-[clamp(16px,1.4vw,20px)] font-semibold text-slate-700 leading-relaxed max-w-[32ch]">
                    authentic home-cooked meals from trusted cooks and bakers.
                  </p>

                  <div className="mt-6 sm:mt-7 flex flex-col gap-3 w-full max-w-[340px] sm:max-w-[420px]">
                    <Link
                      href="/join"
                      className={cn(
                        "w-full whitespace-nowrap text-center",
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
                        "w-full whitespace-nowrap text-center",
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

              {/* RIGHT: Visual column (TABLET/DESKTOP) */}
              <div className="hidden sm:block col-span-12 sm:col-span-6 lg:col-span-7">
                <div className="flex h-full w-full items-center justify-end">
                  <div className="w-full max-w-[560px]">
                    {/* ✅ EXACTLY 3 images */}
                    <div className="flex flex-col gap-4">
                      {/* 1) TOP “BACKGROUND/SCENE” CARD */}
                      <div
                        className={cn(
                          "relative w-full overflow-hidden rounded-[22px]",
                          "shadow-[0_30px_110px_rgba(2,6,23,0.24)]"
                        )}
                        style={{ border: "8px solid rgba(255,255,255,0.82)" }}
                      >
                        <div className="relative aspect-[4/2.05] w-full">
                          <Image
                            src="/images/gallery/gallery17.jpeg"
                            fill
                            alt=""
                            quality={100}
                            className="object-cover"
                            style={{
                              objectPosition: "62% 40%",
                              filter: "contrast(1.12) saturate(1.12) brightness(1.02)",
                              transform: "translateZ(0)",
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/6 via-transparent to-black/12" />
                          <div
                            className="absolute inset-0"
                            style={{
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(0,0,0,0.10)",
                            }}
                          />
                        </div>
                      </div>

                      {/* 2) ORIGINAL TOP CARD */}
                      <div
                        className={cn(
                          "relative w-full overflow-hidden rounded-[22px]",
                          "shadow-[0_24px_80px_rgba(2,6,23,0.22)]"
                        )}
                        style={{ border: "8px solid rgba(255,255,255,0.82)" }}
                      >
                        <div className="relative aspect-[4/2.45] w-full">
                          <Image src="/images/gallery/gallery11.png" fill alt="" className="object-cover object-center" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/18" />
                        </div>
                      </div>

                      {/* 3) ORIGINAL BOTTOM CARD */}
                      <div
                        className={cn(
                          "relative w-full overflow-hidden rounded-[22px]",
                          "shadow-[0_24px_80px_rgba(2,6,23,0.20)]"
                        )}
                        style={{ border: "8px solid rgba(255,255,255,0.82)" }}
                      >
                        <div className="relative aspect-[4/2.45] w-full">
                          <Image src="/images/gallery/gallery14.png" fill alt="" className="object-cover object-center" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/18" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* END RIGHT */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
