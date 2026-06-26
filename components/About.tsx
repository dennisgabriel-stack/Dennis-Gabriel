"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const AmbientParticles = dynamic(
  () => import("./three/AmbientParticles"),
  { ssr: false }
);

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // first only the man is visible, then the text fades in on scroll
  const textOpacity = useTransform(scrollYProgress, [0.02, 0.12], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.02, 0.14], [50, 0]);
  // the portrait recedes slightly as the text takes over
  const imgOpacity = useTransform(scrollYProgress, [0.1, 0.5], [0.85, 0.5]);
  const imgScale = useTransform(scrollYProgress, [0, 0.6], [1.12, 1]);

  return (
    <section id="about" ref={ref} className="relative h-[220vh] w-full">
      <div className="sticky top-0 flex h-[100svh] w-full items-center overflow-hidden">
        {/* continuous animated background (matches the section above) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full blur-[140px]"
            style={{
              background: "#c9a86a",
              opacity: 0.1,
              animation: "aurora1 24s ease-in-out infinite",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full blur-[150px]"
            style={{
              background: "#9c8552",
              opacity: 0.1,
              animation: "aurora2 30s ease-in-out infinite",
            }}
          />
        </div>
        <div className="absolute inset-0 z-0">
          <AmbientParticles />
        </div>

        {/* cinematic portrait — seen first */}
        <motion.div
          style={{ opacity: imgOpacity }}
          className="pointer-events-none absolute inset-0 z-[1]"
        >
          <motion.div style={{ scale: imgScale }} className="absolute inset-0">
            <Image
              src="/images/about-bg-cut.png"
              alt=""
              fill
              sizes="100vw"
              className="scale-90 object-contain object-[72%_30%] md:scale-[0.85] md:object-[78%_30%]"
              priority={false}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent" />
        </motion.div>

        {/* text fades in as you keep scrolling */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="relative z-10 mr-auto max-w-xl px-6 md:px-10"
        >
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-gold">
            Über mich
          </p>
          <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            Entwickler mit dem Auge eines{" "}
            <span className="font-serif italic text-gold">Designers</span>.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
            Ich verbinde technische Tiefe mit gestalterischem Anspruch. Von
            KI-gestützter Automatisierung über kreatives Grafik-Design bis hin zu
            vollständigen Echtzeit-Plattformen — ich denke ein Produkt vom Pixel
            bis zur Datenbank durch.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            Mehrere produktive Websites und Anwendungen gebaut. Belegt durch{" "}
            <span className="text-bone">18 verifizierte Zertifikate</span> in
            verschiedensten Coding-Segmenten — von{" "}
            <span className="text-bone">KI &amp; Automatisierung</span> bis{" "}
            <span className="text-bone">Grafik-Design</span>, jederzeit
            vorlegbar.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-5 border-t border-bone/10 pt-6 md:grid-cols-4">
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
        </motion.div>
      </div>
    </section>
  );
}
