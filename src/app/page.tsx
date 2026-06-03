import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Zap, Wrench, MapPin, Navigation, LocateFixed, Timer, WifiOff, Languages,
  Filter, Star, ThumbsUp, Route, Building2, Package, Settings, ArrowRight, Smartphone,
} from "lucide-react";
import { LiveStats } from "@/components/landing/LiveStats";
import { MapPreview } from "@/components/landing/MapPreview";

export const metadata: Metadata = {
  title: "EV PRO — EV Charging Places & Services in Sri Lanka",
  description:
    "EV PRO is Sri Lanka's complete electric vehicle app: find EV charging stations, showrooms, spare parts, garages and repair shops on one live map. Free, works offline, 300+ chargers and 800+ services across Colombo, Kandy, Galle and every city.",
  alternates: { canonical: "https://evpro.esystemlk.com" },
};

const FEATURES = [
  { icon: Zap, title: "Live Charging Map", desc: "300+ EV charging stations across Sri Lanka, updated daily." },
  { icon: LocateFixed, title: "Near Me", desc: "Find the closest charger to your exact GPS location instantly." },
  { icon: Navigation, title: "Road Distance & Time", desc: "Real driving distance and ETA to any charger, not just straight-line." },
  { icon: Filter, title: "Advanced Filters", desc: "Filter by charger type, connector, speed, free, 24h, your car & more." },
  { icon: Route, title: "Trip Route Planner", desc: "Plan a trip and see every charger along your route corridor." },
  { icon: Timer, title: "Charging Timer", desc: "Smart charge-time estimate for your car + alert when it's done." },
  { icon: ThumbsUp, title: "Live Status", desc: "Community reports show which chargers are actually working." },
  { icon: Star, title: "Reviews & Favorites", desc: "Rate stations, add photos, and save your go-to chargers." },
  { icon: Wrench, title: "EV Services", desc: "Showrooms, spare parts, garages & repair shops on a second map." },
  { icon: WifiOff, title: "Works Offline", desc: "Saved data means the map works even with no signal." },
  { icon: Languages, title: "3 Languages", desc: "English, සිංහල and தமிழ் — switch anytime." },
  { icon: Smartphone, title: "Install as App", desc: "Add to your home screen — Android app & PWA, same data." },
];

const SERVICE_TYPES = [
  { icon: Building2, label: "Showrooms", color: "text-sky-600 bg-sky-50" },
  { icon: Package, label: "Spare Parts", color: "text-orange-600 bg-orange-50" },
  { icon: Wrench, label: "Garages", color: "text-violet-600 bg-violet-50" },
  { icon: Settings, label: "Repair Shops", color: "text-green-600 bg-green-50" },
];

const CITIES = ["Colombo", "Kandy", "Galle", "Negombo", "Matara", "Jaffna", "Kurunegala",
  "Anuradhapura", "Trincomalee", "Batticaloa", "Hambantota", "Nuwara Eliya", "Dambulla", "Ratnapura", "Badulla"];

export default function LandingPage() {
  return (
    <div className="min-h-full bg-white text-slate-800 overflow-y-auto" style={{ height: "100%" }}>
      {/* ── Nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/ev.png" alt="EV PRO" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              EV <span className="text-green-600">PRO</span>
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/services" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-green-600 px-3 py-2 rounded-lg transition-colors">
              <Wrench className="w-4 h-4" /> Services
            </Link>
            <Link href="/map" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl transition-colors">
              <Zap className="w-4 h-4" /> Open Map
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pt-12 md:pt-20 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live across Sri Lanka
        </div>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Every EV charging place &amp; service<br className="hidden md:block" />
          <span className="text-green-600"> in Sri Lanka</span>, on one map
        </h1>
        <p className="mt-5 text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
          Find EV charging stations, showrooms, spare parts, garages and repair shops.
          Real-time data, road directions, works offline — completely free.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/map" className="flex items-center gap-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            <Zap className="w-4 h-4" /> Find Chargers <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/services" className="flex items-center gap-2 text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 px-6 py-3 rounded-xl transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
            <Wrench className="w-4 h-4" /> EV Services
          </Link>
        </div>
      </section>

      {/* ── Live stats from database ────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <LiveStats />
      </section>

      {/* ── Live map preview ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>The live charging map</h2>
          <p className="text-slate-500 mt-2">Real charging stations loaded straight from our database</p>
        </div>
        <MapPreview />
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Everything an EV owner needs</h2>
            <p className="text-slate-500 mt-2">Built for Sri Lankan electric vehicle drivers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>{title}</h3>
                <p className="text-sm text-slate-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Not just charging</h2>
          <p className="text-slate-500 mt-2">Find every EV service on a dedicated map</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICE_TYPES.map(({ icon: Icon, label, color }) => (
            <Link key={label} href="/services" className="rounded-2xl border border-slate-200 p-6 text-center hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-700">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Coverage / SEO cities ───────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>EV charging in every city</h2>
          <p className="text-slate-500 mt-2 mb-6">Coverage across all of Sri Lanka</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CITIES.map((c) => (
              <Link key={c} href={`/map?city=${c}`} className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600 hover:border-green-300 hover:text-green-600 transition-colors">
                EV charging {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Ready to find your next charge?</h2>
        <p className="text-slate-500 mt-3">Free forever. No sign-up. Works on any device.</p>
        <Link href="/map" className="inline-flex items-center gap-2 mt-7 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 px-7 py-3.5 rounded-xl transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
          <Zap className="w-4 h-4" /> Open the Live Map <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/ev.png" alt="EV PRO" width={28} height={28} className="rounded-lg" />
            <span className="text-sm font-semibold text-slate-600" style={{ fontFamily: "var(--font-heading)" }}>EV PRO</span>
          </div>
          <p className="text-xs text-slate-400">
            Built by{" "}
            <a href="https://www.esystemlk.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-600 hover:text-green-600">eSystemLK</a>
            {" "}· esystemlk.com
          </p>
        </div>
      </footer>
    </div>
  );
}
