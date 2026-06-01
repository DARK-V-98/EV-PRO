/**
 * Google Places API importer for Sri Lanka EV charging stations
 *
 * Setup:
 *   1. Get a free Google Cloud API key at https://console.cloud.google.com
 *   2. Enable "Places API" in your project
 *   3. Run: GOOGLE_API_KEY=your_key_here node scripts/import-google-places.mjs
 *
 * This script searches multiple Sri Lanka cities for EV charging stations,
 * deduplicates results, and merges them into public/data/stations.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("❌  Missing GOOGLE_API_KEY environment variable.");
  console.error("    Run: GOOGLE_API_KEY=your_key node scripts/import-google-places.mjs");
  process.exit(1);
}

// Sri Lanka cities to search
const SEARCH_LOCATIONS = [
  { name: "Colombo",        lat: 6.9271, lng: 79.8612 },
  { name: "Kandy",          lat: 7.2906, lng: 80.6337 },
  { name: "Galle",          lat: 6.0535, lng: 80.2210 },
  { name: "Negombo",        lat: 7.2096, lng: 79.8378 },
  { name: "Matara",         lat: 5.9485, lng: 80.5353 },
  { name: "Kurunegala",     lat: 7.4818, lng: 80.3609 },
  { name: "Jaffna",         lat: 9.6615, lng: 80.0255 },
  { name: "Dambulla",       lat: 7.8742, lng: 80.6511 },
  { name: "Anuradhapura",   lat: 8.3114, lng: 80.4037 },
  { name: "Trincomalee",    lat: 8.5874, lng: 81.2152 },
  { name: "Batticaloa",     lat: 7.7170, lng: 81.6924 },
  { name: "Ratnapura",      lat: 6.6828, lng: 80.3992 },
  { name: "Badulla",        lat: 6.9934, lng: 81.0550 },
  { name: "Nuwara Eliya",   lat: 6.9497, lng: 80.7891 },
  { name: "Hambantota",     lat: 6.1241, lng: 81.1185 },
];

const RADIUS_METERS = 25000; // 25km radius per city

async function searchEVStations(lat, lng, cityName) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", RADIUS_METERS.toString());
  url.searchParams.set("type", "electric_vehicle_charging_station");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn(`  ⚠️  ${cityName}: ${data.status} — ${data.error_message ?? ""}`);
    return [];
  }

  console.log(`  ✅ ${cityName}: found ${data.results?.length ?? 0} stations`);
  return data.results ?? [];
}

async function getPlaceDetails(placeId) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,geometry,formatted_phone_number,website,opening_hours,rating");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();
  return data.result ?? null;
}

function guessProvince(address) {
  const map = {
    "Western": ["colombo", "gampaha", "kalutara", "negombo", "katunayake", "rajagiriya", "kotte"],
    "Central": ["kandy", "matale", "nuwara eliya", "dambulla"],
    "Southern": ["galle", "matara", "hambantota", "tangalle", "tissamaharama"],
    "Northern": ["jaffna", "kilinochchi", "mannar", "vavuniya", "mullaitivu"],
    "Eastern": ["trincomalee", "batticaloa", "ampara"],
    "North Western": ["kurunegala", "puttalam"],
    "North Central": ["anuradhapura", "polonnaruwa"],
    "Uva": ["badulla", "moneragala"],
    "Sabaragamuwa": ["ratnapura", "kegalle"],
  };
  const lower = address.toLowerCase();
  for (const [province, keywords] of Object.entries(map)) {
    if (keywords.some((k) => lower.includes(k))) return province;
  }
  return "Unknown";
}

function googlePlaceToStation(place, details, index) {
  const address = details?.formatted_address ?? place.vicinity ?? "";
  const cityParts = address.split(",");
  const city = cityParts[cityParts.length - 3]?.trim() ?? cityParts[0]?.trim() ?? "Unknown";

  const hours = details?.opening_hours;
  const is24Hours = hours?.periods?.some(
    (p) => p.open?.time === "0000" && !p.close
  ) ?? false;

  return {
    id: `gp-${String(index).padStart(3, "0")}`,
    name: place.name,
    address: address,
    city: city,
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
    hours: {
      is24Hours,
      notes: hours?.weekday_text?.join(", ") ?? undefined,
    },
    contact: {
      phone: details?.formatted_phone_number ?? undefined,
      website: details?.website ?? undefined,
    },
    network: undefined,
    amenities: [],
    verified: false,
    submittedBy: "google-places-import",
    lastUpdated: new Date().toISOString().split("T")[0],
    googlePlaceId: place.place_id,
  };
}

async function main() {
  console.log("🔍 Searching Google Places for EV charging stations in Sri Lanka...\n");

  const seenIds = new Set();
  const allRaw = [];

  for (const loc of SEARCH_LOCATIONS) {
    const results = await searchEVStations(loc.lat, loc.lng, loc.name);
    for (const r of results) {
      if (!seenIds.has(r.place_id)) {
        seenIds.add(r.place_id);
        allRaw.push(r);
      }
    }
    // Respect rate limits
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n📦 Total unique stations found: ${allRaw.length}`);
  console.log("🔎 Fetching details for each station...\n");

  const newStations = [];
  for (let i = 0; i < allRaw.length; i++) {
    const place = allRaw[i];
    const details = await getPlaceDetails(place.place_id);
    newStations.push(googlePlaceToStation(place, details, i + 1));
    process.stdout.write(`  ${i + 1}/${allRaw.length}\r`);
    await new Promise((r) => setTimeout(r, 100));
  }

  // Load existing stations
  const outputPath = path.join(__dirname, "../public/data/stations.json");
  const existing = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  const existingPlaceIds = new Set(
    existing.stations.map((s) => s.googlePlaceId).filter(Boolean)
  );

  const uniqueNew = newStations.filter((s) => !existingPlaceIds.has(s.googlePlaceId));
  console.log(`\n✨ ${uniqueNew.length} new stations to add (${newStations.length - uniqueNew.length} already existed)`);

  const merged = {
    stations: [...existing.stations, ...uniqueNew],
    metadata: {
      version: existing.metadata.version,
      lastUpdated: new Date().toISOString().split("T")[0],
      totalStations: existing.stations.length + uniqueNew.length,
    },
  };

  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`\n✅ Done! stations.json now has ${merged.stations.length} stations.`);
  console.log("⚠️  Note: Google Places data uses default charger details (AC, Type 2, 22kW).");
  console.log("   Review and update connector/speed details for accuracy.");
}

main().catch(console.error);
