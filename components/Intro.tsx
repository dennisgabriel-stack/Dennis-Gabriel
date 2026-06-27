"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Intro() {
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setClosing(true), 1600);
    const t2 = setTimeout(() => {
      document.body.style.overflow = prev || "";
      setHidden(true);
    }, 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = prev || "";
    };
  }, []);

  if (hidden) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setClosing(true)}
      aria-hidden
    >
      {/* logo */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src="/images/logo.png"
          alt="ARCHANGEL"
          width={1158}
          height={813}
          priority
          className="h-16 w-auto md:h-20"
        />
      </motion.div>

      {/* thin loading line */}
      <div className="relative mt-7 h-px w-36 overflow-hidden bg-bone/12">
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-gold"
          animate={{ x: ["-130%", "330%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 8px rgba(201,168,106,0.7)" }}
        />
      </div>

      {/* subtle sound-on notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-muted"
      >
        <span className="text-gold">♪</span> Sound on
      </motion.div>
    </motion.div>
  );
}
