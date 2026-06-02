"use client";
import { useState } from "react";
import { Route, X, ArrowRight } from "lucide-react";
import { LK_CITIES, type LkCity } from "@/lib/route";
import { haptic } from "@/lib/haptics";

export interface RouteSelection { origin: LkCity; dest: LkCity; corridorKm: number }

interface RoutePlannerProps {
  active: RouteSelection | null;
  resultCount: number;
  onApply: (sel: RouteSelection | null) => void;
}

export function RoutePlanner({ active, resultCount, onApply }: RoutePlannerProps) {
  const [open, setOpen] = useState(false);
  const [originName, setOriginName] = useState(active?.origin.name ?? "Colombo");
  const [destName, setDestName] = useState(active?.dest.name ?? "Kandy");
  const [corridorKm, setCorridorKm] = useState(active?.corridorKm ?? 10);

  function apply() {
    const origin = LK_CITIES.find((c) => c.name === originName)!;
    const dest = LK_CITIES.find((c) => c.name === destName)!;
    if (origin.name === dest.name) return;
    haptic("success");
    onApply({ origin, dest, corridorKm });
    setOpen(false);
  }

  function clear() {
    haptic("light");
    onApply(null);
    setOpen(false);
  }

  const selectCls = "flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 outline-none focus:border-green-400";

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { haptic("light"); setOpen(true); }}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
          active ? "bg-sky-500 text-white" : "bg-white text-slate-700 border border-slate-200"
        }`}
        style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.1)" }}
      >
        <Route className="w-4 h-4" />
        {active ? `${active.origin.name} → ${active.dest.name} (${resultCount})` : "Plan a route"}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[1500] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} style={{ animation: "fadeIn 0.2s ease" }} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)", paddingBottom: "calc(20px + env(safe-area-inset-bottom,0px))" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <Route className="w-5 h-5 text-sky-500" /> Plan your trip
              </h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">Find charging stations along your route</p>

            <div className="flex items-center gap-2 mb-3">
              <select value={originName} onChange={(e) => setOriginName(e.target.value)} className={selectCls}>
                {LK_CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <select value={destName} onChange={(e) => setDestName(e.target.value)} className={selectCls}>
                {LK_CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <label className="block text-xs text-slate-400 mb-1">
              Corridor width: <span className="text-slate-700 font-medium">{corridorKm} km each side</span>
            </label>
            <input type="range" min={2} max={30} step={1} value={corridorKm}
              onChange={(e) => setCorridorKm(Number(e.target.value))}
              className="w-full accent-sky-500 mb-4" />

            <div className="flex gap-2">
              {active && (
                <button onClick={clear} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Clear
                </button>
              )}
              <button onClick={apply}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}>
                Show chargers on route
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
