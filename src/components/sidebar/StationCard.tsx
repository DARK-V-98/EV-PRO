"use client";
import { Clock, MapPin, Zap, ChevronRight, Car } from "lucide-react";
import type { ChargingStation } from "@/types/station";
import { ChargerBadge, SpeedBadge } from "@/components/ui/Badge";
import { formatDistance } from "@/lib/utils";
import type { RoadInfo } from "@/lib/routing";

interface StationCardProps {
  station: ChargingStation;
  onClick: () => void;
  isSelected: boolean;
  haversineKm?: number;
  roadInfo?: RoadInfo;
}

export function StationCard({ station, onClick, isSelected, haversineKm, roadInfo }: StationCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 transition-all group border-b border-slate-100 ${
        isSelected ? "bg-green-50 border-l-4 border-l-green-500" : "bg-white hover:bg-slate-50 border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-slate-800 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
          {station.name}
        </p>
        <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${isSelected ? "text-green-500" : "text-slate-300"}`} />
      </div>

      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-xs text-slate-500">{station.city}</span>
        {station.network && <span className="text-xs text-slate-400">· {station.network}</span>}
      </div>

      {/* Road distance row */}
      {haversineKm !== undefined && (
        <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-100">
          <Car className="w-3 h-3 text-sky-500 shrink-0" />
          {roadInfo ? (
            <>
              <span className="text-xs font-semibold text-sky-700">{roadInfo.distanceKm} km</span>
              <span className="text-xs text-slate-400">·</span>
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-600">~{roadInfo.durationMin} min drive</span>
            </>
          ) : (
            <>
              <span className="text-xs text-sky-600">{formatDistance(haversineKm)} away</span>
              <span className="text-xs text-slate-400 ml-auto animate-pulse">calculating...</span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <ChargerBadge type={station.chargerType} />
        <SpeedBadge kw={station.speedKw} />
        <div className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3 text-slate-400" />
          {station.hours.is24Hours
            ? <span className="text-xs font-semibold text-green-600">24h</span>
            : <span className="text-xs text-slate-400">{station.hours.open}–{station.hours.close}</span>
          }
        </div>
      </div>

      {station.cost.flat === 0
        ? <p className="text-xs mt-1.5 font-semibold text-green-600">⚡ Free charging</p>
        : station.cost.perKwh
          ? <p className="text-xs mt-1.5 text-slate-400"><Zap className="w-3 h-3 inline mr-1" />LKR {station.cost.perKwh}/kWh</p>
          : null
      }

      {!station.verified && (
        <span className="absolute top-3.5 right-8 text-xs text-amber-500">Unverified</span>
      )}
    </button>
  );
}
