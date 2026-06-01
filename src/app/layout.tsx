import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

const spaceGrotesk = Space_Grotesk({ variable: "--font-heading", subsets: ["latin"], weight: ["400","500","600","700"] });
const dmSans = DM_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["300","400","500","600"] });

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "EV PRO — Sri Lanka EV Charging Map",
  description: "Find EV charging stations across Sri Lanka",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EV PRO",
  },
  icons: {
    icon: "/ev.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "EV PRO — Sri Lanka EV Charging Map",
    description: "Find EV charging stations across Sri Lanka",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} h-full`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EV PRO" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="mask-icon" href="/icons/icon.svg" color="#16a34a" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="h-full antialiased overflow-hidden">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
