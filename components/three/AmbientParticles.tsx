"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Field() {
  const stars = useRef<THREE.Points>(null);
  const rings = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const SN = 900;
    const pos = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) {
      const r = 6 + Math.random() * 22;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.85;
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  // large faint rings that continue the ring motif from the section above
  const ringGroup = useMemo(() => {
    const grp = new THREE.Group();
    grp.position.y = 7; // sit toward the top, flowing down from above
    for (let i = 0; i < 4; i++) {
      const tor = new THREE.Mesh(
        new THREE.TorusGeometry(7 + i * 2, 0.02, 8, 120),
        new THREE.MeshBasicMaterial({
          color: 0xc9a86a,
          transparent: true,
          opacity: 0.07,
        })
      );
      tor.rotation.set(Math.PI / 2.4 + i * 0.18, i * 0.4, i * 0.25);
      grp.add(tor);
    }
    return grp;
  }, []);

  useFrame((state, delta) => {
    if (stars.current) {
      stars.current.rotation.y += delta * 0.02;
      stars.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.05) * 0.08;
    }
    if (rings.current) {
      rings.current.rotation.z += delta * 0.04;
      rings.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <>
      <points ref={stars} geometry={geo}>
        <pointsMaterial
          size={0.05}
          color={0xc9a86a}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <primitive ref={rings} object={ringGroup} />
    </>
  );
}

export default function AmbientParticles() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 14], fov: 55 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[0x0a0a0b, 14, 40]} />
      <Field />
    </Canvas>
  );
}
