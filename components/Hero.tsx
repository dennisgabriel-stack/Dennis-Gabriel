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
      className="relative flex h-[100svh] w-full flex-col overflow-hidden"
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
        {/* mobile: original framing (unchanged) */}
        <Image
          src="/images/portrait.jpeg"
          alt="Dennis Gabriel"
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover object-[12%_52%] opacity-80 md:hidden"
        />
        {/* desktop: background-removed cutout over the animated 3D scene */}
        <Image
          src="/images/portrait-cut.png"
          alt="Dennis Gabriel"
          fill
          priority
          sizes="100vw"
          className="hidden scale-[1.45] object-contain object-[62%_24%] opacity-95 md:block md:[mask-image:radial-gradient(92%_92%_at_55%_42%,#000_70%,transparent_100%)] md:[-webkit-mask-image:radial-gradient(92%_92%_at_55%_42%,#000_70%,transparent_100%)]"
        />
      </motion.div>

      {/* Cinematic overlays to keep the text readable */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-ink via-ink/70 to-transparent md:from-ink/75 md:via-ink/20 md:to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0a0a0b_88%)] md:bg-[radial-gradient(ellipse_at_60%_50%,transparent_45%,#0a0a0b_98%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-ink to-transparent" />

      <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl flex-col px-6 pb-14 pt-24 md:ml-0 md:justify-start md:pb-0 md:pl-[5vw] md:pr-10 md:pt-[13vh]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease }}
            className="mb-6 text-xs uppercase tracking-[0.4em] text-gold md:mb-10"
          >
            Full-Stack · Blockchain · KI
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease }}
            className="shimmer-gold mt-[36vh] mb-2 font-display text-base font-bold uppercase tracking-[0.35em] md:mt-0 md:text-lg"
          >
            Archangel//Dev
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
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 1, ease }}
          className="mt-auto max-w-xl text-balance text-lg text-muted md:mt-12 md:text-xl"
        >
          Ich entwerfe und baue komplette digitale Erlebnisse — von der{" "}
          <span className="text-bone">cinematischen Oberfläche</span> bis zur{" "}
          <span className="text-bone">On-Chain-Architektur</span>.
        </motion.p>
      </div>
    </section>
  );
}
