"use client";

import {
  Suspense,
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { 
  PerspectiveCamera,
  Sky,
  Stars, 
  Environment
} from "@react-three/drei";
import * as THREE from "three";
import CityModel from "./CityModel";
import Ground from "./Ground";
import SunLight from "./SunLight";
import { isDaytime } from "../utils/sunPosition";
import { getSunPosition } from "../utils/sunPosition";

function KeyboardControls() {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const moveSpeed = 12;
  const mouseSensitivity = 0.002;
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false
  });

  // Camera rotation state
  const rotation = useRef({ x: 0, y: 0 });
  const isMouseLocked = useRef(false);

  // Prevent camera from going below ground
  const groundHeight = 0; 

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w': keys.current.w = true; break;
        case 'a': keys.current.a = true; break;
        case 's': keys.current.s = true; break;
        case 'd': keys.current.d = true; break;
        case 'q': keys.current.q = true; break;
        case 'e': keys.current.e = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch(e.key.toLowerCase()) {
        case 'w': keys.current.w = false; break;
        case 'a': keys.current.a = false; break;
        case 's': keys.current.s = false; break;
        case 'd': keys.current.d = false; break;
        case 'q': keys.current.q = false; break;
        case 'e': keys.current.e = false; break;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left mouse button
        e.preventDefault();
        isMouseLocked.current = true;
        document.body.style.cursor = 'none';
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) { // Left mouse button
        isMouseLocked.current = false;
        document.body.style.cursor = 'default';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseLocked.current) {
        rotation.current.y -= e.movementX * mouseSensitivity;
        rotation.current.x -= e.movementY * mouseSensitivity;

        // Limit vertical rotation to prevent flipping
        rotation.current.x = Math.max(
          -Math.PI / 2, 
          Math.min(Math.PI / 2, rotation.current.x)
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useFrame(() => {
    // Reset velocity
    velocity.current.set(0, 0, 0);
  
    // Update camera rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = rotation.current.y;
    camera.rotation.x = rotation.current.x;
  
    // Corrected forward direction: Negative Z-axis in the camera's local space
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    direction.y = 0; // Lock to horizontal plane
    direction.normalize();
  
    // Perpendicular vector for strafing
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, direction);
  
    // Movement logic
    if (keys.current.w) velocity.current.add(direction.multiplyScalar(moveSpeed));
    if (keys.current.s) velocity.current.sub(direction.multiplyScalar(moveSpeed));
    if (keys.current.a) velocity.current.add(right.multiplyScalar(moveSpeed));
    if (keys.current.d) velocity.current.sub(right.multiplyScalar(moveSpeed));
    if (keys.current.q) velocity.current.y -= moveSpeed;
    if (keys.current.e) velocity.current.y += moveSpeed;
  
    // Apply movement
    camera.position.add(velocity.current);
  
    // Define boundaries based on the 3D scene
    const boundingBox = {
      minX: -2500, // Set according to your 3D model's bounds
      maxX: 2500,
      minY: groundHeight + 10, // Prevent below ground
      maxY: 750, // Set upper height limit
      minZ: -2700,
      maxZ: 2700,
    };
  
    // Clamp camera position within the bounding box
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, boundingBox.minX, boundingBox.maxX);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, boundingBox.minY, boundingBox.maxY);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, boundingBox.minZ, boundingBox.maxZ);
  });
  
  return null;
}

interface ThreeJSComponentsProps {
  onSelectBuilding: (building: THREE.Mesh) => void;
  selectedTime: Date;
}

export default function ThreeJSComponents({
  onSelectBuilding,
  selectedTime,
}: ThreeJSComponentsProps) {
  const latitude = 23.0225; // Latitude for Ahmedabad
  const longitude = 72.5714; // Longitude for Ahmedabad
  const [selectedBuilding, setSelectedBuilding] = useState<THREE.Mesh | null>(
    null
  );
  const [isDaytimeState, setIsDaytimeState] = useState(true);

  const sunPosition = useMemo(() => {
    return getSunPosition(selectedTime, latitude, longitude);
  }, [selectedTime, latitude, longitude]);

  useEffect(() => {
    const checkDaytime = () => {
      const newIsDaytime = isDaytime(selectedTime, latitude, longitude);
      setIsDaytimeState(newIsDaytime);
    };
    checkDaytime();
  }, [selectedTime, latitude, longitude]);

  const handleSelectBuilding = useCallback(
    (building: THREE.Mesh) => {
      setSelectedBuilding(building);
      onSelectBuilding(building);
    },
    [onSelectBuilding]
  );

  return (
    <Canvas
      shadows={isDaytimeState}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(isDaytimeState ? 0x87ceeb : 0x000000);
        gl.shadowMap.enabled = isDaytimeState;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        scene.background = new THREE.Color(
          isDaytimeState ? 0x87ceeb : 0x000000
        );
      }}
    >
      <Suspense fallback={null}>
        <PerspectiveCamera 
          makeDefault 
          position={[500, 500, 500]} 
          fov={45} 
          near={1} 
          far={2000}
          rotation={[
            -Math.PI / 4, // pitch down slightly
            0, // no yaw rotation
            0  // no roll
          ]}
        />
        <KeyboardControls />
        {isDaytimeState ? (
          <Sky sunPosition={sunPosition} distance={7500}/>
        ) : (
          <Stars
            radius={300}
            depth={60}
            count={1000}
            factor={7}
            saturation={0}
            fade={true}
          />
        )}
        <Environment preset={isDaytimeState ? "city" : "night"} />
        <CityModel
          onSelectBuilding={handleSelectBuilding}
          selectedBuilding={selectedBuilding}
          date={selectedTime}
          latitude={latitude}
          longitude={longitude}
          isDaytime={isDaytimeState}
        />
        {isDaytimeState && (
          <SunLight
            date={selectedTime}
            latitude={latitude}
            longitude={longitude}
            castShadow={true}
            shadowMapSize={2048}
            shadowBias={-0.0001}
            intensity={1.5}
          />
        )}
        <Ground receiveShadow={true} />
        <ambientLight intensity={isDaytimeState ? 0.5 : 0.1} />
      </Suspense>
    </Canvas>
  );
}