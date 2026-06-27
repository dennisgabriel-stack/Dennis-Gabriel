"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type Lenis from "lenis";

const CubeLoader = dynamic(() => import("./three/CubeLoader"), { ssr: false });

type Fly = { x: number; y: number; scale: number };

export default function Intro() {
  const [run, setRun] = useState(0); // increments each play (remounts the scene)
  const [flying, setFlying] = useState(false); // cube flies into the header logo
  const [hidden, setHidden] = useState(false);
  const [flash, setFlash] = useState(false);
  const [fly, setFly] = useState<Fly | null>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  // lock scrolling while the intro is on screen
  useEffect(() => {
    if (hidden) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [hidden, run]);

  // replay from the header logo
  useEffect(() => {
    const replay = () => {
      const lenis = (window as unknown as { lenis?: Lenis }).lenis;
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      setFlash(false);
      setFlying(false);
      setFly(null);
      setHidden(false);
      setRun((r) => r + 1);
    };
    window.addEventListener("replay-intro", replay);
    return () => window.removeEventListener("replay-intro", replay);
  }, []);

  // fired the moment the 3×3 completes
  const onSnap = useCallback(() => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new CustomEvent("ux-klack"));
    setFlash(true);
    setTimeout(() => setFlash(false), 420);

    // compute where the header logo's cube sits, then fly there
    const logo = document.getElementById("brand-logo");
    const cont = cubeRef.current;
    let target: Fly = { x: 0, y: -window.innerHeight * 0.4, scale: 0.1 };
    if (logo && cont) {
      const r = logo.getBoundingClientRect();
      const cx = r.left + r.width * 0.32; // the cube sits in the A, left-of-centre
      const cy = r.top + r.height * 0.5;
      const ch = cont.offsetHeight || 320;
      target = {
        x: cx - window.innerWidth / 2,
        y: cy - window.innerHeight / 2,
        scale: Math.max(0.08, (r.height / ch) * 0.7),
      };
    }
    setFly(target);
    setTimeout(() => setFlying(true), 480); // brief beat, then fly to the logo
    setTimeout(() => setHidden(true), 480 + 1150);
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" aria-hidden>
      {/* dark backdrop fades away as the cube flies off → page reveals */}
      <motion.div
        className="absolute inset-0 bg-ink"
        animate={{ opacity: flying ? 0 : 1 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* the 3×3 Rubik cube — flies into the header logo on completion */}
        <motion.div
          ref={cubeRef}
          className="relative h-72 w-72 md:h-96 md:w-96"
          animate={
            flying && fly
              ? { x: fly.x, y: fly.y, scale: fly.scale, opacity: 0 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
          }
          transition={{
            default: { duration: 1.1, ease: [0.6, 0, 0.2, 1] },
            opacity: { duration: 0.4, delay: 0.72 },
          }}
        >
          {/* soft radial glow behind the cube — intensifies on snap */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[46%] h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(circle at center, rgba(201,168,106,0.4), rgba(201,168,106,0) 60%)",
            }}
            animate={{ opacity: flash ? 1 : flying ? 0 : 0.35, scale: flash ? 1.2 : 1 }}
            transition={{ duration: flash ? 0.15 : 0.7, ease: "easeOut" }}
          />
          <CubeLoader key={run} onSnap={onSnap} />
        </motion.div>

        {/* subtle sound-on notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: flying ? 0 : 1 }}
          transition={{ delay: flying ? 0 : 0.5, duration: flying ? 0.3 : 0.6 }}
          className="-mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-muted"
        >
          <span className="text-gold">♪</span> Sound on
        </motion.div>
      </div>
    </div>
  );
}
