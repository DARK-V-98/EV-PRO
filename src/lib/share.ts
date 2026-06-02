import type { ChargingStation } from "@/types/station";
import { haptic } from "./haptics";

const BASE = "https://evpro.esystemlk.com";

/**
 * Shares a station via the native share sheet (WhatsApp, SMS, etc.).
 * Falls back to copying a link to the clipboard on desktop.
 */
export async function shareStation(station: ChargingStation): Promise<"shared" | "copied" | "failed"> {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
  const text =
    `⚡ ${station.name}\n` +
    `${station.address}, ${station.city}\n` +
    `${station.chargerType} · ${station.speedKw}kW\n` +
    `Directions: ${mapsUrl}\n\n` +
    `Found on EV PRO — ${BASE}`;

  haptic("light");

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: `EV PRO — ${station.name}`, text, url: mapsUrl });
      return "shared";
    } catch {
      return "failed"; // user cancelled
    }
  }

  // Desktop fallback — copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
