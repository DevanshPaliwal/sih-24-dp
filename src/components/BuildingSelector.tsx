import { useEffect, useState } from "react";
import * as THREE from "three";

interface BuildingSelectorProps {
  selectedBuilding: THREE.Mesh | null;
}

export default function BuildingSelector({
  selectedBuilding,
}: BuildingSelectorProps) {
  const [buildingInfo, setBuildingInfo] = useState<string>("");

  useEffect(() => {
    if (selectedBuilding) {
      setBuildingInfo(
        `Selected Building: ${selectedBuilding.name || "Unnamed"}`
      );
    } else {
      setBuildingInfo("No building selected");
    }
  }, [selectedBuilding]);

  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold">Building Selection</h2>
      <p>{buildingInfo}</p>
    </div>
  );
}
