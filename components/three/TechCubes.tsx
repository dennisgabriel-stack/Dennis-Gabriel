"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const { lerp } = THREE.MathUtils;

type Tech = { n: string; accent: string };

// complete current stack, grouped by domain (accent per group)
const TECHS: Tech[] = [
  // Frontend
  { n: "Next.js", accent: "#e6c88a" },
  { n: "React", accent: "#e6c88a" },
  { n: "TypeScript", accent: "#e6c88a" },
  { n: "Tailwind", accent: "#e6c88a" },
  { n: "Three.js", accent: "#e6c88a" },
  { n: "Framer Motion", accent: "#e6c88a" },
  // Backend
  { n: "Node.js", accent: "#c9a86a" },
  { n: "Express", accent: "#c9a86a" },
  { n: "WebSocket", accent: "#c9a86a" },
  { n: "GraphQL", accent: "#c9a86a" },
  { n: "PostgreSQL", accent: "#c9a86a" },
  { n: "Redis", accent: "#c9a86a" },
  // Infra
  { n: "Docker", accent: "#9c8552" },
  { n: "CI/CD", accent: "#9c8552" },
  { n: "AWS Cloud", accent: "#9c8552" },
  { n: "Git", accent: "#9c8552" },
  { n: "Linux", accent: "#9c8552" },
  { n: "Monitoring", accent: "#9c8552" },
  // AI / Design / Web3
  { n: "KI / LLM", accent: "#f5f4f0" },
  { n: "Automation", accent: "#f5f4f0" },
  { n: "Figma", accent: "#f5f4f0" },
  { n: "UI / UX", accent: "#f5f4f0" },
  { n: "Web3", accent: "#f5f4f0" },
  { n: "Smart Contracts", accent: "#f5f4f0" },
];

const N = TECHS.length; // 24

function makeLabel(tech: Tech) {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;

  // base gradient
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#1c1c22");
  g.addColorStop(1, "#0b0b0e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // accent corner glow
  const rg = ctx.createRadialGradient(54, 46, 8, 54, 46, 210);
  rg.addColorStop(0, tech.accent + "40");
  rg.addColorStop(1, "transparent");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, S, S);

  // glowing border
  ctx.shadowColor = tech.accent;
  ctx.shadowBlur = 16;
  ctx.strokeStyle = tech.accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, S - 28, S - 28);
  ctx.shadowBlur = 0;

  // top accent bar + node
  ctx.fillStyle = tech.accent;
  ctx.fillRect(14, 14, S - 28, 6);
  ctx.beginPath();
  ctx.arc(32, 42, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "600 15px Helvetica, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = tech.accent + "cc";
  ctx.fillText("// stack", 46, 47);

  // name
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f6f5f1";
  const words = tech.n.split(" ");
  if (words.length > 1 && tech.n.length > 9) {
    ctx.font = "700 32px Helvetica, Arial, sans-serif";
    ctx.fillText(words[0], 128, 118);
    ctx.fillText(words.slice(1).join(" "), 128, 156);
  } else {
    ctx.font = `700 ${tech.n.length > 9 ? 30 : 40}px Helvetica, Arial, sans-serif`;
    ctx.fillText(tech.n, 128, 134);
  }

  // underline accent
  ctx.fillStyle = tech.accent;
  ctx.fillRect(98, 196, 60, 3);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// formation target positions (each returns Vector3 for block index i)
const SP = 1.65;
function gridWall(i: number) {
  const col = i % 6;
  const row = Math.floor(i / 6);
  return new THREE.Vector3((col - 2.5) * SP, (1.5 - row) * SP, 0);
}
function cubeBox(i: number) {
  const ix = i % 4;
  const iy = Math.floor(i / 4) % 3;
  const iz = Math.floor(i / 12);
  return new THREE.Vector3((ix - 1.5) * 1.8, (iy - 1) * 1.8, (iz - 0.5) * 1.8);
}
function towerRings(i: number) {
  const layer = Math.floor(i / 6);
  const k = i % 6;
  const ang = (k / 6) * Math.PI * 2 + layer * 0.5;
  const r = 3.1;
  return new THREE.Vector3(
    Math.cos(ang) * r,
    (1.5 - layer) * 1.8,
    Math.sin(ang) * r
  );
}
const FORMATIONS = [gridWall, cubeBox, towerRings];
const FORM_TARGETS = FORMATIONS.map((f) =>
  Array.from({ length: N }, (_, i) => f(i))
);
const HOLD = 5; // seconds per formation

function Blocks() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const blocks = useMemo(() => {
    const arr: {
      mesh: THREE.Group;
      seed: number;
    }[] = [];
    const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const glowGeo = new THREE.BoxGeometry(1.42, 1.42, 1.42);
    TECHS.forEach((tech) => {
      const tex = makeLabel(tech);
      const mat = new THREE.MeshBasicMaterial({ map: tex });
      const cube = new THREE.Mesh(geo, mat);
      const edges = new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({
          color: tech.accent,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        })
      );
      // soft accent glow shell
      const glow = new THREE.Mesh(
        glowGeo,
        new THREE.MeshBasicMaterial({
          color: tech.accent,
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const holder = new THREE.Group();
      holder.add(cube);
      holder.add(edges);
      holder.add(glow);
      // scattered start
      holder.position.set(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 24
      );
      holder.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      arr.push({ mesh: holder, seed: Math.random() * 100 });
    });
    return arr;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const fIndex = Math.floor(t / HOLD) % FORMATIONS.length;
    const targets = FORM_TARGETS[fIndex];
    const k = 1 - Math.pow(0.001, delta); // frame-rate independent lerp

    blocks.forEach((b, i) => {
      const target = targets[i];
      b.mesh.position.lerp(target, k * 0.9);
      // settle straight, with a gentle idle float
      b.mesh.rotation.x = lerp(b.mesh.rotation.x, Math.sin(t + b.seed) * 0.05, k);
      b.mesh.rotation.y = lerp(b.mesh.rotation.y, Math.cos(t * 0.8 + b.seed) * 0.05, k);
      b.mesh.rotation.z = lerp(b.mesh.rotation.z, 0, k);
      const floatY = Math.sin(t * 1.2 + b.seed) * 0.06;
      b.mesh.position.y += floatY * delta * 4;
    });

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.16;
      groupRef.current.rotation.x = lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.25,
        0.04
      );
      groupRef.current.position.x = lerp(
        groupRef.current.position.x,
        pointer.x * 1.2,
        0.04
      );
    }
  });

  return (
    <group ref={groupRef}>
      {blocks.map((b, i) => (
        <primitive key={i} object={b.mesh} />
      ))}
    </group>
  );
}

function Ambience() {
  const stars = useRef<THREE.Points>(null);
  const grid = useRef<THREE.GridHelper>(null);

  const starGeo = useMemo(() => {
    const SN = 700;
    const pos = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) {
      const r = 10 + Math.random() * 22;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const gridObj = useMemo(() => {
    const g = new THREE.GridHelper(60, 40, 0xc9a86a, 0x6a5a36);
    (g.material as THREE.Material).transparent = true;
    (g.material as THREE.Material & { opacity: number }).opacity = 0.12;
    g.position.y = -7;
    return g;
  }, []);

  useFrame((state, delta) => {
    if (stars.current) stars.current.rotation.y += delta * 0.02;
    if (grid.current)
      grid.current.position.z = (Math.sin(state.clock.elapsedTime * 0.1) * 4);
  });

  return (
    <>
      <points ref={stars} geometry={starGeo}>
        <pointsMaterial
          size={0.06}
          color={0xc9a86a}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <primitive ref={grid} object={gridObj} />
    </>
  );
}

export default function TechCubes() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 1.5, 16], fov: 48 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[0x0a0a0b, 16, 42]} />
      <Ambience />
      <Blocks />
    </Canvas>
  );
}
