"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const { clamp, lerp } = THREE.MathUtils;
const ss = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// flow axis (data travels into depth, -Z)
const Z_START = 12;
const Z_END = -66;
const RANGE = Z_START - Z_END;

// stage z-positions
const STAGES = {
  ingest: 8,
  order: -8,
  security: -24,
  orchestrator: -38,
  distribution: -52,
  settlement: -64,
};

const C_GRAY = new THREE.Color(0x5c5c66);
const C_GOLD = new THREE.Color(0xc9a86a);
const C_GOLDB = new THREE.Color(0xe6c88a);
const C_BONE = new THREE.Color(0xf5f4f0);
const C_RED = new THREE.Color(0xc0392b);

// stage thresholds along normalized travel s (0..1)
const sOf = (z: number) => (Z_START - z) / RANGE;
const S_ORDER_A = sOf(STAGES.ingest);
const S_ORDER_B = sOf(STAGES.order);
const S_SEC = sOf(STAGES.security);
const S_ORCH = sOf(STAGES.orchestrator);
const S_DIST_A = sOf(STAGES.orchestrator);
const S_DIST_B = sOf(STAGES.distribution);
const S_SETTLE = sOf(STAGES.settlement);

type P = {
  t: number;
  speed: number;
  seed: number;
  ox: number;
  oy: number;
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  base: number;
  rejected: boolean;
};

function Scene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { pointer } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  const built = useMemo(() => {
    const group = new THREE.Group();
    const spinners: { mesh: THREE.Object3D; ax: "x" | "y" | "z"; sp: number }[] =
      [];
    const pulses: { mesh: THREE.Mesh; phase: number }[] = [];

    // ---- 3D layer planes (you fly through them) ----
    const layerZ = [
      STAGES.ingest,
      STAGES.order,
      STAGES.security,
      STAGES.orchestrator,
      STAGES.distribution,
      STAGES.settlement,
    ];
    layerZ.forEach((z, i) => {
      const geo = new THREE.PlaneGeometry(22, 13, 11, 7);
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        new THREE.LineBasicMaterial({
          color: i % 2 ? 0xc9a86a : 0xf5f4f0,
          transparent: true,
          opacity: 0.05,
        })
      );
      wire.position.z = z;
      group.add(wire);
    });

    // ---- ordering lattice (slots data snaps into) ----
    const GRID_C = 8;
    const GRID_R = 5;
    const slots: { x: number; y: number }[] = [];
    for (let r = 0; r < GRID_R; r++)
      for (let c = 0; c < GRID_C; c++)
        slots.push({ x: (c - (GRID_C - 1) / 2) * 1.05, y: (r - (GRID_R - 1) / 2) * 1.05 });

    const latticeFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(9.2, 6, 0.4)),
      new THREE.LineBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0.22 })
    );
    latticeFrame.position.z = STAGES.order;
    group.add(latticeFrame);

    // ---- security gates (multi-stage) with scan sweeps ----
    const gateDefs = [
      { z: STAGES.security + 3, r: 3.4 },
      { z: STAGES.security, r: 2.9 },
      { z: STAGES.security - 3, r: 2.4 },
    ];
    gateDefs.forEach((g, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(g.r, 0.04, 10, 80),
        new THREE.MeshBasicMaterial({
          color: 0xc9a86a,
          transparent: true,
          opacity: 0.55,
        })
      );
      ring.position.z = g.z;
      group.add(ring);
      spinners.push({ mesh: ring, ax: "z", sp: i % 2 ? -0.5 : 0.5 });

      // radar scan bar
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(g.r * 2, 0.04, 0.04),
        new THREE.MeshBasicMaterial({
          color: 0xe6c88a,
          transparent: true,
          opacity: 0.5,
        })
      );
      bar.position.z = g.z;
      group.add(bar);
      spinners.push({ mesh: bar, ax: "z", sp: 1.4 - i * 0.3 });
    });

    // ---- orchestrator core: hub + radial conductor arms ----
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 1),
      new THREE.MeshBasicMaterial({ color: 0xf5f4f0, wireframe: true })
    );
    core.position.z = STAGES.orchestrator;
    group.add(core);
    spinners.push({ mesh: core, ax: "y", sp: 0.5 });

    const arms = new THREE.Group();
    arms.position.z = STAGES.orchestrator;
    const ARMS = 10;
    for (let i = 0; i < ARMS; i++) {
      const a = (i / ARMS) * Math.PI * 2;
      const tip = new THREE.Vector3(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), tip]),
        new THREE.LineBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0.3 })
      );
      arms.add(line);
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16),
        new THREE.MeshBasicMaterial({ color: 0xc9a86a })
      );
      node.position.copy(tip);
      arms.add(node);
      pulses.push({ mesh: node, phase: i * 0.4 });
    }
    group.add(arms);
    spinners.push({ mesh: arms, ax: "z", sp: 0.18 });

    // ---- distribution destinations + routing lines ----
    const dests = [
      { x: -5, y: 2.6 },
      { x: 5, y: 2.6 },
      { x: -5, y: -2.6 },
      { x: 5, y: -2.6 },
      { x: 0, y: 3.4 },
      { x: 0, y: -3.4 },
    ];
    dests.forEach((d) => {
      const start = new THREE.Vector3(0, 0, STAGES.orchestrator);
      const end = new THREE.Vector3(d.x, d.y, STAGES.distribution);
      const mid = new THREE.Vector3(d.x * 0.5, d.y * 0.5, (start.z + end.z) / 2);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      group.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, 24, 0.015, 6, false),
          new THREE.MeshBasicMaterial({
            color: 0xc9a86a,
            transparent: true,
            opacity: 0.14,
          })
        )
      );
      const marker = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.03, 8, 32),
        new THREE.MeshBasicMaterial({ color: 0xf5f4f0, transparent: true, opacity: 0.6 })
      );
      marker.position.copy(end);
      group.add(marker);
      pulses.push({ mesh: marker, phase: d.x + d.y });
    });

    // ---- settlement ordered grid ----
    const settleFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(9.2, 6, 0.4)),
      new THREE.LineBasicMaterial({ color: 0xf5f4f0, transparent: true, opacity: 0.25 })
    );
    settleFrame.position.z = STAGES.settlement;
    group.add(settleFrame);

    // ---- data particles ----
    const COUNT = 220;
    const packets: P[] = [];
    for (let i = 0; i < COUNT; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 3 + Math.random() * 5;
      const slot = slots[i % slots.length];
      const dest = dests[i % dests.length];
      packets.push({
        t: i / COUNT,
        speed: 0.045 + Math.random() * 0.04,
        seed: Math.random() * 100,
        ox: Math.cos(ang) * rad,
        oy: Math.sin(ang) * rad,
        sx: slot.x,
        sy: slot.y,
        dx: dest.x + (Math.random() - 0.5) * 0.6,
        dy: dest.y + (Math.random() - 0.5) * 0.6,
        base: 0.07 + Math.random() * 0.05,
        rejected: Math.random() < 0.14,
      });
    }
    const inst = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 10, 10),
      new THREE.MeshBasicMaterial({
        toneMapped: false,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
      COUNT
    );
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(inst);

    return { group, spinners, pulses, inst, packets };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progressRef.current ?? 0;
    const { spinners, pulses, inst, packets } = built;

    spinners.forEach((s) => {
      s.mesh.rotation[s.ax] += delta * s.sp;
    });
    pulses.forEach(({ mesh, phase }) => {
      mesh.scale.setScalar(1 + Math.sin(t * 2.4 + phase) * 0.18);
    });

    // particle orchestration: chaos → ordered lattice → distribution → settled
    for (let i = 0; i < packets.length; i++) {
      const pk = packets[i];
      pk.t += pk.speed * delta;
      if (pk.t >= 1) {
        pk.t -= 1;
        pk.rejected = Math.random() < 0.14;
      }
      const s = pk.t;
      const z = Z_START - s * RANGE;

      const orderMix = ss(S_ORDER_A, S_ORDER_B, s);
      const distMix = ss(S_DIST_A, S_DIST_B, s);
      let x = lerp(lerp(pk.ox, pk.sx, orderMix), pk.dx, distMix);
      let y = lerp(lerp(pk.oy, pk.sy, orderMix), pk.dy, distMix);
      // settle back into ordered grid
      const settleMix = ss(S_DIST_B, S_SETTLE, s);
      x = lerp(x, pk.sx, settleMix);
      y = lerp(y, pk.sy, settleMix);

      let scale = pk.base;

      if (pk.rejected && s > S_SEC - 0.02) {
        const k = clamp((s - (S_SEC - 0.02)) / 0.06, 0, 1);
        const out = 1 + k * 1.8;
        x *= out;
        y *= out;
        col.copy(C_RED);
        scale = pk.base * (1 - k * 0.9);
        if (s > S_SEC + 0.06) {
          pk.t = 0;
          pk.rejected = Math.random() < 0.14;
        }
      } else if (s < S_ORDER_B) {
        col.copy(C_GRAY);
      } else if (s < S_SEC) {
        col.lerpColors(C_GRAY, C_GOLD, ss(S_ORDER_B, S_SEC, s));
      } else if (s < S_ORCH) {
        col.copy(C_GOLDB);
        scale = pk.base * (1 + Math.sin(t * 9 + pk.seed) * 0.15);
      } else if (s < S_DIST_B) {
        col.copy(C_GOLDB);
      } else {
        col.lerpColors(C_GOLDB, C_BONE, ss(S_DIST_B, S_SETTLE, s));
      }

      const fade = ss(0, 0.03, s) * (1 - ss(0.97, 1, s));
      scale *= fade;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.max(0.0001, scale));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, col);
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;

    // scroll-driven camera dolly through the pipeline
    const camZ = lerp(22, -56, p);
    const cam = state.camera;
    cam.position.x = lerp(cam.position.x, Math.sin(t * 0.1) * 1.4 + pointer.x * 2, 0.05);
    cam.position.y = lerp(cam.position.y, 2.4 + Math.sin(t * 0.13) * 0.5 - pointer.y * 1.4, 0.05);
    cam.position.z = lerp(cam.position.z, camZ, 0.08);
    cam.lookAt(0, 0, cam.position.z - 16);
  });

  return <primitive object={built.group} />;
}

export default function TransactionFlow({
  progressRef,
}: {
  progressRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 2.4, 22], fov: 50, far: 220 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[0x0a0a0b, 16, 72]} />
      <Scene progressRef={progressRef} />
    </Canvas>
  );
}
