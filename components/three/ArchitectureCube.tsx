"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const { clamp } = THREE.MathUtils;
// smootherstep
const ss = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

function Structure({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  const visibleCount = useRef(0);
  const built = useMemo(() => {
    const S = 1.0;
    const GAP = 0.16;
    const STEP = S + GAP;

    const root = new THREE.Group();
    root.rotation.set(0.5, 0.7, 0);

    // --- 3x3x3 grid of wireframe cells (Rubik's-cube-like) ---
    const cellGeo = new THREE.BoxGeometry(S, S, S);
    const cellEdges = new THREE.EdgesGeometry(cellGeo);
    const coords = [-1, 0, 1];
    const data: number[][] = [];
    coords.forEach((x) =>
      coords.forEach((y) => coords.forEach((z) => data.push([x, y, z])))
    );
    // reveal from the centre outwards
    data.sort(
      (a, b) =>
        a[0] ** 2 + a[1] ** 2 + a[2] ** 2 - (b[0] ** 2 + b[1] ** 2 + b[2] ** 2)
    );

    const cells: { seg: THREE.LineSegments; thr: number }[] = [];
    const n = data.length;
    data.forEach(([x, y, z], i) => {
      const mat = new THREE.LineBasicMaterial({
        color: 0xc9a86a,
        transparent: true,
        opacity: 0,
      });
      const seg = new THREE.LineSegments(cellEdges, mat);
      seg.position.set(x * STEP, y * STEP, z * STEP);
      seg.scale.setScalar(0.0001);
      root.add(seg);
      cells.push({ seg, thr: 0.16 + (i / (n - 1)) * 0.5 });
    });

    // --- outer bounding cube (drawn first) ---
    const outerSize = 2 * STEP + S;
    const outerMat = new THREE.LineBasicMaterial({
      color: 0xf5f4f0,
      transparent: true,
      opacity: 0,
    });
    const outer = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(outerSize, outerSize, outerSize)),
      outerMat
    );
    root.add(outer);

    // --- architectural dimension lines (appear last) ---
    const half = outerSize / 2;
    const off = half + 0.55;
    const tick = 0.14;
    const pts: THREE.Vector3[] = [];
    const push = (
      a: [number, number, number],
      b: [number, number, number]
    ) => {
      pts.push(new THREE.Vector3(...a), new THREE.Vector3(...b));
    };
    // width (x) along front-bottom
    push([-half, -off, half], [half, -off, half]);
    push([-half, -half, half], [-half, -off - tick, half]);
    push([half, -half, half], [half, -off - tick, half]);
    // height (y) along front-right
    push([off, -half, half], [off, half, half]);
    push([half, -half, half], [off + tick, -half, half]);
    push([half, half, half], [off + tick, half, half]);
    // depth (z) along right-bottom
    push([half, -off, -half], [half, -off, half]);
    push([half, -half, -half], [half, -off - tick, -half]);
    push([half, -half, half], [half, -off - tick, half]);

    const dimMat = new THREE.LineBasicMaterial({
      color: 0x8a8a8f,
      transparent: true,
      opacity: 0,
    });
    const dims = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(pts),
      dimMat
    );
    root.add(dims);

    return { root, cells, outer, outerMat, dims, dimMat };
  }, []);

  useFrame((state, delta) => {
    const p = progressRef.current ?? 0;
    const { root, cells, outer, outerMat, dimMat } = built;

    // continuous orbital rotation, accelerated by scroll
    root.rotation.y += delta * (0.22 + p * 0.5);
    root.rotation.x =
      0.5 + p * 0.45 + Math.sin(state.clock.elapsedTime * 0.12) * 0.06;

    // outer cube draws in first
    const o = ss(0.0, 0.16, p);
    outerMat.opacity = o * 0.5;
    outer.scale.setScalar(0.85 + o * 0.15);

    // cells reveal from the centre outwards
    let visible = 0;
    for (const { seg, thr } of cells) {
      const e = ss(thr, thr + 0.12, p);
      seg.scale.setScalar(Math.max(0.0001, e));
      (seg.material as THREE.LineBasicMaterial).opacity = e * 0.9;
      if (e > 0.5) visible++;
    }
    // a soft snap each time another cube locks into place
    if (visible > visibleCount.current) {
      window.dispatchEvent(new CustomEvent("ux-block"));
    }
    visibleCount.current = visible;

    // dimension lines fade in last
    dimMat.opacity = ss(0.6, 0.9, p) * 0.7;
  });

  return <primitive object={built.root} />;
}

export default function ArchitectureCube({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [5.5, 3.8, 6.5], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Structure progressRef={progressRef} />
    </Canvas>
  );
}
