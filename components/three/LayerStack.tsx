"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const { clamp, lerp } = THREE.MathUtils;

type Layer = {
  tag: string;
  name: string;
  accent: string;
  tech: string[];
  purpose: string;
};

const LAYERS: Layer[] = [
  {
    tag: "L1",
    name: "Presentation Layer",
    accent: "#e6c88a",
    tech: ["Next.js", "React", "TypeScript", "Tailwind", "Three.js", "Framer Motion"],
    purpose: "User Interfaces · Responsive Design · Animationen",
  },
  {
    tag: "L2",
    name: "Application Layer",
    accent: "#c9a86a",
    tech: ["Node.js", "Express", "REST & GraphQL", "WebSocket", "Auth / JWT"],
    purpose: "Business-Logik · Echtzeit · API-Gateway",
  },
  {
    tag: "L3",
    name: "Data Layer",
    accent: "#9c8552",
    tech: ["PostgreSQL", "Redis", "Event-System", "Migrations", "Pooling"],
    purpose: "Persistenz · Analytics · Caching",
  },
  {
    tag: "L4",
    name: "Infrastructure & Integration",
    accent: "#7a6740",
    tech: ["Docker", "CI/CD", "Cloud (AWS)", "Web3", "Monitoring"],
    purpose: "Deployment · Skalierung · Integration",
  },
];

function emit(name: string) {
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent(name));
}

function drawCard(layer: Layer) {
  const w = 1024;
  const h = 600;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#16161b");
  g.addColorStop(1, "#0c0c0f");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(0, 0, w, h, 28); ctx.fill();

  ctx.strokeStyle = layer.accent + "66";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(6, 6, w - 12, h - 12, 24); ctx.stroke();

  // accent bar
  ctx.fillStyle = layer.accent;
  ctx.beginPath(); ctx.roundRect(28, 36, 14, h - 72, 7); ctx.fill();

  // tag + name
  ctx.fillStyle = layer.accent;
  ctx.font = "900 130px Helvetica, Arial, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(layer.tag, 70, 170);
  ctx.fillStyle = "#f5f4f0";
  ctx.font = "700 60px Helvetica, Arial, sans-serif";
  ctx.fillText(layer.name, 70, 250);

  // tech chips
  let x = 70;
  let y = 320;
  ctx.font = "500 36px Helvetica, Arial, sans-serif";
  layer.tech.forEach((t) => {
    const tw = ctx.measureText(t).width + 56;
    if (x + tw > w - 60) {
      x = 70;
      y += 86;
    }
    ctx.strokeStyle = "#f5f4f033";
    ctx.fillStyle = "#0a0a0b88";
      ctx.beginPath(); ctx.roundRect(x, y, tw, 64, 32); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f5f4f0dd";
    ctx.fillText(t, x + 28, y + 43);
    x += tw + 18;
  });

  // purpose
  ctx.fillStyle = "#8a8a8f";
  ctx.font = "400 32px Helvetica, Arial, sans-serif";
  ctx.fillText(layer.purpose, 70, h - 48);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Slab({
  layer,
  index,
  hovered,
  setHovered,
}: {
  layer: Layer;
  index: number;
  hovered: number | null;
  setHovered: (i: number | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const baseY = (1.5 - index) * 1.75;

  const { bodyMats, topMat, edges } = useMemo(() => {
    const accent = new THREE.Color(layer.accent);
    const body = new THREE.MeshStandardMaterial({
      color: 0x141418,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    const topMat = new THREE.MeshBasicMaterial({
      map: drawCard(layer),
      transparent: true,
    });
    const bodyMats = [body, body, topMat, body, body, body];
    const edges = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.55,
    });
    return { bodyMats, topMat, edges };
  }, [layer]);

  const geo = useMemo(() => new THREE.BoxGeometry(6.6, 0.42, 4), []);
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const isHot = hovered === index;
    const dim = hovered !== null && !isHot;
    const k = 1 - Math.pow(0.0015, delta);

    const targetY = baseY + (isHot ? 0.55 : 0) + Math.sin(t * 0.8 + index) * 0.06;
    const targetScale = isHot ? 1.06 : 1;
    group.current.position.y = lerp(group.current.position.y, targetY, k);
    const sc = lerp(group.current.scale.x, targetScale, k);
    group.current.scale.setScalar(sc);

    topMat.opacity = lerp(topMat.opacity, dim ? 0.35 : 1, k);
    edges.opacity = lerp(edges.opacity, isHot ? 1 : dim ? 0.2 : 0.55, k);
    bodyMats[0].opacity = lerp(bodyMats[0].opacity, dim ? 0.4 : 0.9, k);
  });

  return (
    <group ref={group} position={[0, baseY, 0]}>
      <mesh
        geometry={geo}
        material={bodyMats}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(index);
          emit("ux-hover");
        }}
        onPointerOut={() => setHovered(null)}
        onClick={() => emit("ux-click")}
      />
      <lineSegments geometry={edgeGeo} material={edges} />
    </group>
  );
}

function DataBeam() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const COUNT = 40;
  const data = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 5.6,
        z: (Math.random() - 0.5) * 3.2,
        t: Math.random(),
        sp: 0.15 + Math.random() * 0.2,
      })),
    []
  );
  useFrame((_, delta) => {
    if (!ref.current) return;
    data.forEach((d, i) => {
      d.t += d.sp * delta;
      if (d.t > 1) d.t -= 1;
      const y = 3.2 - d.t * 6.4;
      dummy.position.set(d.x, y, d.z);
      dummy.scale.setScalar(0.05 * (0.4 + Math.sin(d.t * Math.PI) * 0.6));
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color={0xe6c88a}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

function Rig() {
  const { camera, gl } = useThree();
  const state = useRef({
    theta: 0.6,
    phi: 1.02,
    tTheta: 0.6,
    tPhi: 1.02,
    radius: 14,
    dragging: false,
    lastX: 0,
    lastY: 0,
    idle: 0,
  });

  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.tTheta -= (e.clientX - s.lastX) * 0.006;
      s.tPhi = clamp(s.tPhi - (e.clientY - s.lastY) * 0.005, 0.55, 1.45);
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.idle = 0;
    };
    const up = () => {
      s.dragging = false;
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

  useFrame((_, delta) => {
    const s = state.current;
    if (!s.dragging) {
      s.idle += delta;
      if (s.idle > 0.6) s.tTheta += delta * 0.14; // gentle auto-orbit
    }
    s.theta = lerp(s.theta, s.tTheta, 0.08);
    s.phi = lerp(s.phi, s.tPhi, 0.08);
    const r = s.radius;
    camera.position.set(
      r * Math.sin(s.phi) * Math.sin(s.theta),
      r * Math.cos(s.phi),
      r * Math.sin(s.phi) * Math.cos(s.theta)
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <pointLight position={[-6, 2, -4]} intensity={40} color={0xc9a86a} distance={30} />
      <Rig />
      <DataBeam />
      {LAYERS.map((l, i) => (
        <Slab
          key={l.tag}
          layer={l}
          index={i}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </>
  );
}

export default function LayerStack() {
  return (
    <Canvas
      className="!absolute inset-0 cursor-grab active:cursor-grabbing"
      camera={{ position: [7, 4, 11], fov: 42 }}
      dpr={[1, 1.9]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[0x0a0a0b, 16, 40]} />
      <Scene />
    </Canvas>
  );
}
