"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const { lerp } = THREE.MathUtils;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const S = 1.06; // spacing of the 2×2×2 grid
const HALF = S / 2;
const WHITE = new THREE.Color(0xffffff);
const START = new THREE.Vector3(6.5, 5, 7.5); // where the corner flies in from
const TARGET = new THREE.Vector3(HALF, HALF, HALF); // the empty corner slot

// build a single Rubik cubelet (dark face + glowing gold edges)
const BOX_DARK = new THREE.Color(0x121215);
const BOX_LIT = new THREE.Color(0x6a5226);

function cubelet(accent: number) {
  const g = new THREE.Group();
  const boxMat = new THREE.MeshBasicMaterial({ color: BOX_DARK.clone() });
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.96, 0.96), boxMat);
  const edgeMat = new THREE.LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(0.96, 0.96, 0.96)),
    edgeMat
  );
  g.add(box, edges);
  return { g, edgeMat, boxMat, base: new THREE.Color(accent) };
}

function Scene({
  phaseRef,
  onSnap,
}: {
  phaseRef: MutableRefObject<"in" | "snap">;
  onSnap: () => void;
}) {
  const built = useMemo(() => {
    const root = new THREE.Group();
    const edgeMats: { m: THREE.LineBasicMaterial; base: THREE.Color }[] = [];
    const boxMats: THREE.MeshBasicMaterial[] = [];

    // 7 present cubelets (every corner except +,+,+)
    for (const x of [-1, 1])
      for (const y of [-1, 1])
        for (const z of [-1, 1]) {
          if (x > 0 && y > 0 && z > 0) continue; // leave the corner empty
          const c = cubelet(0xc9a86a);
          c.g.position.set(x * HALF, y * HALF, z * HALF);
          root.add(c.g);
          edgeMats.push({ m: c.edgeMat, base: c.base });
          boxMats.push(c.boxMat);
        }

    // the missing corner cubelet (flies in at the end)
    const corner = cubelet(0xe6c88a);
    corner.g.position.copy(START);
    corner.g.scale.setScalar(0.0001);
    root.add(corner.g);
    edgeMats.push({ m: corner.edgeMat, base: corner.base });
    boxMats.push(corner.boxMat);

    return { root, corner: corner.g, edgeMats, boxMats };
  }, []);

  const st = useRef({ prog: 0, snapped: false, flash: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // floating, slow majestic tumble
    built.root.rotation.y += dt * 0.5;
    built.root.rotation.x = 0.3 + Math.sin(t * 0.45) * 0.16;
    built.root.position.y = Math.sin(t * 1.2) * 0.16; // gentle hover
    built.root.position.x = Math.sin(t * 0.8) * 0.06;

    const s = st.current;
    if (phaseRef.current === "snap" && !s.snapped) {
      s.prog = Math.min(1, s.prog + dt / 0.5);
      const e = easeOut(s.prog);
      built.corner.position.lerpVectors(START, TARGET, e);
      built.corner.scale.setScalar(lerp(0.2, 1, Math.min(1, e * 1.2)));
      if (s.prog >= 1) {
        s.snapped = true;
        s.flash = 1;
        built.corner.position.copy(TARGET);
        onSnap();
      }
    }

    // flash + overshoot pop when it locks in
    if (s.flash > 0) {
      s.flash = Math.max(0, s.flash - dt / 0.45);
      const f = s.flash;
      built.edgeMats.forEach(({ m, base }) => {
        m.color.copy(base).lerp(WHITE, f);
        m.opacity = 0.95 + f * 0.05;
      });
      built.boxMats.forEach((m) => {
        m.color.copy(BOX_DARK).lerp(BOX_LIT, f); // faces light up
      });
      built.corner.scale.setScalar(1 + f * 0.28);
    }
  });

  return <primitive object={built.root} />;
}

export default function CubeLoader({
  phaseRef,
  onSnap,
}: {
  phaseRef: MutableRefObject<"in" | "snap">;
  onSnap: () => void;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [4.2, 3.4, 6], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Scene phaseRef={phaseRef} onSnap={onSnap} />
    </Canvas>
  );
}
