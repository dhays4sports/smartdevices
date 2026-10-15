import catalogJson from "@/content/catalog.json";
import domainsJson from "@/content/domains.json";

export type DomainId = "home" | "vehicle" | "family" | "business";

export type Concern = {
  id: string;
  label: string;
  prompt: string;
  why: string;
  stages: string[];
  position: { x: number; y: number };
};

export type ProtectionDomain = {
  id: DomainId;
  label: string;
  headline: string;
  description: string;
  scene: string;
  concerns: Concern[];
};

export type DeviceSource = { title: string; url: string };

export type Device = {
  id: string;
  slug: string;
  manufacturer: string;
  model: string;
  domains: DomainId[];
  concerns: string[];
  solution: string;
  summary: string;
  bestFor: string;
  priceBand: string;
  installation: string;
  subscription: string;
  connectivity: string;
  monitoring: string;
  capabilities: string[];
  limitations: string[];
  insuranceNote: string;
  status: "active" | "stale" | "archived";
  editorialStatus: "verified" | "review-required" | "retired";
  commercialStatus: "none" | "affiliate" | "sponsored";
  availability?: "available" | "unavailable" | "unknown";
  lastReviewed: string;
  sources: DeviceSource[];
};

export const domains = domainsJson as ProtectionDomain[];
type CatalogRecord = Omit<Device, "editorialStatus" | "commercialStatus">;
export const devices: Device[] = (catalogJson as CatalogRecord[]).map((device) => ({
  ...device,
  editorialStatus: device.status === "active" ? "verified" : device.status === "stale" ? "review-required" : "retired",
  commercialStatus: "none",
  availability: device.availability ?? "unknown",
}));

export function getDomain(id: string): ProtectionDomain | undefined {
  return domains.find((domain) => domain.id === id);
}

export function getConcern(domainId: string, concernId: string): Concern | undefined {
  return getDomain(domainId)?.concerns.find((concern) => concern.id === concernId);
}

export function getDeviceBySlug(slug: string): Device | undefined {
  return devices.find((device) => device.slug === slug);
}

export function getDeviceById(id: string): Device | undefined {
  return devices.find((device) => device.id === id);
}

export function devicesForConcern(domainId: string, concernId: string, publishedDevices: Device[] = devices): Device[] {
  return publishedDevices
    .filter(
      (device) =>
        device.status === "active" &&
        device.domains.includes(domainId as DomainId) &&
        device.concerns.includes(concernId),
    )
    .sort((a, b) => {
      const aSubscription = /no required|without a required/i.test(a.subscription) ? 0 : 1;
      const bSubscription = /no required|without a required/i.test(b.subscription) ? 0 : 1;
      return aSubscription - bSubscription || a.manufacturer.localeCompare(b.manufacturer);
    })
    .slice(0, 3);
}

export function formatReviewed(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export const intentOptions = [
  { id: "already-have", label: "I already have this" },
  { id: "interested", label: "I’m interested" },
  { id: "help-choose", label: "Help me choose" },
  { id: "installation-help", label: "I want installation help" },
  { id: "verify-carrier", label: "Verify this with my carrier" },
  { id: "maybe-later", label: "Maybe later" },
  { id: "not-relevant", label: "Not relevant" },
] as const;
