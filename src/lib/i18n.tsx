"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "en" | "si" | "ta";

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  si: "සිංහල",
  ta: "தமிழ்",
};

type Dict = Record<string, string>;

const STRINGS: Record<Lang, Dict> = {
  en: {
    appTagline: "Sri Lanka EV Charging Map",
    stations: "stations",
    nearYou: "near you",
    live: "live",
    add: "Add",
    addStation: "Add Station",
    search: "Search",
    searchPlaceholder: "Search stations, cities, networks...",
    filter: "Filter",
    filters: "Filters",
    clearAll: "Clear all",
    nearMe: "Near Me",
    locating: "Locating...",
    getDirections: "Get Directions",
    freeCharging: "Free charging",
    open24: "Open 24 hours",
    openNow: "Open now",
    working: "Working",
    notWorking: "Not working",
    liveStatus: "Live Status",
    writeReview: "Write a review",
    reviews: "Reviews",
    noReviews: "No reviews yet — be the first!",
    planRoute: "Plan a route",
    planTrip: "Plan your trip",
    chargersOnRoute: "Show chargers on route",
    location: "Location",
    charger: "Charger",
    type: "Type",
    connector: "Connector",
    speed: "Speed",
    options: "Options",
    amenities: "Amenities",
    city: "City",
    province: "Province",
    allCities: "All Cities",
    allProvinces: "All Provinces",
    loadingStations: "Loading stations...",
    noStations: "No stations found",
    clearFilters: "Clear filters",
    myCar: "My Car",
    anyCar: "Any car",
    verifiedOnly: "Verified only",
    favorites: "My favorites",
    cost: "Cost",
    ports: "Ports",
    offline: "Offline — saved data",
    getAlerts: "Get alerts",
    alertsOn: "Alerts on",
  },
  si: {
    appTagline: "ශ්‍රී ලංකා EV ආරෝපණ සිතියම",
    stations: "ස්ථාන",
    nearYou: "ඔබ අසල",
    live: "සජීවී",
    add: "එක් කරන්න",
    addStation: "ස්ථානයක් එක් කරන්න",
    search: "සොයන්න",
    searchPlaceholder: "ස්ථාන, නගර සොයන්න...",
    filter: "පෙරහන",
    filters: "පෙරහන්",
    clearAll: "සියල්ල මකන්න",
    nearMe: "මා අසල",
    locating: "ස්ථානගත වෙමින්...",
    getDirections: "මාර්ග ලබාගන්න",
    freeCharging: "නොමිලේ ආරෝපණය",
    open24: "පැය 24 විවෘතයි",
    openNow: "දැන් විවෘතයි",
    working: "ක්‍රියාත්මකයි",
    notWorking: "ක්‍රියා නොකරයි",
    liveStatus: "සජීවී තත්ත්වය",
    writeReview: "සමාලෝචනයක් ලියන්න",
    reviews: "සමාලෝචන",
    noReviews: "තවම සමාලෝචන නැත — පළමුවැන්නා වන්න!",
    planRoute: "මාර්ගයක් සැලසුම් කරන්න",
    planTrip: "ඔබේ ගමන සැලසුම් කරන්න",
    chargersOnRoute: "මාර්ගයේ ආරෝපක පෙන්වන්න",
    location: "ස්ථානය",
    charger: "ආරෝපකය",
    type: "වර්ගය",
    connector: "සම්බන්ධකය",
    speed: "වේගය",
    options: "විකල්ප",
    amenities: "පහසුකම්",
    city: "නගරය",
    province: "පළාත",
    allCities: "සියලු නගර",
    allProvinces: "සියලු පළාත්",
    loadingStations: "ස්ථාන පූරණය වෙමින්...",
    noStations: "ස්ථාන හමු නොවීය",
    clearFilters: "පෙරහන් මකන්න",
    myCar: "මගේ වාහනය",
    anyCar: "ඕනෑම වාහනයක්",
    verifiedOnly: "තහවුරු කළ පමණි",
    favorites: "මගේ ප්‍රියතම",
    cost: "මිල",
    ports: "පෝට්",
    offline: "අන්තර්ජාලයක් නැත — සුරැකි දත්ත",
    getAlerts: "දැනුම්දීම් ලබාගන්න",
    alertsOn: "දැනුම්දීම් සක්‍රීයයි",
  },
  ta: {
    appTagline: "இலங்கை EV சார்ஜிங் வரைபடம்",
    stations: "நிலையங்கள்",
    nearYou: "உங்கள் அருகில்",
    live: "நேரலை",
    add: "சேர்",
    addStation: "நிலையம் சேர்க்க",
    search: "தேடு",
    searchPlaceholder: "நிலையங்கள், நகரங்களைத் தேடுங்கள்...",
    filter: "வடிகட்டி",
    filters: "வடிகட்டிகள்",
    clearAll: "அனைத்தையும் அழி",
    nearMe: "என் அருகில்",
    locating: "இடம் கண்டறிகிறது...",
    getDirections: "வழிகளைப் பெறு",
    freeCharging: "இலவச சார்ஜிங்",
    open24: "24 மணி நேரம் திறந்திருக்கும்",
    openNow: "இப்போது திறந்துள்ளது",
    working: "வேலை செய்கிறது",
    notWorking: "வேலை செய்யவில்லை",
    liveStatus: "நேரடி நிலை",
    writeReview: "மதிப்பாய்வு எழுதுங்கள்",
    reviews: "மதிப்பாய்வுகள்",
    noReviews: "இன்னும் மதிப்பாய்வுகள் இல்லை — முதலில் இருங்கள்!",
    planRoute: "வழியைத் திட்டமிடுங்கள்",
    planTrip: "உங்கள் பயணத்தைத் திட்டமிடுங்கள்",
    chargersOnRoute: "வழியில் சார்ஜர்களைக் காட்டு",
    location: "இடம்",
    charger: "சார்ஜர்",
    type: "வகை",
    connector: "இணைப்பான்",
    speed: "வேகம்",
    options: "விருப்பங்கள்",
    amenities: "வசதிகள்",
    city: "நகரம்",
    province: "மாகாணம்",
    allCities: "அனைத்து நகரங்கள்",
    allProvinces: "அனைத்து மாகாணங்கள்",
    loadingStations: "நிலையங்கள் ஏற்றப்படுகிறது...",
    noStations: "நிலையங்கள் இல்லை",
    clearFilters: "வடிகட்டிகளை அழி",
    myCar: "என் கார்",
    anyCar: "எந்த காரும்",
    verifiedOnly: "சரிபார்க்கப்பட்டவை மட்டும்",
    favorites: "என் பிடித்தவை",
    cost: "செலவு",
    ports: "போர்ட்கள்",
    offline: "ஆஃப்லைன் — சேமித்த தரவு",
    getAlerts: "அறிவிப்புகளைப் பெறு",
    alertsOn: "அறிவிப்புகள் இயக்கத்தில்",
  },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof STRINGS.en) => string;
}

const Ctx = createContext<I18nCtx>({ lang: "en", setLang: () => {}, t: (k) => STRINGS.en[k] ?? String(k) });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("evpro-lang") as Lang | null;
      if (saved && saved in STRINGS) setLangState(saved);
    } catch { /* no-op */ }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("evpro-lang", l); } catch { /* no-op */ }
  }, []);

  const t = useCallback(
    (key: keyof typeof STRINGS.en) => STRINGS[lang][key] ?? STRINGS.en[key] ?? String(key),
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
