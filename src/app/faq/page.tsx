// src/app/faq/page.tsx
"use client";

// ✅ FAQ PAGE (client component)

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import LogoCinematic from "@/app/ui/LogoCinematic";
import { MotionDiv } from "@/app/ui/motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

type FAQItem = {
  q: string;
  a: ReactNode;
};

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

/**
 * ✅ Scroll fade wrapper:
 * - Fades in when section enters viewport
 * - Fades out when section leaves viewport (down OR up)
 * - Re-fades in when scrolling back
 */
function ScrollFade({
  children,
  className = "",
  amount = 0.55,
  y = 18,
  blur = 10,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  y?: number;
  blur?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount, margin: "0px 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y, filter: `blur(${blur}px)` }
      }
      transition={{ duration: 0.55, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function FAQPage() {
  // ✅ Header/menu state (same behavior as LogoFullScreen)
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // ✅ (needed for hamburger visibility on phones)
  const [isMobile, setIsMobile] = useState(false);

  // Header show/hide
  const [headerHidden, setHeaderHidden] = useState(false);
  const downAccumRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);

  // Touch tracking (X + Y)
  const touchXRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  useEffect(() => {
    if (menuOpen || desktopMenuOpen) setHeaderHidden(false);
  }, [menuOpen, desktopMenuOpen]);

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

      const dx = e.deltaX || 0;
      const dy = e.deltaY || 0;

      // ignore mostly-horizontal trackpad scroll so header doesn't flicker
      if (Math.abs(dx) > Math.abs(dy) * 1.15) return;
      if (Math.abs(dy) < 4) return;

      if (dy < 0) show();
      else hideAfterThreshold(dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches?.[0];
      if (!t) return;
      touchXRef.current = t.clientX;
      touchYRef.current = t.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (menuOpen || desktopMenuOpen) return;
      const t = e.touches?.[0];
      if (!t) return;

      const prevX = touchXRef.current;
      const prevY = touchYRef.current;

      touchXRef.current = t.clientX;
      touchYRef.current = t.clientY;

      if (prevX == null || prevY == null) return;

      const dx = prevX - t.clientX;
      const dy = prevY - t.clientY;

      if (Math.abs(dx) > Math.abs(dy) * 1.15) return;
      if (Math.abs(dy) < 4) return;

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

  // ✅ Mobile (<=640)
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

  // Desktop (>=768)
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

  // ✅ New menus (desktop + mobile)
  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home", variant: "ghost" as const },
      { href: "/mission", label: "Mission", variant: "ghost" as const },
      { href: "/food-safety", label: "Food safety", variant: "ghost" as const },
      { href: "/queue", label: "Check queue", variant: "ghost" as const },
    ],
    []
  );

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  // ✅ keep hamburger visible on phones (don’t let wordmark push it off-screen)
  const logoWordScale = isMobile ? 0 : 1;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* cinematic bg (subtle + consistent) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/70 to-white" />
        <motion.div
          className="absolute -left-44 top-10 h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
          style={{ background: "rgba(252,176,64,0.32)" }}
          animate={{ x: [0, 60, 0], y: [0, 22, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-52 bottom-[-140px] h-[560px] w-[560px] rounded-full blur-3xl opacity-25"
          style={{ background: "rgba(138,107,67,0.18)" }}
          animate={{ x: [0, -64, 0], y: [0, -24, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header (same UI/menu as LogoFullScreen) */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[100]"
        initial={false}
        animate={{ opacity: headerHidden ? 0 : 1, y: headerHidden ? -10 : 0 }}
        transition={{ duration: 0.22, ease: easeOut }}
        style={{
          willChange: "opacity, transform",
          pointerEvents: headerHidden ? "none" : "auto",
        }}
      >
        <div className="pointer-events-auto">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 pt-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <Link href="/" className="flex items-center">
                <LogoCinematic size={60} wordScale={logoWordScale} />
              </Link>

              {/* Desktop */}
              <div className="hidden md:flex items-center gap-3 ml-auto">
                <div className="relative" data-desktop-menu-root>
                  <button
                    type="button"
                    onClick={() => setDesktopMenuOpen((v) => !v)}
                    aria-label={desktopMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={desktopMenuOpen}
                    className={cn(btnBase, btnGhost, "gap-2")}
                    style={{ borderColor: "rgba(252,176,64,0.30)" }}
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
                        initial={{ opacity: 0, y: 10, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.985 }}
                        transition={{ duration: 0.16, ease: easeOut }}
                        className="absolute right-0 mt-3 w-[320px] origin-top-right"
                      >
                        <div
                          className="rounded-[26px] border border-slate-200 bg-white/92 backdrop-blur p-3 shadow-sm"
                          style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                        >
                          <div className="grid gap-2">
                            {navLinks.map((l) => (
                              <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setDesktopMenuOpen(false)}
                                className={cn(
                                  "w-full",
                                  "rounded-2xl px-5 py-3 font-extrabold",
                                  "border border-slate-200 bg-white/80 hover:bg-white",
                                  "transition"
                                )}
                              >
                                {l.label}
                              </Link>
                            ))}
                            <Link
                              href="/join"
                              onClick={() => setDesktopMenuOpen(false)}
                              className={cn("w-full", "rounded-2xl px-5 py-3 font-extrabold", btnPrimary)}
                            >
                              Join waitlist
                            </Link>
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

              {/* Mobile */}
              {!isDesktop ? (
                <div className="ml-auto shrink-0 relative md:hidden">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    className={cn(
                      "inline-flex items-center justify-center",
                      "rounded-full border border-slate-200/70 bg-white/60 backdrop-blur",
                      "h-10 w-10 transition hover:-translate-y-[1px]"
                    )}
                    style={{
                      color: BRAND_ORANGE,
                      borderColor: "rgba(252,176,64,0.30)",
                    }}
                  >
                    <HamburgerIcon open={menuOpen} />
                  </button>
                </div>
              ) : null}
            </MotionDiv>

            {/* Mobile dropdown */}
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
                    <div className="pt-3">
                      <div
                        className="rounded-[26px] border border-slate-200 bg-white/92 backdrop-blur p-4 shadow-sm"
                        style={{ boxShadow: "0 18px 60px rgba(2,6,23,0.10)" }}
                      >
                        <div className="grid gap-2">
                          {navLinks.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                "w-full",
                                "rounded-2xl px-5 py-3 font-extrabold",
                                "border border-slate-200 bg-white/80 hover:bg-white",
                                "transition"
                              )}
                            >
                              {l.label}
                            </Link>
                          ))}
                          <Link
                            href="/join"
                            onClick={() => setMenuOpen(false)}
                            className={cn("w-full", "rounded-2xl px-5 py-3 font-extrabold", btnPrimary)}
                          >
                            Join waitlist
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* spacer */}
      <div className="h-[84px]" />

      <FAQSection />
    </main>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

export function FAQSection({
  label = "",
  title = "Frequently asked questions",
  subtitle = "Quick answers for vendors and home cooks.",
}: {
  label?: string;
  title?: string;
  subtitle?: string;
}) {
  const items = useMemo<FAQItem[]>(
    () => [
      {
        q: "What is PeerPlates?",
        a: (
          <>
            PeerPlates is a community-driven marketplace where independent home cooks and bakers sell authentic,
            affordable food to nearby customers. You list your menu on our platform, customers pre-order in advance, and
            you prepare, cool, and package each order for pickup.
            <br />
            <br />
            PeerPlates is a one-stop shop to help you manage and grow your food business — from marketing and menu/order
            management to payments, customer support, and more.
          </>
        ),
      },
      {
        q: "What is cooking and baking on PeerPlates like?",
        a: (
          <>
            Cooking and Baking on PeerPlates is simple. You set your availability, and customers order from your menu.
            We notify you of all orders in an easy-to-read list. Once you’ve finished preparing food, you safely cool
            your dishes and package them for pickup. After pickup, you’ll be able to see customer feedback and reviews.
          </>
        ),
      },
      {
        q: "How does pickup work?",
        a: (
          <>
            You set your pickup days, order cut-off time, pickup location, and time windows. Customers select and book a
            pickup slot when placing an order.
            <br />
            <br />
            We send reminders to you and the customer 24 hours, 12 hours, and 30 minutes before pickup, as well as at
            pickup time. The customer meets you at your chosen pickup spot and shows a unique QR code for that
            transaction. You scan the QR code, and if it matches, you hand over the order — completing the transaction.
          </>
        ),
      },
      {
        q: "How many days a week can I cook or bake?",
        a: (
          <>
            It’s completely up to you. You have full control over your availability and how many items you want to sell.
            No pressure — go at your own pace.
          </>
        ),
      },
      {
        q: "Once I start cooking or baking on PeerPlates, can I take a break?",
        a: (
          <>
            Yes — of course. You control your schedule. If you’d like to pause, that’s completely fine. We’ll be here to
            support you whenever you’re ready to come back.
          </>
        ),
      },
      {
        q: "How do I get paid?",
        a: (
          <>
            We use a secure online payment processing partner. After each completed order, your earnings are added to
            your PeerPlates wallet.
          </>
        ),
      },
    ],
    []
  );

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative py-14 sm:py-18">
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero header */}
        <ScrollFade className="mx-auto max-w-3xl text-center" amount={0.5} y={18} blur={12}>
          <h1 className="mt-6 font-extrabold tracking-tight leading-[0.95] text-[clamp(2.2rem,4.6vw,3.6rem)] text-slate-900">
            {title}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})` }}
            >
              {" "}
            </span>
          </h1>

          <p className="mt-4 text-slate-600 font-semibold leading-relaxed">{subtitle}</p>
        </ScrollFade>

        {/* Cards */}
        <div className="mx-auto mt-10 sm:mt-12 max-w-3xl grid gap-4">
          {items.map((it, i) => {
            const open = openIdx === i;

            return (
              <ScrollFade key={it.q} amount={0.35} y={14} blur={10}>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-[28px] border bg-white/88 backdrop-blur shadow-sm",
                    open ? "border-[rgba(252,176,64,0.38)]" : "border-slate-200"
                  )}
                  style={{
                    boxShadow: open
                      ? "0 18px 60px rgba(2,6,23,0.07), 0 0 0 1px rgba(252,176,64,0.14)"
                      : "0 18px 60px rgba(2,6,23,0.07)",
                  }}
                >
                  {/* subtle glow */}
                  <div
                    className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl opacity-15"
                    style={{ background: `rgba(252,176,64,0.55)` }}
                  />
                  <div
                    className="pointer-events-none absolute -left-28 -bottom-28 h-60 w-60 rounded-full blur-3xl opacity-10"
                    style={{ background: `rgba(138,107,67,0.45)` }}
                  />

                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : i)}
                    className={cn(
                      "w-full px-6 sm:px-7 py-5 flex items-center justify-between gap-4 text-left",
                      "focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(252,176,64,0.25)]"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-base sm:text-lg font-extrabold text-slate-900">{it.q}</div>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-2xl border flex items-center justify-center transition",
                          open ? "bg-[rgba(252,176,64,0.10)]" : "bg-white/85"
                        )}
                        style={{
                          borderColor: open ? "rgba(252,176,64,0.45)" : "rgba(226,232,240,1)",
                        }}
                      >
                        <ChevronIcon open={open} />
                      </div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.2, 0.9, 0.2, 1] }}
                      >
                        <div className="px-6 sm:px-7 pb-6 text-slate-700 font-semibold leading-relaxed">
                          <div className="h-px w-full bg-slate-200/70 mb-4" />
                          {it.a}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </ScrollFade>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mx-auto mt-10 max-w-3xl border-t border-slate-200 pt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} PeerPlates
        </div>
      </div>
    </section>
  );
}
