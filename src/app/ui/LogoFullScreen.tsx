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

  // ✅ NEW: scroll cue (auto-hide after scroll)
  const [showScrollCue, setShowScrollCue] = useState(true);

  useEffect(() => {
    setMounted(true);
    setReduceMotion(prefersReducedMotion());
  }, []);

  // ✅ NEW: hide cue once user scrolls a bit
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 10) setShowScrollCue(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  };

  const BG_SHIFT_STYLE: React.CSSProperties = {
    objectPosition: "50% 0%",
    transform: "translateY(-8%) scale(1.10)",
  };

  const BG_SHIFT_MASKED_STYLE: React.CSSProperties = {
    objectPosition: "50% 0%",
    transform: "translateY(-8%) scale(1.10) translateZ(0)",
  };

  // ✅ WHITE card shell (PC)
  const CARD_SHELL_STYLE: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.92)",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 28px 95px rgba(2,6,23,0.34), 0 10px 32px rgba(2,6,23,0.18)",
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
  };

  // ✅ WHITE card shell (PHONE)
  const PHONE_CARD_SHELL_STYLE: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.92)",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 18px 60px rgba(2,6,23,0.32), 0 8px 24px rgba(2,6,23,0.16)",
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
  };

  return (
    <section className={cn("relative isolate h-screen w-screen overflow-hidden", className)}>
      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0">
          <Image
            src="/images/gallery/21.png"
            fill
            alt=""
            className="object-cover sm:hidden"
            priority
            style={BG_SHIFT_STYLE}
          />
          <Image
            src="/images/gallery/gallery20.png"
            fill
            alt=""
            className="object-cover hidden sm:block"
            priority
            style={BG_SHIFT_STYLE}
          />

          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0" style={{ backdropFilter: "blur(8px)" }} />

          <div className="absolute inset-0">
            <Image
              src="/images/gallery/gallery21.png"
              fill
              alt=""
              className="object-cover sm:hidden"
              quality={100}
              style={{
                ...BG_SHIFT_MASKED_STYLE,
                WebkitMaskImage:
                  "radial-gradient(70% 62% at 74% 22%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 82%)",
                maskImage:
                  "radial-gradient(70% 62% at 74% 22%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 82%)",
                opacity: 0.99,
                filter: "contrast(1.06) saturate(1.06)",
              }}
            />
            <Image
              src="/images/gallery/gallery20.png"
              fill
              alt=""
              className="object-cover hidden sm:block"
              quality={100}
              style={{
                ...BG_SHIFT_MASKED_STYLE,
                WebkitMaskImage:
                  "radial-gradient(70% 62% at 74% 22%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 82%)",
                maskImage:
                  "radial-gradient(70% 62% at 74% 22%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 82%)",
                opacity: 0.99,
                filter: "contrast(1.06) saturate(1.06)",
              }}
            />
          </div>

          <div className="absolute inset-0">
            <Image
              src="/images/gallery/gallery21.png"
              fill
              alt=""
              className="object-cover sm:hidden"
              quality={100}
              style={{
                ...BG_SHIFT_MASKED_STYLE,
                WebkitMaskImage:
                  "radial-gradient(55% 42% at 70% 12%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 78%)",
                maskImage:
                  "radial-gradient(55% 42% at 70% 12%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 78%)",
                opacity: 0.98,
                filter: "contrast(1.05) saturate(1.05)",
              }}
            />
            <Image
              src="/images/gallery/gallery20.png"
              fill
              alt=""
              className="object-cover hidden sm:block"
              quality={100}
              style={{
                ...BG_SHIFT_MASKED_STYLE,
                WebkitMaskImage:
                  "radial-gradient(55% 42% at 70% 12%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 78%)",
                maskImage:
                  "radial-gradient(55% 42% at 70% 12%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 78%)",
                opacity: 0.98,
                filter: "contrast(1.05) saturate(1.05)",
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

        <div
          className="absolute inset-y-0 left-0 w-[72%] sm:w-[62%] lg:w-[58%]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 30%, rgba(255,255,255,0.82) 52%, rgba(255,255,255,0.42) 70%, rgba(255,255,255,0.14) 82%, rgba(255,255,255,0.05) 90%, rgba(255,255,255,0.00) 100%)",
          }}
        />

        <div
          className="absolute -left-44 top-12 h-[620px] w-[620px] rounded-full blur-3xl opacity-60"
          style={{ background: "rgba(252,176,64,0.16)" }}
        />
        <div
          className="absolute -left-36 top-28 h-[680px] w-[680px] rounded-full blur-3xl opacity-55"
          style={{ background: "rgba(138,107,67,0.09)" }}
        />

        {/* subtle bottom fade (your existing) */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-transparent to-black/5" />
      </div>

      {/* ================= HEADER (UNCHANGED) ================= */}
      <SiteHeader />
      <div className="h-[84px]" />

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 h-[calc(100%-84px)]">
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
                  "-translate-y-6",
                  "sm:-translate-y-12 lg:-translate-y-16",
                  "[@media_(max-height:760px)]:-translate-y-6",
                  "[@media_(max-height:640px)]:translate-y-0",

                  // ✅ PHONE STACK WIDTHS (tuned so iPhone 14 text isn't squeezed)
                  "[--stackW:clamp(150px,42vw,205px)]",
                  "min-[390px]:[--stackW:clamp(172px,44vw,225px)]",
                  "min-[414px]:[--stackW:clamp(190px,46vw,250px)]",

                  // Reserve space so text never sits under the stack
                  "pr-[calc(var(--stackW)+10px)]",
                  "sm:pr-0",

                  "lg:pl-6 xl:pl-8"
                )}
              >
                {/* ✅ PHONE ONLY: overlay image stack */}
                <motion.div
                  className={cn(
                    "pointer-events-none absolute sm:hidden",
                    "w-[var(--stackW)]",

                    // keep it tight to the right edge on iPhone 14
                    "right-[clamp(-10px,-2.6vw,-4px)]",
                    "min-[390px]:right-[clamp(-16px,-3.4vw,-7px)]",
                    "min-[414px]:right-[clamp(-22px,-4vw,-10px)]",

                    "top-[clamp(98px,12vh,146px)]",
                    "min-[390px]:top-[clamp(108px,13vh,160px)]",
                    "min-[414px]:top-[clamp(112px,12.5vh,154px)]"
                  )}
                  initial={reduceMotion ? false : "hidden"}
                  animate={reduceMotion ? undefined : "show"}
                  variants={fadeInUp}
                >
                  <div className={cn("relative w-full overflow-hidden rounded-[18px]")} style={PHONE_CARD_SHELL_STYLE}>
                    <div className="pointer-events-none absolute inset-0 rounded-[18px] ring-[0.75px] ring-white/90" />

                    <div className="relative w-full rounded-[18px] p-[6px]">
                      <div className="grid grid-rows-2 gap-[12px]">
                        <div className="relative aspect-[16/12] w-full overflow-hidden rounded-[14px] border border-white/90">
                          <Image src="/images/gallery/gallery12.png" fill alt="" className="object-cover object-center" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/24" />
                        </div>

                        <div className="relative aspect-[16/12] w-full overflow-hidden rounded-[14px] border border-white/90">
                          <Image src="/images/gallery/gallery14.png" fill alt="" className="object-cover object-center" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* TEXT BLOCK */}
                <div className="max-w-xl">
                  <h1 className="font-black tracking-tight leading-[0.98] text-[clamp(34px,8.8vw,60px)] sm:text-[clamp(54px,4.8vw,76px)]">
                    <span className="block text-slate-900 whitespace-nowrap">Eat better</span>
                    <span className="block text-slate-900">and</span>
                    <span className="block whitespace-normal min-[370px]:whitespace-nowrap">
                      <span style={{ color: BRAND_ORANGE }}>back</span>{" "}
                      <span style={{ color: BRAND_BROWN }}>local</span>
                    </span>
                  </h1>

                  <p className="mt-4 sm:mt-5 text-[clamp(14px,3.4vw,18px)] sm:text-[clamp(16px,1.4vw,20px)] font-semibold text-slate-700 leading-relaxed max-w-[32ch]">
                    authentic home-cooked meals from trusted cooks and bakers.
                  </p>

                  <div className="mt-5 sm:mt-6 [@media_(max-height:760px)]:mt-4 flex flex-col gap-3 w-full max-w-[340px] sm:max-w-[420px]">
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

              {/* RIGHT: Visual column (PC) */}
              <div className="hidden sm:block col-span-12 sm:col-span-6 lg:col-span-7">
                <div className="flex h-full w-full items-start justify-end overflow-hidden pt-[clamp(165px,22vh,260px)] pr-[clamp(34px,5vw,120px)]">
                  <div
                    className="w-full"
                    style={
                      {
                        "--rightW": "clamp(440px, 36vw, 600px)",
                        "--cardH": "clamp(190px, 22vh, 260px)",
                      } as React.CSSProperties
                    }
                  >
                    <div className={cn("ml-auto w-full max-w-[var(--rightW)]", "translate-x-[-clamp(185px,19vw,460px)]")}>
                      <div className={cn("relative w-full overflow-hidden rounded-[26px]")} style={CARD_SHELL_STYLE}>
                        <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-[0.75px] ring-white/90" />

                        <div className="relative w-full rounded-[26px] p-[7px]">
                          <div className="grid grid-rows-2 gap-3">
                            <div className="relative h-[var(--cardH)] w-full overflow-hidden rounded-[20px] border border-white/90">
                              <Image src="/images/gallery/gallery12.png" fill alt="" className="object-cover object-center" />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/26" />
                            </div>

                            <div className="relative h-[var(--cardH)] w-full overflow-hidden rounded-[20px] border border-white/90">
                              <Image src="/images/gallery/gallery14.png" fill alt="" className="object-cover object-center" />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/26" />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* end merged */}
                    </div>
                  </div>
                </div>
              </div>
              {/* END RIGHT */}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SCROLL CUE (NEW) ================= */}
      {showScrollCue && (
        <motion.div
          className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 sm:bottom-7"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          <div className="flex flex-col items-center gap-2">
            {/* Mouse outline */}
            <div
              className="relative h-10 w-6 rounded-full"
              style={{
                border: "1.4px solid rgba(15,23,42,0.35)",
                background: "rgba(255,255,255,0.22)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 10px 30px rgba(2,6,23,0.10)",
              }}
            >
              {/* Animated scroll dot */}
              <motion.span
                className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                style={{ background: "rgba(15,23,42,0.55)" }}
                animate={{ y: [0, 10, 0], opacity: [0.6, 0.25, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Tiny label */}
            <div
              className="text-[11px] font-semibold tracking-wide"
              style={{ color: "rgba(15,23,42,0.55)" }}
            >
              SCROLL
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
