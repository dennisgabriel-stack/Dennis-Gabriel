"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const CubeLoader = dynamic(() => import("./three/CubeLoader"), { ssr: false });

export default function Intro() {
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [flash, setFlash] = useState(false);
  const phaseRef = useRef<"in" | "snap">("in");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // after a short beat of tumbling, send the missing corner flying in
    const tSnap = setTimeout(() => {
      phaseRef.current = "snap";
    }, 1500);
    return () => {
      clearTimeout(tSnap);
      document.body.style.overflow = prev || "";
    };
  }, []);

  // fired by the 3D scene the moment the corner cube locks in
  const onSnap = useCallback(() => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new CustomEvent("ux-klack"));
    setFlash(true);
    setTimeout(() => setFlash(false), 420);
    setTimeout(() => setClosing(true), 650);
    setTimeout(() => {
      document.body.style.overflow = "";
      setHidden(true);
    }, 1300);
  }, []);

  if (hidden) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink"
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      {/* the 2×2 Rubik cube with the flying corner */}
      <div className="relative h-72 w-72 md:h-96 md:w-96">
        {/* soft glow backdrop behind the cube — intensifies on snap */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold blur-[55px] md:h-52 md:w-52"
          animate={{ opacity: flash ? 0.6 : 0.12, scale: flash ? 1.3 : 1 }}
          transition={{ duration: flash ? 0.12 : 0.7, ease: "easeOut" }}
        />
        <CubeLoader phaseRef={phaseRef} onSnap={onSnap} />
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
