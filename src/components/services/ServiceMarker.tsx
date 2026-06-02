"use client";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { ServicePlace } from "@/types/service";
import { SERVICE_CATEGORIES } from "@/types/service";

function iconFor(place: ServicePlace, selected: boolean) {
  const cat = SERVICE_CATEGORIES.find((c) => c.value === place.category)!;
  const size = selected ? 38 : 30;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;height:${size}px;background:${cat.color};
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        border:2.5px solid rgba(255,255,255,0.95);
        box-shadow:0 3px 10px rgba(0,0,0,0.25);
      ">
        <span style="display:block;transform:rotate(45deg);text-align:center;line-height:${size - 6}px;font-size:${size === 38 ? 15 : 12}px;">${cat.emoji}</span>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 4],
  });
}

export function ServiceMarker({ place, onSelect, isSelected }: {
  place: ServicePlace; onSelect: (p: ServicePlace) => void; isSelected: boolean;
}) {
  const cat = SERVICE_CATEGORIES.find((c) => c.value === place.category)!;
  return (
    <Marker position={[place.coordinates.lat, place.coordinates.lng]} icon={iconFor(place, isSelected)}
      eventHandlers={{ click: () => onSelect(place) }}>
      <Popup>
        <div style={{ minWidth: "190px", fontFamily: "var(--font-body)" }}>
          <p style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a", marginBottom: "2px", fontFamily: "var(--font-heading)" }}>{place.name}</p>
          <p style={{ fontSize: "11px", color: cat.color, fontWeight: 600, marginBottom: "4px" }}>{cat.emoji} {cat.label.slice(0, -1)}</p>
          <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>{place.address}</p>
          <button onClick={() => onSelect(place)}
            style={{ width: "100%", padding: "7px", borderRadius: "8px", background: cat.color, color: "#fff", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "var(--font-heading)" }}>
            View Details →
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
