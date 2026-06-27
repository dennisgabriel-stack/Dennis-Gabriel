"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const { lerp } = THREE.MathUtils;
const G = 0.8; // grid spacing
const CUBE = 0.74; // cubelet size
const WHITE = new THREE.Color(0xffffff);
const BOX_DARK = new THREE.Color(0x121215);
const BOX_LIT = new THREE.Color(0x6a5226);

const smoother = (x: number) => {
  x = Math.min(1, Math.max(0, x));
  return x * x * x * (x * (6 * x - 15) + 10);
};
const hash = (x: number, y: number, z: number) => {
  const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return v - Math.floor(v);
};
const emit = (n: string) => {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent(n));
};

function cubelet(accent: number) {
  const g = new THREE.Group();
  const boxMat = new THREE.MeshBasicMaterial({ color: BOX_DARK.clone() });
  const box = new THREE.Mesh(new THREE.BoxGeometry(CUBE, CUBE, CUBE), boxMat);
  const edgeMat = new THREE.LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE, CUBE, CUBE)),
    edgeMat
  );
  g.add(box, edges);
  return { g, edgeMat, boxMat, base: new THREE.Color(accent) };
}

const STEP = 0.1; // stagger between fly-ins
const DUR = 0.85; // flight duration per cubelet
const CORNER_IN = 0.4; // corners scale-in time

function Scene({ onSnap }: { onSnap: () => void }) {
  const built = useMemo(() => {
    const root = new THREE.Group();
    const edgeMats: { m: THREE.LineBasicMaterial; base: THREE.Color }[] = [];
    const boxMats: THREE.MeshBasicMaterial[] = [];
    const corners: THREE.Group[] = [];
    const flyers: {
      g: THREE.Group;
      start: THREE.Vector3;
      target: THREE.Vector3;
      rot: THREE.Euler;
      delay: number;
      landed: boolean;
    }[] = [];

    const coords = [-1, 0, 1];
    for (const ix of coords)
      for (const iy of coords)
        for (const iz of coords) {
          const target = new THREE.Vector3(ix * G, iy * G, iz * G);
          const isCorner = ix !== 0 && iy !== 0 && iz !== 0;
          const c = cubelet(isCorner ? 0xc9a86a : 0xe6c88a);
          edgeMats.push({ m: c.edgeMat, base: c.base });
          boxMats.push(c.boxMat);

          if (isCorner) {
            // the initial "2×2" — 8 corners present from the start
            c.g.position.copy(target);
            c.g.scale.setScalar(0.0001);
            root.add(c.g);
            corners.push(c.g);
          } else {
            // fillers fly in from outside, from their own direction
            const dir =
              target.length() > 0.001
                ? target.clone().normalize()
                : new THREE.Vector3(0, 1, 0);
            const start = target
              .clone()
              .add(dir.multiplyScalar(4.8))
              .add(
                new THREE.Vector3(
                  (hash(ix, iy, iz) - 0.5) * 2,
                  (hash(iy, iz, ix) - 0.5) * 2,
                  (hash(iz, ix, iy) - 0.5) * 2
                )
              );
            const rot = new THREE.Euler(
              (hash(ix, iy, iz) - 0.5) * 3,
              (hash(iy, ix, iz) - 0.5) * 3,
              0
            );
            c.g.position.copy(start);
            c.g.rotation.copy(rot);
            c.g.scale.setScalar(0.0001);
            root.add(c.g);
            flyers.push({ g: c.g, start, target, rot, delay: 0, landed: false });
          }
        }

    // deterministic shuffle so they arrive from varied directions in sequence
    flyers.sort(
      (a, b) =>
        hash(a.target.x, a.target.y, a.target.z) -
        hash(b.target.x, b.target.y, b.target.z)
    );
    flyers.forEach((f, i) => (f.delay = CORNER_IN + i * STEP));
    const maxEnd = CORNER_IN + (flyers.length - 1) * STEP + DUR;

    return { root, edgeMats, boxMats, corners, flyers, maxEnd };
  }, []);

  const st = useRef({ t0: -1, snapped: false, flash: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = st.current;
    if (s.t0 < 0) s.t0 = t;
    const T = t - s.t0;

    // floating, slow tumble
    built.root.rotation.y += dt * 0.45;
    built.root.rotation.x = 0.3 + Math.sin(t * 0.4) * 0.14;
    built.root.position.y = Math.sin(t * 1.1) * 0.14;
    built.root.position.x = Math.sin(t * 0.7) * 0.05;

    // corners materialise
    const ci = smoother(T / CORNER_IN);
    built.corners.forEach((g) => g.scale.setScalar(Math.max(0.0001, ci)));

    // fillers stream in, staggered & smooth
    built.flyers.forEach((f) => {
      const p = (T - f.delay) / DUR;
      if (p <= 0) {
        f.g.scale.setScalar(0.0001);
        return;
      }
      const e = smoother(p);
      f.g.position.lerpVectors(f.start, f.target, e);
      f.g.scale.setScalar(lerp(0.45, 1, e));
      f.g.rotation.set(f.rot.x * (1 - e), f.rot.y * (1 - e), 0);
      if (p >= 1) {
        f.g.position.copy(f.target);
        f.g.scale.setScalar(1);
        f.g.rotation.set(0, 0, 0);
        if (!f.landed) {
          f.landed = true;
          emit("ux-tick"); // soft tick as each piece lands
        }
      }
    });

    // completion → klack + glow
    if (!s.snapped && T > built.maxEnd) {
      s.snapped = true;
      s.flash = 1;
      emit("ux-klack");
      onSnap();
    }

    // gentle light-up pulse on completion
    if (s.flash > 0) {
      s.flash = Math.max(0, s.flash - dt / 0.5);
      const f = s.flash;
      built.edgeMats.forEach(({ m, base }) => {
        m.color.copy(base).lerp(WHITE, f);
        m.opacity = 0.95 + f * 0.05;
      });
      built.boxMats.forEach((m) => m.color.copy(BOX_DARK).lerp(BOX_LIT, f));
      built.root.scale.setScalar(1 + f * 0.05);
    } else {
      built.root.scale.setScalar(1);
    }
  });

  return <primitive object={built.root} />;
}

export default function CubeLoader({ onSnap }: { onSnap: () => void }) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [4.8, 3.8, 6.8], fov: 33 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Scene onSnap={onSnap} />
    </Canvas>
  );
}
