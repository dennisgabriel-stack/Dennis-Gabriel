"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#e6c88a", "#c9a86a", "#f5f4f0"];

function spawn(x: number, y: number) {
  const N = 13;
  for (let i = 0; i < N; i++) {
    const el = document.createElement("div");
    const size = 8 + Math.random() * 12;
    const color = COLORS[i % COLORS.length];
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border:1.5px solid ${color};background:${color}22;border-radius:2px;pointer-events:none;z-index:65;transform:translate(-50%,-50%);will-change:transform,opacity;box-shadow:0 0 8px ${color}55;`;
    document.body.appendChild(el);

    const ang = Math.random() * Math.PI * 2;
    const dist = 28 + Math.random() * 78;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist;
    const rot = (Math.random() - 0.5) * 420;

    const anim = el.animate(
      [
        {
          transform: "translate(-50%,-50%) scale(0) rotate(0deg)",
          opacity: 0,
        },
        {
          transform: `translate(calc(-50% + ${dx * 0.55}px),calc(-50% + ${
            dy * 0.55
          }px)) scale(1) rotate(${rot * 0.5}deg)`,
          opacity: 1,
          offset: 0.28,
        },
        {
          transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1) rotate(${rot}deg)`,
          opacity: 1,
          offset: 0.62,
        },
        {
          transform: `translate(calc(-50% + ${dx * 1.15}px),calc(-50% + ${
            dy * 1.15
          }px)) scale(0.1) rotate(${rot * 1.3}deg)`,
          opacity: 0,
        },
      ],
      { duration: 1050 + Math.random() * 300, easing: "cubic-bezier(0.16,1,0.3,1)" }
    );
    anim.onfinish = () => el.remove();
  }
}

export default function TapBurst() {
  const last = useRef(0);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last.current < 110) return;
      last.current = now;
      spawn(e.clientX, e.clientY);
      window.dispatchEvent(new CustomEvent("ux-burst"));
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
