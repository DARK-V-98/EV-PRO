export interface RoadInfo {
  distanceKm: number;
  durationMin: number;
}

/**
 * Fetches road distances + durations from one origin to many destinations
 * using the free OSRM public API (no key needed).
 * Returns a map of index → RoadInfo (index matches the destinations array order).
 */
export async function getRoadDistances(
  origin: { lat: number; lng: number },
  destinations: Array<{ id: string; lat: number; lng: number }>
): Promise<Map<string, RoadInfo>> {
  const result = new Map<string, RoadInfo>();
  if (destinations.length === 0) return result;

  // OSRM coordinate format: lng,lat (note: lng first)
  const coords = [
    `${origin.lng},${origin.lat}`,
    ...destinations.map((d) => `${d.lng},${d.lat}`),
  ].join(";");

  const url =
    `https://router.project-osrm.org/table/v1/driving/${coords}` +
    `?sources=0&annotations=distance,duration`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return result;
    const data = await res.json();
    if (data.code !== "Ok") return result;

    const distances: number[] = data.distances?.[0] ?? [];
    const durations: number[] = data.durations?.[0] ?? [];

    destinations.forEach((dest, i) => {
      const meters = distances[i + 1];   // +1 because index 0 is origin→origin
      const seconds = durations[i + 1];
      if (meters != null && seconds != null) {
        result.set(dest.id, {
          distanceKm: Math.round((meters / 1000) * 10) / 10,
          durationMin: Math.round(seconds / 60),
        });
      }
    });
  } catch {
    // Network error or timeout — silently fall back to haversine display
  }

  return result;
}
