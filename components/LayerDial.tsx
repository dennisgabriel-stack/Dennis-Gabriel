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

export default function LayerDial({
  onSelect,
}: {
  onSelect?: (i: number) => void;
}) {
  const [selected, setSelected] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
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
    target: null as number | null,
    nextAuto: 0,
  });

  const AUTO_MS = 4500; // dwell on each layer before auto-advancing one step

  // rotate the wheel to a chosen layer (click-to-select), shortest path
  const goTo = (i: number, silent = false) => {
    const st = s.current;
    const k0 = Math.round(st.angle / 90);
    let d = ((i - (((k0 % 4) + 4) % 4)) + 4) % 4;
    if (d === 3) d = -1;
    st.target = (k0 + d) * 90;
    st.vel = 0;
    st.dragging = false;
    if (!silent) emit("ux-woosh");
  };

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
      st.target = null;
      st.nextAuto = Infinity; // pause auto-rotate while the user interacts
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

    st.nextAuto = performance.now() + AUTO_MS;

    let raf = 0;
    const frame = () => {
      const now = performance.now();
      // auto-advance one detent when idle and the dwell time has elapsed
      if (
        !st.dragging &&
        st.target === null &&
        st.settled &&
        Math.abs(st.vel) < 0.3 &&
        now >= st.nextAuto
      ) {
        const k = (((Math.round(st.angle / 90) % 4) + 4) % 4);
        st.nextAuto = Infinity; // re-armed once it settles on the new layer
        goTo((k + 1) % 4, true); // silent auto-step (detent tick still plays)
      }

      if (st.dragging) {
        if (now - st.lastMove > 90) st.vel = 0;
      } else if (st.target !== null) {
        // animate to a clicked layer
        st.angle += (st.target - st.angle) * 0.16;
        if (Math.abs(st.target - st.angle) < 0.3) {
          st.angle = st.target;
          st.target = null;
          if (!st.settled) {
            st.settled = true;
            st.nextAuto = now + AUTO_MS;
            emit("ux-textin");
          }
        }
      } else if (Math.abs(st.vel) > 0.25) {
        st.angle += st.vel;
        st.vel *= 0.97; // friction → physics spin
      } else {
        const target = Math.round(st.angle / 90) * 90;
        st.angle += (target - st.angle) * 0.18;
        if (Math.abs(target - st.angle) < 0.2 && !st.settled) {
          st.angle = target;
          st.settled = true;
          st.nextAuto = now + AUTO_MS;
          emit("ux-textin"); // card locks in
        }
      }

      const det = (((Math.round(st.angle / 90) % 4) + 4) % 4);
      if (det !== st.det) {
        st.det = det;
        st.settled = false;
        emit("ux-tick");
        setSelected(det);
        onSelectRef.current?.(det);
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
    <div className="flex flex-col-reverse items-center gap-12 md:flex-row-reverse md:items-center md:justify-center md:gap-20">
      {/* ===== rotary dial ===== */}
      <div
        ref={wrapRef}
        className="relative h-[300px] w-[300px] shrink-0 cursor-grab touch-none select-none active:cursor-grabbing md:h-[360px] md:w-[360px]"
        style={{ filter: `drop-shadow(0 0 40px ${layer.accent}33)` }}
      >
        {/* futuristic HUD rings */}
        <svg
          viewBox="0 0 360 360"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <circle
            cx="180"
            cy="180"
            r="150"
            fill="none"
            stroke={`${layer.accent}22`}
            strokeWidth="10"
            strokeDasharray="1 13"
          />
          <circle
            cx="180"
            cy="180"
            r="138"
            fill="none"
            stroke={`${layer.accent}33`}
            strokeWidth="1"
            strokeDasharray="5 11"
            className="dial-spin"
            style={{ transformOrigin: "180px 180px" }}
          />
          <circle
            cx="180"
            cy="180"
            r="120"
            fill="none"
            stroke={`${layer.accent}22`}
            strokeWidth="1"
            strokeDasharray="2 6"
            className="dial-spin-rev"
            style={{ transformOrigin: "180px 180px" }}
          />
          {/* active quadrant arc */}
          <circle
            cx="180"
            cy="180"
            r="150"
            fill="none"
            stroke={layer.accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="235 707"
            style={{
              transform: `rotate(${-135 + selected * 90}deg)`,
              transformOrigin: "180px 180px",
              transition:
                "transform 0.55s cubic-bezier(0.16,1,0.3,1), stroke 0.5s",
              filter: `drop-shadow(0 0 6px ${layer.accent})`,
            }}
          />
        </svg>

        {/* clickable L1-L4 fields around the wheel (top/right/bottom/left) */}
        {LAYERS.map((l, i) => {
          const a = i * 90; // 0 top, 90 right, 180 bottom, 270 left
          const on = i === selected;
          return (
            <button
              key={l.tag}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => goTo(i)}
              aria-label={`${l.tag} ${l.name}`}
              className="absolute left-1/2 top-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
              style={{
                transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-150px) rotate(${-a}deg)`,
                background: on ? `${l.accent}1f` : "transparent",
                boxShadow: on ? `0 0 18px ${l.accent}55` : "none",
              }}
            >
              <span
                className="font-display text-lg font-bold"
                style={{
                  color: on ? l.accent : "#6a6a72",
                  textShadow: on ? `0 0 16px ${l.accent}` : "none",
                  transform: on ? "scale(1.2)" : "scale(1)",
                  display: "inline-block",
                }}
              >
                {l.tag}
              </span>
            </button>
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
        </div>

        {/* hub — NOT rotating, always readable */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-colors duration-500"
          style={{
            background: "radial-gradient(circle, #16161b, #0a0a0b)",
            border: `1px solid ${layer.accent}55`,
            boxShadow: `0 0 28px ${layer.accent}40`,
          }}
        >
          <span
            className="font-display text-3xl font-black"
            style={{ color: layer.accent, textShadow: `0 0 14px ${layer.accent}` }}
          >
            {layer.tag}
          </span>
        </div>

        <p className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-muted">
          Drehen · Tippen · Schwung geben
        </p>
      </div>

      {/* ===== layer card ===== */}
      <div className="relative h-[320px] w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={layer.tag}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              boxShadow: `0 0 60px ${layer.accent}26`,
              border: `1px solid ${layer.accent}26`,
            }}
          >
            {/* top accent beam */}
            <div
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${layer.accent}, transparent)`,
              }}
            />
            {/* corner brackets */}
            {[
              "left-3 top-3 border-l border-t",
              "right-3 top-3 border-r border-t",
              "left-3 bottom-3 border-l border-b",
              "right-3 bottom-3 border-r border-b",
            ].map((cls) => (
              <span
                key={cls}
                className={`absolute h-4 w-4 ${cls}`}
                style={{ borderColor: `${layer.accent}66` }}
              />
            ))}

            <div className="p-7">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-xl font-display text-4xl font-black"
                  style={{
                    color: "#0a0a0b",
                    background: `linear-gradient(135deg, ${layer.accent}, ${layer.accent}99)`,
                    boxShadow: `0 0 26px ${layer.accent}66`,
                  }}
                >
                  {layer.tag}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-bone md:text-2xl">
                    {layer.name}
                  </h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">
                    Schicht {selected + 1} / 4
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {layer.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg border px-3 py-1.5 text-xs text-bone/90 backdrop-blur-sm"
                    style={{
                      borderColor: `${layer.accent}40`,
                      background: `${layer.accent}12`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <p
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: layer.accent }}
                >
                  Fokus
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {layer.purpose}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
