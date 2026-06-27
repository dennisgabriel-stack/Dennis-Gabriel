"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, animate } from "framer-motion";

export default function Intro() {
  const [stage, setStage] = useState<"load" | "open" | "done">("load");
  const [pct, setPct] = useState(0);

  // count 0 → 100 while loading, then trigger the reveal
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = animate(0, 100, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setPct(Math.round(v)),
      onComplete: () => setTimeout(() => setStage("open"), 400),
    });
    return () => {
      controls.stop();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // finish + unmount after the doors have parted
  useEffect(() => {
    if (stage !== "open") return;
    const t = setTimeout(() => {
      document.body.style.overflow = "";
      setStage("done");
    }, 1150);
    return () => clearTimeout(t);
  }, [stage]);

  if (stage === "done") return null;

  const opening = stage === "open";
  const skip = () => stage === "load" && setStage("open");
  const doorEase = [0.76, 0, 0.24, 1] as const;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      aria-hidden
      onClick={skip}
    >
      {/* upper & lower doors that split apart on reveal */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-ink"
        animate={{ y: opening ? "-101%" : "0%" }}
        transition={{ duration: 1.05, ease: doorEase }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
        animate={{ y: opening ? "101%" : "0%" }}
        transition={{ duration: 1.05, ease: doorEase }}
      />

      {/* faint radial gold glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,106,0.10),transparent_60%)]" />

      {/* glowing seam at the split line */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gold to-transparent"
        initial={{ opacity: 0, scaleX: 0.2 }}
        animate={{
          opacity: opening ? [0.9, 1, 0] : 0.5,
          scaleX: opening ? 1 : 0.5,
        }}
        transition={{ duration: opening ? 1.05 : 1.2, ease: "easeInOut" }}
        style={{ boxShadow: "0 0 18px rgba(201,168,106,0.6)" }}
      />

      {/* centre content — fades & zooms out as the doors open */}
      <motion.div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-7"
        animate={{
          opacity: opening ? 0 : 1,
          scale: opening ? 1.18 : 1,
          filter: opening ? "blur(6px)" : "blur(0px)",
        }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* expanding HUD ring behind the mark */}
        <motion.span
          className="absolute h-44 w-44 rounded-full border border-gold/25 md:h-56 md:w-56"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.6, 0.25], scale: [0.6, 1.05, 1] }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
        <motion.span
          className="absolute h-44 w-44 rounded-full border border-gold/15 md:h-56 md:w-56"
          animate={{ scale: [1, 1.35], opacity: [0.3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />

        {/* logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.65, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ filter: "drop-shadow(0 0 26px rgba(201,168,106,0.4))" }}
        >
          <Image
            src="/images/logo.png"
            alt="ARCHANGEL"
            width={1158}
            height={813}
            priority
            className="h-28 w-auto md:h-36"
          />
        </motion.div>

        {/* progress bar */}
        <div className="relative h-px w-48 overflow-hidden bg-bone/15 md:w-64">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gold"
            style={{ width: `${pct}%`, boxShadow: "0 0 10px rgba(201,168,106,0.8)" }}
          />
        </div>

        {/* brand + counter */}
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.4em]">
          <span className="shimmer-gold font-display font-bold tracking-[0.3em]">
            ARCHANGEL//DEV
          </span>
          <span className="tabular-nums text-bone/60">
            {pct.toString().padStart(3, "0")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
