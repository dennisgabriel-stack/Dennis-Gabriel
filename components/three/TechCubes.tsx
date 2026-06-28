"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
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
  { n: "Next.js", accent: "#e6c88a", desc: "Das React-Framework für Production: Server-Rendering, App-Router, Image-Optimierung und Edge-Funktionen für blitzschnelle Seiten.", url: "https://nextjs.org" },
  { n: "React", accent: "#e6c88a", desc: "Bibliothek für komponentenbasierte UIs — deklarativ, wiederverwendbar und mit einem riesigen Ökosystem.", url: "https://react.dev" },
  { n: "TypeScript", accent: "#e6c88a", desc: "JavaScript mit statischen Typen: weniger Bugs, bessere Autovervollständigung und sicheres Refactoring in großen Codebasen.", url: "https://www.typescriptlang.org" },
  { n: "Tailwind", accent: "#e6c88a", desc: "Utility-First CSS: konsistentes, voll responsives Design direkt im Markup — ohne CSS-Wildwuchs.", url: "https://tailwindcss.com" },
  { n: "Three.js", accent: "#e6c88a", desc: "Die führende WebGL-Bibliothek für 3D im Browser — Szenen, Materialien, Licht und Echtzeit-Rendering.", url: "https://threejs.org" },
  { n: "Framer Motion", accent: "#e6c88a", desc: "Produktionsreife Animationen für React: Gesten, Layout-Transitions und Spring-Physik mit minimalem Code.", url: "https://www.framer.com/motion/" },
  // Backend
  { n: "Node.js", accent: "#c9a86a", desc: "Asynchrone JavaScript-Runtime für skalierbare Server, APIs und Echtzeit-Dienste.", url: "https://nodejs.org" },
  { n: "Express", accent: "#c9a86a", desc: "Schlankes, flexibles Node-Framework für REST-APIs, Middleware-Ketten und Routing.", url: "https://expressjs.com" },
  { n: "WebSocket", accent: "#c9a86a", desc: "Persistente, bidirektionale Verbindungen für Live-Updates, Chats und Echtzeit-Daten.", url: "https://developer.mozilla.org/docs/Web/API/WebSockets_API" },
  { n: "GraphQL", accent: "#c9a86a", desc: "Typisierte API-Abfragesprache: der Client holt exakt die Daten, die er braucht — nicht mehr, nicht weniger.", url: "https://graphql.org" },
  { n: "PostgreSQL", accent: "#c9a86a", desc: "Robuste relationale Open-Source-Datenbank mit ACID-Transaktionen, JSON-Support und mächtigen Queries.", url: "https://www.postgresql.org" },
  { n: "Redis", accent: "#c9a86a", desc: "Ultraschneller In-Memory-Store für Caching, Sessions, Rate-Limiting und Pub/Sub.", url: "https://redis.io" },
  // Infra
  { n: "Docker", accent: "#9c8552", desc: "Container kapseln App und Umgebung — identische, reproduzierbare Deployments von lokal bis Cloud.", url: "https://www.docker.com" },
  { n: "CI/CD", accent: "#9c8552", desc: "Automatisierte Pipelines für Build, Test und Deployment — schnelle, verlässliche Releases.", url: "https://github.com/features/actions" },
  { n: "AWS Cloud", accent: "#9c8552", desc: "Skalierbare Cloud-Infrastruktur: Compute, Storage, Datenbanken und Netzwerk on demand.", url: "https://aws.amazon.com" },
  { n: "Git", accent: "#9c8552", desc: "Verteilte Versionskontrolle für Branches, Code-Reviews und eine nachvollziehbare Historie.", url: "https://git-scm.com" },
  { n: "Linux", accent: "#9c8552", desc: "Stabiles, quelloffenes Server-Betriebssystem — das Fundament moderner Web-Infrastruktur.", url: "https://www.linux.org" },
  { n: "Monitoring", accent: "#9c8552", desc: "Metriken, Logs und Dashboards mit Alerting — volle Sichtbarkeit auf Systeme in Echtzeit.", url: "https://grafana.com" },
  // AI / Design / Web3
  { n: "KI / LLM", accent: "#f5f4f0", desc: "Integration großer Sprachmodelle für Automatisierung, Agenten und intelligente Produkt-Features.", url: "https://www.anthropic.com" },
  { n: "Automation", accent: "#f5f4f0", desc: "Verkettung von Diensten zu automatisierten Workflows — weniger Handarbeit, mehr Output.", url: "https://n8n.io" },
  { n: "Figma", accent: "#f5f4f0", desc: "Kollaboratives Design-Tool für UI, Prototypen und gemeinsame Design-Systeme im Team.", url: "https://www.figma.com" },
  { n: "UI / UX", accent: "#f5f4f0", desc: "Nutzerzentriertes Design: klare Strukturen, intuitive Flows und durchdachte Interaktion.", url: "https://www.interaction-design.org" },
  { n: "Web3", accent: "#f5f4f0", desc: "Dezentrale Anwendungen auf der Blockchain — Wallets, Verträge und On-Chain-Logik.", url: "https://ethereum.org" },
  { n: "Smart Contracts", accent: "#f5f4f0", desc: "Selbstausführende Verträge auf der Blockchain — vertrauenslos, transparent und unveränderlich.", url: "https://soliditylang.org" },
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

// ===== 3 button-triggered constructs, each using all 24 cubes =====

// 1) the ARCHANGEL "A" monogram — 24 cells form a capital A with a crossbar
const A_CELLS: [number, number][] = [
  [2, 0], [3, 0], [4, 0],
  [2, 1], [4, 1],
  [1, 2], [2, 2], [4, 2], [5, 2],
  [1, 3], [5, 3],
  [1, 4], [2, 4], [3, 4], [4, 4], [5, 4],
  [1, 5], [5, 5],
  [0, 6], [1, 6], [5, 6], [6, 6],
  [0, 7], [6, 7],
];
function monogramA(i: number) {
  const [c, r] = A_CELLS[i];
  const S = 1.2;
  return new THREE.Vector3((c - 3) * S, (3.5 - r) * S, 0);
}

// 2) a 2×2×6 skyscraper tower
function tower(i: number) {
  const lvl = Math.floor(i / 4); // 0..5
  const k = i % 4;
  const x = (k % 2 ? 1 : -1) * 0.66;
  const z = (k < 2 ? -1 : 1) * 0.66;
  return new THREE.Vector3(x, (lvl - 2.5) * 1.35, z);
}

// 3) a double helix (two strands of 12 — data DNA)
function helix(i: number) {
  const strand = Math.floor(i / 12); // 0 | 1
  const k = i % 12;
  const ang = k * 0.52 + strand * Math.PI;
  const r = 2.8;
  return new THREE.Vector3(Math.cos(ang) * r, (k - 5.5) * 0.8, Math.sin(ang) * r);
}

// 4) the "DG" initials — D (12 cells) + G (12 cells)
const DG_CELLS: [number, number][] = [
  // D — cols 0..3
  [0, 0], [1, 0], [2, 0],
  [0, 1], [3, 1],
  [0, 2], [3, 2],
  [0, 3], [3, 3],
  [0, 4], [1, 4], [2, 4],
  // G — cols 5..8
  [6, 0], [7, 0], [8, 0],
  [5, 1],
  [5, 2], [7, 2], [8, 2],
  [5, 3], [8, 3],
  [6, 4], [7, 4], [8, 4],
];
function initialsDG(i: number) {
  const [c, r] = DG_CELLS[i];
  const S = 1.2;
  return new THREE.Vector3((c - 4) * S, (2 - r) * S, 0);
}

export const FORMATION_LABELS = ["A-Monogramm", "Turm", "Helix", "DG"];
const FORMATIONS = [monogramA, tower, helix, initialsDG];
const FORM_TARGETS = FORMATIONS.map((f) =>
  Array.from({ length: N }, (_, i) => f(i))
);

const RADIUS = 0.85;
const BOUND = { x: 9, y: 5.5, z: 7 } as const;
const emitEv = (n: string) =>
  typeof window !== "undefined" &&
  window.dispatchEvent(new CustomEvent(n));

function Blocks({
  focused,
  setFocused,
  buildRef,
}: {
  focused: number | null;
  setFocused: (i: number | null) => void;
  buildRef: MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  // keep latest focus props reachable inside imperative handlers
  const focusedRef = useRef(focused);
  focusedRef.current = focused;
  const setFocusedRef = useRef(setFocused);
  setFocusedRef.current = setFocused;

  const blocks = useMemo(() => {
    const arr: {
      mesh: THREE.Group;
      mats: (THREE.MeshBasicMaterial | THREE.LineBasicMaterial)[];
      baseOpacity: number[];
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      landed: boolean;
    }[] = [];
    const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const glowGeo = new THREE.BoxGeometry(1.42, 1.42, 1.42);
    TECHS.forEach((tech, i) => {
      const mat = new THREE.MeshBasicMaterial({ map: makeLabel(tech), transparent: true });
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
      holder.userData.idx = i;
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 14
      );
      holder.position.copy(pos);
      arr.push({
        mesh: holder,
        mats: [mat, edgeMat, glowMat],
        baseOpacity: [1, 0.85, 0.06],
        pos,
        vel: new THREE.Vector3(),
        landed: false,
      });
    });
    return arr;
  }, []);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const v1 = useMemo(() => new THREE.Vector3(), []);
  const v2 = useMemo(() => new THREE.Vector3(), []);
  const v3 = useMemo(() => new THREE.Vector3(), []);

  const sim = useRef({
    lastForm: -1,
    yaw: 0,
    pitch: 0,
    tyaw: 0,
    tpitch: 0,
    mode: "none" as "none" | "orbit" | "cube" | "pinch",
    cubeIndex: -1,
    lastX: 0,
    lastY: 0,
    moved: 0,
    downTime: 0,
    lastMoveT: 0,
    zoom: 16,
    zoomTarget: 16,
    pinchDist: 0,
    burstDone: false,
    plane: new THREE.Plane(),
  });

  // imperative pointer handling: orbit empty space, grab/throw cubes, pinch-zoom
  useEffect(() => {
    const el = gl.domElement;
    const grp = groupRef.current!;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const s = sim.current;
    const ZOOM_MIN = 8;
    const ZOOM_MAX = 28;
    const pointers = new Map<number, { x: number; y: number }>();
    const pinchGap = () => {
      const pts = [...pointers.values()];
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const setNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1
      );
    };

    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        // second finger → pinch-zoom (cancel any orbit/cube interaction)
        s.mode = "pinch";
        s.cubeIndex = -1;
        s.pinchDist = pinchGap();
        return;
      }
      setNdc(e);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(grp.children, true);
      if (hits.length) {
        let o: THREE.Object3D | null = hits[0].object;
        while (o && o.userData.idx === undefined) o = o.parent;
        if (o) {
          s.mode = "cube";
          s.cubeIndex = o.userData.idx as number;
          s.moved = 0;
          s.downTime = performance.now();
          s.lastMoveT = performance.now();
          const cubeWorld = grp.localToWorld(blocks[s.cubeIndex].pos.clone());
          camera.getWorldDirection(v3);
          s.plane.setFromNormalAndCoplanarPoint(v3, cubeWorld);
          el.setPointerCapture?.(e.pointerId);
          return;
        }
      }
      s.mode = "orbit";
      s.lastX = e.clientX;
      s.lastY = e.clientY;
    };

    const move = (e: PointerEvent) => {
      if (pointers.has(e.pointerId))
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (s.mode === "pinch" && pointers.size >= 2) {
        const gap = pinchGap();
        if (s.pinchDist > 0) {
          s.zoomTarget = THREE.MathUtils.clamp(
            s.zoomTarget * (s.pinchDist / gap),
            ZOOM_MIN,
            ZOOM_MAX
          );
        }
        s.pinchDist = gap;
        return;
      }
      if (s.mode === "orbit") {
        s.tyaw += (e.clientX - s.lastX) * 0.006;
        s.tpitch = THREE.MathUtils.clamp(
          s.tpitch + (e.clientY - s.lastY) * 0.005,
          -0.85,
          0.85
        );
        s.lastX = e.clientX;
        s.lastY = e.clientY;
      } else if (s.mode === "cube") {
        setNdc(e);
        ray.setFromCamera(ndc, camera);
        const hit = ray.ray.intersectPlane(s.plane, v1);
        if (hit) {
          const b = blocks[s.cubeIndex];
          grp.worldToLocal(v1);
          const now = performance.now();
          const dt = Math.max(0.001, (now - s.lastMoveT) / 1000);
          s.moved += v1.distanceTo(b.pos);
          b.vel.copy(v2.subVectors(v1, b.pos)).multiplyScalar(1 / dt).clampLength(0, 48);
          b.pos.copy(v1);
          s.lastMoveT = now;
        }
      }
    };

    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (s.mode === "pinch") {
        // drop back to idle until fingers lift; re-arm if one remains
        s.mode = "none";
        s.cubeIndex = -1;
        return;
      }
      if (s.mode === "cube") {
        const quick = performance.now() - s.downTime < 260;
        const i = s.cubeIndex;
        if (s.moved < 0.4 && quick) {
          const willFocus = focusedRef.current !== i;
          setFocusedRef.current(willFocus ? i : null);
          emitEv(willFocus ? "ux-woosh" : "ux-click");
        } else {
          emitEv("ux-woosh"); // thrown into zero-g
        }
      }
      s.mode = "none";
      s.cubeIndex = -1;
    };

    // desktop wheel-zoom
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      s.zoomTarget = THREE.MathUtils.clamp(
        s.zoomTarget + e.deltaY * 0.02,
        ZOOM_MIN,
        ZOOM_MAX
      );
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = sim.current;
    const grp = groupRef.current!;
    const focusing = focusedRef.current !== null;

    // button-driven construct: -1 = free float, 0..3 = assemble & hold
    const form = buildRef.current;
    if (form !== s.lastForm) {
      s.lastForm = form;
      s.burstDone = false;
      for (const b of blocks) b.landed = false; // re-arm landing snaps
      emitEv("ux-woosh");
    }
    const building = form >= 0;
    const targets = building ? FORM_TARGETS[form] : null;

    // focus fly-in target — lower-centre of the canvas so the close-up cube
    // keeps clear distance from the heading text above it
    const front = tmp
      .copy(camera.position)
      .add(v3.set(0, 0, -6.5).applyQuaternion(camera.quaternion));
    front.y -= 0.8;

    // integrate physics
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (focusing && i === focused) {
        b.pos.lerp(grp.worldToLocal(front.clone()), 0.12);
        b.vel.set(0, 0, 0);
        continue;
      }
      if (s.mode === "cube" && s.cubeIndex === i) continue; // held by pointer
      if (building && targets) {
        // spring toward the construct slot and hold there
        b.vel.addScaledVector(v1.subVectors(targets[i], b.pos), 9 * dt);
        b.vel.multiplyScalar(0.8);
      } else {
        b.vel.multiplyScalar(0.992); // zero-gravity drift
      }
      b.pos.addScaledVector(b.vel, dt);
      // bounce off the invisible bounds
      (["x", "y", "z"] as const).forEach((ax) => {
        const lim = BOUND[ax];
        if (b.pos[ax] > lim) {
          b.pos[ax] = lim;
          b.vel[ax] = -Math.abs(b.vel[ax]) * 0.7;
        } else if (b.pos[ax] < -lim) {
          b.pos[ax] = -lim;
          b.vel[ax] = Math.abs(b.vel[ax]) * 0.7;
        }
      });
    }

    // cube-vs-cube collisions — always on so blocks never interpenetrate.
    // free-float: full elastic bounce. building: tighter radius + positional
    // push only (no added energy) so the construct settles solid without jitter.
    let collided = false;
    const min = building ? 1.18 : RADIUS * 2;
    for (let i = 0; i < blocks.length; i++) {
      if (focusing && i === focused) continue;
      for (let j = i + 1; j < blocks.length; j++) {
        if (focusing && j === focused) continue;
        const a = blocks[i];
        const c = blocks[j];
        const n = v1.subVectors(c.pos, a.pos);
        const dist = n.length();
        if (dist > 0.0001 && dist < min) {
          n.multiplyScalar(1 / dist);
          const overlap = min - dist;
          const aHeld = s.mode === "cube" && s.cubeIndex === i;
          const cHeld = s.mode === "cube" && s.cubeIndex === j;
          if (!aHeld) a.pos.addScaledVector(n, -overlap * (cHeld ? 1 : 0.5));
          if (!cHeld) c.pos.addScaledVector(n, overlap * (aHeld ? 1 : 0.5));
          const sep = v2.subVectors(c.vel, a.vel).dot(n);
          if (!building && sep < 0) {
            const imp = -sep * 0.9;
            if (!aHeld) a.vel.addScaledVector(n, -imp * (cHeld ? 1 : 0.5));
            if (!cHeld) c.vel.addScaledVector(n, imp * (aHeld ? 1 : 0.5));
            if (imp > 6) collided = true;
          }
        }
      }
    }
    if (collided && !building) emitEv("ux-block");

    // assembly sound: a snap as each block locks into its slot, then a
    // completion burst once the construct is essentially built
    if (building && targets) {
      let landedCount = 0;
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        if (b.pos.distanceTo(targets[i]) < 0.45) {
          if (!b.landed) {
            b.landed = true;
            emitEv("ux-block"); // soft snap, throttled in the SoundManager
          }
          landedCount++;
        }
      }
      if (!s.burstDone && landedCount >= blocks.length - 1) {
        s.burstDone = true;
        emitEv("ux-burst");
      }
    }

    // apply to meshes
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      b.mesh.position.copy(b.pos);
      if (focusing && i === focused) {
        b.mesh.scale.setScalar(lerp(b.mesh.scale.x, 1.7, 0.1));
        b.mesh.rotation.y += dt * 0.55;
        b.mesh.rotation.x += dt * 0.4;
        b.mats.forEach((m, jj) => (m.opacity = b.baseOpacity[jj]));
      } else {
        b.mesh.scale.setScalar(lerp(b.mesh.scale.x, 1, 0.1));
        const held = s.mode === "cube" && s.cubeIndex === i;
        if (building && !held) {
          // grid-align the cube so faces tile cleanly (no corner clipping)
          b.mesh.rotation.x = lerp(b.mesh.rotation.x, 0, 0.12);
          b.mesh.rotation.y = lerp(b.mesh.rotation.y, 0, 0.12);
          b.mesh.rotation.z = lerp(b.mesh.rotation.z, 0, 0.12);
        } else {
          const spd = b.vel.length();
          b.mesh.rotation.x += (0.15 + spd * 0.12) * dt;
          b.mesh.rotation.y += (0.2 + spd * 0.1) * dt;
        }
        const dimTo = focusing ? 0.12 : 1;
        b.mats.forEach(
          (m, jj) => (m.opacity = lerp(m.opacity, b.baseOpacity[jj] * dimTo, 0.1))
        );
      }
    }

    // orbit (drag look-around + gentle idle auto-rotate)
    if (s.mode === "none" && !focusing) s.tyaw += dt * 0.04;
    s.yaw = lerp(s.yaw, s.tyaw, 0.1);
    s.pitch = lerp(s.pitch, s.tpitch, 0.1);
    grp.rotation.y = focusing ? lerp(grp.rotation.y, 0, 0.06) : s.yaw;
    grp.rotation.x = focusing ? lerp(grp.rotation.x, 0, 0.06) : s.pitch;

    // wheel / pinch zoom — dolly the camera along its view axis
    s.zoom = lerp(s.zoom, s.zoomTarget, 0.12);
    camera.position.z = s.zoom;
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

export default function TechCubes({
  onFocus,
  buildRef,
}: {
  onFocus?: (t: Tech | null) => void;
  buildRef: MutableRefObject<number>;
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
      className="!absolute inset-0 touch-none"
      camera={{ position: [0, 1.5, 16], fov: 48 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => setFocused(null)}
    >
      <fog attach="fog" args={[0x0a0a0b, 22, 64]} />
      <Ambience />
      <Blocks focused={focused} setFocused={setFocused} buildRef={buildRef} />
    </Canvas>
  );
}
