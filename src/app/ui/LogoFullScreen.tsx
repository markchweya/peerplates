// src/app/ui/LogoFullScreen.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  /* ================= HEADER STATE (UNCHANGED) ================= */

  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);

  const lastYRef = useRef(0);
  const downAccumRef = useRef(0);

  /* ================= MOUNT ================= */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================= MOBILE / DESKTOP ================= */

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } else {
      // @ts-ignore
      mq.addListener(update);
      // @ts-ignore
      return () => mq.removeListener(update);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } else {
      // @ts-ignore
      mq.addListener(update);
      // @ts-ignore
      return () => mq.removeListener(update);
    }
  }, []);

  /* ================= HEADER VISIBILITY (UNCHANGED) ================= */

  useEffect(() => {
    const show = () => {
      downAccumRef.current = 0;
      setHeaderHidden(false);
    };

    const hide = (dy: number) => {
      downAccumRef.current += dy;
      if (downAccumRef.current > 18) setHeaderHidden(true);
    };

    const onScroll = () => {
      if (menuOpen || desktopMenuOpen) return;

      const y = window.scrollY;
      const dy = y - lastYRef.current;
      lastYRef.current = y;

      if (Math.abs(dy) < 2) return;
      if (dy < 0) show();
      else hide(dy);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen, desktopMenuOpen]);

  /* ================= HERO SIZE ================= */

  const heroSize = Math.max(64, Math.round((isMobile ? 0.78 : 0.62) * size));

  return (
    <section className={cn("relative isolate h-screen w-screen overflow-hidden", className)}>
      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* base page texture (unchanged) */}
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

        {/* ✅ RIGHT: ONLY TWO FLOATING CARDS (removed the big background/frame that sat behind them) */}
        <div className="absolute inset-0">
          <div className="absolute right-2 sm:right-8 top-[88px] sm:top-[94px] bottom-10 w-[66%] sm:w-[58%] md:w-[54%] max-w-[760px]">
            <div className="relative h-full">
              {/* soft glow behind cards (depth) */}
              <div
                className="absolute right-0 bottom-0 h-[260px] w-[66%] rounded-[28px] blur-2xl opacity-70"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />

              {/* cards stack */}
              <div className="absolute right-3 sm:right-4 top-10 sm:top-12 w-[64%] sm:w-[60%] md:w-[58%]">
                <div className="flex flex-col gap-5 sm:gap-6">
                  {/* TOP CARD (gallery11) */}
                  <div
                    className={cn(
                      "relative w-full overflow-hidden",
                      "rounded-[18px] sm:rounded-[20px]",
                      "shadow-[0_22px_66px_rgba(2,6,23,0.24)]"
                    )}
                    style={{
                      border: "6px solid rgba(255,255,255,0.82)",
                    }}
                  >
                    <div className="relative aspect-[4/2.55] w-full">
                      <Image
                        src="/images/gallery/gallery11.png"
                        fill
                        alt=""
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/18" />
                    </div>
                  </div>

                  {/* BOTTOM CARD (gallery14) */}
                  <div
                    className={cn(
                      "relative w-full overflow-hidden",
                      "rounded-[18px] sm:rounded-[20px]",
                      "shadow-[0_22px_66px_rgba(2,6,23,0.22)]"
                    )}
                    style={{
                      border: "6px solid rgba(255,255,255,0.82)",
                    }}
                  >
                    <div className="relative aspect-[4/2.55] w-full">
                      <Image
                        src="/images/gallery/gallery14.png"
                        fill
                        alt=""
                        className="object-cover object-center"
                      />
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
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-white/70 to-white" />
      </div>

      {/* ================= HEADER (RESTORED) ================= */}
      <SiteHeader />
      <div className="h-[84px]" />

      {/* ================= CONTENT (unchanged text + labels) ================= */}
      <div className="relative z-10 h-[calc(100%-84px)]">
        <div className="mx-auto h-full w-full max-w-7xl px-6 sm:px-10">
          <div className="grid h-full grid-cols-1 md:grid-cols-12 items-center gap-8">
            <div className="md:col-span-6 lg:col-span-5">
              <div className="max-w-xl">
                <h1 className="font-black leading-[0.92] tracking-tight text-[clamp(44px,5.4vw,72px)]">
                  <span className="text-slate-900">Eat better.</span>
                  <br />
                  <span style={{ color: BRAND_ORANGE }}>Support</span>{" "}
                  <span style={{ color: BRAND_BROWN }}>local</span>
                  <br />
                  <span className="text-slate-900">cooks.</span>
                </h1>

                <p className="mt-5 text-[clamp(16px,1.7vw,20px)] font-semibold text-slate-700 leading-relaxed">
                  authentic home-cooked meals from trusted cooks and bakers.
                </p>

                <div className="mt-7 flex flex-col gap-3 w-full max-w-[520px]">
                  <Link
                    href="/join"
                    className={cn(
                      "rounded-2xl px-7 py-3 font-extrabold",
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
                      "rounded-2xl px-7 py-3 font-extrabold",
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

            {/* Right side is purely visual */}
            <div className="md:col-span-6 lg:col-span-7" />
          </div>
        </div>
      </div>
    </section>
  );
}
