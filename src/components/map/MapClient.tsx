"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Circle, Polyline, ZoomControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import L from "leaflet";
import type { ChargingStation, ChargerType } from "@/types/station";
import type { UserLocation } from "@/hooks/useGeolocation";
import { StationMarker } from "./StationMarker";
import { MapStyleSwitcher, TILE_STYLES, type MapStyle } from "./MapStyleSwitcher";

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const SRI_LANKA_BOUNDS: [[number, number], [number, number]] = [[5.7, 79.5], [10.0, 82.0]];

function FlyToStation({ station }: { station: ChargingStation | null }) {
  const map = useMap();
  useEffect(() => {
    if (station) map.flyTo([station.coordinates.lat, station.coordinates.lng], 14, { duration: 1 });
  }, [station, map]);
  return null;
}

function FlyToUser({ location }: { location: UserLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lng], 12, { duration: 1.2 });
  }, [location, map]);
  return null;
}

function UserLocationMarker({ location }: { location: UserLocation }) {
  const icon = L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:20px;height:20px">
        <div style="position:absolute;inset:0;border-radius:50%;background:#0ea5e9;opacity:0.2;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#0ea5e9;border:2.5px solid white;box-shadow:0 2px 8px rgba(14,165,233,0.5)"></div>
      </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <>
      <Marker position={[location.lat, location.lng]} icon={icon} />
      {/* Accuracy radius circle */}
      {location.accuracy && location.accuracy < 5000 && (
        <Circle
          center={[location.lat, location.lng]}
          radius={location.accuracy}
          pathOptions={{ color: "#0ea5e9", fillColor: "#0ea5e9", fillOpacity: 0.06, weight: 1, dashArray: "4 4" }}
        />
      )}
    </>
  );
}

interface MapClientProps {
  stations: ChargingStation[];
  onStationSelect: (station: ChargingStation) => void;
  selectedStation: ChargingStation | null;
  userLocation: UserLocation | null;
  routeLine?: [number, number][] | null;
}

export default function MapClient({ stations, onStationSelect, selectedStation, userLocation, routeLine }: MapClientProps) {
  const [style, setStyle] = useState<MapStyle>("map");
  const tile = TILE_STYLES[style];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={SRI_LANKA_CENTER}
        zoom={8}
        minZoom={7}
        maxZoom={18}
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        className="h-full w-full"
      >
        <ZoomControl position="topright" />

        <TileLayer
          key={style}
          attribution={tile.attribution}
          url={tile.url}
          subdomains={tile.subdomains ?? "abc"}
          maxZoom={tile.maxZoom}
          className={tile.className}
        />

        <MarkerClusterGroup chunkedLoading>
          {stations.map((station) => (
            <StationMarker
              key={station.id}
              station={station}
              onSelect={onStationSelect}
              isSelected={selectedStation?.id === station.id}
            />
          ))}
        </MarkerClusterGroup>

        {routeLine && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: "#0ea5e9", weight: 4, opacity: 0.7, dashArray: "8 8" }}
          />
        )}

        {userLocation && <UserLocationMarker location={userLocation} />}
        <FlyToStation station={selectedStation} />
        <FlyToUser location={userLocation} />
      </MapContainer>

      <MapStyleSwitcher style={style} onChange={setStyle} />
    </div>
  );
}
