"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  animate,
  useInView,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useMotionTemplate,
} from "framer-motion";

const AmbientParticles = dynamic(
  () => import("./three/AmbientParticles"),
  { ssr: false }
);

type Stat = { to?: number; suffix?: string; inf?: boolean; l: string };
const STATS: Stat[] = [
  { to: 18, l: "Verifizierte Zertifikate" },
  { to: 8, suffix: "+", l: "Sprachen (i18n)" },
  { to: 3, l: "Verschiedene LLMs" },
  { inf: true, l: "Design-Möglichkeiten" },
];

function StatItem({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);
  const delay = index * 0.12;

  useEffect(() => {
    if (!inView || stat.to === undefined) return;
    const controls = animate(0, stat.to, {
      duration: 1.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, stat.to, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="font-display text-3xl font-bold text-bone md:text-4xl">
        {stat.inf ? (
          <motion.span
            className="inline-block"
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            ∞
          </motion.span>
        ) : (
          <>
            {val}
            {stat.suffix}
          </>
        )}
      </div>
      <motion.div
        className="mt-2 h-px origin-left bg-gradient-to-r from-gold to-transparent"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.7, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="mt-2 text-xs uppercase tracking-wider text-muted">
        {stat.l}
      </div>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // text fades in early, then dissolves to the LEFT first
  const textOpacity = useTransform(
    scrollYProgress,
    [0.02, 0.12, 0.62, 0.74],
    [0, 1, 1, 0]
  );
  const textY = useTransform(scrollYProgress, [0.02, 0.14], [50, 0]);
  const textX = useTransform(scrollYProgress, [0.62, 0.76], [0, -340]);
  const textBlur = useTransform(scrollYProgress, [0.62, 0.76], [0, 16]);
  const textFilter = useMotionTemplate`blur(${textBlur}px)`;
  // the man dissolves to the RIGHT first
  const imgOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.5, 0.62, 0.74],
    [0.85, 0.55, 0.55, 0]
  );
  const imgX = useTransform(scrollYProgress, [0.62, 0.76], [0, 380]);
  const imgBlur = useTransform(scrollYProgress, [0.62, 0.76], [0, 16]);
  const imgFilter = useMotionTemplate`blur(${imgBlur}px)`;
  const imgScale = useTransform(scrollYProgress, [0, 0.6], [1.12, 1]);
  // AFTER the dissolve, a small cube falls slowly from top → out of screen
  const cubeY = useTransform(scrollYProgress, [0.8, 1], ["-22vh", "118vh"]);
  const cubeOpacity = useTransform(
    scrollYProgress,
    [0.8, 0.84, 0.99, 1],
    [0, 1, 1, 0]
  );

  // sounds: dissolve burst, then cube
  const dissolved = useRef(false);
  const dropped = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.62 && !dissolved.current) {
      dissolved.current = true;
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("ux-woosh"));
    }
    if (v < 0.6) dissolved.current = false;
    if (v > 0.81 && !dropped.current) {
      dropped.current = true;
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("ux-block"));
    }
    if (v < 0.8) dropped.current = false;
  });

  return (
    <section id="about" ref={ref} className="relative h-[340vh] w-full">
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

        {/* cinematic portrait — seen first, dissolves right on exit */}
        <motion.div
          style={{ opacity: imgOpacity, x: imgX, filter: imgFilter }}
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

        {/* falling cube during the section exit */}
        <motion.div
          style={{ y: cubeY, opacity: cubeOpacity }}
          className="pointer-events-none absolute left-1/2 top-0 z-40 -translate-x-1/2"
        >
          <div className="cube-perspective">
            <div className="cube3d">
              {["cf1", "cf2", "cf3", "cf4", "cf5", "cf6"].map((f) => (
                <i key={f} className={f}>
                  {Array.from({ length: 9 }).map((_, k) => (
                    <b key={k} />
                  ))}
                </i>
              ))}
            </div>
          </div>
        </motion.div>

        {/* text fades in as you keep scrolling, dissolves left on exit */}
        <motion.div
          style={{ opacity: textOpacity, y: textY, x: textX, filter: textFilter }}
          className="relative z-10 mr-auto max-w-xl px-6 md:px-10 md:pl-[13vw]"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.4em] text-gold md:mb-6">
            Über mich
          </p>
          <h2 className="font-display text-[2rem] font-bold leading-tight md:text-5xl">
            Entwickler mit dem Auge eines{" "}
            <span className="font-serif italic text-gold">Designers</span>.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted md:mt-6 md:text-lg">
            Ich verbinde technische Tiefe mit gestalterischem Anspruch. Von
            KI-gestützter Automatisierung über kreatives Grafik-Design bis hin zu
            vollständigen Echtzeit-Plattformen — ich denke ein Produkt vom Pixel
            bis zur Datenbank durch.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted md:mt-4 md:text-lg">
            Mehrere produktive Websites und Anwendungen gebaut. Belegt durch{" "}
            <span className="text-bone">18 verifizierte Zertifikate</span> in
            verschiedensten Coding-Segmenten — von{" "}
            <span className="text-bone">KI &amp; Automatisierung</span> bis{" "}
            <span className="text-bone">Grafik-Design</span>, jederzeit
            vorlegbar.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-bone/10 pt-5 md:mt-8 md:gap-5 md:pt-6 md:grid-cols-4">
            {STATS.map((s, i) => (
              <StatItem key={s.l} stat={s} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
