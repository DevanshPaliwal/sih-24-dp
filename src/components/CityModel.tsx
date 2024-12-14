"use client";

import * as THREE from "three";
import { useEffect, useMemo, useState, useRef } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { getSunPosition } from "../utils/sunPosition";

interface CityModelProps {
  onSelectBuilding: (building: THREE.Mesh | null) => void;
  selectedBuilding: THREE.Mesh | null;
  date: Date;
  latitude: number;
  longitude: number;
  isDaytime: boolean;
}

export default function CityModel({
  onSelectBuilding,
  selectedBuilding,
  date,
  latitude,
  longitude,
  isDaytime,
}: CityModelProps) {
  const { scene, camera, raycaster, pointer, gl } = useThree();
  const [hoveredBuilding, setHoveredBuilding] = useState<THREE.Mesh | null>(
    null
  );
  const cityGroupRef = useRef<THREE.Group>(null);

  const cityModel = useLoader(OBJLoader, "/ahm3d_obj.obj");

  const cityGroup = useMemo(() => {
    const group = new THREE.Group();

    const getColorByHeight = (height: number): number => {
      // return 0x31313b; grey colour if needed to set 1 color
      if (height < 5) return 0xFFFF00; // Yellow
      if (height >= 5 && height < 10) return 0xADD8E6; // Light Blue
      if (height >= 11 && height < 15) return 0x90EE90; // Light Green
      if (height >= 16 && height < 20) return 0xFFC0CB; // Pink
      if (height >= 21 && height < 25) return 0x800080; // Purple
      if (height >= 26 && height < 30) return 0x4B0082; // Dark Purple
      return 0xFF0000; // Red (for height > 30)
    };  

    // Enhanced color palettes for hover and selection
    const HOVER_COLORS = {
      default: 0x00ff00, // Bright Green
      yellow: 0xffd700, // Golden Yellow
      lightBlue: 0x1e90ff, // Dodger Blue
      lightGreen: 0x32cd32, // Lime Green
      pink: 0xff69b4, // Hot Pink
      purple: 0x9400d3, // Dark Violet
      darkPurple: 0x8a2be2, // Blue Violet
      red: 0xff4500, // Orange Red
    };

    const SELECTION_COLORS = {
      default: 0xff4500, // Orange Red
      yellow: 0xff6347, // Tomato
      lightBlue: 0xff8c00, // Dark Orange
      lightGreen: 0xff7f50, // Coral
      pink: 0xff1493, // Deep Pink
      purple: 0xff00ff, // Magenta
      darkPurple: 0xc71585, // Medium Violet Red
      red: 0x8b0000, // Dark Red
    };

    cityModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Calculate building height (assuming Y-axis represents height)
        const boundingBox = new THREE.Box3().setFromObject(child);
        const height = boundingBox.getSize(new THREE.Vector3()).y;

        // Get color based on height
        const baseColor = getColorByHeight(height);

        const material = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.7,
          metalness: 0.2,
        });

        const newMesh = new THREE.Mesh(child.geometry, material);
        newMesh.position.copy(child.position);
        newMesh.rotation.copy(child.rotation);
        newMesh.scale.copy(child.scale);
        newMesh.castShadow = true;
        newMesh.receiveShadow = true;

        // Store original color, height, and color variants
        newMesh.userData.originalColor = baseColor;
        newMesh.userData.height = height;
        newMesh.userData.hoverColor = (() => {
          switch (baseColor) {
            case 0xffff00:
              return HOVER_COLORS.yellow;
            case 0xadd8e6:
              return HOVER_COLORS.lightBlue;
            case 0x90ee90:
              return HOVER_COLORS.lightGreen;
            case 0xffc0cb:
              return HOVER_COLORS.pink;
            case 0x800080:
              return HOVER_COLORS.purple;
            case 0x4b0082:
              return HOVER_COLORS.darkPurple;
            case 0xff0000:
              return HOVER_COLORS.red;
            default:
              return HOVER_COLORS.default;
          }
        })();
        newMesh.userData.selectionColor = (() => {
          switch (baseColor) {
            case 0xffff00:
              return SELECTION_COLORS.yellow;
            case 0xadd8e6:
              return SELECTION_COLORS.lightBlue;
            case 0x90ee90:
              return SELECTION_COLORS.lightGreen;
            case 0xffc0cb:
              return SELECTION_COLORS.pink;
            case 0x800080:
              return SELECTION_COLORS.purple;
            case 0x4b0082:
              return SELECTION_COLORS.darkPurple;
            case 0xff0000:
              return SELECTION_COLORS.red;
            default:
              return SELECTION_COLORS.default;
          }
        })();
        group.add(newMesh);
      }
    });

    return group;
  }, [cityModel]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(cityGroupRef.current!, true);

      if (intersects.length > 0) {
        const clickedBuilding = intersects[0].object as THREE.Mesh;
        onSelectBuilding(
          clickedBuilding === selectedBuilding ? null : clickedBuilding
        );
        console.log(`Selected Building: `, clickedBuilding);
        // const surfaceArea = calculateSurfaceAreaNonIndexed(clickedBuilding, date, latitude, longitude);
        // const surfaceArea2=calculateSurfaceAreaNonIndexed2(clickedBuilding)
        // console.log("Area " + surfaceArea);
        getPixelData(clickedBuilding);
        calculateShadowArea(clickedBuilding, date, latitude, longitude);
      }
      else {
        onSelectBuilding(null);
      }
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [
    camera,
    onSelectBuilding,
    raycaster,
    pointer,
    selectedBuilding,
    date,
    latitude,
    longitude,
  ]);

  // THIS IS THE 1ST PROTOTYPE OF AREA
  // function calculateSurfaceAreaNonIndexed2(mesh: THREE.Mesh): number {
  //   const geometry = mesh.geometry as THREE.BufferGeometry;
  //   const position = geometry.attributes.position;

  //   if (!position) {
  //     console.error("The geometry lacks position data.");
  //     return 0;
  //   }

  //   const positions = position.array as Float32Array;

  //   let totalArea = 0;

  //   const vectorA = new THREE.Vector3();
  //   const vectorB = new THREE.Vector3();
  //   const vectorC = new THREE.Vector3();

  //   for (let i = 0; i < positions.length; i += 9) {
  //     vectorA.set(positions[i], positions[i + 1], positions[i + 2]);
  //     vectorB.set(positions[i + 3], positions[i + 4], positions[i + 5]);
  //     vectorC.set(positions[i + 6], positions[i + 7], positions[i + 8]);

  //     const AB = vectorB.clone().sub(vectorA);
  //     const AC = vectorC.clone().sub(vectorA);

  //     const crossProduct = AB.cross(AC);
  //     const triangleArea = crossProduct.length() / 2;

  //     totalArea += triangleArea;
  //   }

  //   return totalArea;
  // }





  // THIS FUNCTION IS BEING USED CURRENTLY 
  // AND THIS IS BEING LOGGED TO CONSOLE
  function calculateShadowArea(
    mesh: THREE.Mesh,
    date: Date,
    latitude: number,
    longitude: number
  ) {
    if (!mesh || !mesh.parent) {
      console.log("Invalid mesh for shadow calculation");
      return 0;
    }

    // Create isolated shadow scene
    const shadowScene = new THREE.Scene();
    shadowScene.background = new THREE.Color(0xffffff);

    // Deep clone the mesh and ensure materials and geometries are not shared
    const buildingClone = mesh.clone(true);

    // Clone geometries and materials to prevent sharing with the original mesh
    buildingClone.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        // Clone geometry
        node.geometry = node.geometry.clone();

        // Clone material
        if (Array.isArray(node.material)) {
          node.material = node.material.map((mat) => mat.clone());
        } else if (node.material) {
          node.material = node.material.clone();
        }

        node.castShadow = true;
      }
    });

    shadowScene.add(buildingClone);

    // Calculate bounds
    const boundingBox = new THREE.Box3().setFromObject(buildingClone);
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());

    const planeSize = Math.max(size.x, size.z) * 2;
    const shadowPlane = new THREE.PlaneGeometry(planeSize, planeSize);
    const shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0,
    });

    const shadowMesh = new THREE.Mesh(shadowPlane, shadowMaterial);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = boundingBox.min.y;
    shadowMesh.receiveShadow = true;
    shadowScene.add(shadowMesh);

    // Setup lighting
    const sunPosition = getSunPosition(date, latitude, longitude);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.copy(sunPosition);
    light.target.position.copy(center);
    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000;
    light.shadow.camera.left = -planeSize / 2;
    light.shadow.camera.right = planeSize / 2;
    light.shadow.camera.top = planeSize / 2;
    light.shadow.camera.bottom = -planeSize / 2;

    shadowScene.add(light);
    shadowScene.add(light.target);

    // Render shadow
    const renderTarget = new THREE.WebGLRenderTarget(1024, 1024);
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;

    const shadowCamera = new THREE.OrthographicCamera(
      -planeSize / 2,
      planeSize / 2,
      planeSize / 2,
      -planeSize / 2,
      0.1,
      1000
    );
    shadowCamera.position.set(0, planeSize, 0);
    shadowCamera.lookAt(center);

    gl.setRenderTarget(renderTarget);
    gl.render(shadowScene, shadowCamera);

    // Calculate shadow area
    const pixelData = new Uint8Array(1024 * 1024 * 4);
    gl.readRenderTargetPixels(renderTarget, 0, 0, 1024, 1024, pixelData);

    let shadowPixels = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      if (r < 240 || g < 240 || b < 240) {
        shadowPixels++;
      }
    }

    const totalPixels = 1024 * 1024;
    const shadowAreaRatio = shadowPixels / totalPixels;
    const shadowArea = shadowAreaRatio * (planeSize * planeSize);

    // Log shadow area
    console.log("Shadow Area Calculation:");
    console.log("Total Pixels:", totalPixels);
    console.log("Shadow Pixels:", shadowPixels);
    console.log("Shadow Area Ratio:", shadowAreaRatio);
    console.log("Final Shadow Area:", shadowArea);

    // Cleanup cloned objects
    gl.setRenderTarget(null);
    renderTarget.dispose();

    // Dispose cloned materials and geometries without affecting the original mesh
    buildingClone.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.geometry.dispose();
        if (Array.isArray(node.material)) {
          node.material.forEach((mat) => mat.dispose());
        } else if (node.material) {
          node.material.dispose();
        }
      }
    });

    shadowMesh.geometry.dispose();
    shadowMaterial.dispose();
    light.dispose();

    return shadowArea;
  }

  // Function to get pixel data of the selected building
  const getPixelData = (mesh: THREE.Mesh) => {
    if (!mesh) return;

    // Create a render target to render the building into
    const renderTarget = new THREE.WebGLRenderTarget(512, 512); // Smaller render target size
    const renderer = gl;

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 5); // Camera should be positioned to view the building
    camera.lookAt(mesh.position);

    // Set up the scene and add lighting
    const sceneWithSelectedBuilding = new THREE.Scene();
    sceneWithSelectedBuilding.add(mesh.clone()); // Clone the mesh to avoid modifying the original
    const light = new THREE.AmbientLight(0xffffff, 1); // Add light to the scene
    sceneWithSelectedBuilding.add(light);

    // Render the mesh to the render target
    renderer.setRenderTarget(renderTarget);
    renderer.render(sceneWithSelectedBuilding, camera);

    // Read pixel data from the render target
    const width = renderTarget.width;
    const height = renderTarget.height;
    const pixelData = new Uint8Array(width * height * 4); // RGBA format

    renderer.readRenderTargetPixels(
      renderTarget,
      0,
      0,
      width,
      height,
      pixelData
    );

    // Process the pixel data (e.g., log the pixel at the building's position)
    console.log("Pixel data: ", pixelData);

    // Reset the render target back to the default frame buffer
    renderer.setRenderTarget(null);

    // Log some pixel data for debugging
    for (let i = 0; i < 10 * 4; i += 4) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = pixelData[i + 3];
      console.log(`Pixel ${i / 4}: rgba(${r}, ${g}, ${b}, ${a / 255})`);
    }

    // Clean up
    renderTarget.dispose();
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(cityGroupRef.current!, true);

      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object as THREE.Mesh;
        setHoveredBuilding(hoveredMesh);
      } else {
        setHoveredBuilding(null);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [camera, raycaster, pointer]);

  useEffect(() => {
    const sunPosition = getSunPosition(date, latitude, longitude);

    cityGroupRef.current?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        const originalColor = new THREE.Color(child.userData.originalColor);

        if (child === selectedBuilding) {
          material.color.setHex(child.userData.selectionColor);
          material.emissive.setHex(isDaytime ? 0x330000 : 0x110000);
        } else if (child === hoveredBuilding) {
          material.color.setHex(child.userData.hoverColor);
          material.emissive.setHex(isDaytime ? 0x333300 : 0x111100);
        } else {
          if (isDaytime) {
            const dotProduct = Math.max(
              0,
              child.position.clone().normalize().dot(sunPosition.normalize())
            );
            const solarIntensity = dotProduct * 0.5;
            material.color.setRGB(
              originalColor.r + solarIntensity,
              originalColor.g + solarIntensity,
              originalColor.b + solarIntensity
            );
            material.emissive.setHex(0x000000);
          } else {
            material.color.setRGB(
              originalColor.r * 0.2,
              originalColor.g * 0.2,
              originalColor.b * 0.2
            );
            material.emissive.setHex(0x000000);
          }
        }

        // Update shadow casting based on time of day
        child.castShadow = isDaytime;
        child.receiveShadow = isDaytime;
      }
    });
  }, [selectedBuilding, hoveredBuilding, date, latitude, longitude, isDaytime]);

  useEffect(() => {
    cityGroupRef.current = cityGroup;
  }, [cityGroup]);

  useEffect(() => {
    if (selectedBuilding) {
      calculateShadowArea(selectedBuilding, date, latitude, longitude);
    }
  }, [selectedBuilding, date, latitude, longitude]);

  return <primitive object={cityGroup} ref={cityGroupRef} />;
}
