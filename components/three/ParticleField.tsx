"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 2600 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const { positions, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute in a soft sphere shell for depth
      const r = 5 + Math.pow(Math.random(), 0.6) * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = Math.random();
    }
    return { positions, scales };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.035;
    pointsRef.current.rotation.x += delta * 0.012;
    // Smooth mouse parallax
    const tx = pointer.y * 0.18;
    const ty = pointer.x * 0.25;
    pointsRef.current.rotation.x +=
      (tx - pointsRef.current.rotation.x * 0.0) * 0;
    state.camera.position.x += (pointer.x * 1.2 - state.camera.position.x) * 0.03;
    state.camera.position.y += (pointer.y * 0.9 - state.camera.position.y) * 0.03;
    state.camera.lookAt(0, 0, 0);
    void ty;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color={"#c9a86a"}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default Particles;
