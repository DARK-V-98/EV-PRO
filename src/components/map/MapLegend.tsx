"use client";

export function MapLegend() {
  return (
    <div className="leaflet-bottom leaflet-left" style={{ zIndex: 1000 }}>
      <div className="leaflet-control m-3 p-3 rounded-xl text-xs bg-white border border-slate-200"
        style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.1)", fontFamily: "var(--font-body)" }}>
        <p className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-2"
          style={{ fontFamily: "var(--font-heading)" }}>Charger</p>
        {[
          { color: "#16a34a", label: "AC" },
          { color: "#0ea5e9", label: "DC" },
          { color: "#7c3aed", label: "AC+DC" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
