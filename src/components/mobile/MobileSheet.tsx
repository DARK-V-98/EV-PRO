"use client";
import { useState, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, LocateFixed, Plus, ChevronDown, Loader2, Navigation, WifiOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ChargingStation, Filters, RadiusKm } from "@/types/station";
import type { RoadInfo } from "@/lib/routing";
import { StationCard } from "@/components/sidebar/StationCard";
import { FilterPanel } from "@/components/sidebar/FilterPanel";
import { SearchBar } from "@/components/sidebar/SearchBar";
import { haptic } from "@/lib/haptics";

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
  onRefresh: () => Promise<void>;
  isOffline: boolean;
  tracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  loading: boolean;
}

const HEIGHTS: Record<SheetState, number> = { peek: 72, half: 0.5, full: 0.92 };

function pxFor(state: SheetState): number {
  if (typeof window === "undefined") return 72;
  const h = HEIGHTS[state];
  return h < 1 && h !== 72 ? Math.round(window.innerHeight * h) : (h === 72 ? 72 : Math.round(window.innerHeight * h));
}

export function MobileSheet(props: MobileSheetProps) {
  const [sheet, setSheet] = useState<SheetState>("peek");
  const [activeTab, setActiveTab] = useState<"list" | "search" | "filter">("list");
  const [dragH, setDragH] = useState<number | null>(null);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const dragging = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const pullStart = useRef<number | null>(null);

  // ── Sheet drag (snap physics) ──────────────────────────
  const onHandleStart = (e: React.TouchEvent) => {
    dragging.current = true;
    startY.current = e.touches[0].clientY;
    startH.current = dragH ?? pxFor(sheet);
  };
  const onHandleMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dy = startY.current - e.touches[0].clientY;
    const next = Math.max(72, Math.min(window.innerHeight * 0.92, startH.current + dy));
    setDragH(next);
  };
  const onHandleEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const h = dragH ?? pxFor(sheet);
    const vh = window.innerHeight;
    // snap to nearest of peek / half / full
    const targets: [SheetState, number][] = [["peek", 72], ["half", vh * 0.5], ["full", vh * 0.92]];
    let best: SheetState = "peek", bestD = Infinity;
    for (const [st, px] of targets) {
      const d = Math.abs(px - h);
      if (d < bestD) { bestD = d; best = st; }
    }
    haptic("light");
    setSheet(best);
    setDragH(null);
  };

  // ── Pull-to-refresh ────────────────────────────────────
  const onListTouchStart = (e: React.TouchEvent) => {
    if (listRef.current && listRef.current.scrollTop <= 0) {
      pullStart.current = e.touches[0].clientY;
    }
  };
  const onListTouchMove = (e: React.TouchEvent) => {
    if (pullStart.current === null) return;
    const dy = e.touches[0].clientY - pullStart.current;
    if (dy > 0) setPullY(Math.min(dy * 0.5, 80));
  };
  const onListTouchEnd = async () => {
    if (pullY > 60 && !refreshing) {
      setRefreshing(true);
      haptic("success");
      await props.onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    pullStart.current = null;
  };

  const cycle = useCallback(() => {
    haptic("light");
    setSheet((s) => (s === "peek" ? "half" : s === "half" ? "full" : "peek"));
  }, []);

  const {
    stations, allStations, filters, cities, selectedStation, distanceMap, roadMap,
    onFilterChange, toggleAmenity, onClearFilters, onStationSelect,
    onLocate, locating, hasLocation, locationError, onClearLocation, accuracyMeters,
    isFavorite, onToggleFavorite, loading, isOffline,
    tracking, onStartTracking, onStopTracking,
  } = props;

  const height = dragH !== null ? `${dragH}px` : (sheet === "peek" ? "72px" : sheet === "half" ? "50vh" : "92vh");

  return (
    <>
      {/* Offline banner */}
      {isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[960] flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-medium shadow-lg">
          <WifiOff className="w-3.5 h-3.5" /> Offline — saved data
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 z-[900] flex flex-col gap-2">
        <Link href="/submit"
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-green-600"
          style={{ boxShadow: "0 4px 16px rgba(15,23,42,0.15)" }}>
          <Plus className="w-5 h-5" />
        </Link>

        {/* Live tracking toggle — only once located */}
        {hasLocation && (
          <button
            onClick={() => { haptic("medium"); tracking ? onStopTracking() : onStartTracking(); }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              tracking ? "bg-sky-500 text-white animate-pulse" : "bg-white text-slate-600 border border-slate-200"
            }`}
            style={{ boxShadow: "0 4px 16px rgba(15,23,42,0.15)" }}
            aria-label="Live tracking">
            <Navigation className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => { haptic("medium"); hasLocation ? onClearLocation() : onLocate(); }}
          disabled={locating}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            hasLocation ? "bg-green-500 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
          style={{ boxShadow: "0 4px 16px rgba(15,23,42,0.15)" }}
          aria-label="Near me">
          {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
        </button>
      </div>

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[950] flex flex-col bg-white rounded-t-2xl"
        style={{
          height,
          boxShadow: "0 -4px 32px rgba(15,23,42,0.12)",
          overflow: "hidden",
          transition: dragging.current ? "none" : "height 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Handle + header (drag zone) */}
        <div
          className="shrink-0 px-4 pt-3 pb-2 select-none"
          onTouchStart={onHandleStart}
          onTouchMove={onHandleMove}
          onTouchEnd={onHandleEnd}
          onClick={cycle}
        >
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
                  {tracking && <span className="text-sky-500"> · live</span>}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform"
              style={{ transform: sheet === "full" ? "rotate(0deg)" : "rotate(180deg)" }} />
          </div>
        </div>

        {/* Tabs */}
        {sheet !== "peek" && (
          <div className="shrink-0 flex gap-1 px-4 pb-2 border-b border-slate-100">
            {(["list", "search", "filter"] as const).map((tab) => {
              const icons = { list: null, search: <Search className="w-3.5 h-3.5" />, filter: <SlidersHorizontal className="w-3.5 h-3.5" /> };
              const labels = { list: "Stations", search: "Search", filter: "Filter" };
              const active = activeTab === tab;
              const hasFilter = tab === "filter" && (filters.city || filters.province || filters.chargerType ||
                filters.connector || filters.speedTier || filters.isFree || filters.is24Hours ||
                filters.verifiedOnly || filters.amenities.length > 0 || filters.availableNow || filters.myCarId || filters.favoritesOnly);
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active ? "bg-green-50 text-green-700 border border-green-200" : "text-slate-500"
                  }`}>
                  {icons[tab]}{labels[tab]}
                  {hasFilter && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {sheet !== "peek" && (
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto"
            onTouchStart={activeTab === "list" ? onListTouchStart : undefined}
            onTouchMove={activeTab === "list" ? onListTouchMove : undefined}
            onTouchEnd={activeTab === "list" ? onListTouchEnd : undefined}
          >
            {activeTab === "list" && (
              <>
                {/* Pull-to-refresh indicator */}
                {(pullY > 0 || refreshing) && (
                  <div className="flex items-center justify-center text-slate-400" style={{ height: refreshing ? 44 : pullY }}>
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullY * 3}deg)` }} />
                    <span className="text-xs ml-2">{refreshing ? "Refreshing..." : pullY > 60 ? "Release to refresh" : "Pull to refresh"}</span>
                  </div>
                )}
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

        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </>
  );
}
