import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

const SEARCH_LOCATIONS = [
  { name: "Colombo",       lat: 6.9271, lng: 79.8612 },
  { name: "Kandy",         lat: 7.2906, lng: 80.6337 },
  { name: "Galle",         lat: 6.0535, lng: 80.2210 },
  { name: "Negombo",       lat: 7.2096, lng: 79.8378 },
  { name: "Matara",        lat: 5.9485, lng: 80.5353 },
  { name: "Kurunegala",    lat: 7.4818, lng: 80.3609 },
  { name: "Jaffna",        lat: 9.6615, lng: 80.0255 },
  { name: "Dambulla",      lat: 7.8742, lng: 80.6511 },
  { name: "Anuradhapura",  lat: 8.3114, lng: 80.4037 },
  { name: "Trincomalee",   lat: 8.5874, lng: 81.2152 },
  { name: "Batticaloa",    lat: 7.7170, lng: 81.6924 },
  { name: "Ratnapura",     lat: 6.6828, lng: 80.3992 },
  { name: "Badulla",       lat: 6.9934, lng: 81.0550 },
  { name: "Nuwara Eliya",  lat: 6.9497, lng: 80.7891 },
  { name: "Hambantota",    lat: 6.1241, lng: 81.1185 },
];

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

async function searchNearby(lat: number, lng: number) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", "25000");
  url.searchParams.set("type", "electric_vehicle_charging_station");
  url.searchParams.set("key", process.env.GOOGLE_API_KEY!);
  const res = await fetch(url.toString());
  const data = await res.json();
  return data.status === "OK" ? (data.results ?? []) : [];
}

async function getDetails(placeId: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,geometry,formatted_phone_number,website,opening_hours");
  url.searchParams.set("key", process.env.GOOGLE_API_KEY!);
  const res = await fetch(url.toString());
  const data = await res.json();
  return data.result ?? null;
}

// Vercel Cron calls this route — protect it with a secret
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // Get existing place IDs from Firestore to avoid duplicates
    const existingSnap = await getAdminDb().collection("stations").get();
    const existingPlaceIds = new Set(
      existingSnap.docs.map((d) => d.data().googlePlaceId).filter(Boolean)
    );

    let added = 0;
    const batch = getAdminDb().batch();

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

      const station = {
        name: place.name,
        address,
        city,
        province: guessProvince(address),
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
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
        submittedBy: "google-places-sync",
        lastUpdated: new Date().toISOString().split("T")[0],
        googlePlaceId: place.place_id,
      };

      const ref = getAdminDb().collection("stations").doc();
      batch.set(ref, station);
      added++;
    }

    // Update sync metadata
    const metaRef = getAdminDb().collection("meta").doc("sync");
    batch.set(metaRef, {
      lastSync: new Date().toISOString(),
      totalStations: existingSnap.size + added,
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      newStationsAdded: added,
      totalSearched: allRaw.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
