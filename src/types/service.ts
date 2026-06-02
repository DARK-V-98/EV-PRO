export type ServiceCategory = "showroom" | "spareparts" | "garage" | "repair";

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; color: string; emoji: string }[] = [
  { value: "showroom",   label: "Showrooms",     color: "#0ea5e9", emoji: "🏢" },
  { value: "spareparts", label: "Spare Parts",   color: "#ea580c", emoji: "🔧" },
  { value: "garage",     label: "Garages",       color: "#7c3aed", emoji: "🛠️" },
  { value: "repair",     label: "Repair Shops",  color: "#16a34a", emoji: "⚙️" },
];

export interface ServicePlace {
  id: string;
  name: string;
  category: ServiceCategory;
  address: string;
  city: string;
  province: string;
  coordinates: { lat: number; lng: number };
  brands?: string[];          // EV brands serviced (BYD, MG, Nissan...)
  services?: string[];        // e.g. "Battery", "Bodywork", "Diagnostics"
  phone?: string;
  whatsapp?: string;
  website?: string;
  hours?: { is24Hours: boolean; open?: string; close?: string };
  verified: boolean;
  lastUpdated: string;
}

export interface ServiceFilters {
  category: ServiceCategory | "";
  city: string;
  searchQuery: string;
}
