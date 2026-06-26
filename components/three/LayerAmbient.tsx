"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const { lerp } = THREE.MathUtils;

// per-layer theme: color + light intensity + fog distance
const THEMES = [
  { color: new THREE.Color("#e6c88a"), light: 1.5, fogFar: 34 }, // L1 airy/bright
  { color: new THREE.Color("#c9a86a"), light: 1.1, fogFar: 30 }, // L2 network
  { color: new THREE.Color("#9c8552"), light: 0.85, fogFar: 26 }, // L3 data
  { color: new THREE.Color("#c9a05a"), light: 0.7, fogFar: 22 }, // L4 infra
];

function setOpacity(obj: THREE.Object3D, o: number) {
  obj.traverse((c) => {
    const m = (c as THREE.Mesh).material as THREE.Material | THREE.Material[];
    if (!m) return;
    (Array.isArray(m) ? m : [m]).forEach((mm) => {
      mm.transparent = true;
      (mm as THREE.Material & { opacity: number }).opacity =
        ((mm as { _base?: number })._base ?? 1) * o;
    });
  });
}

function Ambient({ selRef }: { selRef: MutableRefObject<number> }) {
  const { camera } = useThree();
  const curColor = useMemo(() => THEMES[0].color.clone(), []);
  const blend = useRef(0); // smoothed selected index
  const ambRef = useRef<THREE.AmbientLight>(null);
  const pointRef = useRef<THREE.PointLight>(null);

  const built = useMemo(() => {
    const root = new THREE.Group();

    // ---- starfield (always present, tinted to theme) ----
    const SN = 1400;
    const pos = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) {
      const r = 8 + Math.random() * 16;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xc9a86a,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    root.add(stars);

    // ===== motif 0 — L1: flowing UI wave surface =====
    const waveGeo = new THREE.PlaneGeometry(20, 14, 36, 26);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xe6c88a,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    (waveMat as unknown as { _base: number })._base = 0.45;
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.rotation.x = -Math.PI / 2.4;
    wave.position.y = -3;
    root.add(wave);

    // ===== motif 1 — L2: orbiting network =====
    const net = new THREE.Group();
    const NODES = 12;
    const nodePos: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++) {
      const a = (i / NODES) * Math.PI * 2;
      const r = 4.5 + (i % 3) * 0.8;
      const v = new THREE.Vector3(
        Math.cos(a) * r,
        Math.sin(a * 1.5) * 1.6,
        Math.sin(a) * r
      );
      nodePos.push(v);
      const node = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18),
        new THREE.MeshBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0 })
      );
      (node.material as unknown as { _base: number })._base = 0.9;
      node.position.copy(v);
      net.add(node);
    }
    const linePts: THREE.Vector3[] = [];
    for (let i = 0; i < NODES; i++) {
      linePts.push(new THREE.Vector3(0, 0, 0), nodePos[i]);
      linePts.push(nodePos[i], nodePos[(i + 1) % NODES]);
    }
    const netLines = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(linePts),
      new THREE.LineBasicMaterial({ color: 0xc9a86a, transparent: true, opacity: 0 })
    );
    (netLines.material as unknown as { _base: number })._base = 0.25;
    net.add(netLines);
    root.add(net);

    // ===== motif 2 — L3: descending data streams =====
    const streams = new THREE.Group();
    const SC = 90;
    const sData = Array.from({ length: SC }, () => ({
      x: (Math.random() - 0.5) * 14,
      z: (Math.random() - 0.5) * 8,
      t: Math.random(),
      sp: 0.25 + Math.random() * 0.4,
    }));
    const streamMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.06, 0.5, 0.06),
      new THREE.MeshBasicMaterial({
        color: 0xb9985a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      SC
    );
    (streamMesh.material as unknown as { _base: number })._base = 0.8;
    streams.add(streamMesh);
    root.add(streams);

    // ===== motif 3 — L4: rotating infrastructure lattice =====
    const lattice = new THREE.Group();
    const box = new THREE.BoxGeometry(7, 7, 7, 3, 3, 3);
    const latMain = new THREE.LineSegments(
      new THREE.WireframeGeometry(box),
      new THREE.LineBasicMaterial({ color: 0xc9a05a, transparent: true, opacity: 0 })
    );
    (latMain.material as unknown as { _base: number })._base = 0.4;
    lattice.add(latMain);
    const latInner = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.4, 0)),
      new THREE.LineBasicMaterial({ color: 0xe6c88a, transparent: true, opacity: 0 })
    );
    (latInner.material as unknown as { _base: number })._base = 0.6;
    lattice.add(latInner);
    root.add(lattice);

    const motifs = [wave, net, streams, lattice];
    return {
      root,
      stars,
      starMat,
      motifs,
      waveGeo,
      net,
      lattice,
      streamMesh,
      sData,
    };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const sel = selRef.current ?? 0;
    blend.current = lerp(blend.current, sel, 1 - Math.pow(0.002, delta));
    const b = blend.current;

    // theme color + light lerp
    const target = THEMES[Math.round(b)] ?? THEMES[0];
    curColor.lerp(target.color, 1 - Math.pow(0.01, delta));
    built.starMat.color.copy(curColor);

    // fog
    if (state.scene.fog instanceof THREE.Fog) {
      state.scene.fog.color.lerp(new THREE.Color(0x0a0a0b), 0.1);
      state.scene.fog.far = lerp(state.scene.fog.far, target.fogFar, 0.05);
    }

    // motif cross-fade (active = closest index)
    built.motifs.forEach((m, i) => {
      const w = Math.max(0, 1 - Math.abs(b - i)); // 1 when active
      setOpacity(m, w);
      m.visible = w > 0.01;
    });

    // animate each motif
    const wave = built.motifs[0] as THREE.Mesh;
    const wp = built.waveGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < wp.count; i++) {
      const x = wp.getX(i);
      const y = wp.getY(i);
      wp.setZ(i, Math.sin(x * 0.5 + t) * 0.6 + Math.cos(y * 0.5 + t * 0.7) * 0.6);
    }
    wp.needsUpdate = true;
    wave.rotation.z = Math.sin(t * 0.1) * 0.1;

    built.net.rotation.y += delta * 0.25;
    built.net.rotation.x = Math.sin(t * 0.2) * 0.2;

    built.lattice.rotation.y += delta * 0.15;
    built.lattice.rotation.x += delta * 0.05;

    // data streams
    built.sData.forEach((d, i) => {
      d.t += d.sp * delta;
      if (d.t > 1) d.t -= 1;
      dummy.position.set(d.x, 5 - d.t * 10, d.z);
      dummy.scale.setScalar(0.6 + Math.sin(d.t * Math.PI));
      dummy.updateMatrix();
      built.streamMesh.setMatrixAt(i, dummy.matrix);
    });
    built.streamMesh.instanceMatrix.needsUpdate = true;

    // lights adapt to the layer theme
    if (pointRef.current) {
      pointRef.current.color.copy(curColor);
      pointRef.current.intensity = lerp(
        pointRef.current.intensity,
        target.light * 34,
        0.05
      );
    }
    if (ambRef.current) {
      ambRef.current.intensity = lerp(
        ambRef.current.intensity,
        0.25 + target.light * 0.25,
        0.05
      );
    }

    // camera drift
    camera.position.x = lerp(camera.position.x, Math.sin(t * 0.08) * 2, 0.02);
    camera.position.y = lerp(camera.position.y, 1 + Math.cos(t * 0.1) * 1, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.4} />
      <pointLight ref={pointRef} position={[0, 4, 6]} intensity={30} distance={40} />
      <primitive object={built.root} />
    </>
  );
}

export default function LayerAmbient({
  selRef,
}: {
  selRef: MutableRefObject<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 1, 12], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[0x0a0a0b, 6, 30]} />
      <Ambient selRef={selRef} />
    </Canvas>
  );
}
