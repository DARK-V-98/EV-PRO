"use client";
import { useState, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, LocateFixed, Plus, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ChargingStation, Filters, RadiusKm } from "@/types/station";
import type { RoadInfo } from "@/lib/routing";
import { StationCard } from "@/components/sidebar/StationCard";
import { FilterPanel } from "@/components/sidebar/FilterPanel";
import { SearchBar } from "@/components/sidebar/SearchBar";

type SheetState = "peek" | "half" | "full";

interface MobileSheetProps {
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
  onStationSelect: (s: ChargingStation) => void;
  onLocate: () => void;
  locating: boolean;
  hasLocation: boolean;
  locationError: string | null;
  onClearLocation: () => void;
  accuracyMeters?: number;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  favoritesCount: number;
  loading: boolean;
}

const SHEET_HEIGHTS: Record<SheetState, string> = {
  peek: "72px",
  half: "50vh",
  full: "92vh",
};

export function MobileSheet(props: MobileSheetProps) {
  const [sheet, setSheet] = useState<SheetState>("peek");
  const [activeTab, setActiveTab] = useState<"list" | "search" | "filter">("list");
  const startY = useRef(0);
  const startSheet = useRef<SheetState>("peek");

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startSheet.current = sheet;
  }, [sheet]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dy = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 20) return;
    if (dy > 0) {
      // swipe up → expand
      setSheet(s => s === "peek" ? "half" : "full");
    } else {
      // swipe down → collapse
      setSheet(s => s === "full" ? "half" : "peek");
    }
  }, []);

  const { stations, allStations, filters, cities, selectedStation, distanceMap, roadMap,
    onFilterChange, toggleAmenity, onClearFilters, onStationSelect,
    onLocate, locating, hasLocation, locationError, onClearLocation, accuracyMeters,
    isFavorite, onToggleFavorite, loading } = props;

  return (
    <>
      {/* Floating Action Buttons — always visible on map */}
      <div className="fixed bottom-24 right-4 z-[900] flex flex-col gap-2">
        <Link href="/submit"
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white border border-slate-200 text-green-600"
          style={{ boxShadow: "0 4px 16px rgba(15,23,42,0.15)" }}
        >
          <Plus className="w-5 h-5" />
        </Link>
        <button
          onClick={hasLocation ? onClearLocation : onLocate}
          disabled={locating}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
            hasLocation ? "bg-green-500 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
          style={{ boxShadow: "0 4px 16px rgba(15,23,42,0.15)" }}
        >
          {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
        </button>
      </div>

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[950] flex flex-col bg-white rounded-t-2xl transition-all duration-300"
        style={{
          height: SHEET_HEIGHTS[sheet],
          boxShadow: "0 -4px 32px rgba(15,23,42,0.12)",
          overflow: "hidden",
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Handle + header */}
        <div
          className="shrink-0 px-4 pt-3 pb-2 cursor-pointer select-none"
          onClick={() => setSheet(s => s === "peek" ? "half" : s === "half" ? "full" : "peek")}
        >
          {/* Drag handle */}
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/ev.png" alt="EV PRO" width={28} height={28} className="rounded-lg shrink-0" />
              <div>
                <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>
                  EV <span className="text-green-600">PRO</span>
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {loading ? "Loading..." : `${stations.length} stations`}
                  {hasLocation && <span className="text-sky-500"> · near you</span>}
                </span>
              </div>
            </div>
            <ChevronDown
              className="w-4 h-4 text-slate-400 transition-transform"
              style={{ transform: sheet === "full" ? "rotate(0deg)" : "rotate(180deg)" }}
            />
          </div>
        </div>

        {/* Tab bar */}
        {sheet !== "peek" && (
          <div className="shrink-0 flex gap-1 px-4 pb-2 border-b border-slate-100">
            {(["list", "search", "filter"] as const).map((tab) => {
              const icons = { list: null, search: <Search className="w-3.5 h-3.5" />, filter: <SlidersHorizontal className="w-3.5 h-3.5" /> };
              const labels = { list: `Stations`, search: "Search", filter: "Filter" };
              const active = activeTab === tab;
              const hasFilter = tab === "filter" && (filters.city || filters.province || filters.chargerType ||
                filters.connector || filters.speedTier || filters.isFree || filters.is24Hours ||
                filters.verifiedOnly || filters.amenities.length > 0);
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active ? "bg-green-50 text-green-700 border border-green-200" : "text-slate-500 hover:text-slate-700"
                  }`}>
                  {icons[tab]}
                  {labels[tab]}
                  {hasFilter && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {sheet !== "peek" && (
          <div className="flex-1 overflow-y-auto">
            {activeTab === "list" && (
              <>
                {stations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center px-6">
                    <p className="text-sm text-slate-400">No stations found</p>
                    <button onClick={onClearFilters} className="mt-2 text-xs text-green-600 underline">Clear filters</button>
                  </div>
                ) : (
                  stations.map((s) => (
                    <StationCard key={s.id} station={s}
                      onClick={() => { onStationSelect(s); setSheet("peek"); }}
                      isSelected={selectedStation?.id === s.id}
                      haversineKm={distanceMap.get(s.id)}
                      roadInfo={roadMap.get(s.id)}
                      isFavorite={isFavorite(s.id)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === "search" && (
              <SearchBar
                value={filters.searchQuery}
                onChange={(v) => onFilterChange("searchQuery", v)}
                resultCount={stations.length}
                totalCount={allStations.length}
                onLocate={onLocate} locating={locating}
                hasLocation={hasLocation} locationError={locationError}
                onClearLocation={onClearLocation}
                radiusKm={filters.radiusKm}
                onRadiusChange={(r) => onFilterChange("radiusKm", r as RadiusKm)}
                accuracyMeters={accuracyMeters}
              />
            )}

            {activeTab === "filter" && (
              <FilterPanel
                filters={filters} cities={cities}
                onFilterChange={onFilterChange}
                toggleAmenity={toggleAmenity}
                onClear={onClearFilters}
              />
            )}
          </div>
        )}

        {/* Safe area spacer for iOS */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </>
  );
}
