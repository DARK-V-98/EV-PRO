"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllStations } from "@/lib/stations";
import { getStationsFromFirestore } from "@/lib/firestoreStations";
import { haversineKm, isOpenNow } from "@/lib/utils";
import { getCarById } from "@/lib/cars";
import { cacheStations, getCachedStations } from "@/lib/stationCache";
import type { ChargingStation, Filters } from "@/types/station";
import type { UserLocation } from "@/hooks/useGeolocation";

export function useStations(
  filters: Filters,
  userLocation: UserLocation | null = null,
  favorites: Set<string> = new Set()
) {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const load = useCallback(async () => {
    const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    try {
      const data = firebaseConfigured
        ? await getStationsFromFirestore().catch(() => getAllStations())
        : await getAllStations();
      setStations(data);
      cacheStations(data);          // save for offline use
      setIsOffline(false);
      setError(null);
    } catch {
      // Network failed — fall back to cache
      const cached = getCachedStations();
      if (cached && cached.length) {
        setStations(cached);
        setIsOffline(true);
      } else {
        setError("Failed to load stations");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Show cached data instantly while fresh data loads
    const cached = getCachedStations();
    if (cached && cached.length) {
      setStations(cached);
      setLoading(false);
    }
    load();
  }, [load]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  const distanceMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!userLocation) return map;
    stations.forEach((s) => {
      map.set(s.id, haversineKm(userLocation.lat, userLocation.lng, s.coordinates.lat, s.coordinates.lng));
    });
    return map;
  }, [stations, userLocation]);

  const filteredStations = useMemo(() => {
    let result = stations.filter((s) => {
      const matchesCity = !filters.city || s.city === filters.city;
      const matchesProvince = !filters.province || s.province === filters.province;
      const matchesType = !filters.chargerType || s.chargerType === filters.chargerType;
      const matchesConnector = !filters.connector || s.connectors.includes(filters.connector);
      const matchesSearch =
        !filters.searchQuery ||
        [s.name, s.address, s.city, s.province, s.network ?? ""]
          .join(" ").toLowerCase()
          .includes(filters.searchQuery.toLowerCase());

      const matchesSpeed = (() => {
        if (!filters.speedTier) return true;
        const kw = s.speedKw;
        if (filters.speedTier === "slow")     return kw <= 7;
        if (filters.speedTier === "standard") return kw > 7  && kw <= 22;
        if (filters.speedTier === "fast")     return kw > 22 && kw <= 50;
        if (filters.speedTier === "rapid")    return kw > 50;
        return true;
      })();

      const matchesCost = !filters.isFree || s.cost.flat === 0;
      const matchesHours = !filters.is24Hours || s.hours.is24Hours;
      const matchesVerified = !filters.verifiedOnly || s.verified;
      const matchesAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((a) => s.amenities?.includes(a));

      const dist = distanceMap.get(s.id);
      const matchesRadius = !filters.radiusKm || dist === undefined || dist <= filters.radiusKm;

      const matchesAvailable = !filters.availableNow || isOpenNow(s.hours);
      const matchesFavorites = !filters.favoritesOnly || favorites.has(s.id);

      const matchesCar = (() => {
        if (!filters.myCarId) return true;
        const car = getCarById(filters.myCarId);
        if (!car) return true;
        return car.connectors.some((c) => s.connectors.includes(c));
      })();

      return (
        matchesCity && matchesProvince && matchesType && matchesConnector &&
        matchesSearch && matchesSpeed && matchesCost && matchesHours &&
        matchesVerified && matchesAmenities && matchesRadius &&
        matchesAvailable && matchesFavorites && matchesCar
      );
    });

    if (userLocation) {
      result = [...result].sort((a, b) => {
        const da = distanceMap.get(a.id) ?? Infinity;
        const db2 = distanceMap.get(b.id) ?? Infinity;
        return da - db2;
      });
    }

    return result;
  }, [stations, filters, distanceMap, userLocation, favorites]);

  return { stations, filteredStations, distanceMap, loading, error, isOffline, refetch };
}
