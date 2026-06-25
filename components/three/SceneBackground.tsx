"use client";

import { Canvas } from "@react-three/fiber";
import Particles from "./ParticleField";

export default function SceneBackground() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 12], fov: 55 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={["#0a0a0b", 9, 22]} />
      <ambientLight intensity={0.4} />
      <Particles />
    </Canvas>
  );
}
