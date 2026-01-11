"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import SiteHeader from "./SiteHeader";
import { Lobster } from "next/font/google";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

/* ================= CONSTANTS ================= */

const BRAND_BROWN = "#8a6b43";
const BRAND_ORANGE = "#fcb040";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

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
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
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
    <section className="relative isolate h-screen w-screen overflow-hidden">
      {/* ================= BACKGROUND (MOBILE FIX: layout + spacing) ================= */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* ✅ Mobile gets its own grid (6 cols / 10 rows) so images align cleanly */}
        <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-12 grid-rows-10 sm:grid-rows-3 gap-2 sm:gap-3 p-3 sm:p-5">
          {/* BIG: full width on mobile, left stack on desktop */}
          <div className="col-span-6 sm:col-span-7 row-span-4 sm:row-span-2 relative rounded-xl sm:rounded-2xl overflow-hidden">
            <Image src="/images/gallery/gallery11.png" fill className="object-cover object-center" alt="" />
          </div>

          {/* RIGHT TOP: half width on mobile (left), top-right on desktop */}
          <div className="col-span-3 sm:col-span-5 row-span-2 sm:row-span-1 relative rounded-xl sm:rounded-2xl overflow-hidden">
            <Image src="/images/gallery/gallery12.png" fill className="object-cover object-center" alt="" />
          </div>

          {/* RIGHT MID: half width on mobile (right), mid-right on desktop */}
          <div className="col-span-3 sm:col-span-5 row-span-2 sm:row-span-1 relative rounded-xl sm:rounded-2xl overflow-hidden">
            <Image src="/images/gallery/gallery14.png" fill className="object-cover object-center" alt="" />
          </div>

          {/* BOTTOM: full width on both */}
          <div className="col-span-6 sm:col-span-12 row-span-4 sm:row-span-1 relative rounded-xl sm:rounded-2xl overflow-hidden">
            <Image src="/images/gallery/gallery16.jpeg" fill className="object-cover object-center" alt="" />
          </div>
        </div>

        {/* white wash */}
        <div className="absolute inset-0 bg-white/80" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* ================= HEADER (RESTORED) ================= */}
      <SiteHeader />
      <div className="h-[84px]" />

      {/* ================= CENTER CONTENT ================= */}
      <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h1 className="text-[clamp(32px,5vw,56px)] font-black">
            <span className="bg-gradient-to-r from-[#fcb040] to-[#8a6b43] bg-clip-text text-transparent">
              Eat better and back local
            </span>
          </h1>

          <p className="mt-4 text-lg font-semibold text-slate-700">
            authentic home-cooked meals from trusted cooks and bakers.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/join" className="rounded-2xl px-7 py-3 bg-[#fcb040] font-extrabold">
              Join waitlist
            </Link>
            <Link href="/queue" className="rounded-2xl px-7 py-3 border bg-white/90 font-extrabold">
              Check queue
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
