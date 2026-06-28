"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl px-6 text-center md:px-10">
        <Reveal>
          <p className="mb-8 text-xs uppercase tracking-[0.4em] text-gold">
            Kontakt
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mx-auto max-w-4xl font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-8xl">
            Lass uns etwas{" "}
            <span className="font-serif italic text-gold">Bauen</span>.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-xl text-lg text-muted">
            Offen für Projekte, Zusammenarbeit und neue Herausforderungen.
            Schreib mir — ich antworte schnell.
          </p>
        </Reveal>

        <motion.a
          href="mailto:vimode@gmx.de"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="group mt-14 inline-flex items-center gap-4 rounded-full bg-bone px-9 py-5 text-sm font-medium uppercase tracking-[0.18em] text-ink transition-all duration-300 hover:bg-gold"
        >
          E-Mail schreiben
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </motion.a>

        <Reveal delay={0.3}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            {[
              { label: "X", href: "https://x.com/solairetrades?s=11" },
              {
                label: "Instagram",
                href: "https://www.instagram.com/dagles27?igsh=Z24wY2d6cndvNTY3&utm_source=qr",
              },
              { label: "E-Mail", href: "mailto:vimode@gmx.de" },
            ].map((l) => {
              const external = l.href.startsWith("http");
              return (
                <a
                  key={l.label}
                  href={l.href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-muted underline-offset-4 transition-colors hover:text-bone hover:underline"
                >
                  {l.label}
                </a>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
