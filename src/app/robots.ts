import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Endpoints internos e payloads RSC (?_rsc=) não são páginas.
      disallow: ["/api/", "/*?_rsc=", "/*&_rsc="],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
