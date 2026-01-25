// src/app/page.tsx
"use client";

import LogoFullScreen from "@/app/ui/LogoFullScreen";
import PeerWorks from "@/app/ui/PeerWorks";
import ScrollShowcase from "@/app/ui/ScrollShowcase";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";
const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

/* ---------------- In-view helper ---------------- */
function useInViewAmount<T extends HTMLElement>(amount = 0.55) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: amount,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [amount]);

  return { ref, inView };
}

/* ---------------- Eat Better Section ---------------- */
function EatBetterSection() {
  const { ref, inView } = useInViewAmount<HTMLElement>(0.35);

  return (
    <section
      ref={ref}
      className="relative w-full px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 flex justify-center"
    >
      <motion.div
        initial={false}
        animate={
          inView
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 22, scale: 0.985, filter: "blur(12px)" }
        }
        transition={{ duration: 0.75, ease: easeOut }}
        className="w-full max-w-3xl text-center"
      >
        <h2 className="text-[clamp(30px,4vw,54px)] font-black tracking-tight leading-[1.05]">
          <span
            style={{
              backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE} 10%, ${BRAND_BROWN} 90%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Eat better and back local:
          </span>
        </h2>

        <div className="h-6" />

        <p className="text-[clamp(18px,2.2vw,26px)] font-semibold leading-[1.25] text-slate-700">
          authentic home-cooked meals from trusted cooks and bakers.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/join"
            className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] bg-[#fcb040] text-slate-900"
          >
            Join waitlist
          </a>

          <a
            href="/queue"
            className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 font-extrabold shadow-sm transition hover:-translate-y-[1px] border border-slate-200 bg-white/90 backdrop-blur text-slate-900 hover:bg-slate-50"
          >
            Check queue
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ================= COOKIES (Consent Banner) ================= */

type CookiePrefs = {
  essential: true; // always true
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_COOKIE = "pp_cookie_consent_v1";
const CONSENT_DAYS = 180;

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) return decodeURIComponent(p.slice(name.length + 1));
  }
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function safeParsePrefs(raw: string | null): CookiePrefs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookiePrefs>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      essential: true,
      analytics: Boolean((parsed as any).analytics),
      marketing: Boolean((parsed as any).marketing),
    };
  } catch {
    return null;
  }
}

function CookieConsent() {
  const [mounted, setMounted] = useState(false);

  // ✅ This state is the source of truth for whether the banner shows
  const [consent, setConsent] = useState<CookiePrefs | null>(null);

  // UI states
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    setMounted(true);
    const existing = safeParsePrefs(getCookie(CONSENT_COOKIE));
    setConsent(existing);
    if (existing) setPrefs(existing);
  }, []);

  const shouldShow = mounted && consent === null;

  function persist(next: CookiePrefs) {
    // ✅ Set cookie
    setCookie(CONSENT_COOKIE, JSON.stringify(next), CONSENT_DAYS);

    // ✅ Update UI immediately (this is what your old version didn't do)
    setConsent(next);
    setPrefs(next);
    setOpen(false);

    // ✅ Hook for enabling analytics/marketing AFTER consent:
    // if (next.analytics) initAnalytics();
    // if (next.marketing) initMarketingPixels();
  }

  function acceptAll() {
    persist({ essential: true, analytics: true, marketing: true });
  }

  function rejectNonEssential() {
    persist({ essential: true, analytics: false, marketing: false });
  }

  function saveChoices() {
    persist({ ...prefs, essential: true });
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <>
          {/* Banner */}
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="fixed bottom-4 left-0 right-0 z-[70] px-4 sm:px-6"
          >
            <div
              className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.12)] overflow-hidden"
              style={{
                boxShadow:
                  "0 18px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset",
              }}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 h-10 w-10 rounded-2xl grid place-items-center"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND_ORANGE} 0%, ${BRAND_BROWN} 100%)`,
                    }}
                  >
                    <span className="text-white text-lg font-black">🍪</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 font-extrabold tracking-tight">
                      Cookies on PeerPlates
                    </div>
                    <div className="mt-1 text-[13.5px] leading-snug text-slate-600">
                      We use essential cookies to make the site work (like security and sessions).
                      With your OK, we’ll also use analytics to improve the experience and marketing
                      cookies to show relevant content.
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
                      <button
                        onClick={acceptAll}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold text-slate-900 transition hover:-translate-y-[1px]"
                        style={{
                          background: BRAND_ORANGE,
                          boxShadow: "0 10px 24px rgba(252,176,64,0.35)",
                        }}
                      >
                        Accept all
                      </button>

                      <button
                        onClick={rejectNonEssential}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold text-slate-900 border border-slate-200 bg-white/80 backdrop-blur transition hover:-translate-y-[1px] hover:bg-slate-50"
                      >
                        Reject non-essential
                      </button>

                      <button
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold text-slate-700 border border-transparent bg-transparent transition hover:bg-slate-100/70"
                      >
                        Manage
                      </button>

                      <a
                        href="/privacy"
                        className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 underline underline-offset-4 sm:ml-auto"
                      >
                        Privacy & cookies
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="h-[2px] w-full"
                style={{ background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})` }}
              />
            </div>
          </motion.div>

          {/* Manage modal */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: easeOut }}
                className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm px-4 py-8 grid place-items-center"
                role="dialog"
                aria-modal="true"
                aria-label="Cookie preferences"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(10px)" }}
                  transition={{ duration: 0.28, ease: easeOut }}
                  className="w-full max-w-xl rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-slate-900 text-lg font-black tracking-tight">
                          Cookie preferences
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Choose what you’re comfortable with. Essential cookies are always on.
                        </div>
                      </div>

                      <button
                        onClick={() => setOpen(false)}
                        className="rounded-2xl px-3 py-2 text-slate-700 font-extrabold bg-slate-100 hover:bg-slate-200 transition"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {/* Essential */}
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-extrabold text-slate-900">Essential</div>
                            <div className="mt-1 text-sm text-slate-600">
                              Needed for security, page navigation, and core features.
                            </div>
                          </div>
                          <div className="shrink-0 rounded-full px-3 py-1 text-xs font-extrabold bg-slate-100 text-slate-700">
                            Always on
                          </div>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-extrabold text-slate-900">Analytics</div>
                            <div className="mt-1 text-sm text-slate-600">
                              Helps us understand what’s working so we can improve the experience.
                            </div>
                          </div>

                          <label className="shrink-0 inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={prefs.analytics}
                              onChange={(e) =>
                                setPrefs((p) => ({ ...p, analytics: e.target.checked }))
                              }
                            />
                            <span
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                                prefs.analytics ? "bg-slate-900" : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                                  prefs.analytics ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Marketing */}
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-extrabold text-slate-900">Marketing</div>
                            <div className="mt-1 text-sm text-slate-600">
                              Used to personalize content and measure campaign performance.
                            </div>
                          </div>

                          <label className="shrink-0 inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={prefs.marketing}
                              onChange={(e) =>
                                setPrefs((p) => ({ ...p, marketing: e.target.checked }))
                              }
                            />
                            <span
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                                prefs.marketing ? "bg-slate-900" : "bg-slate-200"
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                                  prefs.marketing ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={rejectNonEssential}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition"
                      >
                        Reject non-essential
                      </button>

                      <button
                        onClick={acceptAll}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold text-slate-900 transition hover:-translate-y-[1px]"
                        style={{
                          background: BRAND_ORANGE,
                          boxShadow: "0 10px 24px rgba(252,176,64,0.35)",
                        }}
                      >
                        Accept all
                      </button>

                      <button
                        onClick={saveChoices}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 font-extrabold text-white transition hover:-translate-y-[1px] sm:ml-auto"
                        style={{
                          background: BRAND_BROWN,
                          boxShadow: "0 10px 24px rgba(138,107,67,0.28)",
                        }}
                      >
                        Save choices
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      You can update this anytime by clearing cookies in your browser.
                    </div>
                  </div>

                  <div
                    className="h-[2px] w-full"
                    style={{ background: `linear-gradient(90deg, ${BRAND_ORANGE}, ${BRAND_BROWN})` }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------------- HOME ---------------- */
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      <div className="rounded-none" style={{ borderRadius: 0 }}>
        <LogoFullScreen />
      </div>

      <PeerWorks />

      <ScrollShowcase
        heading=""
        subheading="See how PeerPlates makes ordering and managing home-cooked food effortless."
        direction="ltr"
        snap={true}
        tilt={false}
        items={[
          {
            image: "/images/gallery/gallery1.jpeg",
            kicker: "Highlights",
            title: "TikTok-style scroll experience, built for ordering.",
            subtitle: "",
            desc: 'Discover home-cooked meals in short, shoppable videos. Tap “Add to cart” straight from the video.',
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery2.jpeg",
            kicker: "Highlights",
            title: "Highlights that make choosing effortless.",
            subtitle: "",
            desc: "Short, snackable previews that help you decide in seconds, perfect for busy students.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery3.jpeg",
            kicker: "Menu",
            title: "No back-and-forth. Just orders.",
            subtitle: "",
            desc: "A proper storefront for home-cooked meals where you can browse categories, see prices upfront, and checkout in seconds.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery4.jpeg",
            kicker: "Vendor profiles",
            title: "Grow your community.",
            subtitle: "",
            desc: "Build a loyal following with your own vendor profile. Customers can follow you, view your posts, and stay updated on your collection days and latest drops.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery5.jpeg",
            kicker: "Analytics",
            title: "Eliminate the guesswork — PeerPlates tracks it for you.",
            subtitle: "",
            desc: "Orders, revenue, customer activity, and peak times, all in one clean dashboard.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery6.png",
            kicker: "Analytics",
            title: "Know what's working",
            subtitle: "",
            desc: "See what’s selling fastest, and double down on the dishes that drive revenue.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery7.jpeg",
            kicker: "Order management",
            title: "Set a cutoff. Stay in control.",
            subtitle: "",
            desc: "Orders close when you say so. Choose how far in advance customers must order, so you’ve got time to prep and don’t get overloaded.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery9.jpeg",
            kicker: "Order management",
            title: "Your kitchen. Your rules. Set slots. Cap orders. Keep control.",
            subtitle: "",
            desc: "You decide when you’re taking orders and when you’re not. PeerPlates fits around your life, not the other way around.",
            stackedDesktop: true,
          },
          {
            image: "/images/gallery/gallery10 copy.jpeg",
            kicker: "Order management",
            title: "Stay organised. Avoid mix-ups.",
            subtitle: "",
            desc: "Filter orders by pickup date so you can track what’s due today, this week, or a specific day, and make sure each order goes to the right customer.",
            stackedDesktop: true,
          },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 sm:mt-12 border-t border-slate-200 pt-6 pb-10 text-sm text-slate-500">
          © {new Date().getFullYear()} PeerPlates
        </div>
      </div>

      {/* ✅ Cookies banner + preferences */}
      <CookieConsent />
    </main>
  );
}
