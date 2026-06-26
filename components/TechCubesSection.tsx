"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import type { Tech } from "./three/TechCubes";

const TechCubes = dynamic(() => import("./three/TechCubes"), { ssr: false });

export default function TechCubesSection() {
  const [tech, setTech] = useState<Tech | null>(null);

  return (
    <section
      id="stack-3d"
      className="relative w-full overflow-hidden py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        {/* portrait sized to the text block (matches sketched area), soft on all sides */}
        <div className="relative">
          <div className="pointer-events-none absolute left-[-22%] right-[38%] top-10 z-0 bottom-[-3.5rem] md:left-auto md:right-0 md:bottom-[-1.5rem] md:top-[-1.5rem] md:w-[72%]">
            <Image
              src="/images/stack-bg.jpeg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[60%_top] opacity-55"
              priority={false}
            />
            {/* fade toward the text on the left */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink/55 to-ink" />
            {/* feather every edge */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent" />
          </div>

          <div className="relative z-10">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.4em] text-gold">
                Live-Architektur
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
                Mein Stack,{" "}
                <span className="font-serif italic text-gold">in Bewegung</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Jeder Block ist ein Werkzeug. Sie fügen sich zusammen, bauen sich
                um und lassen sich frei umkreisen — meine komplette aktuelle
                Tech-Kenntnis als lebende 3D-Architektur.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-10 h-[68vh] w-full md:-mt-6 md:h-[74vh]">
        {/* animated gold aurora behind the cubes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full blur-[110px]"
            style={{
              background: "#c9a86a",
              opacity: 0.12,
              animation: "aurora1 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full blur-[130px]"
            style={{
              background: "#9c8552",
              opacity: 0.12,
              animation: "aurora2 26s ease-in-out infinite",
            }}
          />
        </div>
        <TechCubes onFocus={setTech} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" />

        {/* tech detail card on cube tap */}
        <AnimatePresence>
          {tech && (
            <motion.div
              key={tech.n}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute inset-x-4 bottom-10 z-30 mx-auto max-w-sm overflow-hidden rounded-2xl p-6"
              style={{
                boxShadow: `0 0 50px ${tech.accent}33`,
                border: `1px solid ${tech.accent}40`,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tech.accent}, transparent)`,
                }}
              />
              <button
                onClick={() => {
                  setTech(null);
                  window.dispatchEvent(new CustomEvent("tech-unfocus"));
                }}
                aria-label="Schließen"
                className="absolute right-4 top-4 text-muted transition-colors hover:text-bone"
              >
                ✕
              </button>
              <p
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: tech.accent }}
              >
                Tech-Stack
              </p>
              <h4 className="mt-2 font-display text-2xl font-bold text-bone">
                {tech.n}
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {tech.desc}
              </p>
              <a
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink transition-transform duration-300 hover:scale-105"
                style={{ background: tech.accent }}
              >
                Zur Website
                <span aria-hidden>↗</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
