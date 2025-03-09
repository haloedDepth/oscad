import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Set Z as the up direction for ReplicAD models
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

export default function ThreeContext({ children }) {
  const dpr = Math.min(window.devicePixelRatio, 2);

  return (
    <Suspense fallback={null}>
      <Canvas
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f5f5f5",
        }}
        dpr={dpr}
        frameloop="demand"
        // Orthographic camera setup
        camera={{ 
          position: [200, 200, 200],
          orthographic: true,
          zoom: 1,
          far: 10000,
          near: 0.1
        }}
      >
        <OrbitControls />
        <ambientLight intensity={4} />
        <pointLight position={[100, 100, 100]} />
        {children}
      </Canvas>
    </Suspense>
  );
}