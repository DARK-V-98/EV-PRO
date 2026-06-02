"use client";
import { useState } from "react";
import { Timer, Zap } from "lucide-react";
import type { ChargingStation } from "@/types/station";
import { getCarById, loadMyCar, estimateChargeMinutes } from "@/lib/cars";

interface TimerStarterProps {
  station: ChargingStation;
  onStart: (stationId: string, stationName: string, minutes: number) => void;
}

export function TimerStarter({ station, onStart }: TimerStarterProps) {
  const [open, setOpen] = useState(false);
  const car = getCarById(loadMyCar() ?? "");
  const [fromPct, setFromPct] = useState(20);
  const [toPct, setToPct] = useState(80);
  const [manualMin, setManualMin] = useState(45);

  const isDc = station.chargerType !== "AC";
  const estimate = car ? estimateChargeMinutes(car, station.speedKw, isDc, fromPct, toPct) : null;
  const minutes = estimate ?? manualMin;

  return (
    <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-200">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="w-4 h-4 text-indigo-500" />
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400" style={{ fontFamily: "var(--font-heading)" }}>
          Charging Timer
        </p>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-100 transition-colors"
        >
          ⏱️ Start a charging timer
        </button>
      ) : (
        <div className="space-y-3">
          {car ? (
            <>
              <p className="text-xs text-slate-500">
                Estimating for your <span className="font-semibold">{car.name}</span> at {station.speedKw}kW {isDc ? "DC" : "AC"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Current charge: {fromPct}%</label>
                  <input type="range" min={0} max={95} value={fromPct}
                    onChange={(e) => setFromPct(Math.min(Number(e.target.value), toPct - 5))}
                    className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Target: {toPct}%</label>
                  <input type="range" min={fromPct + 5} max={100} value={toPct}
                    onChange={(e) => setToPct(Number(e.target.value))}
                    className="w-full accent-indigo-500" />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Duration: {manualMin} min</label>
              <input type="range" min={5} max={180} step={5} value={manualMin}
                onChange={(e) => setManualMin(Number(e.target.value))}
                className="w-full accent-indigo-500" />
              <p className="text-xs text-slate-400 mt-1">💡 Set your car in Filters → My Car for smart estimates</p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-indigo-100">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-indigo-500" /> Estimated time</span>
            <span className="text-sm font-bold text-indigo-700" style={{ fontFamily: "var(--font-heading)" }}>
              ~{minutes} min
            </span>
          </div>

          <button
            onClick={() => { onStart(station.id, station.name, minutes); setOpen(false); }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Start timer ({minutes} min)
          </button>
        </div>
      )}
    </div>
  );
}
