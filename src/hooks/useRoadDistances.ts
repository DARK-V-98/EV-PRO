"use client";
import { useState, useEffect, useRef } from "react";
import { getRoadDistances, type RoadInfo } from "@/lib/routing";
import type { ChargingStation } from "@/types/station";
import type { UserLocation } from "./useGeolocation";

const MAX_STATIONS = 50; // OSRM handles up to 100 waypoints; 50 is safe and fast

export function useRoadDistances(
  userLocation: UserLocation | null,
  stations: ChargingStation[],
  haversineMap: Map<string, number>
) {
  const [roadMap, setRoadMap] = useState<Map<string, RoadInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!userLocation || stations.length === 0) {
      setRoadMap(new Map());
      return;
    }

    // Take the MAX_STATIONS closest by straight-line distance
    const nearby = [...stations]
      .sort((a, b) => (haversineMap.get(a.id) ?? Infinity) - (haversineMap.get(b.id) ?? Infinity))
      .slice(0, MAX_STATIONS)
      .map((s) => ({ id: s.id, lat: s.coordinates.lat, lng: s.coordinates.lng }));

    setLoading(true);

    getRoadDistances(userLocation, nearby).then((result) => {
      setRoadMap(result);
      setLoading(false);
    });

    return () => { abortRef.current?.abort(); };
  }, [userLocation, stations, haversineMap]);

  return { roadMap, roadLoading: loading };
}
