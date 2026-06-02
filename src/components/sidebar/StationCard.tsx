"use client";
import { Clock, MapPin, Zap, Car, Star } from "lucide-react";
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
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function StationCard({ station, onClick, isSelected, haversineKm, roadInfo, isFavorite, onToggleFavorite }: StationCardProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`w-full text-left px-4 py-3.5 transition-all group border-b border-slate-100 cursor-pointer ${
        isSelected ? "bg-green-50 border-l-4 border-l-green-500" : "bg-white hover:bg-slate-50 border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-semibold text-slate-800 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
          {station.name}
        </p>
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(station.id); }}
            className="shrink-0 -mt-0.5 -mr-1 p-1 rounded-full hover:bg-amber-50 transition-colors"
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
          >
            <Star className={`w-4 h-4 transition-all ${isFavorite ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
          </button>
        )}
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
        <span className="text-xs text-amber-500">Unverified</span>
      )}
    </div>
  );
}
