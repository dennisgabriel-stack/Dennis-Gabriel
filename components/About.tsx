"use client";

import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="relative w-full py-28 md:py-40">
      <div className="mx-auto max-w-3xl px-6 md:px-10">
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
            Tech-Stacks gebaut. Belegt durch{" "}
            <span className="text-bone">18 verifizierte Zertifikate</span> in
            verschiedensten Coding-Segmenten — von{" "}
            <span className="text-bone">KI &amp; Automatisierung</span> bis{" "}
            <span className="text-bone">Grafik-Design</span>, jederzeit
            vorlegbar.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-bone/10 pt-8 md:grid-cols-4">
            {[
              { n: "18", l: "Verifizierte Zertifikate" },
              { n: "8+", l: "Sprachen (i18n)" },
              { n: "4", l: "Sicherheits-Stufen" },
              { n: "∞", l: "Design-Möglichkeiten" },
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
    </section>
  );
}
