"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const { clamp, lerp } = THREE.MathUtils;

// pipeline stations along X
const ORIGIN = -9;
const VALIDATION = -3;
const CONSENSUS = 0;
const EXECUTION = 3;
const SETTLEMENT = 6;
const RANGE = SETTLEMENT - ORIGIN;

const LANES = [
  { y: 0, z: 0 },
  { y: 0.6, z: 1.4 },
  { y: -0.6, z: 1.4 },
  { y: 0.6, z: -1.4 },
  { y: -0.6, z: -1.4 },
  { y: 1.3, z: 0 },
  { y: -1.3, z: 0 },
];

const C_GRAY = new THREE.Color(0x6a6a72);
const C_GOLD = new THREE.Color(0xc9a86a);
const C_GOLDB = new THREE.Color(0xe6c88a);
const C_BONE = new THREE.Color(0xf5f4f0);
const C_RED = new THREE.Color(0xc0392b);

type Packet = {
  u: number;
  lane: number;
  speed: number;
  seed: number;
  base: number;
  rejected: boolean;
};

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  const built = useMemo(() => {
    const group = new THREE.Group();
    group.rotation.x = 0.18;

    const dynamic: { mesh: THREE.Mesh; axis: "x" | "y"; speed: number }[] = [];
    const pulses: { mesh: THREE.Mesh; phase: number }[] = [];

    // --- lane guide lines (the bundled pipeline) ---
    LANES.forEach((l) => {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(ORIGIN, l.y, l.z),
        new THREE.Vector3(SETTLEMENT, l.y, l.z),
      ]);
      group.add(
        new THREE.Line(
          g,
          new THREE.LineBasicMaterial({
            color: 0xf5f4f0,
            transparent: true,
            opacity: 0.06,
          })
        )
      );
    });

    // --- security gates (rings packets pass through) ---
    const gate = (x: number, r: number, color: number, op: number) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.05, 10, 64),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op })
      );
      m.position.x = x;
      m.rotation.y = Math.PI / 2; // hole faces X → packets pass through
      group.add(m);
      return m;
    };
    dynamic.push({ mesh: gate(VALIDATION, 2.2, 0xc9a86a, 0.5), axis: "x", speed: 0.4 });
    dynamic.push({ mesh: gate(EXECUTION, 2.2, 0xc9a86a, 0.5), axis: "x", speed: -0.4 });

    // inner validation discs
    const disc1 = gate(VALIDATION, 1.4, 0xe6c88a, 0.25);
    const disc2 = gate(EXECUTION, 1.4, 0xe6c88a, 0.25);
    dynamic.push({ mesh: disc1, axis: "x", speed: -0.7 });
    dynamic.push({ mesh: disc2, axis: "x", speed: 0.7 });

    // --- consensus core + 3D validator ring + shield ---
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7, 0),
      new THREE.MeshBasicMaterial({ color: 0xf5f4f0, wireframe: true })
    );
    core.position.x = CONSENSUS;
    group.add(core);
    dynamic.push({ mesh: core, axis: "y", speed: 0.5 });

    const shield = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.04, 10, 80),
      new THREE.MeshBasicMaterial({
        color: 0xf5f4f0,
        transparent: true,
        opacity: 0.3,
      })
    );
    shield.position.x = CONSENSUS;
    shield.rotation.y = Math.PI / 2;
    group.add(shield);
    dynamic.push({ mesh: shield, axis: "x", speed: 0.6 });

    const VALIDATORS = 8;
    const ring = new THREE.Group();
    ring.position.x = CONSENSUS;
    for (let i = 0; i < VALIDATORS; i++) {
      const a = (i / VALIDATORS) * Math.PI * 2;
      const v = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18),
        new THREE.MeshBasicMaterial({ color: 0xc9a86a })
      );
      v.position.set(0, Math.cos(a) * 2.4, Math.sin(a) * 2.4);
      ring.add(v);
      pulses.push({ mesh: v, phase: i * 0.5 });
    }
    group.add(ring);
    dynamic.push({ mesh: ring as unknown as THREE.Mesh, axis: "x", speed: 0.25 });

    // --- station nodes (origin / settlement) ---
    const station = (x: number, r: number, color: number) => {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(r, 0),
        new THREE.MeshBasicMaterial({ color })
      );
      m.position.x = x;
      group.add(m);
      pulses.push({ mesh: m, phase: x });
      return m;
    };
    station(ORIGIN, 0.34, 0xf5f4f0);
    const settle = station(SETTLEMENT, 0.4, 0xf5f4f0);

    // --- fee distribution branches (3D) ---
    const settlePos = new THREE.Vector3(SETTLEMENT, 0, 0);
    const recipients = [
      new THREE.Vector3(5, 3.4, 1.6),
      new THREE.Vector3(5, -3.4, -1.6),
      new THREE.Vector3(8.2, 1.8, 2.6),
      new THREE.Vector3(8.2, -1.8, -2.6),
    ];
    const feeCurves: THREE.CubicBezierCurve3[] = [];
    recipients.forEach((b) => {
      const c1 = new THREE.Vector3(
        (settlePos.x + b.x) / 2,
        settlePos.y,
        settlePos.z
      );
      const c2 = new THREE.Vector3((settlePos.x + b.x) / 2, b.y, b.z);
      const curve = new THREE.CubicBezierCurve3(settlePos.clone(), c1, c2, b);
      feeCurves.push(curve);
      group.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, 32, 0.02, 6, false),
          new THREE.MeshBasicMaterial({
            color: 0xc9a86a,
            transparent: true,
            opacity: 0.16,
          })
        )
      );
      const r = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16),
        new THREE.MeshBasicMaterial({ color: 0xc9a86a })
      );
      r.position.copy(b);
      group.add(r);
      pulses.push({ mesh: r, phase: b.y });
    });

    // --- transaction packets (instanced) ---
    const COUNT = 56;
    const packets: Packet[] = [];
    for (let i = 0; i < COUNT; i++) {
      packets.push({
        u: i / COUNT,
        lane: i % LANES.length,
        speed: 0.05 + Math.random() * 0.05,
        seed: Math.random() * 100,
        base: 0.08 + Math.random() * 0.04,
        rejected: Math.random() < 0.16,
      });
    }
    const tx = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 12, 12),
      new THREE.MeshBasicMaterial({ toneMapped: false }),
      COUNT
    );
    tx.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(tx);

    // --- fee packets (instanced, gold) ---
    const FEE_COUNT = feeCurves.length * 5;
    const feePackets: { curve: number; phase: number; speed: number }[] = [];
    feeCurves.forEach((_, ci) => {
      for (let k = 0; k < 5; k++)
        feePackets.push({ curve: ci, phase: k / 5, speed: 0.25 });
    });
    const fee = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xc9a86a, toneMapped: false }),
      FEE_COUNT
    );
    fee.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(fee);

    return {
      group,
      dynamic,
      pulses,
      tx,
      packets,
      fee,
      feePackets,
      feeCurves,
      settle,
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { group, dynamic, pulses, tx, packets, fee, feePackets, feeCurves } =
      built;

    // rotating gates / cores / rings → reveals 3D depth
    dynamic.forEach((d) => {
      if (d.axis === "x") d.mesh.rotation.x += delta * d.speed;
      else d.mesh.rotation.y += delta * d.speed;
    });
    pulses.forEach(({ mesh, phase }) => {
      mesh.scale.setScalar(1 + Math.sin(t * 2 + phase) * 0.15);
    });

    // --- transaction lifecycle ---
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i];
      p.u += p.speed * delta;
      if (p.u >= 1) {
        p.u -= 1;
        p.rejected = Math.random() < 0.16;
        p.speed = 0.05 + Math.random() * 0.05;
        p.lane = Math.floor(Math.random() * LANES.length);
      }
      const u = p.u;
      const lane = LANES[p.lane];
      let x = ORIGIN + u * RANGE;
      let y = lane.y + Math.sin(t * 1.3 + p.seed) * 0.06;
      let z = lane.z;
      let scale = p.base;

      if (p.rejected && u > 0.4) {
        // rejected at the validation gate → diverts, reddens, drops away
        const k = clamp((u - 0.4) / 0.2, 0, 1);
        y -= k * 3.8;
        z += Math.sin(p.seed) * k * 0.6;
        col.copy(C_RED);
        scale = p.base * (1 - k * 0.9);
        if (u > 0.62) {
          p.u = 0;
          p.rejected = Math.random() < 0.16;
        }
      } else if (u < 0.4) {
        col.copy(C_GRAY); // pending in mempool / pre-validation
      } else if (u < 0.6) {
        col.lerpColors(C_GRAY, C_GOLD, (u - 0.4) / 0.2); // validating
      } else if (u < 0.8) {
        col.copy(C_GOLDB); // consensus + execution
        scale = p.base * (1 + Math.sin(t * 8 + p.seed) * 0.12);
      } else {
        col.lerpColors(C_GOLDB, C_BONE, (u - 0.8) / 0.2); // settled
      }

      const fadeIn = clamp(u / 0.04, 0, 1);
      scale *= fadeIn;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.max(0.0001, scale));
      dummy.updateMatrix();
      tx.setMatrixAt(i, dummy.matrix);
      tx.setColorAt(i, col);
    }
    tx.instanceMatrix.needsUpdate = true;
    if (tx.instanceColor) tx.instanceColor.needsUpdate = true;

    // --- fee packets flowing to recipients ---
    const tmp = new THREE.Vector3();
    for (let i = 0; i < feePackets.length; i++) {
      const fp = feePackets[i];
      const tt = (t * fp.speed + fp.phase) % 1;
      feeCurves[fp.curve].getPointAt(tt, tmp);
      dummy.position.copy(tmp);
      dummy.scale.setScalar(0.06 * (0.5 + Math.sin(tt * Math.PI) * 0.5));
      dummy.updateMatrix();
      fee.setMatrixAt(i, dummy.matrix);
    }
    fee.instanceMatrix.needsUpdate = true;

    // slow orbital reveal + pointer parallax
    if (groupRef.current) {
      const targetY = pointer.x * 0.4 + Math.sin(t * 0.1) * 0.25;
      const targetX = 0.18 - pointer.y * 0.2;
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, targetY, 0.05);
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, targetX, 0.05);
    }
  });

  return <primitive ref={groupRef} object={built.group} />;
}

export default function TransactionFlow() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0.5, 1.4, 15], fov: 44 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Scene />
    </Canvas>
  );
}
