"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";

const TransactionFlow = dynamic(() => import("./three/TransactionFlow"), {
  ssr: false,
});

const STAGES = [
  {
    k: "01 · Eingang",
    t: "Ingest",
    d: "Tausende Datenpunkte treffen ungeordnet ein — roh, asynchron, ohne Struktur.",
  },
  {
    k: "02 · Reihenfolge",
    t: "Sequenzierung",
    d: "Der Orchestrator bringt jeden Vorgang in exakte Ordnung. Aus Chaos wird ein deterministischer Strom.",
  },
  {
    k: "03 · Prüfung",
    t: "Security-Layer",
    d: "Mehrstufige Gates scannen jede Einheit. Was nicht besteht, wird isoliert und verworfen.",
  },
  {
    k: "04 · Koordination",
    t: "Orchestrierung",
    d: "Der Kern verteilt Last, Rechte und Verantwortung — koordiniert statt zufällig.",
  },
  {
    k: "05 · Verteilung",
    t: "Distribution",
    d: "Jeder Datensatz wird an exakt sein Ziel geroutet — parallel, geordnet, verlustfrei.",
  },
  {
    k: "06 · Abschluss",
    t: "Settlement",
    d: "Geprüft, sortiert, final. Komplexität, die sich selbst trägt.",
  },
];

const CENTERS = [0.07, 0.24, 0.42, 0.6, 0.78, 0.93];

function Caption({ i, p }: { i: number; p: MotionValue<number> }) {
  const c = CENTERS[i];
  const w = 0.1;
  const opacity = useTransform(p, [c - w, c - 0.03, c + 0.03, c + w], [0, 1, 1, 0]);
  const y = useTransform(p, [c - w, c + w], [50, -50]);
  const s = STAGES[i];
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-0 will-change-transform md:inset-x-auto md:bottom-auto md:top-0"
    >
      <p className="text-xs uppercase tracking-[0.4em] text-gold">{s.k}</p>
      <h3 className="mt-4 font-display text-4xl font-bold leading-[0.95] md:text-6xl">
        {s.t}
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-muted md:text-lg">
        {s.d}
      </p>
    </motion.div>
  );
}

function RailItem({ i, p }: { i: number; p: MotionValue<number> }) {
  const c = CENTERS[i];
  const active = useTransform(p, [c - 0.09, c, c + 0.09], [0.25, 1, 0.25]);
  const scaleX = useTransform(p, [c - 0.09, c, c + 0.09], [0.3, 1, 0.3]);
  return (
    <motion.div style={{ opacity: active }} className="flex items-center gap-3">
      <div className="relative h-px w-8 bg-bone/20">
        <motion.div
          style={{ scaleX }}
          className="absolute inset-0 origin-left bg-gold"
        />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
        {STAGES[i].t}
      </span>
    </motion.div>
  );
}

export default function TransactionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const prev = useRef(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    // woosh each time we fly through a stage boundary
    const p0 = prev.current;
    for (const c of CENTERS) {
      if ((p0 < c && v >= c) || (p0 > c && v <= c)) {
        window.dispatchEvent(new CustomEvent("ux-woosh"));
        break;
      }
    }
    prev.current = v;
  });

  return (
    <section id="onchain" ref={ref} className="relative h-[460vh] w-full">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* 3D orchestration pipeline */}
        <div className="absolute inset-0 z-0">
          <TransactionFlow progressRef={progress} />
        </div>

        {/* cinematic depth overlays */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,#0a0a0b_95%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

        {/* section heading */}
        <div className="absolute left-6 top-20 z-20 md:left-10 md:top-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted">
            On-Chain · Orchestrierung
          </p>
        </div>

        {/* stage rail (desktop) */}
        <div className="absolute right-10 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 text-muted md:flex">
          {STAGES.map((_, i) => (
            <RailItem key={i} i={i} p={scrollYProgress} />
          ))}
        </div>

        {/* scroll-driven phase captions */}
        <div className="absolute inset-x-0 bottom-12 z-20 px-6 md:bottom-auto md:left-10 md:top-1/2 md:w-[42%] md:-translate-y-1/2 md:px-0">
          <div className="relative h-52">
            {STAGES.map((_, i) => (
              <Caption key={i} i={i} p={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
