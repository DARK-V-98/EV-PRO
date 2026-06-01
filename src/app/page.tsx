"use client";
import { useState, useRef, useCallback } from "react";
import { useStations } from "@/hooks/useStations";
import { useFilters } from "@/hooks/useFilters";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRoadDistances } from "@/hooks/useRoadDistances";
import { useDailySync } from "@/hooks/useDailySync";
import { getUniqueCities } from "@/lib/stations";
import MapContainer from "@/components/map/MapContainer";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { StationDetailModal } from "@/components/modals/StationDetailModal";
import { MobileSheet } from "@/components/mobile/MobileSheet";
import type { ChargingStation } from "@/types/station";

export default function Home() {
  useDailySync();

  const { filters, setFilter, toggleAmenity, clearFilters } = useFilters();
  const { userLocation, locating, locationError, locate, clearLocation } = useGeolocation();
  const { stations, filteredStations, distanceMap, loading } = useStations(filters, userLocation);
  const { roadMap } = useRoadDistances(userLocation, stations, distanceMap);

  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const cities = getUniqueCities(stations);

  function handleStationSelect(station: ChargingStation) {
    setSelectedStation(station);
  }

  function handleLocate() {
    locate();
    setFilter("radiusKm", 25);
  }

  function handleClearLocation() {
    clearLocation();
    setFilter("radiusKm", null);
  }

  const sidebarProps = {
    stations: filteredStations, allStations: stations, filters, cities,
    selectedStation, distanceMap, roadMap,
    onFilterChange: setFilter, toggleAmenity, onClearFilters: clearFilters,
    onStationSelect: handleStationSelect,
    onLocate: handleLocate, locating, hasLocation: !!userLocation,
    locationError, onClearLocation: handleClearLocation,
    accuracyMeters: userLocation?.accuracy,
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50">

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
            stations={filteredStations}
            onStationSelect={handleStationSelect}
            selectedStation={selectedStation}
            userLocation={userLocation}
          />
        )}

        {/* Station detail — desktop right panel / mobile full sheet */}
        {selectedStation && (
          <StationDetailModal
            station={selectedStation}
            onClose={() => setSelectedStation(null)}
            roadInfo={roadMap.get(selectedStation.id)}
            haversineKm={distanceMap.get(selectedStation.id)}
          />
        )}

        {/* Desktop floating stats bar */}
        {!loading && (
          <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-[999] items-center gap-3 px-4 py-2 rounded-2xl text-xs bg-white border border-slate-200"
            style={{ boxShadow: "0 2px 16px rgba(15,23,42,0.1)" }}>
            <span className="text-slate-600"><strong className="text-green-600">{filteredStations.length}</strong> stations on map</span>
            <span className="text-slate-200">|</span>
            <span className="text-slate-400">Syncs daily 12:01 AM</span>
          </div>
        )}
      </main>

      {/* ── Mobile bottom sheet (sm only) ────────────── */}
      <div className="md:hidden">
        <MobileSheet {...sidebarProps} loading={loading} />
      </div>
    </div>
  );
}
