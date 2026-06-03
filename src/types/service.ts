export type ServiceCategory = "showroom" | "spareparts" | "garage" | "repair";

// svgPath = inner markup for a 24x24 lucide-style stroke icon (used in map markers).
export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string; color: string; svgPath: string }[] = [
  { value: "showroom",   label: "Showrooms",    color: "#0ea5e9",
    svgPath: '<path d="M3 21h18M6 21V8l6-4 6 4v13M10 12h.01M14 12h.01M10 16h.01M14 16h.01"/>' },
  { value: "spareparts", label: "Spare Parts",  color: "#ea580c",
    svgPath: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>' },
  { value: "garage",     label: "Garages",      color: "#7c3aed",
    svgPath: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.1-.6-.6-2.1 2.3-2.3z"/>' },
  { value: "repair",     label: "Repair Shops", color: "#16a34a",
    svgPath: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>' },
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
