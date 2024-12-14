import * as THREE from "three";

export function getSunPosition(
  date: Date,
  latitude: number,
  longitude: number
): THREE.Vector3 {
  const julianDate = getJulianDate(date);
  const solarDeclination = getSolarDeclination(julianDate);
  const solarTime = getSolarTime(date, longitude);
  const hourAngle = getHourAngle(solarTime);

  // Flip the azimuth direction by negating the hour angle
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(-hourAngle); // Invert direction

  const cosSolarAltitude =
    Math.sin((latitude * Math.PI) / 180) * Math.sin(solarDeclination) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos(solarDeclination) *
      Math.cos((hourAngle * Math.PI) / 180);

  const solarAltitude = Math.asin(cosSolarAltitude);

  const sunPosition = new THREE.Vector3();
  sunPosition.setFromSphericalCoords(1000, phi, theta);
  return sunPosition;
}

function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function getSolarDeclination(julianDate: number): number {
  const n = julianDate - 2451545.0;
  return (
    0.39778 *
    Math.sin(
      ((2 * Math.PI) / 365.24) * (n + 10) +
        ((2 * Math.PI) / 360) *
          0.0167 *
          Math.sin(((2 * Math.PI) / 365.24) * (n - 2))
    )
  );
}

function getSolarTime(date: Date, longitude: number): number {
  const eqTime = getEquationOfTime(getJulianDate(date));
  const solarTime =
    date.getUTCHours() * 60 + date.getUTCMinutes() + eqTime + 4 * longitude;
  return solarTime / 60;
}

function getEquationOfTime(julianDate: number): number {
  const n = julianDate - 2451545.0;
  const g = 357.528 + 0.9856003 * n;
  const c =
    1.9148 * Math.sin((g * Math.PI) / 180) +
    0.02 * Math.sin((2 * g * Math.PI) / 180) +
    0.0003 * Math.sin((3 * g * Math.PI) / 180);
  const lambda = 280.47 + 0.9856003 * n + c;
  const e = -(1789 + 237 * Math.sin(((2 * Math.PI) / 365.24) * (n + 10))) / 60;
  return e;
}

function getHourAngle(solarTime: number): number {
  return (solarTime - 12) * 15;
}

export function isDaytime(
  date: Date,
  latitude: number,
  longitude: number
): boolean {
  const sunPosition = getSunPosition(date, latitude, longitude);
  return sunPosition.y > 0;
}
