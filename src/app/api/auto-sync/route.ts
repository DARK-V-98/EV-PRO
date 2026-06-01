import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const SYNC_HOUR = 0;   // 12:01 AM
const SYNC_MINUTE = 1;

const SEARCH_LOCATIONS = [
  { lat: 6.9271, lng: 79.8612 },  // Colombo
  { lat: 7.2906, lng: 80.6337 },  // Kandy
  { lat: 6.0535, lng: 80.2210 },  // Galle
  { lat: 7.2096, lng: 79.8378 },  // Negombo
  { lat: 5.9485, lng: 80.5353 },  // Matara
  { lat: 7.4818, lng: 80.3609 },  // Kurunegala
  { lat: 9.6615, lng: 80.0255 },  // Jaffna
  { lat: 7.8742, lng: 80.6511 },  // Dambulla
  { lat: 8.3114, lng: 80.4037 },  // Anuradhapura
  { lat: 8.5874, lng: 81.2152 },  // Trincomalee
  { lat: 7.7170, lng: 81.6924 },  // Batticaloa
  { lat: 6.6828, lng: 80.3992 },  // Ratnapura
  { lat: 6.9934, lng: 81.0550 },  // Badulla
  { lat: 6.9497, lng: 80.7891 },  // Nuwara Eliya
  { lat: 6.1241, lng: 81.1185 },  // Hambantota
];

function getTodaySriLanka(): string {
  // Sri Lanka is UTC+5:30
  const now = new Date();
  const slt = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return slt.toISOString().split("T")[0]; // "2026-06-01"
}

function isSyncTimeReached(): boolean {
  const now = new Date();
  const slt = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const hours = slt.getUTCHours();
  const minutes = slt.getUTCMinutes();
  return hours > SYNC_HOUR || (hours === SYNC_HOUR && minutes >= SYNC_MINUTE);
}

function guessProvince(address: string): string {
  const map: Record<string, string[]> = {
    "Western":       ["colombo", "gampaha", "kalutara", "negombo", "katunayake", "rajagiriya"],
    "Central":       ["kandy", "matale", "nuwara eliya", "dambulla"],
    "Southern":      ["galle", "matara", "hambantota", "tangalle"],
    "Northern":      ["jaffna", "kilinochchi", "mannar", "vavuniya"],
    "Eastern":       ["trincomalee", "batticaloa", "ampara"],
    "North Western": ["kurunegala", "puttalam"],
    "North Central": ["anuradhapura", "polonnaruwa"],
    "Uva":           ["badulla", "moneragala"],
    "Sabaragamuwa":  ["ratnapura", "kegalle"],
  };
  const lower = address.toLowerCase();
  for (const [province, keywords] of Object.entries(map)) {
    if (keywords.some((k) => lower.includes(k))) return province;
  }
  return "Unknown";
}

async function searchNearby(lat: number, lng: number): Promise<any[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", "25000");
  url.searchParams.set("type", "electric_vehicle_charging_station");
  url.searchParams.set("key", process.env.GOOGLE_API_KEY!);
  const res = await fetch(url.toString());
  const data = await res.json();
  return data.status === "OK" ? (data.results ?? []) : [];
}

async function getDetails(placeId: string): Promise<any> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,geometry,formatted_phone_number,website,opening_hours");
  url.searchParams.set("key", process.env.GOOGLE_API_KEY!);
  const res = await fetch(url.toString());
  const data = await res.json();
  return data.result ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  try {
    const adminDb = getAdminDb();
    const today = getTodaySriLanka();

    // Check if sync already ran today (skip if force=true)
    const metaRef = adminDb.collection("meta").doc("sync");
    const meta = await metaRef.get();
    const lastSyncDate: string = meta.data()?.lastSyncDate ?? "";

    if (!force && lastSyncDate === today) {
      return NextResponse.json({ status: "already_synced", date: today });
    }

    // Check if it's past 12:01 AM Sri Lanka time (skip if force=true)
    if (!force && !isSyncTimeReached()) {
      return NextResponse.json({ status: "not_yet", message: "Sync time not reached yet" });
    }

    // Mark sync as in-progress immediately to prevent duplicate runs
    await metaRef.set({ lastSyncDate: today, syncStatus: "running", startedAt: new Date().toISOString() }, { merge: true });

    // Fetch all places from Google
    const seenIds = new Set<string>();
    const allRaw: any[] = [];

    for (const loc of SEARCH_LOCATIONS) {
      const results = await searchNearby(loc.lat, loc.lng);
      for (const r of results) {
        if (!seenIds.has(r.place_id)) {
          seenIds.add(r.place_id);
          allRaw.push(r);
        }
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    // Get existing Google Place IDs from Firestore
    const existingSnap = await adminDb.collection("stations").get();
    const existingPlaceIds = new Set(
      existingSnap.docs.map((d) => d.data().googlePlaceId).filter(Boolean)
    );

    let added = 0;
    const batch = adminDb.batch();

    for (const place of allRaw) {
      if (existingPlaceIds.has(place.place_id)) continue;

      const details = await getDetails(place.place_id);
      await new Promise((r) => setTimeout(r, 100));

      const address = details?.formatted_address ?? place.vicinity ?? "";
      const cityParts = address.split(",");
      const city = cityParts[cityParts.length - 3]?.trim() ?? cityParts[0]?.trim() ?? "Unknown";
      const is24Hours = details?.opening_hours?.periods?.some(
        (p: any) => p.open?.time === "0000" && !p.close
      ) ?? false;

      batch.set(adminDb.collection("stations").doc(), {
        name: place.name,
        address,
        city,
        province: guessProvince(address),
        coordinates: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
        chargerType: "AC",
        connectors: ["Type 2"],
        speedKw: 22,
        numberOfPorts: 1,
        cost: { currency: "LKR" },
        hours: { is24Hours },
        contact: {
          phone: details?.formatted_phone_number ?? null,
          website: details?.website ?? null,
        },
        network: null,
        amenities: [],
        verified: false,
        submittedBy: "auto-sync",
        lastUpdated: today,
        googlePlaceId: place.place_id,
      });
      added++;
    }

    await batch.commit();

    // Update meta with completion
    await metaRef.set({
      lastSyncDate: today,
      syncStatus: "done",
      completedAt: new Date().toISOString(),
      totalStations: existingSnap.size + added,
      newAdded: added,
    }, { merge: true });

    return NextResponse.json({ status: "synced", newAdded: added, date: today });
  } catch (err: any) {
    console.error("Auto-sync error:", err);
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
