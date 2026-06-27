"use client";

import { useEffect, useRef } from "react";
import { spawnBurst } from "./burst";

export default function TapBurst() {
  const last = useRef(0);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last.current < 110) return;
      last.current = now;
      spawnBurst(e.clientX, e.clientY);
      window.dispatchEvent(new CustomEvent("ux-burst"));
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
