import type { ChargingStation } from "@/types/station";

export interface LkCity { name: string; lat: number; lng: number }

export const LK_CITIES: LkCity[] = [
  { name: "Colombo",       lat: 6.9271, lng: 79.8612 },
  { name: "Kandy",         lat: 7.2906, lng: 80.6337 },
  { name: "Galle",         lat: 6.0535, lng: 80.2210 },
  { name: "Negombo",       lat: 7.2096, lng: 79.8378 },
  { name: "Matara",        lat: 5.9485, lng: 80.5353 },
  { name: "Kurunegala",    lat: 7.4818, lng: 80.3609 },
  { name: "Jaffna",        lat: 9.6615, lng: 80.0255 },
  { name: "Anuradhapura",  lat: 8.3114, lng: 80.4037 },
  { name: "Trincomalee",   lat: 8.5874, lng: 81.2152 },
  { name: "Batticaloa",    lat: 7.7170, lng: 81.6924 },
  { name: "Ratnapura",     lat: 6.6828, lng: 80.3992 },
  { name: "Badulla",       lat: 6.9934, lng: 81.0550 },
  { name: "Nuwara Eliya",  lat: 6.9497, lng: 80.7891 },
  { name: "Hambantota",    lat: 6.1241, lng: 81.1185 },
  { name: "Dambulla",      lat: 7.8742, lng: 80.6511 },
  { name: "Ella",          lat: 6.8667, lng: 81.0466 },
  { name: "Sigiriya",      lat: 7.9570, lng: 80.7603 },
  { name: "Arugam Bay",    lat: 6.8404, lng: 81.8344 },
];

const KM_PER_DEG = 111; // approx

/** Perpendicular distance (km) from point P to segment A→B using equirectangular projection. */
export function distanceToSegmentKm(
  p: { lat: number; lng: number },
  a: LkCity,
  b: LkCity
): number {
  const latRef = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const toXY = (pt: { lat: number; lng: number }) => ({
    x: pt.lng * Math.cos(latRef) * KM_PER_DEG,
    y: pt.lat * KM_PER_DEG,
  });
  const P = toXY(p), A = toXY(a), B = toXY(b);
  const dx = B.x - A.x, dy = B.y - A.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(P.x - A.x, P.y - A.y);
  let t = ((P.x - A.x) * dx + (P.y - A.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const projX = A.x + t * dx, projY = A.y + t * dy;
  return Math.hypot(P.x - projX, P.y - projY);
}

/** Returns stations within `corridorKm` of the line between two cities, sorted along the route. */
export function stationsAlongRoute(
  stations: ChargingStation[],
  origin: LkCity,
  dest: LkCity,
  corridorKm = 10
): ChargingStation[] {
  const latRef = ((origin.lat + dest.lat) / 2) * (Math.PI / 180);
  const projT = (s: ChargingStation) => {
    const ax = origin.lng * Math.cos(latRef), ay = origin.lat;
    const bx = dest.lng * Math.cos(latRef), by = dest.lat;
    const px = s.coordinates.lng * Math.cos(latRef), py = s.coordinates.lat;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    return ((px - ax) * dx + (py - ay) * dy) / len2;
  };

  return stations
    .filter((s) => distanceToSegmentKm(s.coordinates, origin, dest) <= corridorKm)
    .sort((a, b) => projT(a) - projT(b));
}
