"use client";
import { Globe } from "lucide-react";
import { useI18n, LANG_NAMES, type Lang } from "@/lib/i18n";
import { haptic } from "@/lib/haptics";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const langs: Lang[] = ["en", "si", "ta"];

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5">
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => { haptic("light"); setLang(l); }}
          className={`text-xs px-2 py-1 rounded-full font-medium transition-all ${
            lang === l ? "bg-white text-green-700 shadow-sm" : "text-slate-500"
          }`}
        >
          {LANG_NAMES[l]}
        </button>
      ))}
    </div>
  );
}
