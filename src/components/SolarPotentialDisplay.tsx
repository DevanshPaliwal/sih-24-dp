interface SolarPotentialDisplayProps {
  potential: number | null;
}

export default function SolarPotentialDisplay({
  potential,
}: SolarPotentialDisplayProps) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold">Solar Potential</h2>
      {potential !== null ? (
        <p>{`Estimated solar potential: ${potential.toFixed(2)} kWh/day`}</p>
      ) : (
        <p>Calculate solar potential to see results</p>
      )}
    </div>
  );
}
