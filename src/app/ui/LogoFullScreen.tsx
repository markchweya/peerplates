"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Lobster } from "next/font/google";

const BRAND_HEX = "#fcb040";
const BRAND_BROWN = "#8a6b43";

const logoWordmarkFont = Lobster({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

type Particle = {
  id: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  r: number;
  d: number;
};

function makeWordTargets(): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  const line = (x1: number, y1: number, x2: number, y2: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1);
      pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
    }
  };

  // ORIGINAL MAP — UNCHANGED
  line(18, 30, 18, 88, 6);
  line(18, 30, 72, 30, 5);
  line(18, 56, 62, 56, 4);
  line(72, 30, 72, 56, 3);
  line(92, 56, 132, 56, 4);
  line(92, 56, 92, 86, 3);
  line(92, 86, 132, 86, 4);
  line(148, 56, 188, 56, 4);
  line(256, 30, 256, 88, 6);
  line(256, 30, 310, 30, 5);
  line(328, 30, 328, 88, 6);
  line(414, 30, 414, 88, 6);
  line(446, 56, 486, 56, 4);
  line(506, 56, 546, 56, 4);

  return pts;
}

const px = (n: number) => `${Math.round(n * 1000) / 1000}px`;

/* =======================
   VARIANTS (TYPED)
======================= */

const wordmarkVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.98,
    filter: "blur(14px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.75,
    },
  },
};

const taglineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
    filter: "blur(10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: "easeOut",
      delay: 0.9,
    },
  },
};

/* ---------------- Hamburger Icon ---------------- */
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
      aria-hidden="true"
    >
      <motion.path
        d="M5 7h14"
        initial={false}
        animate={{ rotate: open ? 45 : 0, y: open ? 5 : 0 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ originX: 0.5, originY: 0.5 }}
      />
      <motion.path
        d="M5 12h14"
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.12, ease: "easeInOut" }}
      />
      <motion.path
        d="M5 17h14"
        initial={false}
        animate={{ rotate: open ? -45 : 0, y: open ? -5 : 0 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ originX: 0.5, originY: 0.5 }}
      />
    </svg>
  );
}

export default function LogoFullScreen({
  size = 56,
  wordScale = 1,
  className = "",
}: {
  size?: number;
  wordScale?: number;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();

    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();

    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
    if (!isDesktop) setDesktopMenuOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const targets = useMemo(() => makeWordTargets(), []);

  const particles = useMemo<Particle[]>(() => {
    if (!mounted) return [];
    const count = isMobile ? 36 : 72;

    return targets.slice(0, count).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 14 + (i % 7) * 3;

      const spreadX = isMobile
        ? 80 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 70
        : 320 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 200;

      const spreadY =
        (Math.cos(i * 78.233) * 0.5 - 0.25) * (isMobile ? 50 : 90);

      return {
        id: i,
        sx: size / 2 + Math.cos(angle) * radius,
        sy: size / 2 + Math.sin(angle) * radius,
        tx: spreadX * wordScale,
        ty: spreadY * wordScale,
        r: 4 + (i % 3),
        d: i * 0.018,
      };
    });
  }, [targets, size, wordScale, isMobile, mounted]);

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/food-safety", label: "Food safety" },
      { href: "/faq", label: "FAQ" },
      { href: "/queue", label: "Check queue" },
    ],
    []
  );

  return (
    <section className="relative isolate h-screen w-screen flex items-center justify-center overflow-hidden">
      {/* ======= BACKGROUND SHADING (Mission/Vision-style) ======= */}
   <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
  {/* Clean soft wash (Mission/Vision feel) */}
  <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-white" />

 
 {/* Ultra-subtle brand warmth (but it ENDS in pure white) */}
<div
  className="absolute inset-0"
  style={{
    background: `
      linear-gradient(
        180deg,
        rgba(255,255,255,1) 0%,
        rgba(255,247,230,0.45) 22%,
        rgba(252,176,64,0.05) 62%,
        rgba(255,255,255,1) 100%
      )
    `,
  }}
/>

{/* ✅ Feather-to-white so the next section doesn’t create a visible split */}
<div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-b from-transparent to-white" />


  {/* Very light blobs (just a hint) */}
  <div
    className="absolute -left-44 top-10 h-[520px] w-[520px] rounded-full blur-3xl opacity-[0.08]"
    style={{ background: "rgba(138,107,67,0.30)" }}
  />
  <div
    className="absolute -right-44 bottom-[-140px] h-[560px] w-[560px] rounded-full blur-3xl opacity-[0.08]"
    style={{ background: "rgba(252,176,64,0.35)" }}
  />
</div>
      {/* ================= HEADER ================= */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto">
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-5 py-4 flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/brand/logo.png"
                alt="PeerPlates"
                width={44}
                height={44}
                priority
              />
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <div className="relative">
                <button
                  onClick={() => setDesktopMenuOpen((v) => !v)}
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50"
                >
                  Menu
                </button>

                <AnimatePresence>
                  {desktopMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg"
                    >
                      {navLinks.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setDesktopMenuOpen(false)}
                          className="w-full inline-flex items-center justify-start rounded-2xl px-5 py-2.5 font-extrabold border border-slate-200 bg-white/90 mb-2"
                        >
                          {l.label}
                        </Link>
                      ))}
                      <Link
                        href="/join"
                        className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold bg-[#fcb040] text-slate-900 w-full"
                      >
                        Join waitlist
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/join"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold bg-[#fcb040] text-slate-900"
              >
                Join waitlist
              </Link>
            </div>

            {/* Mobile */}
            {!isDesktop && (
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-auto h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                style={{ color: BRAND_HEX }}
              >
                <HamburgerIcon open={menuOpen} />
              </button>
            )}
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && !isDesktop && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
                className="md:hidden overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-2">
                  {navLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="w-full inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold border border-slate-200 bg-white/90"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link
                    href="/join"
                    onClick={() => setMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold bg-[#fcb040] text-slate-900"
                  >
                    Join waitlist
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ================= INTRO CONTENT ================= */}
      <motion.div
        className={[
          "relative z-10 inline-flex items-center select-none",
          "max-sm:flex-col max-sm:items-center",
          className,
        ].join(" ")}
        initial={{ opacity: 0, scale: 0.82, filter: "blur(18px)" }}
        animate={
          mounted ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined
        }
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* LOGO ICON — NEVER VISIBLE */}
        <div className="relative" style={{ width: size, height: size }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0 }}>
            <Image
              src="/images/brand/logo.png"
              alt="PeerPlates logo"
              width={size}
              height={size}
              priority
            />
          </motion.div>

          {/* PARTICLES */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((pt) => (
              <motion.span
                key={pt.id}
                className="absolute rounded-full will-change-transform"
                style={{
                  width: px(pt.r),
                  height: px(pt.r),
                  left: px(pt.sx),
                  top: px(pt.sy),
                  background: `
                    radial-gradient(
                      circle at 30% 30%,
                      #ffffff 0%,
                      ${BRAND_HEX} 45%,
                      ${BRAND_HEX} 60%,
                      ${BRAND_BROWN} 90%
                    )
                  `,
                }}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={
                  mounted ? { opacity: 1, x: pt.tx, y: pt.ty } : { opacity: 0 }
                }
                transition={{
                  opacity: { duration: 0.45, delay: pt.d, ease: "easeOut" },
                  x: {
                    duration: 0.9,
                    delay: pt.d + 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  y: {
                    duration: 0.9,
                    delay: pt.d + 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
              />
            ))}
          </div>
        </div>

        {/* WORDMARK */}
        <div
          className="relative ml-4 max-sm:ml-0 max-sm:mt-4 max-sm:text-center"
          style={{ width: 520 * wordScale }}
        >
          <motion.div
            variants={wordmarkVariants}
            initial="hidden"
            animate={mounted ? "show" : "hidden"}
            className="flex flex-col max-sm:items-center"
          >
            <div
              className={logoWordmarkFont.className}
              style={{
                fontSize: `${34 * wordScale}px`,
                letterSpacing: "-0.02em",
              }}
            >
              <span className="text-slate-900">Peer</span>
              <span style={{ color: BRAND_HEX }}>Plates</span>
            </div>

            <motion.div
              variants={taglineVariants}
              initial="hidden"
              animate={mounted ? "show" : "hidden"}
              className="mt-1 font-semibold text-slate-600"
              style={{ fontSize: `${15 * wordScale}px` }}
            >
              authentic • affordable • local
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
