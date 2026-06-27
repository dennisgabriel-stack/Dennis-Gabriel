"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type Lenis from "lenis";
import { spawnBurst } from "./burst";

const emit = (n: string) => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(n));
};

const TERM = ["..booting System", "loading stack"];

export default function Intro() {
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0); // 0 load · 1/2 terminal · 3 shimmer · 4 welcome · 5 reveal
  const [hidden, setHidden] = useState(false);

  // lock scroll while visible
  useEffect(() => {
    if (hidden) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [hidden, run]);

  // replay from header logo
  useEffect(() => {
    const replay = () => {
      const lenis = (window as unknown as { lenis?: Lenis }).lenis;
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      setHidden(false);
      setRun((r) => r + 1);
    };
    window.addEventListener("replay-intro", replay);
    return () => window.removeEventListener("replay-intro", replay);
  }, []);

  // timeline
  useEffect(() => {
    setStep(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    at(600, () => {
      setStep(1);
      emit("ux-tick");
    });
    at(1600, () => {
      setStep(2);
      emit("ux-tick");
    });
    at(2700, () => {
      setStep(3);
      emit("ux-woosh");
    });
    at(3300, () => {
      setStep(4);
      emit("ux-burst");
      spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 18);
    });
    at(6000, () => setStep(5)); // hold WELCOME longer before the slow dissolve
    at(8200, () => setHidden(true));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  if (hidden) return null;

  const revealing = step >= 5;
  const welcome = step >= 4;
  const shimmer = step >= 3;

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden ${
        revealing ? "pointer-events-none" : ""
      }`}
      aria-hidden
    >
      {/* fitting background — dark + gold glow + faint grid (fades on reveal) */}
      <motion.div
        className="absolute inset-0 bg-ink"
        animate={{ opacity: revealing ? 0 : 1 }}
        transition={{ duration: 1.9, ease: [0.33, 0, 0.4, 1] }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,106,0.10),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,106,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full blur-[130px]"
          style={{ background: "#c9a86a", opacity: 0.12, animation: "aurora1 22s ease-in-out infinite" }}
        />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!welcome ? (
            <motion.div
              key="loading"
              exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* LOADING wordmark — spinning O, A replaced by the logo mark */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`flex items-center justify-center gap-[0.06em] font-display text-[2.4rem] font-bold tracking-[0.18em] text-bone md:text-6xl ${
                  shimmer ? "shimmer-gold" : ""
                }`}
              >
                <span>L</span>
                {/* spinning O */}
                <span className="relative inline-flex h-[0.9em] w-[0.9em] items-center justify-center">
                  <svg viewBox="0 0 36 36" className="h-full w-full">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(245,244,240,0.18)" strokeWidth="3" />
                    <circle
                      className="ld-spin"
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#c9a86a"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="26 200"
                    />
                  </svg>
                </span>
                {/* A → logo mark */}
                <motion.span
                  className="relative inline-block"
                  animate={{
                    filter: shimmer
                      ? "drop-shadow(0 0 14px rgba(201,168,106,0.85))"
                      : "drop-shadow(0 0 4px rgba(201,168,106,0.3))",
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src="/images/a-mark.png"
                    alt="A"
                    width={633}
                    height={622}
                    priority
                    className="inline-block h-[1em] w-auto -translate-y-[0.02em]"
                  />
                </motion.span>
                <span>D</span>
                <span>I</span>
                <span>N</span>
                <span>G</span>
              </motion.div>

              {/* terminal lines */}
              <div className="mt-8 h-12 w-[260px] font-mono text-[11px] leading-5 tracking-wide text-gold/80 md:w-[320px] md:text-xs">
                {TERM.map((line, i) => (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: step > i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-bone/40">&gt;</span> {line}
                    {step === i + 1 && <span className="term-cursor">▋</span>}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)", letterSpacing: "0.25em" }}
              animate={
                revealing
                  ? {
                      opacity: 0,
                      scale: 1.04,
                      filter: "blur(16px)",
                      letterSpacing: "0.7em",
                    }
                  : {
                      opacity: 1,
                      scale: 1,
                      filter: "blur(0px)",
                      letterSpacing: "0.42em",
                    }
              }
              transition={{
                duration: revealing ? 2 : 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-display text-4xl font-light uppercase text-bone md:text-7xl"
              style={{ textShadow: "0 0 24px rgba(245,244,240,0.25)" }}
            >
              WELCOME
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
