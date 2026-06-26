"use client";

import dynamic from "next/dynamic";
import Reveal from "./Reveal";

const LayerStack = dynamic(() => import("./three/LayerStack"), { ssr: false });

export default function TechStack() {
  return (
    <section id="stack" className="relative w-full overflow-hidden py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-10 max-w-3xl">
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
              robust und in Echtzeit. Ziehen zum Drehen, über eine Schicht fahren
              zum Fokussieren.
            </p>
          </Reveal>
        </div>
      </div>

      {/* interactive 3D layer stack */}
      <div className="relative h-[72vh] w-full md:h-[80vh]">
        <LayerStack />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" />
      </div>
    </section>
  );
}
