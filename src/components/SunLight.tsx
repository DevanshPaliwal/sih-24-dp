"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getSunPosition } from "../utils/sunPosition";

interface SunLightProps {
  date: Date;
  latitude: number;
  longitude: number;
  castShadow: boolean;
  shadowMapSize: number;
  shadowBias: number;
  intensity: number;
}

export default function SunLight({
  date,
  latitude,
  longitude,
  castShadow,
  shadowMapSize,
  shadowBias,
  intensity,
}: SunLightProps) {
  const { scene } = useThree();
  const lightRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    if (lightRef.current) {
      const sunPosition = getSunPosition(date, latitude, longitude);
      lightRef.current.position.copy(sunPosition);
      lightRef.current.lookAt(scene.position);
    }
  }, [date, latitude, longitude, scene.position]);

  return (
    <directionalLight
      ref={lightRef}
      intensity={intensity}
      castShadow={castShadow}
      shadow-mapSize-width={shadowMapSize}
      shadow-mapSize-height={shadowMapSize}
      shadow-camera-far={2000}
      shadow-camera-left={-1000}
      shadow-camera-right={1000}
      shadow-camera-top={1000}
      shadow-camera-bottom={-1000}
      shadow-bias={shadowBias}
    />
  );
}
