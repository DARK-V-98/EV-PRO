import type { ConnectorType } from "@/types/station";

export interface CarModel {
  id: string;
  name: string;
  brand: string;
  connectors: ConnectorType[];
  batteryKwh: number;     // usable battery capacity
  maxAcKw: number;        // max AC charge rate the car accepts
  maxDcKw: number;        // max DC charge rate the car accepts
}

/**
 * Common EVs in Sri Lanka and their compatible connectors.
 * Used by the connector compatibility checker.
 */
export const CAR_MODELS: CarModel[] = [
  { id: "leaf",      brand: "Nissan", name: "Nissan Leaf",       connectors: ["Type 1", "CHAdeMO"], batteryKwh: 24, maxAcKw: 6.6, maxDcKw: 50 },
  { id: "leaf-new",  brand: "Nissan", name: "Nissan Leaf (2018+)", connectors: ["Type 2", "CHAdeMO"], batteryKwh: 40, maxAcKw: 6.6, maxDcKw: 50 },
  { id: "byd-atto3", brand: "BYD",    name: "BYD Atto 3",        connectors: ["Type 2", "CCS2"], batteryKwh: 60, maxAcKw: 7, maxDcKw: 80 },
  { id: "byd-dolphin",brand: "BYD",   name: "BYD Dolphin",       connectors: ["Type 2", "CCS2"], batteryKwh: 44, maxAcKw: 7, maxDcKw: 60 },
  { id: "mg-zs",     brand: "MG",     name: "MG ZS EV",          connectors: ["Type 2", "CCS2"], batteryKwh: 50, maxAcKw: 7, maxDcKw: 76 },
  { id: "mg4",       brand: "MG",     name: "MG4",               connectors: ["Type 2", "CCS2"], batteryKwh: 51, maxAcKw: 7, maxDcKw: 88 },
  { id: "tesla3",    brand: "Tesla",  name: "Tesla Model 3",     connectors: ["Type 2", "CCS2"], batteryKwh: 60, maxAcKw: 11, maxDcKw: 170 },
  { id: "teslay",    brand: "Tesla",  name: "Tesla Model Y",     connectors: ["Type 2", "CCS2"], batteryKwh: 60, maxAcKw: 11, maxDcKw: 170 },
  { id: "kona",      brand: "Hyundai",name: "Hyundai Kona EV",   connectors: ["Type 2", "CCS2"], batteryKwh: 64, maxAcKw: 11, maxDcKw: 77 },
  { id: "ioniq5",    brand: "Hyundai",name: "Hyundai Ioniq 5",   connectors: ["Type 2", "CCS2"], batteryKwh: 72, maxAcKw: 11, maxDcKw: 220 },
  { id: "niro",      brand: "Kia",    name: "Kia Niro EV",       connectors: ["Type 2", "CCS2"], batteryKwh: 64, maxAcKw: 11, maxDcKw: 77 },
  { id: "outlander", brand: "Mitsubishi", name: "Mitsubishi Outlander PHEV", connectors: ["Type 1", "CHAdeMO"], batteryKwh: 20, maxAcKw: 3.7, maxDcKw: 22 },
  { id: "bmwi3",     brand: "BMW",    name: "BMW i3",            connectors: ["Type 2", "CCS2"], batteryKwh: 42, maxAcKw: 11, maxDcKw: 50 },
  { id: "wuling",    brand: "Wuling", name: "Wuling Air EV",     connectors: ["Type 2", "GB/T"], batteryKwh: 17, maxAcKw: 6.6, maxDcKw: 40 },
  { id: "byd-e6",    brand: "BYD",    name: "BYD e6",            connectors: ["Type 2", "GB/T"], batteryKwh: 71, maxAcKw: 7, maxDcKw: 60 },
];

/** Estimate charging time in minutes from `fromPct` to `toPct` at a given station kW. */
export function estimateChargeMinutes(car: CarModel, stationKw: number, isDc: boolean, fromPct: number, toPct: number): number {
  const carMax = isDc ? car.maxDcKw : car.maxAcKw;
  const effectiveKw = Math.min(stationKw, carMax);
  if (effectiveKw <= 0) return 0;
  const kwhNeeded = car.batteryKwh * ((toPct - fromPct) / 100);
  // efficiency/taper factor ~0.85
  const minutes = (kwhNeeded / effectiveKw) * 60 / 0.85;
  return Math.max(1, Math.round(minutes));
}

export function getCarById(id: string): CarModel | undefined {
  return CAR_MODELS.find((c) => c.id === id);
}

const KEY = "evpro-my-car";

export function saveMyCar(id: string) {
  try { localStorage.setItem(KEY, id); } catch { /* no-op */ }
}

export function loadMyCar(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
