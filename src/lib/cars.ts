import type { ConnectorType } from "@/types/station";

export interface CarModel {
  id: string;
  name: string;
  brand: string;
  connectors: ConnectorType[];
}

/**
 * Common EVs in Sri Lanka and their compatible connectors.
 * Used by the connector compatibility checker.
 */
export const CAR_MODELS: CarModel[] = [
  { id: "leaf",      brand: "Nissan", name: "Nissan Leaf",       connectors: ["Type 1", "CHAdeMO"] },
  { id: "leaf-new",  brand: "Nissan", name: "Nissan Leaf (2018+)", connectors: ["Type 2", "CHAdeMO"] },
  { id: "byd-atto3", brand: "BYD",    name: "BYD Atto 3",        connectors: ["Type 2", "CCS2"] },
  { id: "byd-dolphin",brand: "BYD",   name: "BYD Dolphin",       connectors: ["Type 2", "CCS2"] },
  { id: "mg-zs",     brand: "MG",     name: "MG ZS EV",          connectors: ["Type 2", "CCS2"] },
  { id: "mg4",       brand: "MG",     name: "MG4",               connectors: ["Type 2", "CCS2"] },
  { id: "tesla3",    brand: "Tesla",  name: "Tesla Model 3",     connectors: ["Type 2", "CCS2"] },
  { id: "teslay",    brand: "Tesla",  name: "Tesla Model Y",     connectors: ["Type 2", "CCS2"] },
  { id: "kona",      brand: "Hyundai",name: "Hyundai Kona EV",   connectors: ["Type 2", "CCS2"] },
  { id: "ioniq5",    brand: "Hyundai",name: "Hyundai Ioniq 5",   connectors: ["Type 2", "CCS2"] },
  { id: "niro",      brand: "Kia",    name: "Kia Niro EV",       connectors: ["Type 2", "CCS2"] },
  { id: "outlander", brand: "Mitsubishi", name: "Mitsubishi Outlander PHEV", connectors: ["Type 1", "CHAdeMO"] },
  { id: "bmwi3",     brand: "BMW",    name: "BMW i3",            connectors: ["Type 2", "CCS2"] },
  { id: "wuling",    brand: "Wuling", name: "Wuling Air EV",     connectors: ["Type 2", "GB/T"] },
  { id: "byd-e6",    brand: "BYD",    name: "BYD e6",            connectors: ["Type 2", "GB/T"] },
];

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
