"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Node = {
  id: string;
  pos: [number, number, number];
  kind: "wallet" | "hub" | "main" | "fee";
};

const NODES: Node[] = [
  { id: "in1", pos: [-7, 1.7, 0], kind: "wallet" },
  { id: "in2", pos: [-7, -1.7, 0], kind: "wallet" },
  { id: "hub1", pos: [-2.6, 0, 0], kind: "hub" },
  { id: "feeP", pos: [-0.4, 2.9, 0.6], kind: "fee" },
  { id: "burn", pos: [-0.4, -2.9, -0.6], kind: "fee" },
  { id: "hub2", pos: [1.8, 0, 0], kind: "hub" },
  { id: "feeT", pos: [4.6, 2.7, 0.6], kind: "fee" },
  { id: "feeV", pos: [4.6, -2.7, -0.6], kind: "fee" },
  { id: "out", pos: [7, 0, 0], kind: "main" },
];

const EDGES: { from: string; to: string; fee: boolean }[] = [
  { from: "in1", to: "hub1", fee: false },
  { from: "in2", to: "hub1", fee: false },
  { from: "hub1", to: "hub2", fee: false },
  { from: "hub1", to: "feeP", fee: true },
  { from: "hub1", to: "burn", fee: true },
  { from: "hub2", to: "out", fee: false },
  { from: "hub2", to: "feeT", fee: true },
  { from: "hub2", to: "feeV", fee: true },
];

const BONE = new THREE.Color(0xf5f4f0);
const GOLD = new THREE.Color(0xc9a86a);

function Network() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { group, instanced, packets, curves, nodeMeshes } = useMemo(() => {
    const map = new Map(NODES.map((n) => [n.id, new THREE.Vector3(...n.pos)]));
    const group = new THREE.Group();

    // --- pipelines (tubes) ---
    const curves: THREE.CubicBezierCurve3[] = [];
    EDGES.forEach((e) => {
      const a = map.get(e.from)!;
      const b = map.get(e.to)!;
      const midx = a.x + (b.x - a.x) * 0.5;
      // leaves A horizontally, arrives B horizontally → pipeline feel
      const c1 = new THREE.Vector3(midx, a.y, a.z);
      const c2 = new THREE.Vector3(midx, b.y, b.z);
      const curve = new THREE.CubicBezierCurve3(a.clone(), c1, c2, b.clone());
      curves.push(curve);

      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, e.fee ? 0.022 : 0.04, 8, false),
        new THREE.MeshBasicMaterial({
          color: e.fee ? GOLD : BONE,
          transparent: true,
          opacity: e.fee ? 0.16 : 0.22,
        })
      );
      group.add(tube);
    });

    // --- nodes ---
    const nodeMeshes: { mesh: THREE.Mesh; phase: number }[] = [];
    NODES.forEach((n, i) => {
      const isFee = n.kind === "fee";
      const r =
        n.kind === "hub" ? 0.26 : n.kind === "main" ? 0.3 : isFee ? 0.16 : 0.2;
      const geo =
        n.kind === "hub"
          ? new THREE.OctahedronGeometry(r)
          : new THREE.IcosahedronGeometry(r, 0);
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color: isFee ? GOLD : BONE })
      );
      mesh.position.copy(map.get(n.id)!);
      group.add(mesh);

      // halo ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r * 1.6, r * 1.75, 32),
        new THREE.MeshBasicMaterial({
          color: isFee ? GOLD : BONE,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        })
      );
      ring.position.copy(map.get(n.id)!);
      group.add(ring);

      nodeMeshes.push({ mesh, phase: i * 0.7 });
    });

    // --- flowing packets (transactions + fees) ---
    type P = { edge: number; phase: number; speed: number; scale: number; fee: boolean };
    const packets: P[] = [];
    EDGES.forEach((e, ei) => {
      const n = e.fee ? 4 : 7;
      for (let k = 0; k < n; k++) {
        packets.push({
          edge: ei,
          phase: k / n,
          speed: e.fee ? 0.22 : 0.13,
          scale: e.fee ? 0.06 : 0.1,
          fee: e.fee,
        });
      }
    });

    const instanced = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 12, 12),
      new THREE.MeshBasicMaterial({ toneMapped: false }),
      packets.length
    );
    instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    packets.forEach((p, i) => instanced.setColorAt(i, p.fee ? GOLD : BONE));
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    group.add(instanced);

    return { group, instanced, packets, curves, nodeMeshes };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // flowing packets
    const tmp = new THREE.Vector3();
    packets.forEach((p, i) => {
      const tt = (t * p.speed + p.phase) % 1;
      curves[p.edge].getPointAt(tt, tmp);
      dummy.position.copy(tmp);
      // fade in/out at the ends of each pipe
      const edgeFade = Math.sin(tt * Math.PI);
      dummy.scale.setScalar(p.scale * (0.5 + edgeFade * 0.5));
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;

    // pulsing nodes
    nodeMeshes.forEach(({ mesh, phase }) => {
      const s = 1 + Math.sin(t * 1.6 + phase) * 0.12;
      mesh.scale.setScalar(s);
      mesh.rotation.y += 0.01;
      mesh.rotation.x += 0.004;
    });

    // gentle parallax
    if (groupRef.current) {
      groupRef.current.rotation.y +=
        (pointer.x * 0.25 - groupRef.current.rotation.y) * 0.04 +
        Math.sin(t * 0.08) * 0.0008;
      groupRef.current.rotation.x +=
        (-pointer.y * 0.15 - groupRef.current.rotation.x) * 0.04;
    }
  });

  return <primitive ref={groupRef} object={group} />;
}

export default function TransactionFlow() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 13], fov: 46 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Network />
    </Canvas>
  );
}
