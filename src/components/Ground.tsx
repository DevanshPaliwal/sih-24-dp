"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useLoader } from "@react-three/fiber";

interface GroundProps {
  receiveShadow: boolean;
}

export default function Ground({ receiveShadow }: GroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load the texture image
  const texture = useLoader(THREE.TextureLoader, "/ground_texture.jpg");

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.receiveShadow = receiveShadow;

      // Set texture properties
      if (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(100, 100); // Repeat the texture
      }
    }
  }, [receiveShadow, texture]);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]} // Rotate to lie flat
      position={[0, -0.5, 0]} // Adjust position
      receiveShadow={receiveShadow}
    >
      <planeGeometry args={[10000, 10000]} />
      <meshStandardMaterial
        map={texture} // Attach the texture
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}
