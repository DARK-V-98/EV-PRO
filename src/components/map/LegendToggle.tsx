"use client";
import { useState } from "react";
import { X } from "lucide-react";

const ITEMS = [
  { color: "#16a34a", label: "AC charger" },
  { color: "#0ea5e9", label: "DC fast charger" },
  { color: "#7c3aed", label: "AC + DC" },
];

export function LegendToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute left-3 bottom-24 md:bottom-3 z-[800]">
      {open ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-3 pr-4 shadow-lg fade-in">
          <div className="flex items-center justify-between mb-2 gap-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ fontFamily: "var(--font-heading)" }}>
              Charger types
            </span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {ITEMS.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-lg"
          aria-label="Show charger legend"
        >
          {/* three coloured dots icon */}
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#16a34a" }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0ea5e9" }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#7c3aed" }} />
          </span>
        </button>
      )}
    </div>
  );
}
