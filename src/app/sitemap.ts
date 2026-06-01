import type { MetadataRoute } from "next";

const BASE = "https://evpro.esystemlk.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const cities = [
    "colombo", "kandy", "galle", "negombo", "matara",
    "kurunegala", "jaffna", "anuradhapura", "trincomalee",
    "batticaloa", "ratnapura", "badulla", "nuwara-eliya",
    "hambantota", "dambulla",
  ];

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...cities.map((city) => ({
      url: `${BASE}/?city=${city}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
