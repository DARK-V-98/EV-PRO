"use client";
import { useState, useRef, useCallback } from "react";
import { useStations } from "@/hooks/useStations";
import { useFilters } from "@/hooks/useFilters";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRoadDistances } from "@/hooks/useRoadDistances";
import { useDailySync } from "@/hooks/useDailySync";
import { useFavorites } from "@/hooks/useFavorites";
import { getUniqueCities } from "@/lib/stations";
import MapContainer from "@/components/map/MapContainer";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { StationDetailModal } from "@/components/modals/StationDetailModal";
import { MobileSheet } from "@/components/mobile/MobileSheet";
import { RoutePlanner, type RouteSelection } from "@/components/route/RoutePlanner";
import { LegendToggle } from "@/components/map/LegendToggle";
import { ChargingTimerBar } from "@/components/charging/ChargingTimerBar";
import { useChargingTimer } from "@/hooks/useChargingTimer";
import { stationsAlongRoute } from "@/lib/route";
import { useMemo, useEffect } from "react";
import type { ChargingStation } from "@/types/station";

export default function Home() {
  useDailySync();

  const { filters, setFilter, toggleAmenity, clearFilters } = useFilters();
  const { userLocation, locating, locationError, tracking, locate, startTracking, stopTracking, clearLocation } = useGeolocation();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const chargeTimer = useChargingTimer();
  const { stations, filteredStations, distanceMap, loading, isOffline, refetch } = useStations(filters, userLocation, favorites);
  const { roadMap } = useRoadDistances(userLocation, stations, distanceMap);

  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [route, setRoute] = useState<RouteSelection | null>(null);
  const cities = getUniqueCities(stations);

  // When a route is active, show only chargers along the corridor
  const displayStations = useMemo(() => {
    if (!route) return filteredStations;
    return stationsAlongRoute(filteredStations, route.origin, route.dest, route.corridorKm);
  }, [route, filteredStations]);

  const routeLine: [number, number][] | null = route
    ? [[route.origin.lat, route.origin.lng], [route.dest.lat, route.dest.lng]]
    : null;

  function handleStationSelect(station: ChargingStation) {
    setSelectedStation(station);
  }

  function handleLocate() {
    locate();
    setFilter("radiusKm", 25);
  }

  // Handle PWA shortcut deep links (?action=nearby / favorites)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "nearby") {
      locate();
      setFilter("radiusKm", 25);
    } else if (action === "favorites") {
      setFilter("favoritesOnly", true);
    }
    if (action) {
      window.history.replaceState({}, "", "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClearLocation() {
    clearLocation();
    setFilter("radiusKm", null);
  }

  const sidebarProps = {
    stations: displayStations, allStations: stations, filters, cities,
    selectedStation, distanceMap, roadMap,
    onFilterChange: setFilter, toggleAmenity, onClearFilters: clearFilters,
    onStationSelect: handleStationSelect,
    onLocate: handleLocate, locating, hasLocation: !!userLocation,
    locationError, onClearLocation: handleClearLocation,
    accuracyMeters: userLocation?.accuracy,
    isFavorite, onToggleFavorite: toggleFavorite,
    favoritesCount: favorites.size,
    onRefresh: refetch,
    isOffline,
    tracking, onStartTracking: startTracking, onStopTracking: stopTracking,
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">
      {/* SEO content — visually hidden but indexed by Google */}
      <h1 className="sr-only">EV PRO — EV Charging Places in Sri Lanka | Find EV Charging Points Near You</h1>
      <p className="sr-only">
        Find EV charging places, EV charging points and electric vehicle charging stations across Sri Lanka.
        300+ charging stations in Colombo, Kandy, Galle, Negombo, Matara, Jaffna, Anuradhapura, Trincomalee,
        Kurunegala, Batticaloa, Hambantota, Nuwara Eliya, Dambulla, Ratnapura and Badulla.
        Filter by AC charger, DC fast charger, Type 2, CCS2, CHAdeMO connector. Find free EV charging and 24-hour stations.
        Get road directions and drive time to any EV charging station in Sri Lanka.
        Daily updated data from Google Places. Built by eSystemLK — esystemlk.com.
      </p>

      {/* ── Desktop sidebar (md+) ─────────────────────── */}
      <div className="hidden md:flex">
        <Sidebar {...sidebarProps} />
      </div>

      {/* ── Map (always full area) ────────────────────── */}
      <main className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-slate-50">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-green-100" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500"
                  style={{ animation: "spin 0.9s linear infinite" }} />
                <div className="absolute inset-0 flex items-center justify-center text-xl">⚡</div>
              </div>
              <p className="text-sm font-semibold text-slate-600">Loading stations...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            stations={displayStations}
            onStationSelect={handleStationSelect}
            selectedStation={selectedStation}
            userLocation={userLocation}
            routeLine={routeLine}
          />
        )}

        {/* Route planner — top-left on desktop, above FABs on mobile */}
        {!loading && (
          <div className="absolute top-4 left-4 z-[999] hidden md:block">
            <RoutePlanner active={route} resultCount={displayStations.length} onApply={setRoute} />
          </div>
        )}

        {/* Charger legend toggle */}
        {!loading && <LegendToggle />}

        {/* Station detail — desktop right panel / mobile full sheet */}
        {selectedStation && (
          <StationDetailModal
            station={selectedStation}
            onClose={() => setSelectedStation(null)}
            roadInfo={roadMap.get(selectedStation.id)}
            haversineKm={distanceMap.get(selectedStation.id)}
            isFavorite={isFavorite(selectedStation.id)}
            onToggleFavorite={toggleFavorite}
            onStartTimer={chargeTimer.start}
          />
        )}

        {/* Active charging timer bar */}
        {chargeTimer.timer && (
          <ChargingTimerBar
            timer={chargeTimer.timer}
            remainingMs={chargeTimer.remainingMs}
            progress={chargeTimer.progress}
            done={chargeTimer.done}
            onStop={chargeTimer.stop}
          />
        )}

        {/* Desktop floating stats bar */}
        {!loading && (
          <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-[999] items-center gap-3 px-4 py-2 rounded-2xl text-xs bg-white border border-slate-200"
            style={{ boxShadow: "0 2px 16px rgba(15,23,42,0.1)" }}>
            <span className="text-slate-600"><strong className="text-green-600">{displayStations.length}</strong> stations on map</span>
            <span className="text-slate-200">|</span>
            {isOffline
              ? <span className="text-amber-600">⚠ Offline — showing saved data</span>
              : <span className="text-slate-400">Syncs daily 12:01 AM</span>}
          </div>
        )}
      </main>

      {/* ── Mobile route planner button ──────────────── */}
      <div className="md:hidden fixed top-4 left-4 z-[960]">
        <RoutePlanner active={route} resultCount={displayStations.length} onApply={setRoute} />
      </div>

      {/* ── Mobile bottom sheet (sm only) ────────────── */}
      <div className="md:hidden">
        <MobileSheet {...sidebarProps} loading={loading} />
      </div>
    </div>
  );
}
