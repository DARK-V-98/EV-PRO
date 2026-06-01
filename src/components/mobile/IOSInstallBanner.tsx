"use client";
import Image from "next/image";
import { X } from "lucide-react";
import { useIOSInstall } from "@/hooks/useIOSInstall";

export function IOSInstallBanner() {
  const { show, dismiss } = useIOSInstall();

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Banner — slides up from bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[2001] bg-white rounded-t-3xl px-5 pt-5 pb-8"
        style={{
          boxShadow: "0 -8px 40px rgba(15,23,42,0.2)",
          animation: "slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Image src="/ev.png" alt="EV PRO" width={48} height={48} className="rounded-2xl shadow-sm" />
            <div>
              <p className="font-bold text-slate-900 text-base" style={{ fontFamily: "var(--font-heading)" }}>
                Install EV PRO
              </p>
              <p className="text-xs text-slate-400">Add to your Home Screen</p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-5">
          <Step number={1}>
            <span className="text-slate-600 text-sm">
              Tap the{" "}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-xs font-semibold text-slate-700 mx-0.5">
                <ShareIcon /> Share
              </span>{" "}
              button at the bottom of Safari
            </span>
          </Step>

          <Step number={2}>
            <span className="text-slate-600 text-sm">
              Scroll down and tap{" "}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-xs font-semibold text-slate-700 mx-0.5">
                <PlusSquareIcon /> Add to Home Screen
              </span>
            </span>
          </Step>

          <Step number={3}>
            <span className="text-slate-600 text-sm">
              Tap <span className="font-semibold text-green-600">Add</span> in the top right — done! ✓
            </span>
          </Step>
        </div>

        {/* Visual hint arrow */}
        <div className="flex items-center justify-center gap-2 py-2 rounded-2xl bg-green-50 border border-green-200">
          <span className="text-sm text-green-700 font-medium">Look for</span>
          <ShareIcon className="text-green-600" size={18} />
          <span className="text-sm text-green-700 font-medium">at the bottom of your screen</span>
        </div>
      </div>
    </>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
        style={{ background: "#16a34a", fontFamily: "var(--font-heading)" }}
      >
        {number}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ShareIcon({ className = "text-slate-600", size = 14 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16,6 12,2 8,6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
