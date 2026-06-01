import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://evpro.esystemlk.com/sitemap.xml",
    host: "https://evpro.esystemlk.com",
  };
}
