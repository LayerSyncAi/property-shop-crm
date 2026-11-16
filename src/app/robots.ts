import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/marketing";

/** Public pages are crawlable; the signed-in app, portals and API are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/portal", "/api"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
