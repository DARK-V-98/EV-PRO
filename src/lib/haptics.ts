/**
 * Lightweight haptic feedback helper.
 * Uses the Vibration API (Android Chrome). Silently no-ops on iOS/unsupported.
 */
type HapticKind = "light" | "medium" | "success" | "error";

const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 10,
  medium: 20,
  success: [15, 40, 15],
  error: [40, 30, 40],
};

export function haptic(kind: HapticKind = "light") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(PATTERNS[kind]);
    } catch {
      /* no-op */
    }
  }
}
