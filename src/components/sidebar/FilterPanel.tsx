"use client";
import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { Filters, ChargerType, ConnectorType, SpeedTier } from "@/types/station";
import { SL_PROVINCES, AMENITY_OPTIONS } from "@/types/station";

const CHARGER_TYPES: ChargerType[] = ["AC", "DC", "AC+DC"];
const CONNECTOR_TYPES: ConnectorType[] = ["Type 1", "Type 2", "CCS1", "CCS2", "CHAdeMO", "GB/T", "Tesla"];
const SPEED_TIERS: { value: SpeedTier; label: string }[] = [
  { value: "slow",     label: "≤7 kW" },
  { value: "standard", label: "7–22 kW" },
  { value: "fast",     label: "22–50 kW" },
  { value: "rapid",    label: "50 kW+" },
];

const selectCls = "w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all";

interface FilterPanelProps {
  filters: Filters; cities: string[];
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  toggleAmenity: (a: string) => void; onClear: () => void;
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
        style={{ color: open ? "#0f172a" : "#94a3b8", fontFamily: "var(--font-heading)" }}>
        {title}
        <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "#94a3b8" }} />
      </button>
      {open && <div className="pb-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function Pill({ active, onClick, children, color = "green" }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  const activeStyles: Record<string, string> = {
    green:  "bg-green-50  border-green-300  text-green-700",
    sky:    "bg-sky-50    border-sky-300    text-sky-700",
    violet: "bg-violet-50 border-violet-300 text-violet-700",
    orange: "bg-orange-50 border-orange-300 text-orange-700",
    teal:   "bg-teal-50   border-teal-300   text-teal-700",
  };
  return (
    <button onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
        active ? activeStyles[color] : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
      }`}
    >{children}</button>
  );
}

export function FilterPanel({ filters, cities, onFilterChange, toggleAmenity, onClear }: FilterPanelProps) {
  const [open, setOpen] = useState({ location: true, charger: true, speed: false, options: false, amenities: false });
  const toggle = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const chargerColors: Record<ChargerType, string> = { AC: "green", DC: "sky", "AC+DC": "violet" };
  const hasActive = filters.city || filters.province || filters.chargerType || filters.connector ||
    filters.speedTier || filters.isFree || filters.is24Hours || filters.verifiedOnly || filters.amenities.length > 0;

  return (
    <div className="px-4 py-2 border-b border-slate-100 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>
          <SlidersHorizontal className="w-4 h-4 text-green-600" /> Filters
        </div>
        {hasActive && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <Section title="Location" open={open.location} onToggle={() => toggle("location")}>
        <select value={filters.city} onChange={(e) => onFilterChange("city", e.target.value)} className={selectCls}>
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.province} onChange={(e) => onFilterChange("province", e.target.value)} className={selectCls}>
          <option value="">All Provinces</option>
          {SL_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Section>

      <Section title="Charger" open={open.charger} onToggle={() => toggle("charger")}>
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Type</p>
          <div className="flex gap-1.5 flex-wrap">
            {CHARGER_TYPES.map((t) => (
              <Pill key={t} active={filters.chargerType === t} color={chargerColors[t]}
                onClick={() => onFilterChange("chargerType", filters.chargerType === t ? "" : t)}
              >{t}</Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Connector</p>
          <select value={filters.connector} onChange={(e) => onFilterChange("connector", e.target.value as ConnectorType | "")} className={selectCls}>
            <option value="">All Connectors</option>
            {CONNECTOR_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </Section>

      <Section title="Speed" open={open.speed} onToggle={() => toggle("speed")}>
        <div className="flex gap-1.5 flex-wrap">
          {SPEED_TIERS.map(({ value, label }) => (
            <Pill key={value} active={filters.speedTier === value} color="orange"
              onClick={() => onFilterChange("speedTier", filters.speedTier === value ? "" : value)}
            >{label}</Pill>
          ))}
        </div>
      </Section>

      <Section title="Options" open={open.options} onToggle={() => toggle("options")}>
        {([
          { key: "isFree" as const, label: "Free charging only" },
          { key: "is24Hours" as const, label: "Open 24 hours" },
          { key: "verifiedOnly" as const, label: "Verified only" },
        ] as const).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2.5 cursor-pointer">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              filters[key] ? "bg-green-500 border-green-500" : "bg-white border-slate-300"
            }`} onClick={() => onFilterChange(key, !filters[key])}>
              {filters[key] && <span className="text-white text-xs font-bold leading-none">✓</span>}
            </div>
            <span className={`text-sm transition-colors ${filters[key] ? "text-slate-800 font-medium" : "text-slate-500"}`}>{label}</span>
          </label>
        ))}
      </Section>

      <Section title="Amenities" open={open.amenities} onToggle={() => toggle("amenities")}>
        <div className="flex flex-wrap gap-1.5">
          {AMENITY_OPTIONS.map((a) => (
            <Pill key={a} active={filters.amenities.includes(a)} color="teal" onClick={() => toggleAmenity(a)}>{a}</Pill>
          ))}
        </div>
      </Section>
    </div>
  );
}
