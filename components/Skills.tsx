"use client";

import Image from "next/image";
import Reveal from "./Reveal";

const pillars = [
  {
    no: "01",
    title: "KI & Automatisierung",
    desc: "Fortgeschrittene Fortbildungen in KI-Systemen und Prozess-Automatisierung. Von Workflows bis zu intelligenten Agenten.",
    tags: ["AI Workflows", "Automatisierung", "Agenten", "Integrationen"],
  },
  {
    no: "02",
    title: "Grafik & Kreativ-Design",
    desc: "Visuelle Gestaltung mit Gespür für Komposition, Typografie und Markenästhetik — vom Konzept bis zum fertigen Asset.",
    tags: ["UI/UX", "Branding", "Motion", "Komposition"],
  },
  {
    no: "03",
    title: "Full-Stack Engineering",
    desc: "Komplette Anwendungen über alle Schichten: Frontend, Echtzeit-Backend, Datenbanken und Cloud-Infrastruktur — branchenübergreifend.",
    tags: ["Frontend", "Backend", "Realtime", "Cloud"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="relative w-full py-28 md:py-40">
      {/* Background lifestyle image, subtle */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <Image
          src="/images/about.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/80 to-ink" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-16 max-w-3xl">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-gold">
              Können
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Drei Disziplinen,{" "}
              <span className="font-serif italic text-gold">eine Handschrift</span>.
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.no} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-xl border border-bone/10 bg-ink-card/60 p-8 transition-all duration-500 hover:border-gold/40">
                <div className="font-display text-5xl font-bold text-bone/10 transition-colors duration-500 group-hover:text-gold/30">
                  {p.no}
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold text-bone">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {p.desc}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-bone/10 px-3 py-1 text-[11px] uppercase tracking-wider text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
