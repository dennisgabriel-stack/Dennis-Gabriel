"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
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

// 3x3 grid texture → little Rubik-cube faces
function makeGridTex() {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(0, 0, S, S);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, S - 8, S - 8);
  ctx.lineWidth = 5;
  for (let i = 1; i < 3; i++) {
    const p = (S / 3) * i;
    ctx.beginPath();
    ctx.moveTo(p, 6);
    ctx.lineTo(p, S - 6);
    ctx.moveTo(6, p);
    ctx.lineTo(S - 6, p);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

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
  const { gl } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const orbit = useRef({
    yaw: 0,
    pitch: 0,
    tyaw: 0,
    tpitch: 0,
    drag: false,
    lx: 0,
    ly: 0,
  });

  // mouse-drag orbit (touch left for page scrolling)
  useEffect(() => {
    const el = gl.domElement;
    const o = orbit.current;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      o.drag = true;
      o.lx = e.clientX;
      o.ly = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!o.drag) return;
      o.tyaw += (e.clientX - o.lx) * 0.005;
      o.tpitch = clamp(o.tpitch - (e.clientY - o.ly) * 0.004, -1.2, 1.2);
      o.lx = e.clientX;
      o.ly = e.clientY;
    };
    const up = () => {
      o.drag = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [gl]);

  const built = useMemo(() => {
    const group = new THREE.Group();
    const spinners: { mesh: THREE.Object3D; ax: "x" | "y" | "z"; sp: number }[] =
      [];
    const pulses: { mesh: THREE.Mesh; phase: number }[] = [];

    // ---- ingest funnel: narrowing, rotating rings that catch the data ----
    for (let i = 0; i < 8; i++) {
      const fr = 8 - i * 0.95; // wide mouth → narrow throat
      const fz = STAGES.ingest + 5 - i * 2.1; // from in front of ingest toward order
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(Math.max(0.7, fr), 0.025, 8, 96),
        new THREE.MeshBasicMaterial({
          color: 0xc9a86a,
          transparent: true,
          opacity: 0.16,
        })
      );
      ring.position.z = fz;
      group.add(ring);
      spinners.push({ mesh: ring, ax: "z", sp: 0.1 + i * 0.05 });
    }
    // ---- portal rings at the later stages (clean tunnel to fly through) ----
    [
      STAGES.security,
      STAGES.orchestrator,
      STAGES.distribution,
      STAGES.settlement,
    ].forEach((z, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.6, 0.02, 8, 80),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? 0xc9a86a : 0xf5f4f0,
          transparent: true,
          opacity: 0.08,
        })
      );
      ring.position.z = z;
      group.add(ring);
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

    // ---- security padlock (blocks rejected, passes valid) ----
    const lock = new THREE.Group();
    lock.position.z = STAGES.security;
    const lockMats: { mat: THREE.MeshBasicMaterial | THREE.LineBasicMaterial; base: THREE.Color }[] = [];
    const addLockMat = (
      mat: THREE.MeshBasicMaterial | THREE.LineBasicMaterial
    ) => {
      lockMats.push({ mat, base: mat.color.clone() });
      return mat;
    };

    // body (translucent fill + crisp edges)
    const bodyGeo = new THREE.BoxGeometry(1.5, 1.25, 0.5);
    const bodyFill = new THREE.Mesh(
      bodyGeo,
      addLockMat(
        new THREE.MeshBasicMaterial({
          color: 0xc9a86a,
          transparent: true,
          opacity: 0.12,
          depthWrite: false,
        })
      )
    );
    bodyFill.position.y = -0.35;
    lock.add(bodyFill);
    const bodyEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(bodyGeo),
      addLockMat(
        new THREE.LineBasicMaterial({ color: 0xe6c88a, transparent: true, opacity: 0.85 })
      )
    );
    bodyEdges.position.y = -0.35;
    lock.add(bodyEdges);

    // shackle (∩ arc on top)
    const shackle = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.09, 14, 48, Math.PI),
      addLockMat(
        new THREE.MeshBasicMaterial({ color: 0xe6c88a, transparent: true, opacity: 0.9 })
      )
    );
    shackle.position.y = 0.28;
    lock.add(shackle);
    // shackle legs
    [-0.46, 0.46].forEach((x) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.32, 12),
        addLockMat(
          new THREE.MeshBasicMaterial({ color: 0xe6c88a, transparent: true, opacity: 0.9 })
        )
      );
      leg.position.set(x, 0.12, 0);
      lock.add(leg);
    });

    // keyhole
    const keyRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.13, 0.035, 8, 24),
      addLockMat(
        new THREE.MeshBasicMaterial({ color: 0xf5f4f0, transparent: true, opacity: 0.9 })
      )
    );
    keyRing.position.set(0, -0.3, 0.26);
    lock.add(keyRing);

    lock.scale.setScalar(1.5);
    group.add(lock);
    const flashState = { v: 0 };

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

    // ===== per-stage symbols =====

    // 1) Ingest — intake funnel (wide mouth faces incoming data)
    const funnel = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.ConeGeometry(3.4, 3.6, 6, 1, true)),
      new THREE.LineBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0.28 })
    );
    funnel.position.z = STAGES.ingest;
    funnel.rotation.x = -Math.PI / 2;
    group.add(funnel);
    spinners.push({ mesh: funnel, ax: "y", sp: 0.25 });

    // 2) Sequencing — ascending sorted bars
    const seqBars: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const h = 0.7 + i * 0.45;
      const barGeo = new THREE.BoxGeometry(0.34, h, 0.34);
      const bar = new THREE.Mesh(
        barGeo,
        new THREE.MeshBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0.14, depthWrite: false })
      );
      const x = (i - 3) * 0.62;
      bar.position.set(x, h / 2 - 1.4, STAGES.order);
      bar.userData.baseY = h / 2 - 1.4;
      bar.userData.idx = i;
      group.add(bar);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(barGeo),
        new THREE.LineBasicMaterial({ color: 0xe6c88a, transparent: true, opacity: 0.55 })
      );
      bar.add(edges);
      seqBars.push(bar);
    }

    // 4) Orchestration — interlocking control rings around the core
    const orchRings = [
      { rot: [0, 0, 0], sp: 0.6, ax: "x" as const },
      { rot: [Math.PI / 2, 0, 0], sp: -0.5, ax: "y" as const },
      { rot: [0, Math.PI / 2, Math.PI / 4], sp: 0.4, ax: "z" as const },
    ];
    orchRings.forEach((o) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.7, 0.03, 10, 64),
        new THREE.MeshBasicMaterial({ color: 0xf5f4f0, transparent: true, opacity: 0.4 })
      );
      ring.position.z = STAGES.orchestrator;
      ring.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
      group.add(ring);
      spinners.push({ mesh: ring, ax: o.ax, sp: o.sp });
    });

    // 5) Distribution — fan-out routing arrows
    const upY = new THREE.Vector3(0, 1, 0);
    dests.forEach((d) => {
      const dir = new THREE.Vector3(d.x, d.y, 0).normalize();
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.5, 10),
        new THREE.MeshBasicMaterial({ color: 0xc9a86a })
      );
      cone.position.set(d.x * 0.62, d.y * 0.62, STAGES.distribution);
      cone.quaternion.setFromUnitVectors(upY, dir);
      group.add(cone);
      pulses.push({ mesh: cone, phase: d.x + d.y });
    });

    // 6) Settlement — confirmation seal (✓ inside a ring)
    const seal = new THREE.Group();
    seal.position.z = STAGES.settlement;
    const sealRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.4, 0.05, 12, 64),
      new THREE.MeshBasicMaterial({ color: 0xf5f4f0, transparent: true, opacity: 0.55 })
    );
    seal.add(sealRing);
    const checkMat = new THREE.MeshBasicMaterial({ color: 0xe6c88a });
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.16), checkMat);
    c1.position.set(-0.45, -0.18, 0);
    c1.rotation.z = -Math.PI / 4;
    seal.add(c1);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.16), checkMat);
    c2.position.set(0.28, 0.1, 0);
    c2.rotation.z = Math.PI / 3.2;
    seal.add(c2);
    group.add(seal);
    pulses.push({ mesh: seal as unknown as THREE.Mesh, phase: 1.5 });

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
        base: 0.16 + Math.random() * 0.1,
        rejected: Math.random() < 0.14,
      });
    }
    const inst = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        map: makeGridTex(),
        toneMapped: false,
        transparent: true,
        depthWrite: false,
      }),
      COUNT
    );
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(inst);

    return { group, spinners, pulses, inst, packets, lock, lockMats, flashState, seqBars };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progressRef.current ?? 0;
    const { spinners, pulses, inst, packets, lock, lockMats, flashState, seqBars } =
      built;

    spinners.forEach((s) => {
      s.mesh.rotation[s.ax] += delta * s.sp;
    });
    pulses.forEach(({ mesh, phase }) => {
      mesh.scale.setScalar(1 + Math.sin(t * 2.4 + phase) * 0.18);
    });
    // sequencing bars bob in order (sorting motion)
    seqBars.forEach((b) => {
      b.position.y =
        (b.userData.baseY as number) + Math.sin(t * 3 + b.userData.idx * 0.5) * 0.12;
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
        if (s < S_SEC + 0.04) flashState.v = 1; // padlock blocks it
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
      dummy.rotation.set(t * 0.5 + pk.seed, t * 0.7 + pk.seed * 1.3, t * 0.3);
      dummy.scale.setScalar(Math.max(0.0001, scale));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, col);
    }
    dummy.rotation.set(0, 0, 0);
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;

    // padlock: idle gold glow, flashes red while blocking a rejected tx
    const f = flashState.v;
    lockMats.forEach(({ mat, base }) => {
      mat.color.copy(base).lerp(C_RED, f * 0.85);
      mat.opacity = base.equals(C_GOLD) ? 0.12 : 0.85 + f * 0.15;
    });
    lock.rotation.y = Math.sin(t * 0.4) * 0.3;
    lock.position.y = Math.sin(t * 0.8) * 0.15;
    lock.scale.setScalar(1.5 * (1 + Math.sin(t * 2) * 0.03 + f * 0.18));
    flashState.v *= 0.9;

    // camera stays ON the pipeline line; scroll = forward, drag = look around
    const o = orbit.current;
    o.yaw = lerp(o.yaw, o.tyaw, 0.1);
    o.pitch = lerp(o.pitch, o.tpitch, 0.1);

    const camZ = lerp(22, -56, p);
    const cam = state.camera;
    cam.position.x = lerp(cam.position.x, 0, 0.06);
    cam.position.y = lerp(cam.position.y, 1.4, 0.06);
    cam.position.z = lerp(cam.position.z, camZ, 0.08);

    // first-person look direction (default looks down the pipeline, -Z)
    const cp = Math.cos(o.pitch);
    cam.lookAt(
      cam.position.x + Math.sin(o.yaw) * cp * 16,
      cam.position.y + Math.sin(o.pitch) * 16,
      cam.position.z - Math.cos(o.yaw) * cp * 16
    );
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
