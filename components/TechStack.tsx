"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";

type Layer = {
  tag: string;
  name: string;
  color: string;
  tech: string[];
  purpose: string;
};

const layers: Layer[] = [
  {
    tag: "L1",
    name: "Presentation Layer",
    color: "#e6c88a",
    tech: ["Next.js 15", "React 19", "PixiJS 8", "Tailwind CSS", "Framer Motion", "i18n · 8 langs"],
    purpose: "User Interface · Game Rendering · Responsive Design · Animations",
  },
  {
    tag: "L2",
    name: "Application Layer",
    color: "#c9a86a",
    tech: ["Node.js / Express", "WebSocket", "PM2 Cluster", "Rate Limiting", "Auth / JWT"],
    purpose: "Game Logic · Session Management · Real-time Communication · API Gateway",
  },
  {
    tag: "L3",
    name: "Data Layer",
    color: "#9c8552",
    tech: ["PostgreSQL", "Redis Cache", "Event System", "Migrations", "Connection Pooling"],
    purpose: "Player Data · Game History · Leaderboards · Achievements · Analytics",
  },
  {
    tag: "L4",
    name: "Blockchain Layer",
    color: "#7a6740",
    tech: ["Solana", "Anchor Framework", "Provably Fair RNG", "SPL Token", "On-chain Settlement"],
    purpose: "Trustless Settlement · Verifiable Fairness · Token Economy",
  },
];

export default function TechStack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.4"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [4, 26]);
  const stackY = useTransform(scrollYProgress, [0, 1], ["2%", "-6%"]);

  return (
    <section id="stack" className="relative w-full overflow-hidden py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
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
              Vom ersten Pixel bis zur On-Chain-Abwicklung — durchdacht,
              skalierbar und in Echtzeit.
            </p>
          </Reveal>
        </div>

        {/* 3D isometric stack */}
        <div
          ref={ref}
          className="relative mx-auto max-w-4xl"
          style={{ perspective: "1600px" }}
        >
          <motion.div
            style={{ rotateX, y: stackY, transformStyle: "preserve-3d" }}
            className="flex flex-col gap-5"
          >
            {layers.map((layer, i) => (
              <motion.div
                key={layer.tag}
                initial={{ opacity: 0, y: 80, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ scale: 1.015, z: 30 }}
                className="glass group relative rounded-xl p-6 md:p-8"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                  style={{ background: layer.color }}
                />
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className="font-display text-3xl font-bold"
                      style={{ color: layer.color }}
                    >
                      {layer.tag}
                    </span>
                    <h3 className="font-display text-xl font-semibold text-bone md:text-2xl">
                      {layer.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {layer.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-bone/10 bg-ink/40 px-3 py-1.5 text-xs text-bone/90 transition-colors group-hover:border-gold/30"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-sm leading-relaxed text-muted">
                  {layer.purpose}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
