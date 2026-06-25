"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";

const SceneBackground = dynamic(
  () => import("@/components/three/SceneBackground"),
  { ssr: false }
);

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex h-[100svh] w-full flex-col justify-center overflow-hidden"
    >
      {/* 3D particle field */}
      <div className="absolute inset-0 z-0">
        <SceneBackground />
      </div>

      {/* Profile portrait — sits behind the text */}
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease }}
        className="pointer-events-none absolute inset-0 z-[5]"
      >
        <Image
          src="/images/portrait.jpeg"
          alt="Dennis Gabriel"
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover object-[45%_38%] opacity-80 md:object-[58%_35%]"
        />
      </motion.div>

      {/* Cinematic overlays to keep the text readable */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0a0a0b_88%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-ink to-transparent" />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease }}
          className="mb-6 text-xs uppercase tracking-[0.4em] text-gold"
        >
          Full-Stack · Blockchain · KI
        </motion.p>

        <h1 className="font-display text-[15vw] font-bold leading-[0.86] tracking-tight md:text-[10vw] lg:text-[8.5vw]">
          <span className="reveal-line">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.45, duration: 1, ease }}
              className="block"
            >
              DENNIS
            </motion.span>
          </span>
          <span className="reveal-line">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.6, duration: 1, ease }}
              className="block text-gold"
            >
              GABRIEL
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 1, ease }}
          className="mt-8 max-w-xl text-balance text-lg text-muted md:text-xl"
        >
          Ich entwerfe und baue komplette digitale Erlebnisse — von der{" "}
          <span className="text-bone">cinematischen Oberfläche</span> bis zur{" "}
          <span className="text-bone">On-Chain-Architektur</span>.
        </motion.p>
      </div>
    </section>
  );
}
