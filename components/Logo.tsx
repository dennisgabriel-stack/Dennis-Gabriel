"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0,
        filter: [
          "drop-shadow(0 0 0px rgba(201,168,106,0))",
          "drop-shadow(0 0 8px rgba(201,168,106,0.45))",
          "drop-shadow(0 0 0px rgba(201,168,106,0))",
        ],
      }}
      transition={{
        opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
        scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
        rotate: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
        filter: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
      }}
      whileHover={{ scale: 1.12 }}
    >
      <Image
        src="/images/logo.png"
        alt="ARCHANGEL"
        width={1158}
        height={813}
        priority
        className="h-full w-auto"
      />
    </motion.span>
  );
}
