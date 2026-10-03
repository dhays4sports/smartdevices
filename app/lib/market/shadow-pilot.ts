import type { ScanResult } from "../scan";
import { buildCommercialIntent } from "./commercial-intent";
import type { CommercialIntentEnvelope } from "./contract";
import type { SponsoredFulfillmentPreview } from "./preview";

export function isWaterShutoffPilotScan(scan: ScanResult): boolean {
  return scan.domainId === "home"
    && scan.primaryConcernId === "water"
    && scan.recommendations.some((item) => item.device.capabilities.some((capability) => /automatic shutoff/i.test(capability)));
}

export function buildWaterShutoffShadowIntent(
  scan: ScanResult,
  createdAt = new Date().toISOString(),
  programContext?: CommercialIntentEnvelope["programContext"],
): CommercialIntentEnvelope | null {
  if (!isWaterShutoffPilotScan(scan)) return null;
  return buildCommercialIntent(scan, {
    createdAt,
    jurisdiction: "US-CA",
    programContext,
    commercialStage: "active-consideration",
    commercialization: {
      sponsoredPlacementAllowed: true,
      directProviderContactAllowed: false,
      personalDataSharingAllowed: false,
    },
  });
}

export async function submitWaterShutoffShadow(
  scan: ScanResult,
  options: { previewRequested?: boolean; fetcher?: typeof fetch; programContext?: CommercialIntentEnvelope["programContext"] } = {},
): Promise<SponsoredFulfillmentPreview | null> {
  const intent = buildWaterShutoffShadowIntent(scan, new Date().toISOString(), options.programContext);
  if (!intent) return null;
  const fetcher = options.fetcher ?? fetch;
  try {
    const response = await fetcher(`/api/market/shadow${options.previewRequested ? "?preview=1" : ""}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(intent),
      keepalive: true,
    });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null) as { preview?: SponsoredFulfillmentPreview } | null;
    return options.previewRequested ? payload?.preview ?? null : null;
  } catch {
    // Shadow-market failure must never alter or block SmartDevices recommendations.
    return null;
  }
}
