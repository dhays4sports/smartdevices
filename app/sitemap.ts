import type { MetadataRoute } from "next";
import { devices } from "@/app/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://smartdevices.com";
  const fixed = ["", "/connect", "/build", "/insurance", "/farmers", "/devices", "/compare", "/about", "/index", "/research", "/partners", "/accessibility", "/privacy", "/terms", "/disclosures", "/protect/home", "/protect/vehicle", "/protect/family", "/protect/business"];
  return [...fixed.map((path) => ({ url: `${base}${path}`, lastModified: path === "/build" ? "2026-09-16" : "2026-08-26", changeFrequency: path === "/insurance" || path === "/farmers" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : path === "/insurance" || path === "/farmers" ? .9 : .6 })), ...devices.filter((device) => device.status === "active").map((device) => ({ url: `${base}/devices/${device.slug}`, lastModified: device.lastReviewed, changeFrequency: "monthly" as const, priority: .7 }))];
}
