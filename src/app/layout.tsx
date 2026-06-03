import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";
import { IOSInstallBanner } from "@/components/mobile/IOSInstallBanner";
import { I18nProvider } from "@/lib/i18n";

const spaceGrotesk = Space_Grotesk({ variable: "--font-heading", subsets: ["latin"], weight: ["400","500","600","700"] });
const dmSans = DM_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["300","400","500","600"] });

const BASE_URL = "https://evpro.esystemlk.com";

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "EV PRO — EV Charging Places in Sri Lanka | Find EV Charging Points",
    template: "%s | EV PRO Sri Lanka",
  },

  description:
    "Find EV charging places and charging points across Sri Lanka. Interactive map of 300+ electric vehicle charging stations in Colombo, Kandy, Galle, Negombo and all cities. Real-time data, directions and free charging finder.",

  keywords: [
    "EV charging places Sri Lanka",
    "EV charging points Sri Lanka",
    "electric vehicle charging Sri Lanka",
    "EV charging stations Sri Lanka",
    "EV charger Sri Lanka",
    "EV charging Colombo",
    "EV charging Kandy",
    "EV charging Galle",
    "EV charging Negombo",
    "EV charging near me Sri Lanka",
    "electric car charging Sri Lanka",
    "EV charging map Sri Lanka",
    "free EV charging Sri Lanka",
    "24 hour EV charging Sri Lanka",
    "DC fast charger Sri Lanka",
    "Type 2 charger Sri Lanka",
    "CCS charging Sri Lanka",
    "CHAdeMO Sri Lanka",
    "Tesla charging Sri Lanka",
    "LECO EV charging",
    "Lanka IOC EV charging",
    "EV PRO Sri Lanka",
    "best EV charging app Sri Lanka",
    "EV charging Jaffna",
    "EV charging Matara",
    "EV charging Anuradhapura",
    "EV charging Trincomalee",
    "EV charging Kurunegala",
    "EV charging Batticaloa",
    "EV charging Hambantota",
    "EV charging Nuwara Eliya",
    "EV charging Dambulla",
    "EV charging Ratnapura",
    "EV charging Badulla",
    "AC charging Sri Lanka",
    "rapid EV charger Sri Lanka",
    "EV charging hotel Sri Lanka",
    "electric car Sri Lanka charging",
    "where to charge EV in Sri Lanka",
    "EV charging points map",
    "EV charging station locator Sri Lanka",
    "charge electric car Sri Lanka",
    "EV charging cost Sri Lanka",
    "LKR per kWh EV charging",
    "EV charging BYD Sri Lanka",
    "EV charging MG Sri Lanka",
    "EV charging Toyota Sri Lanka",
    "Sri Lanka electric vehicle infrastructure",
    "ev pro",
    "evpro.esystemlk.com",
  ],

  authors: [{ name: "eSystemLK", url: "https://www.esystemlk.com" }],
  creator: "eSystemLK",
  publisher: "eSystemLK",

  alternates: {
    canonical: BASE_URL,
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EV PRO",
  },

  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "EV PRO",
    title: "EV PRO — Find EV Charging Places in Sri Lanka",
    description:
      "Interactive map of 300+ EV charging points across Sri Lanka. Find stations in Colombo, Kandy, Galle and every city. Get directions, road distance and real-time data.",
    locale: "en_US",
    images: [
      {
        url: "/ev.png",
        width: 512,
        height: 512,
        alt: "EV PRO — Sri Lanka EV Charging Map",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "EV PRO — EV Charging Places in Sri Lanka",
    description: "Find 300+ EV charging stations across Sri Lanka. Interactive map with filters, Near Me, and road distance.",
    images: ["/ev.png"],
    creator: "@esystemlk",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    // Add your Google Search Console verification code here when you get it:
    // google: "your-verification-code",
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
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="geo.region" content="LK" />
        <meta name="geo.country" content="Sri Lanka" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="rating" content="general" />
        <link rel="canonical" href={BASE_URL} />
      </head>
      <body className="h-full antialiased">
        <I18nProvider>
          <PWARegister />
          <JsonLd />
          <IOSInstallBanner />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "EV PRO",
        "description": "Find EV charging places and points across Sri Lanka",
        "publisher": {
          "@type": "Organization",
          "@id": `${BASE_URL}/#organization`,
          "name": "eSystemLK",
          "url": "https://www.esystemlk.com",
          "logo": {
            "@type": "ImageObject",
            "url": `${BASE_URL}/ev.png`,
          },
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/?city={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${BASE_URL}/#app`,
        "name": "EV PRO — EV Charging Places Sri Lanka",
        "url": BASE_URL,
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Any",
        "description": "Interactive map showing 300+ EV charging stations across Sri Lanka with real-time data, directions and road distance calculator.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "LKR",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "42",
        },
        "featureList": [
          "EV charging station map Sri Lanka",
          "Near me EV charging finder",
          "Road distance calculator",
          "Advanced filters by charger type",
          "Free charging station finder",
          "24 hour EV charging finder",
          "Community submissions",
          "Daily data sync from Google Places",
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where are the EV charging places in Sri Lanka?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "There are 300+ EV charging places across Sri Lanka including Colombo, Kandy, Galle, Negombo, Matara, Jaffna, Anuradhapura and all major cities. Use EV PRO's interactive map to find charging points near you.",
            },
          },
          {
            "@type": "Question",
            "name": "How much does EV charging cost in Sri Lanka?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "EV charging in Sri Lanka typically costs between LKR 40-50 per kWh. Some stations at hotels and malls offer free charging. LECO EV and Lanka IOC stations charge around LKR 45/kWh.",
            },
          },
          {
            "@type": "Question",
            "name": "What type of EV chargers are available in Sri Lanka?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sri Lanka has AC chargers (Type 2, 7-22kW), DC fast chargers (CCS2, CHAdeMO, 50-150kW) and some AC+DC combo stations. Type 2 is the most common connector.",
            },
          },
          {
            "@type": "Question",
            "name": "Is there free EV charging in Sri Lanka?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, several hotels and resorts in Sri Lanka offer free EV charging for guests including Shangri-La Colombo and various Jetwing and Cinnamon hotels.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
