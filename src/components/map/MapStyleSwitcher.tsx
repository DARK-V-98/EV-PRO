"use client";
import { Map as MapIcon, Satellite, Mountain } from "lucide-react";

export type MapStyle = "map" | "satellite" | "terrain";

const OPTIONS: { value: MapStyle; label: string; Icon: typeof MapIcon }[] = [
  { value: "map",       label: "Map",       Icon: MapIcon },
  { value: "satellite", label: "Satellite", Icon: Satellite },
  { value: "terrain",   label: "Terrain",   Icon: Mountain },
];

interface Props {
  style: MapStyle;
  onChange: (s: MapStyle) => void;
  showTerrain?: boolean;
}

export function MapStyleSwitcher({ style, onChange, showTerrain = true }: Props) {
  const opts = showTerrain ? OPTIONS : OPTIONS.filter((o) => o.value !== "terrain");
  return (
    <div
      className="absolute right-3 top-1/2 -translate-y-1/2 z-[800] flex flex-col gap-1 p-1 rounded-2xl bg-white border border-slate-200"
      style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.12)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {opts.map(({ value, label, Icon }) => {
        const active = style === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            title={label}
            aria-label={label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              active ? "bg-green-500 text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Icon className="w-[18px] h-[18px]" />
          </button>
        );
      })}
    </div>
  );
}

export const TILE_STYLES: Record<MapStyle, { url: string; attribution: string; subdomains?: string; maxZoom: number; className?: string }> = {
  map: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
    className: "map-vivid",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (OSM)',
    subdomains: "abc",
    maxZoom: 17,
  },
};
