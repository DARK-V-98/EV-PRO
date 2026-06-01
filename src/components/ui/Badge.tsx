import { cn } from "@/lib/utils";
import type { ChargerType } from "@/types/station";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide border", className)}>
      {children}
    </span>
  );
}

export function ChargerBadge({ type }: { type: ChargerType }) {
  const styles: Record<ChargerType, string> = {
    AC:     "text-green-700  border-green-200  bg-green-50",
    DC:     "text-sky-700    border-sky-200    bg-sky-50",
    "AC+DC":"text-violet-700 border-violet-200 bg-violet-50",
  };
  return <Badge className={styles[type]}>{type}</Badge>;
}

export function SpeedBadge({ kw }: { kw: number }) {
  const style = kw > 50
    ? "text-orange-700 border-orange-200 bg-orange-50"
    : kw > 22
    ? "text-sky-700 border-sky-200 bg-sky-50"
    : "text-slate-600 border-slate-200 bg-slate-50";
  return <Badge className={style}>{kw} kW</Badge>;
}

export function VerifiedBadge() {
  return <Badge className="text-green-700 border-green-200 bg-green-50">✓ Verified</Badge>;
}
