"use client";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { ChargingStation, ChargerType } from "@/types/station";

function getMarkerIcon(type: ChargerType, isSelected: boolean) {
  const colors: Record<ChargerType, { fill: string; glow: string }> = {
    AC:     { fill: "#16a34a", glow: "rgba(22,163,74,0.35)" },
    DC:     { fill: "#0ea5e9", glow: "rgba(14,165,233,0.35)" },
    "AC+DC":{ fill: "#7c3aed", glow: "rgba(124,58,237,0.35)" },
  };
  const { fill, glow } = colors[type];
  const size = isSelected ? 38 : 30;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${fill};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2.5px solid rgba(255,255,255,0.9);
        box-shadow:0 3px 12px ${glow},0 0 0 ${isSelected ? "4px" : "0px"} ${glow};
        transition:all 0.2s;
      ">
        <span style="
          display:block;transform:rotate(45deg);
          text-align:center;line-height:${size - 5}px;
          font-size:${isSelected ? 15 : 12}px;
        ">⚡</span>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 4],
  });
}

interface StationMarkerProps {
  station: ChargingStation;
  onSelect: (station: ChargingStation) => void;
  isSelected: boolean;
}

export function StationMarker({ station, onSelect, isSelected }: StationMarkerProps) {
  return (
    <Marker
      position={[station.coordinates.lat, station.coordinates.lng]}
      icon={getMarkerIcon(station.chargerType, isSelected)}
      eventHandlers={{ click: () => onSelect(station) }}
    >
      <Popup>
        <div style={{ minWidth: "200px", fontFamily: "var(--font-body)" }}>
          <p style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", marginBottom: "4px", fontFamily: "var(--font-heading)" }}>
            {station.name}
          </p>
          <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>{station.address}</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "6px",
              background: station.chargerType === "AC" ? "#dcfce7" : station.chargerType === "DC" ? "#e0f2fe" : "#ede9fe",
              color: station.chargerType === "AC" ? "#15803d" : station.chargerType === "DC" ? "#0369a1" : "#6d28d9",
              border: `1px solid ${station.chargerType === "AC" ? "#bbf7d0" : station.chargerType === "DC" ? "#bae6fd" : "#ddd6fe"}`,
            }}>{station.chargerType}</span>
            <span style={{
              fontSize: "11px", padding: "2px 8px", borderRadius: "6px",
              background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0",
            }}>{station.speedKw} kW</span>
          </div>
          <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
            {station.hours.is24Hours
              ? <span style={{ color: "#16a34a", fontWeight: 600 }}>● Open 24 hours</span>
              : `${station.hours.open} – ${station.hours.close}`}
          </p>
          <button
            onClick={() => onSelect(station)}
            style={{
              width: "100%", padding: "7px", borderRadius: "8px",
              background: "#16a34a", color: "#fff", fontSize: "11px",
              fontWeight: 700, border: "none", cursor: "pointer",
              fontFamily: "var(--font-heading)",
            }}
          >View Details →</button>
        </div>
      </Popup>
    </Marker>
  );
}
