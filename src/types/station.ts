export type ChargerType = "AC" | "DC" | "AC+DC";

export type ConnectorType =
  | "Type 1"
  | "Type 2"
  | "CCS1"
  | "CCS2"
  | "CHAdeMO"
  | "GB/T"
  | "Tesla";

export type SpeedTier = "slow" | "standard" | "fast" | "rapid" | "";
export type RadiusKm = 5 | 10 | 25 | 50 | null;

export const SL_PROVINCES = [
  "Central", "Eastern", "North Central", "Northern",
  "North Western", "Sabaragamuwa", "Southern", "Uva", "Western",
] as const;

export const AMENITY_OPTIONS = ["Parking", "WiFi", "Cafe", "Restrooms"] as const;

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  coordinates: { lat: number; lng: number };
  chargerType: ChargerType;
  connectors: ConnectorType[];
  speedKw: number;
  numberOfPorts: number;
  cost: {
    perKwh?: number;
    perMinute?: number;
    flat?: number;
    currency: "LKR";
    notes?: string;
  };
  hours: { is24Hours: boolean; open?: string; close?: string; notes?: string };
  contact: { phone?: string; email?: string; website?: string };
  network?: string;
  amenities?: string[];
  verified: boolean;
  submittedBy?: string;
  lastUpdated: string;
  googlePlaceId?: string;
}

export interface Filters {
  city: string;
  province: string;
  chargerType: ChargerType | "";
  connector: ConnectorType | "";
  searchQuery: string;
  speedTier: SpeedTier;
  isFree: boolean;
  is24Hours: boolean;
  verifiedOnly: boolean;
  amenities: string[];
  radiusKm: RadiusKm;
  availableNow: boolean;
  myCarId: string;
  favoritesOnly: boolean;
}
