"use client";

import { motion } from "framer-motion";

export default function BigTitle({
  lead,
  accent,
  accentClassName = "text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#fcb040] to-slate-900",
}: {
  lead: string;
  accent: string;
  accentClassName?: string;
}) {
  return (
    <div className="pt-8 sm:pt-10">
      <motion.h1
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.65 }}
        transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
        className="tracking-tight leading-[0.92] font-extrabold text-[clamp(2.4rem,6.8vw,5.4rem)]"
      >
        <span className="text-slate-900">{lead} </span>
        <span className={accentClassName}>{accent}</span>
        <span className="text-slate-900">.</span>
      </motion.h1>
    </div>
  );
}
