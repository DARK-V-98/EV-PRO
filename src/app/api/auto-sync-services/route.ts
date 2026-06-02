import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import type { ServiceCategory } from "@/types/service";

export const dynamic = "force-dynamic";

const SYNC_HOUR = 0;
const SYNC_MINUTE = 1;

// Text-search queries per category. Google has no "EV showroom" type, so we use text search.
const QUERIES: { category: ServiceCategory; terms: string[] }[] = [
  { category: "showroom",   terms: ["electric car showroom", "EV car dealership", "car showroom"] },
  { category: "spareparts", terms: ["car spare parts shop", "vehicle spare parts"] },
  { category: "garage",     terms: ["car garage", "vehicle service center"] },
  { category: "repair",     terms: ["car repair service", "EV battery repair", "auto electrician"] },
];

const CITIES = [
  { name: "Colombo",      lat: 6.9271, lng: 79.8612 },
  { name: "Kandy",        lat: 7.2906, lng: 80.6337 },
  { name: "Galle",        lat: 6.0535, lng: 80.2210 },
  { name: "Negombo",      lat: 7.2096, lng: 79.8378 },
  { name: "Kurunegala",   lat: 7.4818, lng: 80.3609 },
  { name: "Matara",       lat: 5.9485, lng: 80.5353 },
  { name: "Jaffna",       lat: 9.6615, lng: 80.0255 },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
];

function getTodaySL(): string {
  const slt = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return slt.toISOString().split("T")[0];
}
function syncTimeReached(): boolean {
  const slt = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const h = slt.getUTCHours(), m = slt.getUTCMinutes();
  return h > SYNC_HOUR || (h === SYNC_HOUR && m >= SYNC_MINUTE);
}
function guessProvince(addr: string): string {
  const map: Record<string, string[]> = {
    Western: ["colombo", "gampaha", "kalutara", "negombo", "rajagiriya"],
    Central: ["kandy", "matale", "nuwara eliya", "dambulla"],
    Southern: ["galle", "matara", "hambantota"],
    Northern: ["jaffna", "kilinochchi", "vavuniya"],
    Eastern: ["trincomalee", "batticaloa", "ampara"],
    "North Western": ["kurunegala", "puttalam"],
    "North Central": ["anuradhapura", "polonnaruwa"],
    Uva: ["badulla", "moneragala"],
    Sabaragamuwa: ["ratnapura", "kegalle"],
  };
  const l = addr.toLowerCase();
  for (const [p, ks] of Object.entries(map)) if (ks.some((k) => l.includes(k))) return p;
  return "Unknown";
}

async function textSearch(query: string, lat: number, lng: number): Promise<any[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", "20000");
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
  return (await res.json()).result ?? null;
}

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("force") === "true";
  try {
    const adminDb = getAdminDb();
    const today = getTodaySL();
    const metaRef = adminDb.collection("meta").doc("syncServices");
    const meta = await metaRef.get();
    if (!force && meta.data()?.lastSyncDate === today)
      return NextResponse.json({ status: "already_synced", date: today });
    if (!force && !syncTimeReached())
      return NextResponse.json({ status: "not_yet" });

    await metaRef.set({ lastSyncDate: today, syncStatus: "running", startedAt: new Date().toISOString() }, { merge: true });

    const seen = new Set<string>();
    const found: { place: any; category: ServiceCategory }[] = [];

    for (const city of CITIES) {
      for (const { category, terms } of QUERIES) {
        for (const term of terms) {
          const results = await textSearch(`${term} ${city.name} Sri Lanka`, city.lat, city.lng);
          for (const r of results) {
            if (!seen.has(r.place_id)) {
              seen.add(r.place_id);
              found.push({ place: r, category });
            }
          }
          await new Promise((r) => setTimeout(r, 150));
        }
      }
    }

    const existingSnap = await adminDb.collection("services").get();
    const existingIds = new Set(existingSnap.docs.map((d) => d.data().googlePlaceId).filter(Boolean));

    let added = 0;
    const batch = adminDb.batch();
    for (const { place, category } of found) {
      if (existingIds.has(place.place_id)) continue;
      const details = await getDetails(place.place_id);
      await new Promise((r) => setTimeout(r, 80));
      const address = details?.formatted_address ?? place.formatted_address ?? "";
      const parts = address.split(",");
      const city = parts[parts.length - 3]?.trim() ?? parts[0]?.trim() ?? "Unknown";
      const is24 = details?.opening_hours?.periods?.some((p: any) => p.open?.time === "0000" && !p.close) ?? false;

      batch.set(adminDb.collection("services").doc(), {
        name: place.name,
        category,
        address,
        city,
        province: guessProvince(address),
        coordinates: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
        brands: [],
        services: [],
        phone: details?.formatted_phone_number ?? null,
        website: details?.website ?? null,
        hours: { is24Hours: is24 },
        verified: false,
        submittedBy: "google-places-sync",
        lastUpdated: today,
        googlePlaceId: place.place_id,
      });
      added++;
    }

    await batch.commit();
    await metaRef.set({ lastSyncDate: today, syncStatus: "done", completedAt: new Date().toISOString(), total: existingSnap.size + added, newAdded: added }, { merge: true });

    return NextResponse.json({ status: "synced", newAdded: added, scanned: found.length, date: today });
  } catch (err: any) {
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
