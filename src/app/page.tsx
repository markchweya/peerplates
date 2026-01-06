// src/app/page.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

function FloatingDotsBackdrop({ zIndex = 0 }: { zIndex?: number }) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const velRef = useRef(0);
  const lastPtrRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const t = performance.now();
      const p = lastPtrRef.current;
      const x = e.clientX;
      const y = e.clientY;

      if (!p) {
        lastPtrRef.current = { x, y, t };
        return;
      }

      const dt = Math.max(8, t - p.t);
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.hypot(dx, dy);
      const v = (dist / dt) * 1000;

      velRef.current = velRef.current * 0.84 + v * 0.16;
      lastPtrRef.current = { x, y, t };
    };

    document.addEventListener("pointermove", onMove, { passive: true, capture: true });
    return () => document.removeEventListener("pointermove", onMove, true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, globalThis.devicePixelRatio || 1));

    type Dot = { x: number; y: number; r: number; vx: number; vy: number; mix: number; wob: number };
    const dots: Dot[] = [];

    const mixColor = (mix: number, a: number) => {
      const o = { r: 252, g: 176, b: 64 };
      const b = { r: 138, g: 107, b: 67 };
      const rr = Math.round(o.r * (1 - mix) + b.r * mix);
      const gg = Math.round(o.g * (1 - mix) + b.g * mix);
      const bb = Math.round(o.b * (1 - mix) + b.b * mix);
      return `rgba(${rr},${gg},${bb},${a})`;
    };

    const seed = () => {
      const w = Math.max(1, globalThis.innerWidth);
      const h = Math.max(1, globalThis.innerHeight);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = reduce ? 34 : Math.round(clamp((w * h) / 26000, 50, 120));
      dots.length = 0;

      for (let i = 0; i < target; i++) {
        const ang = Math.random() * Math.PI * 2;
        const base = reduce ? 0.010 : 0.016;
        const sp = base * (0.65 + Math.random() * 1.25);

        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: reduce ? 1.6 + Math.random() * 1.2 : 1.8 + Math.random() * 1.6,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          mix: Math.random(),
          wob: Math.random() * 1000,
        });
      }
    };

    seed();
    const onResize = () => seed();
    globalThis.addEventListener("resize", onResize, { passive: true });

    let raf = 0;
    let lastT = performance.now();

    const tick = () => {
      raf = globalThis.requestAnimationFrame(tick);

      const now = performance.now();
      const dt = Math.min(40, now - lastT);
      lastT = now;

      const w = Math.max(1, globalThis.innerWidth);
      const h = Math.max(1, globalThis.innerHeight);

      const rawV = velRef.current;
      const boost = reduce ? 1 : 1 + clamp(rawV / 850, 0, 3.2);

      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.wob += dt * 0.001;

        const drift = reduce ? 0.00006 : 0.00010;
        d.vx += Math.sin(d.wob * 1.8) * drift;
        d.vy += Math.cos(d.wob * 1.6) * drift;

        d.x += d.vx * dt * boost;
        d.y += d.vy * dt * boost;

        if (d.x < -20) d.x = w + 20;
        if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        if (d.y > h + 20) d.y = -20;

        const a = reduce ? 0.35 : 0.42;

        ctx.beginPath();
        ctx.fillStyle = mixColor(d.mix, a);
        ctx.shadowColor = mixColor(d.mix, reduce ? 0.18 : 0.22);
        ctx.shadowBlur = reduce ? 6 : 10;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = globalThis.requestAnimationFrame(tick);

    return () => {
      globalThis.cancelAnimationFrame(raf);
      globalThis.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex }}
      aria-hidden="true"
    />
  );
}

function PeerPlatesWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="select-none text-center">
      <div
        className={cn(
          "flex items-baseline justify-center gap-1",
          compact ? "text-[34px]" : "text-[clamp(56px,8.5vw,86px)]"
        )}
      >
        <span className="font-black tracking-tight text-slate-900">Peer</span>
        <span
          className="font-black tracking-tight"
          style={{
            backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE} 10%, ${BRAND_BROWN} 90%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Plates
        </span>
      </div>

      <div className={cn("mt-2 font-semibold text-slate-500", compact ? "text-[13px]" : "text-[15px]")}>
        authentic • affordable • local
      </div>
    </div>
  );
}

export default function Home() {
  const reduce = useReducedMotion();

  // Intro overlay on refresh
  const [introOpen, setIntroOpen] = useState(!reduce);
  useEffect(() => {
    if (reduce) return;
    const t = globalThis.setTimeout(() => setIntroOpen(false), 1250);
    return () => globalThis.clearTimeout(t);
  }, [reduce]);

  const landed = !introOpen;

  // Desktop menu (top-right)
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-menu-root]")) return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();

    if (menuOpen) {
      globalThis.addEventListener("mousedown", onDown);
      globalThis.addEventListener("keydown", onKey);
      return () => {
        globalThis.removeEventListener("mousedown", onDown);
        globalThis.removeEventListener("keydown", onKey);
      };
    }
  }, [menuOpen, closeMenu]);

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  // Smooth pop/fade-in variants (after refresh intro)
  const wrap = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { duration: 0.6, ease: easeOut, when: "beforeChildren", staggerChildren: 0.08 },
      },
    }),
    []
  );

  const pop = useMemo(
    () => ({
      hidden: { opacity: 0, y: 14, scale: 0.985, filter: "blur(10px)" },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: easeOut },
      },
    }),
    []
  );

  const popFast = useMemo(
    () => ({
      hidden: { opacity: 0, y: 10, scale: 0.99, filter: "blur(8px)" },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.55, ease: easeOut },
      },
    }),
    []
  );

  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      {/* Dots behind everything */}
      <FloatingDotsBackdrop zIndex={0} />

      {/* Subtle page glow (also fades in) */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={landed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.02 }}
        aria-hidden="true"
      >
        <div
          className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 h-[140vmin] w-[140vmin] rounded-full blur-3xl opacity-[0.08]"
          style={{ background: `radial-gradient(circle at 48% 46%, ${BRAND_ORANGE}, transparent 62%)` }}
        />
        <div
          className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 h-[160vmin] w-[160vmin] rounded-full blur-3xl opacity-[0.06]"
          style={{ background: `radial-gradient(circle at 54% 56%, ${BRAND_BROWN}, transparent 64%)` }}
        />
      </motion.div>

      {/* Top-right actions (fade/pop in after intro) */}
      <motion.div className="relative z-20" initial="hidden" animate={landed ? "show" : "hidden"} variants={wrap}>
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-end gap-3" data-menu-root>
            <motion.div variants={popFast} className="relative hidden md:block">
              <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} className={cn(btnBase, btnGhost, "gap-2")}>
                Menu <span className={cn("transition", menuOpen ? "rotate-180" : "rotate-0")}>▾</span>
              </button>

              <AnimatePresence initial={false}>
                {menuOpen ? (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: easeOut }}
                    className="absolute right-0 mt-3 w-[320px] origin-top-right z-[50]"
                  >
                    <div
                      className="rounded-[28px] border border-slate-200 bg-white/92 backdrop-blur p-3 shadow-sm"
                      style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                    >
                      <div className="grid gap-2">
                        {[
                          { href: "/mission", label: "Mission" },
                          { href: "/vision", label: "Vision" },
                          { href: "/faq", label: "FAQ" },
                          { href: "/food-safety", label: "Food safety" },
                          { href: "/queue", label: "Check queue" },
                          { href: "/privacy", label: "Privacy" },
                        ].map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn(btnBase, btnGhost, "px-5 py-3 justify-start w-full")}
                          >
                            {l.label}
                          </a>
                        ))}
                      </div>
                      <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>

            <motion.a href="/join" variants={popFast} className={cn(btnBase, btnPrimary, "hidden md:inline-flex")}>
              Join waitlist
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Center hero logo (persistent) — smooth pop/fade in after intro */}
      <motion.div className="relative z-10" initial="hidden" animate={landed ? "show" : "hidden"} variants={wrap}>
        <div className="min-h-[calc(100svh-110px)] flex items-center justify-center px-6">
          <motion.div variants={pop}>
            <PeerPlatesWordmark />
          </motion.div>
        </div>
      </motion.div>

      {/* Reload intro overlay: logo appears in the middle + “opens”, then fades out. */}
      <AnimatePresence initial={false}>
        {introOpen ? (
          <motion.div
            key="intro"
            className="fixed inset-0 bg-white"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <div className="relative h-full w-full flex items-center justify-center px-6">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.65, ease: easeOut }}
                className="relative"
              >
                <PeerPlatesWordmark />

                {/* “Open” ring expansion */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{
                    width: ["0px", "74vmin", "122vmin"],
                    height: ["0px", "74vmin", "122vmin"],
                    opacity: [0, 0.18, 0],
                  }}
                  transition={{ duration: 1.05, ease: easeOut }}
                  style={{
                    border: `2px solid rgba(252,176,64,0.30)`,
                    boxShadow: "0 0 0 2px rgba(138,107,67,0.12) inset",
                  }}
                />

                {/* Tiny underline pop */}
                <motion.div
                  aria-hidden="true"
                  className="mt-5 flex justify-center"
                  initial={{ opacity: 0, scaleX: 0.65 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.12, duration: 0.55, ease: easeOut }}
                >
                  <div
                    className="h-[2px] w-[min(340px,78vw)] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(252,176,64,0), rgba(252,176,64,0.70), rgba(138,107,67,0.60), rgba(252,176,64,0))",
                      opacity: 0.55,
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
