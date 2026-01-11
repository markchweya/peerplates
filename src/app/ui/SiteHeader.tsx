// src/app/ui/SiteHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

/** Hamburger icon (3 lines) that animates into an X when open */
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

function ChevronDown({ open }: { open: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

export default function SiteHeader() {
  // ✅ EXACT same header behavior as Mission/Vision
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ✅ header fade on scroll down / show on scroll up (also works with wheel/touch intent)
  const [headerHidden, setHeaderHidden] = useState(false);
  const downAccumRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
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

  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
    if (!isDesktop) setDesktopMenuOpen(false);
  }, [isDesktop]);

  // keep header visible when any menu is open
  useEffect(() => {
    if (menuOpen || desktopMenuOpen) setHeaderHidden(false);
  }, [menuOpen, desktopMenuOpen]);

  // ✅ hide on down intent, show on up intent
  useEffect(() => {
    lastYRef.current = window.scrollY || 0;

    const show = () => {
      downAccumRef.current = 0;
      setHeaderHidden(false);
    };

    const hideAfterThreshold = (deltaDown: number) => {
      downAccumRef.current += deltaDown;
      if (!headerHidden && downAccumRef.current > 18) setHeaderHidden(true);
    };

    const onScroll = () => {
      if (menuOpen || desktopMenuOpen) return;

      const y = window.scrollY || 0;

      // always show near top
      if (y <= 8) {
        if (headerHidden) show();
        lastYRef.current = y;
        return;
      }

      const last = lastYRef.current;
      const delta = y - last;
      lastYRef.current = y;

      if (Math.abs(delta) < 2) return;

      if (delta < 0) show();
      else hideAfterThreshold(delta);
    };

    const onWheel = (e: WheelEvent) => {
      if (menuOpen || desktopMenuOpen) return;

      const dy = e.deltaY;
      if (Math.abs(dy) < 2) return;

      if (dy < 0) show();
      else hideAfterThreshold(dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches?.[0]) return;
      touchYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (menuOpen || desktopMenuOpen) return;
      const t = e.touches?.[0];
      if (!t) return;

      const prev = touchYRef.current;
      touchYRef.current = t.clientY;

      if (prev == null) return;
      const dy = prev - t.clientY; // finger up => dy positive => down intent
      if (Math.abs(dy) < 2) return;

      if (dy < 0) show();
      else hideAfterThreshold(dy);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [menuOpen, desktopMenuOpen, headerHidden]);

  // Mobile menu: lock scroll + esc
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Desktop dropdown: esc + outside click
  useEffect(() => {
    if (!desktopMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDesktopMenuOpen(false);
    };

    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.closest("[data-desktop-menu-root]")) return;
      setDesktopMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [desktopMenuOpen]);

  const navLinks = useMemo(
    () => [
  {href: "/mission", label: "Mission", variant: "ghost" as const },
      { href: "/food-safety", label: "Food safety", variant: "ghost" as const },
      { href: "/faq", label: "FAQ", variant: "ghost" as const },
      { href: "/queue", label: "Check queue", variant: "ghost" as const },
    ],
    []
  );

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100]"
      initial={false}
      animate={{ opacity: headerHidden ? 0 : 1 }}
      transition={{ duration: 0.22, ease: easeOut }}
      style={{
        willChange: "opacity",
        pointerEvents: headerHidden ? "none" : "auto",
      }}
    >
      <div className="bg-transparent">
        <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
          <MotionDiv
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              duration: 1.1, // slower, more cinematic
              ease: [0.25, 0.1, 0.25, 1], // gentle ease-in-out
            }}
            className="flex items-center gap-3 min-w-0"
          >
            <Link href="/" className="flex items-center min-w-0">
              {/* ✅ FIX (same as Mission/Vision): remove any clipping during fade/slide/glow */}
              <span className="min-w-0 max-w-[170px] sm:max-w-none overflow-visible">
                {/* give the logo a tiny vertical buffer so filters/glow never get cut */}
                <span className="inline-flex shrink-0 overflow-visible py-1 -my-1">
                  <LogoCinematic size={64} wordScale={1} />
                </span>
              </span>
            </Link>

            {/* Desktop: dropdown + primary button */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <div className="relative" data-desktop-menu-root>
                <button
                  type="button"
                  onClick={() => setDesktopMenuOpen((v) => !v)}
                  aria-label={desktopMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={desktopMenuOpen}
                  className={cn(btnBase, btnGhost, "gap-2")}
                  style={{ borderColor: "rgba(252,176,64,0.35)" }}
                >
                  <span style={{ color: BRAND_BROWN }}>Menu</span>
                  <span style={{ color: BRAND_ORANGE }}>
                    <ChevronDown open={desktopMenuOpen} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {desktopMenuOpen ? (
                    <motion.div
                      key="desktop-menu"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: easeOut }}
                      className="absolute right-0 mt-3 w-[320px] origin-top-right"
                    >
                      <div
                        className="rounded-[28px] border border-slate-200 bg-white/92 backdrop-blur p-3 shadow-sm"
                        style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                      >
                        <div className="grid gap-2">
                          {navLinks.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              onClick={() => setDesktopMenuOpen(false)}
                              className={cn("w-full", btnBase, "px-5 py-3", btnGhost, "justify-start")}
                            >
                              {l.label}
                            </Link>
                          ))}
                          <Link
                            href="/join"
                            onClick={() => setDesktopMenuOpen(false)}
                            className={cn("w-full", btnBase, "px-5 py-3", btnPrimary, "justify-start")}
                          >
                            Join waitlist
                          </Link>
                        </div>

                        <div className="mt-3 text-center text-xs font-semibold text-slate-500">
                          Taste. Tap. Order.
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <Link href="/join" className={cn(btnBase, btnPrimary)}>
                Join waitlist
              </Link>
            </div>

            {/* Mobile: hamburger */}
            {!isDesktop ? (
              <div className="ml-auto shrink-0 relative md:hidden">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                  className={cn(
                    "inline-flex items-center justify-center",
                    "rounded-full border border-slate-200 bg-white/95 backdrop-blur",
                    "h-10 w-10 shadow-sm transition hover:-translate-y-[1px]"
                  )}
                  style={{ color: BRAND_ORANGE, borderColor: "rgba(252,176,64,0.35)" }}
                >
                  <HamburgerIcon open={menuOpen} />
                </button>
              </div>
            ) : null}
          </MotionDiv>
        </div>

        {/* Mobile dropdown (EXACT Mission/Vision) */}
        {!isDesktop ? (
          <AnimatePresence initial={false}>
            {menuOpen ? (
              <motion.div
                key="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: easeOut }}
                className="md:hidden overflow-hidden"
              >
                <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 pb-5">
                  <div className="mx-auto w-full max-w-[420px]">
                    <div
                      className="rounded-[28px] border border-slate-200 bg-white/92 backdrop-blur p-4 shadow-sm"
                      style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                    >
                      <div className="grid gap-2">
                        {navLinks.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setMenuOpen(false)}
                            className={cn("w-full", btnBase, "px-5 py-3", btnGhost)}
                          >
                            {l.label}
                          </Link>
                        ))}

                        <Link
                          href="/join"
                          onClick={() => setMenuOpen(false)}
                          className={cn("w-full", btnBase, "px-5 py-3", btnPrimary)}
                        >
                          Join waitlist
                        </Link>
                      </div>

                      <div className="mt-3 text-center text-xs font-semibold text-slate-500">
                        Taste. Tap. Order.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        ) : null}
      </div>
    </motion.div>
  );
}
