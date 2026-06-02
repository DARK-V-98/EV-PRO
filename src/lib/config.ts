/** Central config — update these for your deployment. */

// WhatsApp business number in international format, no + or spaces.
// Example: 94771234567 for +94 77 123 4567
export const WHATSAPP_NUMBER = "94771234567";

export function whatsappReportLink(): string {
  const msg = encodeURIComponent(
    "Hi EV PRO 👋 I'd like to report a new EV charging station:\n\n" +
    "📍 Location/Name:\n" +
    "🗺️ Google Maps link:\n" +
    "⚡ Charger type (AC/DC):\n" +
    "🔌 Connector:\n" +
    "💡 Any other info:"
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}
