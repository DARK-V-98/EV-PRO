"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl, LayersControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import type { ServicePlace } from "@/types/service";
import { ServiceMarker } from "./ServiceMarker";

const CENTER: [number, number] = [7.8731, 80.7718];
const BOUNDS: [[number, number], [number, number]] = [[5.7, 79.5], [10.0, 82.0]];

function FlyTo({ place }: { place: ServicePlace | null }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.coordinates.lat, place.coordinates.lng], 14, { duration: 1 });
  }, [place, map]);
  return null;
}

interface Props {
  places: ServicePlace[];
  onSelect: (p: ServicePlace) => void;
  selected: ServicePlace | null;
}

export default function ServicesMapClient({ places, onSelect, selected }: Props) {
  return (
    <MapContainer center={CENTER} zoom={8} minZoom={7} maxZoom={18}
      maxBounds={BOUNDS} maxBoundsViscosity={1.0} zoomControl={false} className="h-full w-full">
      <ZoomControl position="topright" />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="🗺️ Map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd" maxZoom={20} className="map-vivid" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="🛰️ Satellite">
          <TileLayer
            attribution='Tiles &copy; Esri'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19} />
        </LayersControl.BaseLayer>
      </LayersControl>
      <MarkerClusterGroup chunkedLoading>
        {places.map((p) => (
          <ServiceMarker key={p.id} place={p} onSelect={onSelect} isSelected={selected?.id === p.id} />
        ))}
      </MarkerClusterGroup>
      <FlyTo place={selected} />
    </MapContainer>
  );
}
