import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { ChargingStation } from "@/types/station";
import type { UserLocation } from "@/hooks/useGeolocation";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

interface MapContainerProps {
  stations: ChargingStation[];
  onStationSelect: (station: ChargingStation) => void;
  selectedStation: ChargingStation | null;
  userLocation: UserLocation | null;
  routeLine?: [number, number][] | null;
}

export default function MapContainer(props: MapContainerProps) {
  return <MapClient {...props} />;
}
