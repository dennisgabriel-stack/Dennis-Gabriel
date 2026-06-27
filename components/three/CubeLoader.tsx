"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { spawnBurst } from "../burst";

const { lerp, clamp } = THREE.MathUtils;
const G = 0.8; // grid spacing
const CUBE = 0.74; // cubelet size
const W = 2 * (G + CUBE / 2); // overall extent (construction frame)
const WHITE = new THREE.Color(0xffffff);
const BOX_DARK = new THREE.Color(0x131318);
const BOX_LIT = new THREE.Color(0x6a5226);
const GOLD = new THREE.Color(0xc9a86a);
const ORIGIN = new THREE.Vector3();

const smoother = (x: number) => {
  x = clamp(x, 0, 1);
  return x * x * x * (x * (6 * x - 15) + 10);
};
const hash = (x: number, y: number, z: number) => {
  const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return v - Math.floor(v);
};
const emit = (n: string) => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(n));
};

function cubelet(accent: number) {
  const g = new THREE.Group();
  const boxMat = new THREE.MeshBasicMaterial({
    color: BOX_DARK.clone(),
    transparent: true,
    opacity: 0.92,
  });
  const box = new THREE.Mesh(new THREE.BoxGeometry(CUBE, CUBE, CUBE), boxMat);
  const edgeMat = new THREE.LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE, CUBE, CUBE)),
    edgeMat
  );
  g.add(box, edges);
  return { g, edgeMat, boxMat, base: new THREE.Color(accent) };
}

const STEP = 0.1;
const DUR = 0.85;
const CORNER_IN = 0.4;

function Scene({ onSnap }: { onSnap: () => void }) {
  const vproj = useMemo(() => new THREE.Vector3(), []);

  const built = useMemo(() => {
    const root = new THREE.Group();
    const edgeMats: { m: THREE.LineBasicMaterial; base: THREE.Color }[] = [];
    const boxMats: THREE.MeshBasicMaterial[] = [];
    const corners: THREE.Group[] = [];
    const flyers: {
      g: THREE.Group;
      start: THREE.Vector3;
      target: THREE.Vector3;
      dir: THREE.Vector3; // travel direction (for recoil)
      rot: THREE.Euler;
      delay: number;
      landed: boolean;
    }[] = [];

    // ---- architectural construction frame (faint scaffold + joints) ----
    const frameMat = new THREE.LineBasicMaterial({
      color: 0xc9a86a,
      transparent: true,
      opacity: 0.16,
    });
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(W, W, W)),
      frameMat
    );
    root.add(frame);

    // ---- cubelets ----
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
            c.g.position.copy(target);
            c.g.scale.setScalar(0.0001);
            root.add(c.g);
            corners.push(c.g);
          } else {
            const out =
              target.length() > 0.001
                ? target.clone().normalize()
                : new THREE.Vector3(0, 1, 0);
            const start = target
              .clone()
              .add(out.clone().multiplyScalar(4.8))
              .add(
                new THREE.Vector3(
                  (hash(ix, iy, iz) - 0.5) * 2,
                  (hash(iy, iz, ix) - 0.5) * 2,
                  (hash(iz, ix, iy) - 0.5) * 2
                )
              );
            const dir = target.clone().sub(start).normalize(); // inbound direction
            const rot = new THREE.Euler(
              (hash(ix, iy, iz) - 0.5) * 3,
              (hash(iy, ix, iz) - 0.5) * 3,
              0
            );
            c.g.position.copy(start);
            c.g.rotation.copy(rot);
            c.g.scale.setScalar(0.0001);
            root.add(c.g);
            flyers.push({ g: c.g, start, target, dir, rot, delay: 0, landed: false });
          }
        }

    flyers.sort(
      (a, b) =>
        hash(a.target.x, a.target.y, a.target.z) -
        hash(b.target.x, b.target.y, b.target.z)
    );
    flyers.forEach((f, i) => (f.delay = CORNER_IN + i * STEP));
    const maxEnd = CORNER_IN + (flyers.length - 1) * STEP + DUR;

    return { root, frameMat, edgeMats, boxMats, corners, flyers, maxEnd };
  }, []);

  const st = useRef({
    t0: -1,
    snapped: false,
    flash: 0,
    recoil: new THREE.Vector3(),
    recVel: new THREE.Vector3(),
  });
  const acc = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = st.current;
    if (s.t0 < 0) s.t0 = t;
    const T = t - s.t0;

    // spawn click-style shard particles at a cubelet's screen position
    const screenBurst = (local: THREE.Vector3, count: number) => {
      vproj.copy(local);
      built.root.localToWorld(vproj);
      vproj.project(state.camera);
      const rect = state.gl.domElement.getBoundingClientRect();
      const sx = rect.left + (vproj.x * 0.5 + 0.5) * rect.width;
      const sy = rect.top + (-vproj.y * 0.5 + 0.5) * rect.height;
      spawnBurst(sx, sy, count);
    };

    // slow tumble
    built.root.rotation.y += dt * 0.45;
    built.root.rotation.x = 0.3 + Math.sin(t * 0.4) * 0.14;

    // corners materialise
    const ci = smoother(T / CORNER_IN);
    built.corners.forEach((g) => g.scale.setScalar(Math.max(0.0001, ci)));

    // fillers stream in
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
      if (p >= 1 && !f.landed) {
        f.landed = true;
        f.g.position.copy(f.target);
        f.g.scale.setScalar(1);
        f.g.rotation.set(0, 0, 0);
        emit("ux-tick");
        screenBurst(f.target, 7); // click-style shards where it locks in
        // soft impulse into the recoil spring (inbound direction)
        s.recVel.addScaledVector(f.dir, 0.55);
      }
    });

    // completion → klack + flash + big shimmer
    if (!s.snapped && T > built.maxEnd) {
      s.snapped = true;
      s.flash = 1;
      emit("ux-klack");
      screenBurst(ORIGIN, 20); // big shard burst on completion
      onSnap();
    }

    // smooth recoil spring (gentle, slightly damped) + float
    const K = 42; // stiffness
    const C = 13; // damping (near critical → no hard snap)
    acc.copy(s.recoil).multiplyScalar(-K).addScaledVector(s.recVel, -C);
    s.recVel.addScaledVector(acc, dt);
    s.recoil.addScaledVector(s.recVel, dt);
    s.recoil.clampLength(0, 0.3);
    built.root.position.set(
      Math.sin(t * 0.7) * 0.05 + s.recoil.x,
      Math.sin(t * 1.1) * 0.14 + s.recoil.y,
      s.recoil.z
    );

    // light-up pulse on completion
    if (s.flash > 0) {
      s.flash = Math.max(0, s.flash - dt / 0.5);
      const f = s.flash;
      built.edgeMats.forEach(({ m, base }) => {
        m.color.copy(base).lerp(WHITE, f);
        m.opacity = 0.9 + f * 0.1;
      });
      built.boxMats.forEach((m) => m.color.copy(BOX_DARK).lerp(BOX_LIT, f));
      built.frameMat.color.copy(GOLD).lerp(WHITE, f);
      built.frameMat.opacity = 0.16 + f * 0.5;
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
