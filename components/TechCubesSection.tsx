"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import type { Tech } from "./three/TechCubes";
import { FORMATION_LABELS } from "./three/TechCubes";

const TechCubes = dynamic(() => import("./three/TechCubes"), { ssr: false });

// icons symbolising each construct (order matches FORMATION_LABELS)
const CONSTRUCT_ICONS = [
  // A-Monogramm — the ARCHANGEL "A"
  <svg key="a" width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 4 L5 20 M12 4 L19 20 M8 14 H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  // Turm — stacked blocks (2×3)
  <svg key="t" width="22" height="22" viewBox="0 0 24 24" fill="none">
    {[6, 11, 16].map((y) =>
      [7, 13].map((x) => (
        <rect
          key={`${x}-${y}`}
          x={x - 3.6}
          y={y - 2.2}
          width="7.2"
          height="4.4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      ))
    )}
  </svg>,
  // Helix — double helix curve
  <svg key="h" width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3 C 19 6, 19 9, 12 11.5 C 5 14, 5 18, 12 21"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M12 3 C 5 6, 5 9, 12 11.5 C 19 14, 19 18, 12 21"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <path
      d="M9 6 H15 M9 17 H15"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>,
  // DG — the initials
  <span key="dg" className="font-display text-[15px] font-bold tracking-tight">
    DG
  </span>,
];

export default function TechCubesSection() {
  const [tech, setTech] = useState<Tech | null>(null);
  const buildRef = useRef(-1);
  const [active, setActive] = useState(-1);

  const build = (i: number) => {
    const next = active === i ? -1 : i; // tap active again → scatter
    buildRef.current = next;
    setActive(next);
    window.dispatchEvent(new CustomEvent("ux-click"));
  };

  return (
    <section
      id="stack-3d"
      className="relative w-full overflow-hidden py-24 md:py-32"
    >
      <div className="relative z-30 mx-auto max-w-7xl px-6 md:px-10">
        {/* thinking-pose portrait (cutout) behind the heading, like the sketch */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 -top-16 z-0 h-[460px] overflow-hidden md:-top-24 md:h-[600px]">
            <Image
              src="/images/stack-person.png"
              alt=""
              fill
              sizes="100vw"
              className="object-contain object-[center_top] opacity-55 md:object-[72%_top]"
              priority={false}
            />
            {/* darken toward the text (left) so the heading stays readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
            {/* feather every edge into the background */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent" />
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
        <TechCubes onFocus={setTech} buildRef={buildRef} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink to-transparent" />

        {/* construct builder — 4 icons symbolising what each one builds */}
        <div className="pointer-events-none absolute inset-x-0 top-5 z-30 flex flex-col items-center gap-2 px-4">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted">
            Konstrukt bauen
          </p>
          <div className="pointer-events-auto flex items-center justify-center gap-3">
            {CONSTRUCT_ICONS.map((icon, i) => (
              <button
                key={FORMATION_LABELS[i]}
                onClick={() => build(i)}
                aria-label={FORMATION_LABELS[i]}
                title={FORMATION_LABELS[i]}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 ${
                  active === i
                    ? "border-gold bg-gold text-ink shadow-[0_0_24px_rgba(201,168,106,0.55)]"
                    : "border-bone/20 bg-ink/40 text-bone hover:border-gold/60 hover:text-gold"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* tech detail card on cube tap */}
        <AnimatePresence>
          {tech && (
            <motion.div
              key={tech.n}
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute inset-x-4 bottom-4 z-30 mx-auto max-w-sm overflow-hidden rounded-2xl p-6"
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
