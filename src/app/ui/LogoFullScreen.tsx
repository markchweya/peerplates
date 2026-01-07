"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
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

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  return (
    <section className="relative h-screen w-screen flex items-center justify-center overflow-hidden">
      <motion.div
        className={[
          "relative inline-flex items-center select-none",
          "max-sm:flex-col max-sm:items-center",
          className,
        ].join(" ")}
        initial={{ opacity: 0, scale: 0.82, filter: "blur(18px)" }}
        animate={
          mounted
            ? { opacity: 1, scale: 1, filter: "blur(0px)" }
            : undefined
        }
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* LOGO ICON — NEVER VISIBLE */}
        <div className="relative" style={{ width: size, height: size }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
          >
            <Image
              src="/images/brand/logo.png"
              alt="PeerPlates logo"
              width={size}
              height={size}
              priority
              className="rounded-2xl"
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
  initial={{
    opacity: 0,
    x: 0,
    y: 0,
  }}
  animate={
    mounted
      ? {
          opacity: 1,
          x: pt.tx,
          y: pt.ty,
        }
      : {
          opacity: 0,
        }
  }
  transition={{
    opacity: {
      duration: 0.45,
      delay: pt.d,
      ease: "easeOut",
    },
    x: {
      duration: 0.9,
      delay: pt.d + 0.15, // ⏱ movement starts AFTER fade
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
