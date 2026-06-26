"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import Reveal from "./Reveal";
import LayerDial from "./LayerDial";

const LayerAmbient = dynamic(() => import("./three/LayerAmbient"), {
  ssr: false,
});

export default function TechStack() {
  const selRef = useRef(0);

  return (
    <section
      id="stack"
      className="relative w-full overflow-hidden py-28 md:py-40"
    >
      {/* theme-reactive 3D ambient behind everything */}
      <div className="absolute inset-0 z-0">
        <LayerAmbient selRef={selRef} />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,#0a0a0b_92%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
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

        <LayerDial onSelect={(i) => (selRef.current = i)} />
      </div>
    </section>
  );
}
