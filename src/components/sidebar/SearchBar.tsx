"use client";
import { Search, X, LocateFixed, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import type { RadiusKm } from "@/types/station";

interface SearchBarProps {
  value: string; onChange: (value: string) => void;
  resultCount: number; totalCount: number;
  onLocate: () => void; locating: boolean;
  hasLocation: boolean; locationError: string | null; onClearLocation: () => void;
  radiusKm: RadiusKm; onRadiusChange: (r: RadiusKm) => void;
  accuracyMeters?: number;
}

const inputCls = "w-full text-sm border border-slate-200 rounded-xl outline-none transition-all text-slate-800 placeholder-slate-400 focus:border-green-400 focus:ring-2 focus:ring-green-100";

export function SearchBar({ value, onChange, resultCount, totalCount, onLocate, locating, hasLocation, locationError, onClearLocation, radiusKm, onRadiusChange, accuracyMeters }: SearchBarProps) {
  const [input, setInput] = useState(value);
  const debounced = useDebounce(input, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onChange(debounced); }, [debounced]);

  return (
    <div className="p-4 border-b border-slate-100">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search stations, cities, networks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`${inputCls} pl-9 pr-8 py-2.5 bg-slate-50`}
        />
        {input && (
          <button onClick={() => { setInput(""); onChange(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <button
          onClick={hasLocation ? onClearLocation : onLocate}
          disabled={locating}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
            hasLocation
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:text-green-600"
          }`}
        >
          {locating ? <><Loader2 className="w-3 h-3 animate-spin" />Locating...</> : <><LocateFixed className="w-3 h-3" />{hasLocation ? "Near Me ✓" : "Near Me"}</>}
        </button>

        {hasLocation && (
          <select
            value={radiusKm ?? ""}
            onChange={(e) => onRadiusChange(e.target.value ? Number(e.target.value) as RadiusKm : null)}
            className="text-xs px-2.5 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 outline-none focus:border-green-400"
          >
            <option value="">All distances</option>
            {([5, 10, 25, 50] as const).map((r) => <option key={r} value={r}>Within {r} km</option>)}
          </select>
        )}
      </div>

      {locationError && <p className="text-xs mt-1.5 text-red-500">{locationError}</p>}

      {hasLocation && accuracyMeters && (
        <p className="text-xs mt-1.5 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
          <span className="text-slate-400">
            GPS accuracy: <span className={accuracyMeters < 50 ? "text-green-600 font-medium" : accuracyMeters < 200 ? "text-amber-500 font-medium" : "text-red-500 font-medium"}>
              ±{accuracyMeters < 1000 ? `${accuracyMeters}m` : `${(accuracyMeters/1000).toFixed(1)}km`}
            </span>
          </span>
        </p>
      )}

      <p className="text-xs mt-2 text-slate-400">
        <span className="font-semibold text-green-600">{resultCount}</span> of {totalCount} stations
        {hasLocation && <span className="text-sky-500"> · sorted by distance</span>}
      </p>
    </div>
  );
}
