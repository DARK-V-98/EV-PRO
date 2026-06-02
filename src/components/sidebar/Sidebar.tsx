"use client";
import Link from "next/link";
import Image from "next/image";
import { Plus, Zap } from "lucide-react";
import type { ChargingStation, Filters, RadiusKm } from "@/types/station";
import type { RoadInfo } from "@/lib/routing";
import { SearchBar } from "./SearchBar";
import { FilterPanel } from "./FilterPanel";
import { StationCard } from "./StationCard";

interface SidebarProps {
  stations: ChargingStation[];
  allStations: ChargingStation[];
  filters: Filters;
  cities: string[];
  selectedStation: ChargingStation | null;
  distanceMap: Map<string, number>;
  roadMap: Map<string, RoadInfo>;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  toggleAmenity: (a: string) => void;
  onClearFilters: () => void;
  onStationSelect: (station: ChargingStation) => void;
  onLocate: () => void;
  locating: boolean;
  hasLocation: boolean;
  locationError: string | null;
  onClearLocation: () => void;
  accuracyMeters?: number;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  favoritesCount: number;
}

export function Sidebar({
  stations, allStations, filters, cities, selectedStation, distanceMap, roadMap,
  onFilterChange, toggleAmenity, onClearFilters, onStationSelect,
  onLocate, locating, hasLocation, locationError, onClearLocation, accuracyMeters,
  isFavorite, onToggleFavorite,
}: SidebarProps) {
  return (
    <aside className="flex flex-col h-full w-96 shrink-0 bg-white" style={{ borderRight: "1px solid var(--border)" }}>

      {/* Header */}
      <div className="px-5 py-4 shrink-0 bg-white" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/ev.png" alt="EV PRO" width={36} height={36} className="rounded-xl shrink-0" />
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
                EV <span className="text-green-600">PRO</span>
              </h1>
              <p className="text-xs text-slate-400">Sri Lanka · {allStations.length} stations</p>
            </div>
          </div>
          <Link href="/submit"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="shrink-0 overflow-y-auto bg-white" style={{ maxHeight: "55vh" }}>
        <SearchBar
          value={filters.searchQuery}
          onChange={(v) => onFilterChange("searchQuery", v)}
          resultCount={stations.length}
          totalCount={allStations.length}
          onLocate={onLocate}
          locating={locating}
          hasLocation={hasLocation}
          locationError={locationError}
          onClearLocation={onClearLocation}
          radiusKm={filters.radiusKm}
          onRadiusChange={(r) => onFilterChange("radiusKm", r as RadiusKm)}
          accuracyMeters={accuracyMeters}
        />
        <FilterPanel
          filters={filters}
          cities={cities}
          onFilterChange={onFilterChange}
          toggleAmenity={toggleAmenity}
          onClear={onClearFilters}
        />
      </div>

      {/* Station list */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {stations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-6">
            <Zap className="w-8 h-8 mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">No stations found</p>
            <button onClick={onClearFilters} className="mt-2 text-xs text-green-600 hover:text-green-700 underline transition-colors">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="fade-in">
            {stations.map((s) => (
              <StationCard
                key={s.id}
                station={s}
                onClick={() => onStationSelect(s)}
                isSelected={selectedStation?.id === s.id}
                haversineKm={distanceMap.get(s.id)}
                roadInfo={roadMap.get(s.id)}
                isFavorite={isFavorite(s.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Developer credit */}
      <div className="shrink-0 px-4 py-2.5 flex items-center justify-center gap-1.5 bg-white" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="text-xs text-slate-400">Built by</span>
        <a href="https://www.esystemlk.com" target="_blank" rel="noopener noreferrer"
          className="text-xs font-semibold text-slate-600 hover:text-green-600 transition-colors"
          style={{ fontFamily: "var(--font-heading)" }}
        >eSystemLK</a>
        <span className="text-xs text-slate-300">·</span>
        <a href="https://www.esystemlk.com" target="_blank" rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-green-600 transition-colors"
        >esystemlk.com</a>
      </div>
    </aside>
  );
}
