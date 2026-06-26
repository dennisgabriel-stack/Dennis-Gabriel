"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Layer = {
  tag: string;
  name: string;
  accent: string;
  tech: string[];
  purpose: string;
};

const LAYERS: Layer[] = [
  {
    tag: "L1",
    name: "Presentation Layer",
    accent: "#e6c88a",
    tech: ["Next.js", "React", "TypeScript", "Tailwind", "Three.js", "Framer Motion"],
    purpose: "User Interfaces · Responsive Design · Animationen",
  },
  {
    tag: "L2",
    name: "Application Layer",
    accent: "#c9a86a",
    tech: ["Node.js", "Express", "REST & GraphQL", "WebSocket", "Auth / JWT"],
    purpose: "Business-Logik · Echtzeit · API-Gateway",
  },
  {
    tag: "L3",
    name: "Data Layer",
    accent: "#9c8552",
    tech: ["PostgreSQL", "Redis", "Event-System", "Migrations", "Pooling"],
    purpose: "Persistenz · Analytics · Caching",
  },
  {
    tag: "L4",
    name: "Infrastructure & Integration",
    accent: "#bfa779",
    tech: ["Docker", "CI/CD", "Cloud (AWS)", "Web3", "Monitoring"],
    purpose: "Deployment · Skalierung · Integration",
  },
];

const emit = (n: string) =>
  typeof window !== "undefined" && window.dispatchEvent(new CustomEvent(n));

const norm = (a: number) => {
  let d = a % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

export default function LayerDial() {
  const [selected, setSelected] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const layer = LAYERS[selected];

  const s = useRef({
    angle: 0,
    vel: 0,
    dragging: false,
    lastPointer: 0,
    lastMove: 0,
    det: 0,
    settled: true,
    cx: 0,
    cy: 0,
  });

  useEffect(() => {
    const knob = knobRef.current!;
    const wrap = wrapRef.current!;
    const st = s.current;

    const angleAt = (x: number, y: number) =>
      (Math.atan2(y - st.cy, x - st.cx) * 180) / Math.PI;

    const down = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      st.cx = r.left + r.width / 2;
      st.cy = r.top + r.height / 2;
      st.dragging = true;
      st.vel = 0;
      st.lastPointer = angleAt(e.clientX, e.clientY);
      st.lastMove = performance.now();
      wrap.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!st.dragging) return;
      const a = angleAt(e.clientX, e.clientY);
      const d = norm(a - st.lastPointer);
      st.angle += d;
      st.vel = Math.max(-32, Math.min(32, d));
      st.lastPointer = a;
      st.lastMove = performance.now();
      st.settled = false;
    };
    const up = () => {
      if (!st.dragging) return;
      st.dragging = false;
      if (performance.now() - st.lastMove > 90) st.vel = 0;
      if (Math.abs(st.vel) > 9) emit("ux-woosh");
    };

    wrap.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    let raf = 0;
    const frame = () => {
      if (!st.dragging) {
        if (Math.abs(st.vel) > 0.25) {
          st.angle += st.vel;
          st.vel *= 0.97; // friction → physics spin
        } else {
          const target = Math.round(st.angle / 90) * 90;
          st.angle += (target - st.angle) * 0.18;
          if (Math.abs(target - st.angle) < 0.2 && !st.settled) {
            st.angle = target;
            st.settled = true;
            emit("ux-textin"); // card locks in
          }
        }
      } else if (performance.now() - st.lastMove > 90) {
        st.vel = 0;
      }

      const det = (((Math.round(st.angle / 90) % 4) + 4) % 4);
      if (det !== st.det) {
        st.det = det;
        st.settled = false;
        emit("ux-tick");
        setSelected(det);
      }

      knob.style.transform = `rotate(${st.angle}deg)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:justify-center md:gap-20">
      {/* ===== rotary dial ===== */}
      <div
        ref={wrapRef}
        className="relative h-[300px] w-[300px] shrink-0 cursor-grab touch-none select-none active:cursor-grabbing md:h-[360px] md:w-[360px]"
        style={{ filter: `drop-shadow(0 0 40px ${layer.accent}33)` }}
      >
        {/* outer fixed ticks L1-L4 (top/right/bottom/left) */}
        {LAYERS.map((l, i) => {
          const a = i * 90; // 0 top, 90 right, 180 bottom, 270 left
          const on = i === selected;
          return (
            <div
              key={l.tag}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-168px) rotate(${-a}deg)`,
              }}
            >
              <span
                className="font-display text-lg font-bold transition-all duration-300"
                style={{
                  color: on ? l.accent : "#55555c",
                  textShadow: on ? `0 0 16px ${l.accent}` : "none",
                  transform: on ? "scale(1.25)" : "scale(1)",
                  display: "inline-block",
                }}
              >
                {l.tag}
              </span>
            </div>
          );
        })}

        {/* fixed pointer at top */}
        <div
          className="absolute left-1/2 top-1 z-20 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `14px solid ${layer.accent}`,
            filter: `drop-shadow(0 0 6px ${layer.accent})`,
          }}
        />

        {/* outer ring */}
        <div
          className="absolute inset-3 rounded-full border transition-colors duration-500"
          style={{
            borderColor: `${layer.accent}55`,
            boxShadow: `inset 0 0 60px ${layer.accent}18, 0 0 30px ${layer.accent}22`,
          }}
        />

        {/* rotating knob */}
        <div
          ref={knobRef}
          className="absolute inset-10 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, #1a1a1f 0%, #0c0c0f 70%)",
            border: "1px solid rgba(245,244,240,0.08)",
            boxShadow: "inset 0 6px 20px rgba(0,0,0,0.6)",
          }}
        >
          {/* knob grip ridges */}
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-2.5 w-[2px] origin-center"
              style={{
                background: "rgba(245,244,240,0.12)",
                transform: `translate(-50%,-50%) rotate(${i * 15}deg) translateY(-${
                  130
                }px)`,
              }}
            />
          ))}
          {/* indicator notch */}
          <div
            className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full"
            style={{
              width: 6,
              height: 46,
              background: `linear-gradient(${layer.accent}, transparent)`,
              boxShadow: `0 0 14px ${layer.accent}`,
            }}
          />
          {/* hub */}
          <div
            className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle, #16161b, #0a0a0b)",
              border: `1px solid ${layer.accent}40`,
              boxShadow: `0 0 24px ${layer.accent}33`,
            }}
          >
            <span
              className="font-display text-2xl font-bold"
              style={{ color: layer.accent, textShadow: `0 0 12px ${layer.accent}` }}
            >
              {layer.tag}
            </span>
          </div>
        </div>

        <p className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-muted">
          Drehen · Schwung geben
        </p>
      </div>

      {/* ===== layer card ===== */}
      <div className="relative h-[260px] w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={layer.tag}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute inset-0 overflow-hidden rounded-2xl p-7"
            style={{ boxShadow: `0 0 50px ${layer.accent}22` }}
          >
            <div
              className="absolute left-0 top-0 h-full w-1.5"
              style={{ background: layer.accent }}
            />
            <div className="flex items-center gap-4">
              <span
                className="font-display text-5xl font-black"
                style={{ color: layer.accent }}
              >
                {layer.tag}
              </span>
              <h3 className="font-display text-xl font-semibold text-bone md:text-2xl">
                {layer.name}
              </h3>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {layer.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border px-3 py-1.5 text-xs text-bone/90"
                  style={{ borderColor: `${layer.accent}33` }}
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              {layer.purpose}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
