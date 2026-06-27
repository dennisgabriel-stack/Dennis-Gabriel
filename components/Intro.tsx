"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type Lenis from "lenis";

const CubeLoader = dynamic(() => import("./three/CubeLoader"), { ssr: false });

export default function Intro() {
  const [run, setRun] = useState(0); // increments each play (also remounts the scene)
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [flash, setFlash] = useState(false);

  // lock scrolling whenever the intro is on screen
  useEffect(() => {
    if (hidden) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [hidden, run]);

  // replay from the header logo: jump to top, then run the animation again
  useEffect(() => {
    const replay = () => {
      const lenis = (window as unknown as { lenis?: Lenis }).lenis;
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      setFlash(false);
      setClosing(false);
      setHidden(false);
      setRun((r) => r + 1);
    };
    window.addEventListener("replay-intro", replay);
    return () => window.removeEventListener("replay-intro", replay);
  }, []);

  // fired by the 3D scene the moment the cube completes
  const onSnap = useCallback(() => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new CustomEvent("ux-klack"));
    setFlash(true);
    setTimeout(() => setFlash(false), 420);
    setTimeout(() => setClosing(true), 650);
    setTimeout(() => setHidden(true), 1300);
  }, []);

  if (hidden) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink"
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      {/* the 3×3 Rubik cube assembling */}
      <div className="relative h-72 w-72 md:h-96 md:w-96">
        {/* soft radial glow behind the cube — intensifies on snap */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[46%] h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(circle at center, rgba(201,168,106,0.4), rgba(201,168,106,0) 60%)",
          }}
          animate={{ opacity: flash ? 1 : 0.35, scale: flash ? 1.2 : 1 }}
          transition={{ duration: flash ? 0.15 : 0.7, ease: "easeOut" }}
        />
        <CubeLoader key={run} onSnap={onSnap} />
      </div>

      {/* subtle sound-on notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="-mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-muted"
      >
        <span className="text-gold">♪</span> Sound on
      </motion.div>
    </motion.div>
  );
}
