import type { ChargingStation, ConnectorType } from "@/types/station";

export async function getAllStations(): Promise<ChargingStation[]> {
  const res = await fetch("/data/stations.json");
  const json = await res.json();
  return json.stations;
}

export function getUniqueCities(stations: ChargingStation[]): string[] {
  return [...new Set(stations.map((s) => s.city))].sort();
}

export function getUniqueConnectors(stations: ChargingStation[]): ConnectorType[] {
  const all = stations.flatMap((s) => s.connectors);
  return [...new Set(all)].sort() as ConnectorType[];
}
