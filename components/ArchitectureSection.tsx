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

const ArchitectureCube = dynamic(() => import("./three/ArchitectureCube"), {
  ssr: false,
});

const STORY = [
  {
    k: "01 · Architektur",
    t: "Die Achse",
    d: "Jede komplexe Architektur beginnt mit einer einzigen, klaren Entscheidung — einer Linie, die alles Weitere ausrichtet.",
  },
  {
    k: "02 · System",
    t: "Das Raster",
    d: "Aus der Linie wächst ein System. Schicht für Schicht, Modul für Modul — bewusst gesetzt und exakt vermessen.",
  },
  {
    k: "03 · Struktur",
    t: "Die Ordnung",
    d: "Nichts ist zufällig und alles ist bedacht konstruiert. Jede Verbindung trägt Last, jede Kante hat ein Maß.",
  },
  {
    k: "04 · Ganzes",
    t: "Das Zusammenspiel",
    d: "Design und Code verschmelzen zu einer Struktur, die sich dreht, ohne je zu kippen.",
  },
];

const CENTERS = [0.13, 0.38, 0.63, 0.86];

function StoryPanel({
  i,
  p,
}: {
  i: number;
  p: MotionValue<number>;
}) {
  const c = CENTERS[i];
  const opacity = useTransform(
    p,
    [c - 0.14, c - 0.05, c + 0.05, c + 0.14],
    [0, 1, 1, 0]
  );
  const y = useTransform(p, [c - 0.14, c + 0.14], [40, -40]);
  const s = STORY[i];
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 top-0 will-change-transform"
    >
      <p className="text-xs uppercase tracking-[0.4em] text-gold">{s.k}</p>
      <h3 className="mt-5 font-display text-4xl font-bold leading-[0.95] md:text-5xl">
        {s.t}
      </h3>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{s.d}</p>
    </motion.div>
  );
}

export default function ArchitectureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const activeCaption = useRef(-1);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
    // sound when a caption appears / disappears
    let idx = -1;
    CENTERS.forEach((c, i) => {
      if (v > c - 0.1 && v < c + 0.1) idx = i;
    });
    if (idx !== activeCaption.current) {
      if (idx > activeCaption.current)
        window.dispatchEvent(new CustomEvent("ux-textin"));
      else window.dispatchEvent(new CustomEvent("ux-textout"));
      activeCaption.current = idx;
    }
  });

  // blueprint annotations fade in with the dimension lines
  const blueprintOpacity = useTransform(
    scrollYProgress,
    [0.55, 0.78],
    [0, 0.55]
  );

  return (
    <section ref={ref} className="relative h-[250vh] w-full">
      <div className="sticky top-0 flex h-[100svh] w-full items-center overflow-hidden">
        {/* animated gold aurora filling the background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full blur-[130px]"
            style={{
              background: "#c9a86a",
              opacity: 0.1,
              animation: "aurora1 22s ease-in-out infinite",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full blur-[150px]"
            style={{
              background: "#9c8552",
              opacity: 0.1,
              animation: "aurora2 28s ease-in-out infinite",
            }}
          />
        </div>
        {/* rotating cube structure */}
        <div className="absolute inset-0 z-0">
          <ArchitectureCube progressRef={progress} />
        </div>

        {/* readability vignette weighted to the left where the text sits */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_70%_50%,transparent_35%,#0a0a0b_92%)]" />
        {/* feather top & bottom so the 3D dissolves into the page, no hard cut */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-ink to-transparent" />

        {/* section label */}
        <span className="absolute left-6 top-8 z-20 text-[10px] uppercase tracking-[0.4em] text-muted md:left-10">
          / Wie Struktur entsteht
        </span>

        {/* blueprint measurement annotations */}
        <motion.div
          style={{ opacity: blueprintOpacity }}
          className="pointer-events-none absolute inset-0 z-20 hidden font-mono text-[10px] uppercase tracking-widest text-muted md:block"
        >
          <span className="absolute right-10 top-1/3">Ø 3.24</span>
          <span className="absolute bottom-1/3 right-10">x:3 · y:3 · z:3</span>
          <span className="absolute right-24 top-1/2">27 nodes</span>
        </motion.div>

        {/* scroll-driven text story */}
        <div className="relative z-20 mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="relative h-72 max-w-md">
            {STORY.map((_, i) => (
              <StoryPanel key={i} i={i} p={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
