"use client";

import { motion, useInView, type Variants } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function TopGallery() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.2, once: false });

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // ❌ removed rounded-3xl
  const img = "relative overflow-hidden shadow-sm";

  return (
    <section className="relative w-full bg-white py-12 sm:py-14">
      <div ref={ref} className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* ================= DESKTOP ================= */}
        <div className="hidden md:grid grid-cols-12 gap-6">
          {/* HERO */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={`col-span-7 aspect-[16/11] ${img}`}
          >
            <Image
              src="/images/gallery/gallery11.png"
              alt="Home cooked meal"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* STACK RIGHT */}
          <div className="col-span-5 flex flex-col gap-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`aspect-[4/3] ${img}`}
            >
              <Image
                src="/images/gallery/gallery12.png"
                alt="Baked goods"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`aspect-[4/3] ${img}`}
            >
              <Image
                src="/images/gallery/gallery14.png"
                alt="Fresh pastries"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* FULL-WIDTH BOTTOM */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={`col-span-12 aspect-[21/9] ${img}`}
          >
            <Image
              src="/images/gallery/gallery15.png"
              alt="Cinnamon rolls"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden space-y-5">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={`aspect-[4/3] ${img}`}
          >
            <Image
              src="/images/gallery/gallery11.png"
              alt="Home cooked meal"
              fill
              className="object-cover"
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`aspect-square ${img}`}
            >
              <Image
                src="/images/gallery/gallery12.png"
                alt="Baked goods"
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className={`aspect-square ${img}`}
            >
              <Image
                src="/images/gallery/gallery14.png"
                alt="Fresh pastries"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className={`aspect-[4/3] ${img}`}
          >
            <Image
              src="/images/gallery/gallery15.png"
              alt="Cinnamon rolls"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
