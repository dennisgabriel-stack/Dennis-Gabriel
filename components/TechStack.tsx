"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";
import LayerDial from "./LayerDial";

const LayerAmbient = dynamic(() => import("./three/LayerAmbient"), {
  ssr: false,
});

const ACCENTS = ["#e6c88a", "#c9a86a", "#9c8552", "#c9a05a"];

export default function TechStack() {
  const selRef = useRef(0);
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLElement>(null);

  // emerge-from-depth: this section is pulled up BEHIND the on-chain frame
  // (see -mt below). As that frame dissolves, this scales forward from small →
  // full, so it reads as the room behind the construct you flew through.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const depthScale = useTransform(scrollYProgress, [0.1, 0.92], [0.7, 1]);
  const depthOpacity = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);
  const depthBlur = useTransform(scrollYProgress, [0.1, 0.8], [12, 0]);
  const depthFilter = useTransform(depthBlur, (b) => `blur(${b}px)`);

  return (
    <section
      id="stack"
      ref={ref}
      className="relative z-10 -mt-[100svh] w-full overflow-hidden py-28 transition-colors duration-700 md:py-40"
    >
      {/* layer-reactive colour wash */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 42%, ${ACCENTS[sel]}1f, transparent 60%)`,
        }}
      />
      {/* theme-reactive 3D ambient behind everything */}
      <div className="absolute inset-0 z-0">
        <LayerAmbient selRef={selRef} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_38%,#0a0a0b_92%)]" />

      <motion.div
        style={{
          scale: depthScale,
          opacity: depthOpacity,
          filter: depthFilter,
        }}
        className="relative z-10 mx-auto max-w-7xl px-6 md:px-10"
      >
        <div className="mb-16 max-w-3xl">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-gold">
              Tech-Stack
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Eine Architektur in{" "}
              <span className="font-serif italic text-gold">vier Schichten</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-muted">
              Vom ersten Pixel bis zur skalierbaren Infrastruktur — durchdacht,
              robust und in Echtzeit. Dreh am Regler oder gib ihm Schwung; die
              Atmosphäre wechselt mit jeder Schicht.
            </p>
          </Reveal>
        </div>

        <LayerDial
          onSelect={(i) => {
            selRef.current = i;
            setSel(i);
          }}
        />
      </motion.div>
    </section>
  );
}
