import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/plans/", "/my-plan", "/pro/workspace", "/insurance/farmers"] }, sitemap: "https://smartdevices.com/sitemap.xml", host: "https://smartdevices.com" };
}
