"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const { clamp, lerp } = THREE.MathUtils;
const ss = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// ---- pipeline geometry (camera flies -Z as you scroll) ----
const SPAWN = 12;
const ST = {
  ingest: 2,
  order: -15,
  security: -32,
  core: -49,
  dist: -65,
  settle: -82,
};
const CAM_START = 20;
const CAM_END = -78;
const FOCUS_AHEAD = 12;

const C_GRAY = new THREE.Color(0x6a6a72);
const C_GOLD = new THREE.Color(0xc9a86a);
const C_GOLDB = new THREE.Color(0xe6c88a);
const C_BONE = new THREE.Color(0xf5f4f0);
const C_RED = new THREE.Color(0xc0392b);

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
  ctx.lineWidth = 9;
  ctx.strokeRect(5, 5, S - 10, S - 10);
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

type Pkt = {
  t: number;
  sp: number;
  seed: number;
  ox: number;
  oy: number;
  lx: number;
  ly: number;
  dx: number;
  dy: number;
  bad: boolean;
  dead: boolean;
};

function Scene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { gl } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // first-person look-around on the fixed line
  const orbit = useRef({ yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, drag: false, lx: 0, ly: 0 });
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
    const up = () => (o.drag = false);
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
    const spin: { o: THREE.Object3D; ax: "x" | "y" | "z"; sp: number }[] = [];
    const pulse: { o: THREE.Object3D; ph: number }[] = [];
    // focus-dim registry: each material with its base opacity + world z
    const focus: { m: THREE.Material & { opacity: number }; base: number; z: number }[] = [];
    const reg = (o: THREE.Object3D, z: number) => {
      o.traverse((c) => {
        const mm = (c as THREE.Mesh).material as THREE.Material | THREE.Material[];
        if (!mm) return;
        (Array.isArray(mm) ? mm : [mm]).forEach((m) => {
          m.transparent = true;
          focus.push({ m: m as THREE.Material & { opacity: number }, base: (m as THREE.Material & { opacity: number }).opacity, z });
        });
      });
    };
    const gold = (op: number) =>
      new THREE.MeshBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: op });
    const bone = (op: number) =>
      new THREE.MeshBasicMaterial({ color: 0xf5f4f0, transparent: true, opacity: op });

    // ===== 1) INGEST — intake funnel of narrowing rings =====
    for (let i = 0; i < 8; i++) {
      const fr = 8 - i * 0.95;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(Math.max(0.7, fr), 0.03, 8, 96),
        gold(0.16)
      );
      ring.position.z = ST.ingest + 6 - i * 2.0;
      group.add(ring);
      spin.push({ o: ring, ax: "z", sp: 0.1 + i * 0.05 });
      reg(ring, ring.position.z);
    }

    // ===== 2) SEQUENCING — ordered lane lattice (slots) =====
    const GC = 6;
    const GR = 4;
    const slots: { x: number; y: number }[] = [];
    for (let r = 0; r < GR; r++)
      for (let c = 0; c < GC; c++)
        slots.push({ x: (c - (GC - 1) / 2) * 1.25, y: (r - (GR - 1) / 2) * 1.25 });
    const latticeFrame = new THREE.Mesh(
      new THREE.TorusGeometry(4.4, 0.02, 6, 4), // diamond frame
      gold(0.0)
    );
    const seqFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 5.6, 0.3)),
      new THREE.LineBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0.3 })
    );
    seqFrame.position.z = ST.order;
    group.add(seqFrame);
    reg(seqFrame, ST.order);
    void latticeFrame;
    // lane guide lines from order → security
    slots.forEach((s2) => {
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(s2.x, s2.y, ST.order),
        new THREE.Vector3(s2.x, s2.y, ST.core),
      ]);
      const ln = new THREE.Line(
        g,
        new THREE.LineBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0.06 })
      );
      group.add(ln);
      reg(ln, (ST.order + ST.security) / 2);
    });

    // ===== 3) SECURITY — gates + scan + padlock =====
    [
      { z: ST.security + 3, r: 3.6 },
      { z: ST.security, r: 3.0 },
      { z: ST.security - 3, r: 2.5 },
    ].forEach((g, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(g.r, 0.04, 10, 90), gold(0.55));
      ring.position.z = g.z;
      group.add(ring);
      spin.push({ o: ring, ax: "z", sp: i % 2 ? -0.5 : 0.5 });
      reg(ring, g.z);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(g.r * 2, 0.04, 0.04), gold(0.5));
      bar.position.z = g.z;
      group.add(bar);
      spin.push({ o: bar, ax: "z", sp: 1.4 - i * 0.3 });
      reg(bar, g.z);
    });
    // padlock
    const lock = new THREE.Group();
    lock.position.z = ST.security;
    const lockMats: { m: THREE.MeshBasicMaterial | THREE.LineBasicMaterial; base: THREE.Color }[] = [];
    const lk = (m: THREE.MeshBasicMaterial | THREE.LineBasicMaterial) => {
      lockMats.push({ m, base: m.color.clone() });
      return m;
    };
    const body = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6, 1.3, 0.5)),
      lk(new THREE.LineBasicMaterial({ color: 0xe6c88a, transparent: true, opacity: 0.9 }))
    );
    body.position.y = -0.35;
    lock.add(body);
    const shackle = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.09, 14, 48, Math.PI),
      lk(new THREE.MeshBasicMaterial({ color: 0xe6c88a, transparent: true, opacity: 0.9 }))
    );
    shackle.position.y = 0.3;
    lock.add(shackle);
    lock.scale.setScalar(1.4);
    group.add(lock);
    reg(lock, ST.security);

    // ===== 4) CORE — gives weight/rights =====
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 1),
      new THREE.MeshBasicMaterial({ color: 0xf5f4f0, wireframe: true, transparent: true, opacity: 0.85 })
    );
    core.position.z = ST.core;
    group.add(core);
    spin.push({ o: core, ax: "y", sp: 0.5 });
    reg(core, ST.core);
    const shield = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.04, 10, 90),
      bone(0.3)
    );
    shield.position.z = ST.core;
    shield.rotation.y = Math.PI / 2;
    group.add(shield);
    spin.push({ o: shield, ax: "x", sp: 0.6 });
    reg(shield, ST.core);
    const ring = new THREE.Group();
    ring.position.z = ST.core;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const v = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), gold(0.9));
      v.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
      ring.add(v);
      pulse.push({ o: v, ph: i });
    }
    group.add(ring);
    spin.push({ o: ring, ax: "z", sp: 0.3 });
    reg(ring, ST.core);

    // ===== 5) DISTRIBUTION — fan-out routing to destinations =====
    const dests = [
      { x: -5, y: 2.6 },
      { x: 5, y: 2.6 },
      { x: -5, y: -2.6 },
      { x: 5, y: -2.6 },
      { x: 0, y: 3.6 },
      { x: 0, y: -3.6 },
    ];
    dests.forEach((d) => {
      const start = new THREE.Vector3(0, 0, ST.core);
      const end = new THREE.Vector3(d.x, d.y, ST.dist);
      const mid = new THREE.Vector3(d.x * 0.5, d.y * 0.5, (start.z + end.z) / 2);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.015, 6, false),
        gold(0.14)
      );
      group.add(tube);
      reg(tube, (ST.core + ST.dist) / 2);
      const mk = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 8, 32), bone(0.5));
      mk.position.copy(end);
      group.add(mk);
      pulse.push({ o: mk, ph: d.x + d.y });
      reg(mk, ST.dist);
    });

    // ===== 6) SETTLEMENT — construct that stacks up (loop) =====
    const board = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(9, 6, 0.4)),
      new THREE.LineBasicMaterial({ color: 0xf5f4f0, transparent: true, opacity: 0.3 })
    );
    board.position.z = ST.settle;
    group.add(board);
    reg(board, ST.settle);
    // the construct (instanced cubes that fill up over time)
    const tex = makeGridTex();
    const SCC = 6;
    const SCR = 4;
    const SCD = 2;
    const constructSlots: THREE.Vector3[] = [];
    for (let d = 0; d < SCD; d++)
      for (let r = 0; r < SCR; r++)
        for (let c = 0; c < SCC; c++)
          constructSlots.push(
            new THREE.Vector3(
              (c - (SCC - 1) / 2) * 1.25,
              (r - (SCR - 1) / 2) * 1.25,
              ST.settle - 0.6 - d * 1.25
            )
          );
    const construct = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }),
      constructSlots.length
    );
    construct.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(construct);

    // ===== data cubes (the flowing Rubik packets) =====
    const COUNT = 90;
    const pkts: Pkt[] = [];
    for (let i = 0; i < COUNT; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 3 + Math.random() * 6;
      const slot = slots[i % slots.length];
      const dest = dests[i % dests.length];
      pkts.push({
        t: i / COUNT,
        sp: 0.03 + Math.random() * 0.025,
        seed: Math.random() * 100,
        ox: Math.cos(ang) * rad,
        oy: Math.sin(ang) * rad,
        lx: slot.x,
        ly: slot.y,
        dx: dest.x,
        dy: dest.y,
        bad: Math.random() < 0.18,
        dead: false,
      });
    }
    const cubes = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }),
      COUNT
    );
    cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(cubes);

    // ===== debris pool (red, for dissolving malicious cubes) =====
    const DCOUNT = 200;
    const debris = Array.from({ length: DCOUNT }, () => ({
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
    }));
    let dHead = 0;
    const spawnDebris = (x: number, y: number, z: number) => {
      for (let n = 0; n < 9; n++) {
        const d = debris[dHead % DCOUNT];
        dHead++;
        d.x = x;
        d.y = y;
        d.z = z;
        d.vx = (Math.random() - 0.5) * 6;
        d.vy = (Math.random() - 0.5) * 6;
        d.vz = (Math.random() - 0.5) * 6;
        d.life = 0.8 + Math.random() * 0.5;
      }
    };
    const debrisMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({
        color: 0xc0392b,
        transparent: true,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      DCOUNT
    );
    debrisMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(debrisMesh);

    return {
      group,
      spin,
      pulse,
      focus,
      lock,
      lockMats,
      cubes,
      pkts,
      construct,
      constructSlots,
      debris,
      debrisMesh,
      spawnDebris,
      flash: { v: 0 },
      settleState: { placed: 0, full: 0 },
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const p = progressRef.current ?? 0;
    const cam = state.camera;
    const camZ = lerp(CAM_START, CAM_END, p);
    const focusZ = camZ - FOCUS_AHEAD;
    const b = built;

    // spinners + pulses
    b.spin.forEach((s) => (s.o.rotation[s.ax] += dt * s.sp));
    b.pulse.forEach((q) => q.o.scale.setScalar(1 + Math.sin(t * 2.4 + q.ph) * 0.18));

    // focus-dim: only the current section stays bright
    b.focus.forEach((f) => {
      const near = 1 - clamp((Math.abs(f.z - focusZ) - 9) / 22, 0, 1);
      f.m.opacity = f.base * (0.12 + near * 0.88);
    });

    // ===== flowing data cubes =====
    let flash = b.flash.v;
    for (let i = 0; i < b.pkts.length; i++) {
      const pk = b.pkts[i];
      pk.t += pk.sp * dt;
      if (pk.t >= 1 || pk.dead) {
        pk.t = 0;
        pk.dead = false;
        pk.bad = Math.random() < 0.18;
      }
      const z = lerp(SPAWN, ST.settle, pk.t);

      // malicious → dissolve at the security gate
      if (pk.bad && z <= ST.security) {
        b.spawnDebris(
          lerp(pk.ox, pk.lx, 1) * 0.4,
          lerp(pk.oy, pk.ly, 1) * 0.4,
          z
        );
        flash = 1;
        pk.dead = true;
        dummy.scale.setScalar(0.0001);
        dummy.position.set(0, 0, 9999);
        dummy.updateMatrix();
        b.cubes.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const mO = ss(SPAWN, ST.order, SPAWN - (SPAWN - z)); // chaos→order
      const orderMix = ss(0, 1, clamp((SPAWN - z) / (SPAWN - ST.order), 0, 1));
      const distMix = clamp((ST.core - z) / (ST.core - ST.dist), 0, 1);
      const settleMix = clamp((ST.dist - z) / (ST.dist - ST.settle), 0, 1);
      void mO;

      let x = lerp(lerp(pk.ox, pk.lx, orderMix), pk.dx, distMix);
      let y = lerp(lerp(pk.oy, pk.ly, orderMix), pk.dy, distMix);
      // converge toward centre to enter the construct at settlement
      x = lerp(x, pk.lx * 0.6, settleMix);
      y = lerp(y, pk.ly * 0.6, settleMix);

      // colour by stage
      if (z > ST.order) col.copy(C_GRAY); // chaos
      else if (z > ST.security) col.lerpColors(C_GRAY, C_GOLD, orderMix); // sorted
      else if (z > ST.core) col.copy(C_GOLDB); // passed security
      else col.lerpColors(C_GOLDB, C_BONE, clamp((ST.core - z) / 6, 0, 1)); // weighted

      const scale = 0.42 * ss(0, 0.04, pk.t) * (1 - ss(0.96, 1, pk.t));
      dummy.position.set(x, y, z);
      dummy.rotation.set(t * 0.5 + pk.seed, t * 0.7 + pk.seed * 1.3, t * 0.3);
      dummy.scale.setScalar(Math.max(0.0001, scale));
      dummy.updateMatrix();
      b.cubes.setMatrixAt(i, dummy.matrix);
      b.cubes.setColorAt(i, col);
    }
    b.cubes.instanceMatrix.needsUpdate = true;
    if (b.cubes.instanceColor) b.cubes.instanceColor.needsUpdate = true;
    b.flash.v = flash * 0.9;

    // ===== debris =====
    dummy.rotation.set(0, 0, 0);
    for (let i = 0; i < b.debris.length; i++) {
      const d = b.debris[i];
      let sc = 0.0001;
      if (d.life > 0) {
        d.life -= dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.z += d.vz * dt;
        d.vx *= 0.94;
        d.vy *= 0.94;
        d.vz *= 0.94;
        sc = clamp(d.life, 0, 1) * 0.22;
      }
      dummy.position.set(d.x, d.y, d.z);
      dummy.scale.setScalar(Math.max(0.0001, sc));
      dummy.updateMatrix();
      b.debrisMesh.setMatrixAt(i, dummy.matrix);
    }
    b.debrisMesh.instanceMatrix.needsUpdate = true;

    // ===== settlement construct: stack up, then loop =====
    const cs = b.settleState;
    if (cs.full > 0) {
      cs.full -= dt;
      if (cs.full <= 0) {
        cs.placed = 0;
        cs.full = 0;
      }
    } else {
      cs.placed += dt * 3.2; // fill rate
      if (cs.placed >= b.constructSlots.length) {
        cs.placed = b.constructSlots.length;
        cs.full = 2.5; // hold the finished construct, then reset
      }
    }
    for (let i = 0; i < b.constructSlots.length; i++) {
      const appear = clamp(cs.placed - i, 0, 1);
      const sl = b.constructSlots[i];
      dummy.position.copy(sl);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(Math.max(0.0001, appear * 1.0));
      dummy.updateMatrix();
      b.construct.setMatrixAt(i, dummy.matrix);
    }
    b.construct.instanceMatrix.needsUpdate = true;

    // padlock flash on block
    const f = b.flash.v;
    b.lockMats.forEach(({ m, base }) => {
      (m.color as THREE.Color).copy(base).lerp(C_RED, f * 0.9);
    });
    b.lock.scale.setScalar(1.4 * (1 + Math.sin(t * 2) * 0.03 + f * 0.2));

    // ===== camera: forward on the line + first-person look =====
    const o = orbit.current;
    o.yaw = lerp(o.yaw, o.tyaw, 0.1);
    o.pitch = lerp(o.pitch, o.tpitch, 0.1);
    cam.position.x = lerp(cam.position.x, 0, 0.06);
    cam.position.y = lerp(cam.position.y, 1.2, 0.06);
    cam.position.z = lerp(cam.position.z, camZ, 0.08);
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
      camera={{ position: [0, 1.2, 20], fov: 50, far: 220 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[0x0a0a0b, 14, 60]} />
      <Scene progressRef={progressRef} />
    </Canvas>
  );
}
