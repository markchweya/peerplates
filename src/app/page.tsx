// src/app/page.tsx
"use client";

import LogoFullScreen from "@/app/ui/LogoFullScreen";
import TopGallery from "@/app/ui/TopGallery";
import PeerWorks from "@/app/ui/PeerWorks";
import ScrollShowcase from "@/app/ui/ScrollShowcase";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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

        {/* ✅ FIX: add the buttons back */}
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

/* ---------------- HOME ---------------- */
export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
      {/* ✅ Fix: force the fullscreen logo area to render with square corners */}
      <div className="rounded-none" style={{ borderRadius: 0 }}>
        <LogoFullScreen />
      </div>

      <EatBetterSection />
      <TopGallery />

      {/* HOW IT WORKS (your section) */}
      <PeerWorks />

      {/* APP PREVIEWS (below How it works) */}
      <ScrollShowcase
        heading="App Previews"
        subheading="See how PeerPlates makes ordering and managing home-cooked food effortless."
        direction="ltr"
        snap={true}
        tilt={false}
        nav={[
          { label: "Ordering", index: 0 },
          { label: "Storefront", index: 2 },
          { label: "Vendor", index: 3 },
          { label: "Analytics", index: 4 },
          { label: "Operations", index: 6 },
        ]}
        items={[
          {
            image: "/images/gallery/gallery1.jpeg",
            kicker: "Highlights",
            title: "TikTok-style scroll experience, built for ordering.",
            subtitle: "",
            desc: 'Discover home-cooked meals in short, shoppable videos — tap “Add to cart” straight from the video.',
          },
          {
            image: "/images/gallery/gallery2.jpeg",
            kicker: "Highlights",
            title: "Highlights that make choosing effortless.",
            subtitle: "",
            desc: "Short, snackable previews that help you decide in seconds — perfect for busy students.",
          },
          {
            image: "/images/gallery/gallery3.jpeg",
            kicker: "Menu",
            title: "No back-and-forth. Just orders.",
            subtitle: "",
            desc: "A proper storefront for home-cooked meals: browse categories, see prices upfront, and checkout in seconds.",
          },
          {
            image: "/images/gallery/gallery4.jpeg",
            kicker: "Vendor profiles",
            title: "Grow your community.",
            subtitle: "",
            desc: "Build a loyal following with your own vendor profile — customers can follow, view your posts, and stay updated on your collection days and latest drops.",
          },
          {
            image: "/images/gallery/gallery5.jpeg",
            kicker: "Analytics",
            title: "Eliminate the guesswork — PeerPlates tracks it for you.",
            subtitle: "",
            desc: "Orders, revenue, customer activity, peak times — all in one clean dashboard.",
          },
          {
            image: "/images/gallery/gallery6.png",
            kicker: "Analytics",
            title: "Know what's working",
            subtitle: "",
            desc: "See what's moving fastest — and double down on the dishes that drive revenue",
          },
          {
            image: "/images/gallery/gallery7.jpeg",
            kicker: "Order management",
            title: "Set a cutoff. Stay in control.",
            subtitle: "",
            desc: "Orders close when you say so.Choose how far in advance customers must order — so you’ve got time to prep and don’t get overloaded.",
          },
          {
            image: "/images/gallery/gallery9.jpeg",
            kicker: "Order management",
            title: "Your kitchen. Your rules. Set slots. Cap orders. Keep control.",
            subtitle: "",
            desc: "You decide when you’re taking orders and when you’re not. PeerPlates fits around your life — not the other way round.",
          },
          {
            image: "/images/gallery/gallery10.png",
            kicker: "Order management",
            title: "Stay organised. Avoid mix-ups.",
            subtitle: "",
            desc: "Filter orders by pickup date so you can track what’s due today, this week, or a specific day — and make sure each order goes to the right customer.",
          },
        ]}
      />

      {/* Footer */}
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-10 sm:mt-12 border-t border-slate-200 pt-6 pb-10 text-sm text-slate-500">
          © {new Date().getFullYear()} PeerPlates
        </div>
      </div>
    </main>
  );
}
