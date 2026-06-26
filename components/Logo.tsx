"use client";

import { motion } from "framer-motion";

// isometric cube vertices (the gold Rubik mark that nests inside the "A")
const T_top: [number, number] = [50, 56];
const T_right: [number, number] = [65, 64];
const T_bot: [number, number] = [50, 72];
const T_left: [number, number] = [35, 64];
const B_right: [number, number] = [65, 81];
const B_bot: [number, number] = [50, 89];
const B_left: [number, number] = [35, 81];

type P = [number, number];
const lerp = (a: P, b: P, t: number): P => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const poly = (pts: P[]) => pts.map((p) => p.join(",")).join(" ");

// 3x3 Rubik grid lines across a parallelogram face (p0→p1→p2→p3)
function grid(p0: P, p1: P, p2: P, p3: P) {
  const lines: [P, P][] = [];
  for (let i = 1; i < 3; i++) {
    const t = i / 3;
    lines.push([lerp(p0, p1, t), lerp(p3, p2, t)]);
    lines.push([lerp(p0, p3, t), lerp(p1, p2, t)]);
  }
  return lines;
}

const FACES: { id: string; pts: P[]; fill: string; delay: number }[] = [
  { id: "top", pts: [T_top, T_right, T_bot, T_left], fill: "#e6c88a", delay: 0 },
  { id: "left", pts: [T_left, T_bot, B_bot, B_left], fill: "#9c8552", delay: 0.12 },
  { id: "right", pts: [T_bot, T_right, B_right, B_bot], fill: "#c9a86a", delay: 0.24 },
];

const GRIDS: [P, P][] = [
  ...grid(T_top, T_right, T_bot, T_left),
  ...grid(T_left, T_bot, B_bot, B_left),
  ...grid(T_bot, T_right, B_right, B_bot),
];

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      whileHover={{ scale: 1.12 }}
      style={{ overflow: "visible" }}
    >
      {/* the "A" — drawn as a bone outline that traces in on mount */}
      <motion.path
        d="M50 8 L12 96 L31 96 L50 50 L69 96 L88 96 Z"
        fill="none"
        stroke="#f5f4f0"
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.path
        d="M50 8 L12 96 L31 96 L50 50 L69 96 L88 96 Z"
        fill="#f5f4f0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.14 }}
        transition={{ duration: 0.8, delay: 1.3 }}
      />

      {/* the gold cube — faces assemble from the centre, then breathe */}
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        {FACES.map((f) => (
          <motion.polygon
            key={f.id}
            points={poly(f.pts)}
            fill={f.fill}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 0.82, 1], scale: 1 }}
            transition={{
              opacity: {
                duration: 3.2,
                times: [0, 0.25, 0.6, 1],
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.7 + f.delay,
                ease: "easeInOut",
              },
              scale: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.7 + f.delay,
              },
            }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        ))}
        {/* Rubik grid lines */}
        {GRIDS.map((l, i) => (
          <motion.line
            key={i}
            x1={l[0][0]}
            y1={l[0][1]}
            x2={l[1][0]}
            y2={l[1][1]}
            stroke="#0a0a0b"
            strokeWidth={1}
            strokeOpacity={0.35}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          />
        ))}
        {/* cube silhouette edge for crispness */}
        <motion.polygon
          points={poly([T_top, T_right, B_right, B_bot, B_left, T_left])}
          fill="none"
          stroke="#e6c88a"
          strokeWidth={1.4}
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.6, delay: 1 }}
        />
      </g>
    </motion.svg>
  );
}
