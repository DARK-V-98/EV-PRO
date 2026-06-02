"use client";
import { Timer, X, CheckCircle2 } from "lucide-react";
import type { ChargingTimer } from "@/hooks/useChargingTimer";
import { formatRemaining } from "@/hooks/useChargingTimer";

interface Props {
  timer: ChargingTimer;
  remainingMs: number;
  progress: number;
  done: boolean;
  onStop: () => void;
}

export function ChargingTimerBar({ timer, remainingMs, progress, done, onStop }: Props) {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[1400] w-[calc(100%-1.5rem)] max-w-sm">
      <div className={`rounded-2xl shadow-lg border overflow-hidden ${done ? "bg-green-500 border-green-500" : "bg-white border-slate-200"}`}
        style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.18)" }}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          {done ? (
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          ) : (
            <Timer className="w-5 h-5 text-indigo-500 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate ${done ? "text-white" : "text-slate-700"}`} style={{ fontFamily: "var(--font-heading)" }}>
              {done ? "Charging complete!" : "Charging in progress"}
            </p>
            <p className={`text-xs truncate ${done ? "text-green-50" : "text-slate-400"}`}>{timer.stationName}</p>
          </div>
          <span className={`text-base font-bold tabular-nums shrink-0 ${done ? "text-white" : "text-indigo-600"}`}
            style={{ fontFamily: "var(--font-heading)" }}>
            {done ? "Done" : formatRemaining(remainingMs)}
          </span>
          <button onClick={onStop} className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${done ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {!done && (
          <div className="h-1 bg-slate-100">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
