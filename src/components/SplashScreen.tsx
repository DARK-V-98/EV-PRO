"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Minimum display time so the brand is seen, then fade out.
    const MIN = 1600;
    const start = Date.now();

    const finish = () => {
      const wait = Math.max(0, MIN - (Date.now() - start));
      setTimeout(() => setHidden(true), wait);
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    return () => window.removeEventListener("load", finish);
  }, []);

  useEffect(() => {
    if (hidden) {
      const t = setTimeout(() => setRemoved(true), 600); // match transition
      return () => clearTimeout(t);
    }
  }, [hidden]);

  if (removed) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        background: "linear-gradient(160deg, #ffffff 0%, #ecfdf5 55%, #d1fae5 100%)",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center" style={{ animation: "splashPop 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-40" style={{ background: "#16a34a" }} />
          <Image src="/ev.png" alt="EV PRO" width={96} height={96} priority className="relative rounded-3xl shadow-lg" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
          EV <span className="text-green-600">PRO</span>
        </h1>
        <p className="mt-1 text-xs text-slate-400">Sri Lanka EV Charging &amp; Services</p>
      </div>

      {/* Loading bar */}
      <div className="mt-8 w-40 h-1 rounded-full bg-green-100 overflow-hidden">
        <div className="h-full bg-green-500 rounded-full" style={{ animation: "splashBar 1.6s ease-in-out infinite" }} />
      </div>

      {/* Credit */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-0.5"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <p className="text-xs text-slate-400">Built by</p>
        <a href="https://www.esystemlk.com" target="_blank" rel="noopener noreferrer"
          className="text-sm font-bold text-slate-700" style={{ fontFamily: "var(--font-heading)" }}>
          eSystemLK
        </a>
        <p className="text-xs text-slate-400">www.esystemlk.com</p>
      </div>
    </div>
  );
}
