// src/app/ui/PeerWorks.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

const BRAND_ORANGE = "#fcb040";
const BRAND_BROWN = "#8a6b43";

const easeOut: [number, number, number, number] = [0.2, 0.9, 0.2, 1];

function cn(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

export default function PeerWorks() {
  return (
    // ✅ IMPORTANT: keep section background transparent so it blends with whatever is above/below
    <section className="relative w-full px-6 py-20 sm:py-28 flex justify-center overflow-hidden bg-transparent">
      {/* ✅ Feathered background overlay (no visible "split") */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            // softer, mostly white + orange; brown reduced a lot
            backgroundImage: `
              radial-gradient(900px circle at 50% 78%, rgba(252,176,64,0.20), transparent 62%),
              radial-gradient(900px circle at 18% 38%, rgba(252,176,64,0.12), transparent 58%),
              radial-gradient(900px circle at 86% 82%, rgba(138,107,67,0.06), transparent 60%),
              linear-gradient(180deg, rgba(252,176,64,0.00) 0%, rgba(252,176,64,0.08) 40%, rgba(252,176,64,0.06) 75%, rgba(252,176,64,0.00) 100%)
            `,
            // ✅ feather the overlay edges so it fades in/out into surrounding sections
            WebkitMaskImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)",
            maskImage:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="text-center"
        >
          <div
            className="text-[clamp(26px,3.5vw,40px)] font-black tracking-tight"
            style={{
              backgroundImage: `linear-gradient(135deg, ${BRAND_ORANGE}, ${BRAND_BROWN})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            How it works
          </div>

          <p className="mt-3 text-[clamp(15px,2vw,18px)] font-semibold text-slate-600">
            Join in minutes. Get a code. Share. Move up the waitlist.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-12 grid gap-4">
          {[
            { n: "1", t: "Pick your role", d: "Join as a consumer or partner cook." },
            { n: "2", t: "Answer a few questions", d: "Only complete entries count." },
            { n: "3", t: "Get your link", d: "Share it to move up the waitlist." },
            { n: "4", t: "Safety first", d: "Partner Cooks follow UK hygiene rules." },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 18, scale: 0.985, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.55, ease: easeOut, delay: i * 0.06 }}
              className={cn(
                "rounded-[28px]",
                "border border-slate-200",
                "bg-white/88 backdrop-blur",
                "p-5 sm:p-6",
                "shadow-sm"
              )}
              style={{ boxShadow: "0 14px 40px rgba(2,6,23,0.06)" }}
            >
              <div className="flex items-start gap-5">
                {/* Number */}
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-extrabold text-slate-900"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_ORANGE}, ${BRAND_BROWN})`,
                  }}
                >
                  {s.n}
                </div>

                {/* Text */}
                <div>
                  <div className="font-extrabold text-slate-900 text-lg">{s.t}</div>
                  <div className="mt-1 text-slate-600 font-semibold">{s.d}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
