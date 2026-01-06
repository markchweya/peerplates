// src/app/thanks/page.tsx
"use client";

import Link from "next/link";
import LogoCinematic from "@/app/ui/LogoCinematic";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MotionDiv } from "@/app/ui/motion";
import { AnimatePresence, motion } from "framer-motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

export default function ThanksPage() {
  return (
    <Suspense fallback={<ThanksFallback />}>
      <ThanksInner />
    </Suspense>
  );
}

function ThanksFallback() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="rounded-3xl border border-[#fcb040] bg-white p-5 sm:p-7 shadow-sm">
          <div className="text-lg font-extrabold">Loading…</div>
          <div className="mt-2 text-sm text-slate-600">Preparing your referral link.</div>
        </div>
      </div>
    </main>
  );
}

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function CheckIcon({ className = "" }: { className?: string }) {
  // modern checkmark (NOT emoji)
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M20 6.8 9.6 17.2 4 11.6"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm backdrop-blur">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: BRAND_ORANGE }} />
      <span>You’re on the waitlist</span>
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full"
        style={{
          background: "rgba(252,176,64,0.18)",
          boxShadow: "0 0 0 1px rgba(252,176,64,0.35), 0 12px 30px rgba(252,176,64,0.22)",
          color: "#0f172a",
        }}
        aria-hidden="true"
      >
        <CheckIcon className="h-4 w-4" />
      </span>
    </div>
  );
}

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

function ThanksInner() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";
  const code = sp.get("code") || "";
  const role = (sp.get("role") as "consumer" | "vendor" | null) || "consumer";

  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Only used for consumers
  const [position, setPosition] = useState<number | null>(null);
  const [posLoading, setPosLoading] = useState(false);

  // ✅ Vision-style menus (desktop dropdown + join button, mobile hamburger)
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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

  // ✅ menu links (EXACTLY like vision/page.tsx)
  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home", variant: "ghost" as const },
      { href: "/mission", label: "Mission", variant: "ghost" as const },
      { href: "/food-safety", label: "Food safety", variant: "ghost" as const },
        { href: "/faq", label: "FAQ", variant: "ghost" as const },
      { href: "/queue", label: "Check queue", variant: "ghost" as const },
      { href: "/join", label: "Join waitlist", variant: "primary" as const },
    ],
    []
  );

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] whitespace-nowrap";
  const btnGhost = "border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50";
  const btnPrimary = "bg-[#fcb040] text-slate-900 hover:opacity-95";

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // ✅ Always share the chooser page, not consumer/vendor directly
  const referralLink = useMemo(() => {
    if (!code || !baseUrl) return "";
    return `${baseUrl}/join?ref=${encodeURIComponent(code)}`;
  }, [code, baseUrl]);

  useEffect(() => {
    if (!id) return;
    if (role !== "consumer") return;

    setPosLoading(true);
    fetch(`/api/queue-position?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.position === "number") setPosition(d.position);
        else setPosition(null);
      })
      .finally(() => setPosLoading(false));
  }, [id, role]);

  const copy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const isConsumer = role === "consumer";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <style>{`
        .pp-tap { -webkit-tap-highlight-color: transparent; user-select:none; }
      `}</style>

      {/* soft cinematic background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/70 to-white" />
        <div
          className="absolute -top-28 -left-28 h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
          style={{ background: "rgba(252,176,64,0.35)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[640px] w-[640px] rounded-full blur-3xl opacity-25"
          style={{ background: "rgba(138,107,67,0.22)" }}
        />
      </div>

      {/* ✅ Header — EXACTLY like vision/page.tsx */}
      <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-auto">
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-6 lg:px-8 py-4">
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 min-w-0"
            >
              <Link href="/" className="flex items-center min-w-0">
                {/* ✅ FIX: do NOT use overflow-hidden here (it clips the logo fade/slide/glow).
                    keep layout constraints via max-width, but allow overflow to render. */}
                <span className="min-w-0 max-w-[170px] sm:max-w-none overflow-visible">
                  {/* small vertical breathing room prevents filter/glow clipping in some browsers */}
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
                        transition={{ duration: 0.16, ease: [0.2, 0.9, 0.2, 1] }}
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

                          <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
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

          {/* Mobile dropdown */}
          {!isDesktop ? (
            <AnimatePresence initial={false}>
              {menuOpen ? (
                <motion.div
                  key="mobile-menu"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.2, 0.9, 0.2, 1] }}
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

                        <div className="mt-3 text-center text-xs font-semibold text-slate-500">Taste. Tap. Order.</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : null}
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[84px]" />

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <MotionDiv
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mt-6 rounded-[36px] border border-[#fcb040]/60 bg-white/85 backdrop-blur p-6 sm:p-8 shadow-sm"
          style={{ boxShadow: "0 22px 70px rgba(2,6,23,0.10)" }}
        >
          <h1 className="text-[clamp(2.0rem,4vw,2.8rem)] font-extrabold tracking-tight leading-[0.95]">
            Thanks for joining{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})` }}
            >
              PeerPlates.
            </span>
          </h1>

          <p className="mt-3 text-slate-900/70 text-sm sm:text-base font-semibold">
            We’ll email you with updates and early access.
          </p>

          {isConsumer ? (
            <div className="mt-6 rounded-3xl border border-[#fcb040]/55 bg-white p-5">
              <div className="text-sm font-extrabold">Your queue position</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight">
                {id ? (posLoading ? "Loading…" : position ? `#${position}` : "—") : "—"}
              </div>
              <div className="mt-1 text-xs text-slate-900/60">MVP estimate based on signup time and role.</div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-[#fcb040]/55 bg-white p-5">
              <div className="text-sm font-extrabold">Vendor review</div>
              <div className="mt-2 text-sm text-slate-900/70 font-semibold leading-relaxed">
                We’ll review your application and email you as soon as you’re approved for early access.
              </div>
            </div>
          )}

          {code ? (
            <div className="mt-7 grid gap-3 rounded-3xl border border-[#fcb040]/55 bg-white p-5">
              <div className="text-sm font-extrabold">Your referral link</div>

              <div className="rounded-2xl border border-[#fcb040]/60 bg-white px-4 py-3 font-mono text-sm break-all">
                {referralLink || "Generating link…"}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={copy}
                  disabled={!referralLink}
                  className="rounded-2xl bg-[#fcb040] px-6 py-3 text-center font-extrabold text-slate-900 transition hover:opacity-95 hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>

                <Link
                  href="/"
                  className="rounded-2xl border border-[#fcb040]/60 bg-white px-6 py-3 text-center font-extrabold text-slate-900 transition hover:-translate-y-[1px]"
                >
                  Back to home
                </Link>
              </div>

              <div className="text-xs text-slate-900/60">
                Share your link with friends. Referrals help consumers move up the queue.
              </div>
            </div>
          ) : (
            <div className="mt-7 rounded-3xl border border-[#fcb040]/55 bg-white p-5">
              <div className="text-sm font-semibold">Your signup is saved.</div>
              <div className="mt-1 text-sm text-slate-900/70">
                (Referral code missing from the URL — that’s okay. We can still look you up by email.)
              </div>
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-flex rounded-2xl bg-[#fcb040] px-6 py-3 text-center font-extrabold text-slate-900 transition hover:opacity-95 hover:-translate-y-[1px]"
                >
                  Back to home
                </Link>
              </div>
            </div>
          )}

          {id ? (
            <div className="mt-6 text-xs text-slate-900/50">
              Reference ID: <span className="font-mono">{id}</span>
            </div>
          ) : null}
        </MotionDiv>
      </div>
    </main>
  );
}
