"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BuildingSelector from "./BuildingSelector";
import TimeSelector from "./TimeSelector";
import SolarPotentialDisplay from "./SolarPotentialDisplay";
import * as THREE from "three";

const ThreeJSComponents = dynamic(() => import("./ThreeJSComponents"), {
  ssr: false,
  loading: () => <div>Loading 3D components...</div>,
});

export default function BIPVCalculator() {
  const [selectedBuilding, setSelectedBuilding] = useState<THREE.Mesh | null>(
    null
  );
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [solarPotential, setSolarPotential] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleBuildingSelect = (building: THREE.Mesh) => {
    setSelectedBuilding(building);
  };

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time);
  };

  const calculateSolarPotential = () => {
    if (selectedBuilding && selectedTime) {
      // Get the building's bounding box to estimate area
      const geometry = selectedBuilding.geometry;
      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      if (boundingBox) {
        // Calculate roof-top area
        const width = boundingBox.max.x - boundingBox.min.x;
        const depth = boundingBox.max.z - boundingBox.min.z;
        const roofArea = width * depth;

        // Calculate wall areas
        const height = boundingBox.max.y - boundingBox.min.y;
        const wallArea = 2 * (width * height + depth * height);

        // Total available area (roof + walls)
        const area = roofArea + wallArea;

        // Average solar irradiance in Ahmedabad (kWh/m²/day)
        const averageIrradiance = 5.5;

        // Solar panel efficiency
        const panelEfficiency = 0.15;

        // Calculate potential solar energy generation (kWh/day)
        const potential = area * averageIrradiance * panelEfficiency;

        setSolarPotential(potential);
      }
    }
  };

  return (
    <div className="w-full h-screen flex">
      <div className="flex-grow relative">
        {isClient && (
          <ThreeJSComponents
            onSelectBuilding={handleBuildingSelect}
            selectedTime={selectedTime}
          />
        )}
      </div>
      <div className="">
        <div className="w-64 bg-gray-100 p-4 flex flex-col justify-between">
          <div>
            <BuildingSelector selectedBuilding={selectedBuilding} />
            <TimeSelector onTimeChange={handleTimeChange} />
          </div>
          <div>
            <button
              onClick={calculateSolarPotential}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded w-full"
            >
              Calculate Solar Potential
            </button>
            <SolarPotentialDisplay potential={solarPotential} />
          </div>
        </div>
      </div>
    </div>
  );
}






// let it stay here for a while

// function calculateShadowArea(mesh: THREE.Mesh, date: Date, latitude: number, longitude: number) {
//   const shadowScene = new THREE.Scene();
//   const buildingClone = mesh.clone(true);

//   // Clone the geometry and material, and set castShadow to true for each mesh in the building
//   buildingClone.traverse((node) => {
//     if (node instanceof THREE.Mesh) {
//       node.geometry = node.geometry.clone();
//       node.material = node.material.clone();
//       node.castShadow = true;
//       node.receiveShadow = false; // Make sure building surfaces don't receive shadow during the calculation
//     }
//   });

//   shadowScene.add(buildingClone);

//   // Get bounding box of the building for calculating maximum shadow size
//   const boundingBox = new THREE.Box3().setFromObject(buildingClone);
//   const size = boundingBox.getSize(new THREE.Vector3());
//   const planeSize = Math.max(size.x, size.z) * 2;

//   // Create a shadow mesh for the ground (optional but could be useful for reference)
//   const shadowMesh = new THREE.Mesh(
//     new THREE.PlaneGeometry(planeSize, planeSize),
//     new THREE.MeshStandardMaterial({ opacity: 0, transparent: true })
//   );
//   shadowMesh.rotation.x = -Math.PI / 2;
//   shadowMesh.position.y = boundingBox.min.y;
//   shadowScene.add(shadowMesh);

//   // Get the sun's position
//   const sunPosition = getSunPosition(date, latitude, longitude);

//   // Create a directional light (sunlight)
//   const light = new THREE.DirectionalLight(0xffffff, 1);
//   light.position.copy(sunPosition);
//   light.target.position.copy(boundingBox.getCenter(new THREE.Vector3()));
//   shadowScene.add(light);

//   // Create an orthographic camera for shadow rendering
//   const camera = new THREE.OrthographicCamera(
//     -planeSize / 2, planeSize / 2,
//     planeSize / 2, -planeSize / 2,
//     0.1, 1000
//   );
//   camera.position.copy(sunPosition);
//   camera.lookAt(boundingBox.getCenter(new THREE.Vector3()));

//   // Create a WebGL render target to render shadows
//   const renderTarget = new THREE.WebGLRenderTarget(1024, 1024);
//   gl.setRenderTarget(renderTarget);
//   gl.render(shadowScene, camera);

//   // Read pixel data from the render target
//   const pixelData = new Uint8Array(1024 * 1024 * 4);
//   gl.readRenderTargetPixels(renderTarget, 0, 0, 1024, 1024, pixelData);

//   // Raycasting to calculate the intersection area of the shadow on the building
//   const raycaster = new THREE.Raycaster();
//   const shadowArea = calculateIntersectionShadowArea(buildingClone, sunPosition, raycaster);

//   return shadowArea;
// }

// function calculateIntersectionShadowArea(building: THREE.Mesh, sunPosition: THREE.Vector3, raycaster: THREE.Raycaster) {
//   let totalShadowArea = 0;

//   // Traverse the building mesh and calculate shadow intersection with each face
//   building.traverse((node) => {
//     if (node instanceof THREE.Mesh) {
//       const geometry = node.geometry;
//       const material = node.material;

//       if (geometry instanceof THREE.BufferGeometry) {
//         const positionAttribute = geometry.getAttribute('position');
//         const normalAttribute = geometry.getAttribute('normal');
//         const vertices = [];
        
//         // Store the vertices of the geometry
//         for (let i = 0; i < positionAttribute.count; i++) {
//           vertices.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i));
//         }

//         // Iterate over each face and calculate the shadow projection
//         for (let i = 0; i < vertices.length; i += 3) {
//           const v0 = vertices[i];
//           const v1 = vertices[i + 1];
//           const v2 = vertices[i + 2];

//           // Create a plane for the face (using vertices v0, v1, v2)
//           const plane = new THREE.Plane().setFromCoplanarPoints(v0, v1, v2);

//           // Cast a ray from the sun's position towards the face of the building
//           raycaster.ray.origin.copy(sunPosition);
//           raycaster.ray.direction.copy(plane.normal).negate(); // Direction is opposite to the normal

//           // Check if the ray intersects the face (building's surface)
//           const intersection = raycaster.intersectObject(node);
//           if (intersection.length > 0) {
//             const intersect = intersection[0];
            
//             // Calculate the area of the shadow on this face (simple projection)
//             const area = calculateProjectedShadowArea(v0, v1, v2, intersect.point);
//             totalShadowArea += area;
//           }
//         }
//       }
//     }
//   });

//   return totalShadowArea;
// }

// function calculateProjectedShadowArea(v0: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3, intersectPoint: THREE.Vector3) {
//   // Calculate the projected area (for simplicity, assume triangle area)
//   const edge1 = new THREE.Vector3().subVectors(v1, v0);
//   const edge2 = new THREE.Vector3().subVectors(v2, v0);
//   const crossProduct = new THREE.Vector3().crossVectors(edge1, edge2);
//   return crossProduct.length() / 2; // Area of the triangle
// }
