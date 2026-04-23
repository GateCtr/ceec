import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/gestion/",
          "/api/",
          "/c/mon-espace",
          "/c/connexion",
          "/c/inscription",
          "/c/oauth-callback",
          "/setup/",
          "/marathon-scan/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
