import type { ChargingStation } from "@/types/station";

const KEY = "evpro-stations-cache";
const TS_KEY = "evpro-stations-cache-ts";

/** Save stations to localStorage so the app works offline. */
export function cacheStations(stations: ChargingStation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stations));
    localStorage.setItem(TS_KEY, Date.now().toString());
  } catch {
    /* quota exceeded — ignore */
  }
}

export function getCachedStations(): ChargingStation[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ChargingStation[]) : null;
  } catch {
    return null;
  }
}

export function getCacheAge(): number | null {
  try {
    const ts = localStorage.getItem(TS_KEY);
    return ts ? Date.now() - Number(ts) : null;
  } catch {
    return null;
  }
}
