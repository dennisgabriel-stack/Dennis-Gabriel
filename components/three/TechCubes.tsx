"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const { lerp } = THREE.MathUtils;

export type Tech = {
  n: string;
  accent: string;
  desc: string;
  url: string;
};

// complete current stack, grouped by domain (accent per group)
export const TECHS: Tech[] = [
  // Frontend
  { n: "Next.js", accent: "#e6c88a", desc: "React-Framework für SSR, Routing & Top-Performance.", url: "https://nextjs.org" },
  { n: "React", accent: "#e6c88a", desc: "Bibliothek für komponentenbasierte User Interfaces.", url: "https://react.dev" },
  { n: "TypeScript", accent: "#e6c88a", desc: "Typsicheres JavaScript für robusten, skalierbaren Code.", url: "https://www.typescriptlang.org" },
  { n: "Tailwind", accent: "#e6c88a", desc: "Utility-First CSS-Framework für schnelles UI-Design.", url: "https://tailwindcss.com" },
  { n: "Three.js", accent: "#e6c88a", desc: "WebGL-Engine für 3D-Grafik im Browser.", url: "https://threejs.org" },
  { n: "Framer Motion", accent: "#e6c88a", desc: "Deklarative, physik-basierte Animationen für React.", url: "https://www.framer.com/motion/" },
  // Backend
  { n: "Node.js", accent: "#c9a86a", desc: "Event-getriebene JavaScript-Runtime fürs Backend.", url: "https://nodejs.org" },
  { n: "Express", accent: "#c9a86a", desc: "Minimalistisches Web-Framework für Node.js.", url: "https://expressjs.com" },
  { n: "WebSocket", accent: "#c9a86a", desc: "Bidirektionale Echtzeit-Verbindungen.", url: "https://developer.mozilla.org/docs/Web/API/WebSockets_API" },
  { n: "GraphQL", accent: "#c9a86a", desc: "Typisierte Abfragesprache für flexible APIs.", url: "https://graphql.org" },
  { n: "PostgreSQL", accent: "#c9a86a", desc: "Leistungsstarke relationale Datenbank.", url: "https://www.postgresql.org" },
  { n: "Redis", accent: "#c9a86a", desc: "In-Memory-Store für Cache, Sessions & Pub/Sub.", url: "https://redis.io" },
  // Infra
  { n: "Docker", accent: "#9c8552", desc: "Container für reproduzierbare Deployments.", url: "https://www.docker.com" },
  { n: "CI/CD", accent: "#9c8552", desc: "Automatisierte Builds, Tests & Deployments.", url: "https://github.com/features/actions" },
  { n: "AWS Cloud", accent: "#9c8552", desc: "Skalierbare Cloud-Infrastruktur & Services.", url: "https://aws.amazon.com" },
  { n: "Git", accent: "#9c8552", desc: "Verteilte Versionskontrolle für Code.", url: "https://git-scm.com" },
  { n: "Linux", accent: "#9c8552", desc: "Open-Source-Betriebssystem für Server.", url: "https://www.linux.org" },
  { n: "Monitoring", accent: "#9c8552", desc: "Metriken, Logs, Dashboards & Alerting.", url: "https://grafana.com" },
  // AI / Design / Web3
  { n: "KI / LLM", accent: "#f5f4f0", desc: "Große Sprachmodelle & KI-Integration in Produkte.", url: "https://www.anthropic.com" },
  { n: "Automation", accent: "#f5f4f0", desc: "Workflow-Automatisierung & Integrationen.", url: "https://n8n.io" },
  { n: "Figma", accent: "#f5f4f0", desc: "Kollaboratives Interface- & Prototyp-Design.", url: "https://www.figma.com" },
  { n: "UI / UX", accent: "#f5f4f0", desc: "Nutzerzentriertes Design & Interaktion.", url: "https://www.interaction-design.org" },
  { n: "Web3", accent: "#f5f4f0", desc: "Dezentrale Apps & Blockchain-Anbindung.", url: "https://ethereum.org" },
  { n: "Smart Contracts", accent: "#f5f4f0", desc: "On-Chain-Programmlogik & Verträge.", url: "https://soliditylang.org" },
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

function Blocks({
  focused,
  setFocused,
}: {
  focused: number | null;
  setFocused: (i: number | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer, camera } = useThree();
  const lastForm = useRef(-1);

  const blocks = useMemo(() => {
    const arr: {
      mesh: THREE.Group;
      seed: number;
      mats: (THREE.MeshBasicMaterial | THREE.LineBasicMaterial)[];
      baseOpacity: number[];
    }[] = [];
    const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const glowGeo = new THREE.BoxGeometry(1.42, 1.42, 1.42);
    TECHS.forEach((tech) => {
      const mat = new THREE.MeshBasicMaterial({
        map: makeLabel(tech),
        transparent: true,
      });
      const cube = new THREE.Mesh(geo, mat);
      const edgeMat = new THREE.LineBasicMaterial({
        color: tech.accent,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      const glowMat = new THREE.MeshBasicMaterial({
        color: tech.accent,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      const holder = new THREE.Group();
      holder.add(cube, edges, glow);
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
      arr.push({
        mesh: holder,
        seed: Math.random() * 100,
        mats: [mat, edgeMat, glowMat],
        baseOpacity: [1, 0.85, 0.06],
      });
    });
    return arr;
  }, []);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.001, delta);
    const focusing = focused !== null;

    // formation changes → authentic movement sound
    const fIndex = Math.floor(t / HOLD) % FORMATIONS.length;
    if (!focusing && fIndex !== lastForm.current) {
      lastForm.current = fIndex;
      if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("ux-woosh"));
    }
    const targets = FORM_TARGETS[fIndex];

    // position in front of the camera for the focused cube
    const front = tmp
      .copy(camera.position)
      .add(
        new THREE.Vector3(0, 0, -6.5).applyQuaternion(camera.quaternion)
      );

    blocks.forEach((b, i) => {
      if (focusing && i === focused) {
        // fly to the camera, grow, face viewer, slow spin
        b.mesh.position.lerp(b.mesh.parent!.worldToLocal(front.clone()), 0.12);
        b.mesh.scale.setScalar(lerp(b.mesh.scale.x, 2.6, 0.1));
        b.mesh.rotation.x = lerp(b.mesh.rotation.x, 0, 0.1);
        b.mesh.rotation.z = lerp(b.mesh.rotation.z, 0, 0.1);
        b.mesh.rotation.y += delta * 0.6;
        b.mats.forEach((m, j) => (m.opacity = b.baseOpacity[j]));
      } else {
        const target = targets[i];
        b.mesh.position.lerp(target, k * 0.9);
        b.mesh.scale.setScalar(lerp(b.mesh.scale.x, 1, 0.1));
        b.mesh.rotation.x = lerp(b.mesh.rotation.x, Math.sin(t + b.seed) * 0.05, k);
        b.mesh.rotation.y = lerp(b.mesh.rotation.y, Math.cos(t * 0.8 + b.seed) * 0.05, k);
        b.mesh.rotation.z = lerp(b.mesh.rotation.z, 0, k);
        b.mesh.position.y += Math.sin(t * 1.2 + b.seed) * 0.06 * delta * 4;
        // dim others while one is focused
        const dimTo = focusing ? 0.12 : 1;
        b.mats.forEach(
          (m, j) =>
            (m.opacity = lerp(m.opacity, b.baseOpacity[j] * dimTo, 0.1))
        );
      }
    });

    if (groupRef.current) {
      const spin = focusing ? 0 : delta * 0.16;
      groupRef.current.rotation.y += spin;
      groupRef.current.rotation.x = lerp(
        groupRef.current.rotation.x,
        focusing ? 0 : -pointer.y * 0.25,
        0.04
      );
      groupRef.current.position.x = lerp(
        groupRef.current.position.x,
        focusing ? 0 : pointer.x * 1.2,
        0.04
      );
    }
  });

  return (
    <group ref={groupRef}>
      {blocks.map((b, i) => (
        <primitive
          key={i}
          object={b.mesh}
          onClick={(e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            setFocused(focused === i ? null : i);
            if (typeof window !== "undefined")
              window.dispatchEvent(new CustomEvent("ux-click"));
          }}
        />
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

export default function TechCubes({
  onFocus,
}: {
  onFocus?: (t: Tech | null) => void;
}) {
  const [focused, setFocusedState] = useState<number | null>(null);

  const setFocused = (i: number | null) => {
    setFocusedState(i);
    onFocus?.(i === null ? null : TECHS[i]);
  };

  // allow the HTML card's close button to clear focus
  useEffect(() => {
    const clear = () => setFocused(null);
    window.addEventListener("tech-unfocus", clear);
    return () => window.removeEventListener("tech-unfocus", clear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 1.5, 16], fov: 48 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => setFocused(null)}
    >
      <fog attach="fog" args={[0x0a0a0b, 16, 42]} />
      <Ambience />
      <Blocks focused={focused} setFocused={setFocused} />
    </Canvas>
  );
}
