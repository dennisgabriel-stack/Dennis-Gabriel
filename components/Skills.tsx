"use client";

import Reveal from "./Reveal";
import { motion } from "framer-motion";
import type Lenis from "lenis";

type Pillar = {
  no: string;
  title: string;
  accent: string;
  desc: string;
  icon: "ai" | "design" | "stack";
  tags: string[];
  badge?: string;
  cta: string;
};

const PILLARS: Pillar[] = [
  {
    no: "01",
    title: "KI & Automatisierung",
    accent: "#e6c88a",
    icon: "ai",
    desc: "Intelligente Systeme, die sich selbst orchestrieren, optimieren und reparieren — vom Workflow bis zum autonomen Agenten.",
    tags: [
      "Loop-Engineering",
      "Self-Repairing System Layers",
      "Workflow-Automatisierung",
      "AI-Agenten · Agentic AI",
      "LLM-Orchestrierung",
      "RAG-Pipelines",
      "MCP-Integration",
      "Prompt-Engineering",
      "Vektor-Datenbanken",
      "Eval & Guardrails",
    ],
    cta: "Automatisierung anfragen",
  },
  {
    no: "02",
    title: "Grafik & Kreativ-Design",
    accent: "#c9a86a",
    icon: "design",
    desc: "Markenidentität mit Präzision — von der ersten Skizze bis zum fertigen System. Gesteuert über VMD.",
    tags: [
      "Branding",
      "Logo-Design",
      "Visual Identity",
      "Brand Guidelines",
      "UI/UX Design",
      "Design-Systeme",
      "Motion Design",
      "Social-Media-Design",
      "Print & Editorial",
      "Mockups & Prototyping",
    ],
    badge: "VMD · Vimode Premium Design",
    cta: "Design-Projekt starten",
  },
  {
    no: "03",
    title: "Full-Stack Engineering",
    accent: "#bfa779",
    icon: "stack",
    desc: "Vollständige Plattformen über alle Schichten — performant, skalierbar und produktionsreif.",
    tags: [
      "Next.js & React",
      "TypeScript",
      "Node.js & Edge",
      "REST & GraphQL",
      "PostgreSQL & Redis",
      "Realtime · WebSockets",
      "Auth & Security",
      "Docker & CI/CD",
      "Cloud (AWS)",
      "Web3 & Smart Contracts",
      "Testing & Observability",
      "Performance & SEO",
    ],
    cta: "Projekt besprechen",
  },
];

function Icon({ kind, color }: { kind: Pillar["icon"]; color: string }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "ai")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="5" r="1.4" />
        <circle cx="19" cy="5" r="1.4" />
        <circle cx="5" cy="19" r="1.4" />
        <circle cx="19" cy="19" r="1.4" />
        <path d="M6.2 6.2 9.7 9.7M17.8 6.2 14.3 9.7M6.2 17.8 9.7 14.3M17.8 17.8 14.3 14.3" />
      </svg>
    );
  if (kind === "design")
    return (
      <svg {...common}>
        <path d="M12 3 3 20h18L12 3z" />
        <circle cx="12" cy="14" r="2.4" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M9 7 5 12l4 5M15 7l4 5-4 5M13 5l-2 14" />
    </svg>
  );
}

export default function Skills() {
  const go = (href: string) => {
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    if (lenis) lenis.scrollTo(href, { offset: -20, duration: 1.4 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="skills" className="relative w-full overflow-hidden py-28 md:py-40">
      {/* ambient background — aurora + faint grid, matching the site */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,106,0.10),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,106,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,106,0.5) 1px,transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />
        <div
          className="absolute -left-20 top-1/3 h-80 w-80 rounded-full blur-[150px]"
          style={{ background: "#c9a86a", opacity: 0.08, animation: "aurora1 26s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full blur-[160px]"
          style={{ background: "#9c8552", opacity: 0.08, animation: "aurora2 32s ease-in-out infinite" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 max-w-3xl">
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
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Strategie, Gestaltung und Engineering greifen ineinander — gebaut,
              um zu skalieren, und gestaltet, um zu bleiben.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.no} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-ink-card/50 p-7 backdrop-blur-sm transition-colors duration-500"
                style={{ borderColor: `${p.accent}22` }}
              >
                {/* top accent beam */}
                <div
                  className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)`,
                  }}
                />
                {/* hover glow */}
                <div
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ boxShadow: `inset 0 0 60px ${p.accent}14, 0 0 40px ${p.accent}1a` }}
                />

                <div className="relative flex items-center justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl border transition-colors duration-500"
                    style={{
                      borderColor: `${p.accent}33`,
                      background: `${p.accent}10`,
                    }}
                  >
                    <Icon kind={p.icon} color={p.accent} />
                  </span>
                  <span
                    className="font-display text-5xl font-bold text-bone/10 transition-colors duration-500"
                    style={{ color: undefined }}
                  >
                    {p.no}
                  </span>
                </div>

                <h3 className="relative mt-6 font-display text-2xl font-semibold text-bone">
                  {p.title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted">
                  {p.desc}
                </p>

                {p.badge && (
                  <div
                    className="relative mt-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      borderColor: `${p.accent}44`,
                      background: `${p.accent}12`,
                      color: p.accent,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: p.accent }}
                    />
                    {p.badge}
                  </div>
                )}

                <div className="relative mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border px-2.5 py-1 text-[11px] text-bone/80 transition-colors duration-300"
                      style={{
                        borderColor: `${p.accent}26`,
                        background: `${p.accent}0d`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* per-card CTA */}
                <button
                  onClick={() => go("#contact")}
                  className="group/cta relative mt-7 inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors duration-300"
                  style={{ color: p.accent }}
                >
                  {p.cta}
                  <span className="transition-transform duration-300 group-hover/cta:translate-x-1">
                    →
                  </span>
                </button>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* section call-to-action */}
        <Reveal delay={0.15}>
          <div className="mt-14 flex flex-col items-center justify-between gap-6 rounded-2xl border border-gold/20 bg-ink-card/40 px-8 py-8 text-center backdrop-blur-sm md:flex-row md:text-left">
            <div>
              <h3 className="font-display text-2xl font-bold text-bone md:text-3xl">
                Bereit, etwas Bleibendes zu bauen?
              </h3>
              <p className="mt-2 text-muted">
                Von der Idee bis zum Launch — sprechen wir über dein Projekt.
              </p>
            </div>
            <button
              onClick={() => go("#contact")}
              className="shrink-0 rounded-full bg-gold px-7 py-3.5 text-sm font-medium uppercase tracking-[0.18em] text-ink transition-transform duration-300 hover:scale-105"
            >
              Kontakt aufnehmen
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
