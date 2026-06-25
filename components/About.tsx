"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Reveal from "./Reveal";

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  return (
    <section id="about" className="relative w-full py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 md:grid-cols-12 md:px-10">
        {/* Portrait with parallax */}
        <div
          ref={ref}
          className="relative md:col-span-5 md:col-start-1"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
            <motion.div style={{ y, scale }} className="absolute inset-0">
              <Image
                src="/images/portrait.jpeg"
                alt="Dennis Gabriel"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                priority={false}
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          </div>
          <span className="absolute -bottom-4 -right-2 font-serif text-sm italic text-muted">
            est. Frankfurt
          </span>
        </div>

        {/* Text */}
        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-gold">
              Über mich
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Entwickler mit dem Auge eines{" "}
              <span className="font-serif italic text-gold">Designers</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg leading-relaxed text-muted">
              Ich verbinde technische Tiefe mit gestalterischem Anspruch. Von
              KI-gestützter Automatisierung über kreatives Grafik-Design bis hin
              zu vollständigen Echtzeit-Plattformen — ich denke ein Produkt vom
              Pixel bis zur Datenbank durch.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Mehrere produktive Websites und Anwendungen mit unterschiedlichen
              Tech-Stacks gebaut. Hohe Fortbildungen in{" "}
              <span className="text-bone">KI &amp; Automatisierung</span> und{" "}
              <span className="text-bone">Grafik-Design</span>.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-bone/10 pt-8">
              {[
                { n: "8+", l: "Sprachen (i18n)" },
                { n: "4", l: "Architektur-Layer" },
                { n: "∞", l: "Pixel poliert" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-bold text-bone md:text-4xl">
                    {s.n}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-muted">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
