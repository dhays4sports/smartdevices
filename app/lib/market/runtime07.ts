import { createHash, randomUUID, sign } from "node:crypto";
import type { CommercialIntentEnvelope } from "./contract";
import { resolveOfferIdentity, type OfferIdentityReceipt } from "./offer-identity";

export type Market07ShadowConfig = {
  endpoint: string;
  publisherId: string;
  keyId: string;
  privateKeyPem: string;
  marketId: string;
  jurisdiction: string;
};

export type Market07ShadowResult = {
  status: "shadow" | "no-market";
  opportunityId: string;
  allocationId?: string;
  allocationReceiptId?: string;
  bidId?: string;
  providerId?: string;
  clearingAmount?: number;
  currency?: string;
  offerIdentity?: OfferIdentityReceipt;
  evaluated: Array<{ id: string; providerId: string; eligible: boolean; reason?: string; score?: number }>;
};

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonical(object[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function requestSigningPayload(method: string, path: string, timestamp: string, nonce: string, body: unknown): string {
  return `${method.toUpperCase()}\n${path}\n${timestamp}\n${nonce}\n${sha256(canonical(body ?? {}))}`;
}

function signedHeaders(config: Market07ShadowConfig, method: string, path: string, body: unknown): Record<string, string> {
  const timestamp = new Date().toISOString();
  const nonce = randomUUID();
  const payload = requestSigningPayload(method, path, timestamp, nonce, body);
  const signature = sign(null, Buffer.from(payload), config.privateKeyPem).toString("base64");
  return {
    "content-type": "application/json",
    "x-market-identity-id": config.publisherId,
    "x-market-key-id": config.keyId,
    "x-market-timestamp": timestamp,
    "x-market-nonce": nonce,
    "x-market-signature": signature,
  };
}

function marketIntent(intent: CommercialIntentEnvelope): string {
  if (intent.domain === "home" && intent.concernId === "water" && intent.requiredCapabilities.some((capability) => /automatic shutoff/i.test(capability))) {
    return "automatic_water_shutoff";
  }
  throw new Error("MARKET_PILOT_INTENT_NOT_SUPPORTED");
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`MARKET_07_${response.status}:${JSON.stringify(json)}`);
  return json as Record<string, unknown>;
}

export async function runMarket07Shadow(
  intent: CommercialIntentEnvelope,
  config: Market07ShadowConfig,
  fetcher: typeof fetch = fetch,
): Promise<Market07ShadowResult> {
  const path = "/v1/opportunities";
  const opportunityBody = {
    opportunity_id: `sd_${sha256(intent.intentId).slice(0, 20)}`,
    external_event_id: intent.intentId,
    market_id: config.marketId,
    intent: marketIntent(intent),
    jurisdiction: config.jurisdiction,
    publisher_id: config.publisherId,
    permissions: {
      commercialization_allowed: true,
      sponsored_placement: true,
      direct_contact_allowed: false,
      data_sharing: "none",
    },
    context: {
      source: "smartdevices.com",
      mode: "shadow",
      domain: intent.domain,
      concern_id: intent.concernId,
      eligible_device_ids: intent.eligibleDeviceIds,
      required_capabilities: intent.requiredCapabilities,
      commercial_stage: intent.commercialStage,
      program_context: intent.programContext ?? null,
    },
  };
  const idempotencyKey = `sd-shadow-${sha256(intent.intentId).slice(0, 32)}`;
  const opportunityResponse = await fetcher(`${config.endpoint.replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: { ...signedHeaders(config, "POST", path, opportunityBody), "idempotency-key": idempotencyKey },
    body: JSON.stringify(opportunityBody),
    cache: "no-store",
  });
  const opportunity = await readJson(opportunityResponse);
  const opportunityId = String(opportunity.opportunity_id ?? opportunityBody.opportunity_id);

  const clearPath = `/v1/opportunities/${encodeURIComponent(opportunityId)}/clear`;
  const clearResponse = await fetcher(`${config.endpoint.replace(/\/$/, "")}${clearPath}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
    cache: "no-store",
  });
  const cleared = await readJson(clearResponse);
  const allocation = (cleared.allocation ?? null) as Record<string, unknown> | null;
  const evaluated = Array.isArray(cleared.evaluated) ? cleared.evaluated as Market07ShadowResult["evaluated"] : [];
  if (!allocation) return { status: "no-market", opportunityId, evaluated };

  const allocationId = String(allocation.allocation_id);
  const allocationReceiptId = allocation.receipt_id ? String(allocation.receipt_id) : undefined;
  const bidId = allocation.bid_id ? String(allocation.bid_id) : undefined;
  const providerId = allocation.provider_id ? String(allocation.provider_id) : undefined;

  // MARKET-0.7 binds the allocation receipt to provider_id + bid_id. Resolve the
  // bid's canonical SmartDevices fulfillment payload separately and never infer
  // a device from provider identity, name, URL, or free-form marketing copy.
  let offerIdentity: OfferIdentityReceipt | undefined;
  try {
    const base = config.endpoint.replace(/\/$/, "");
    const [bidsResponse, providersResponse] = await Promise.all([
      fetcher(`${base}/v1/bids`, { cache: "no-store" }),
      fetcher(`${base}/v1/providers`, { cache: "no-store" }),
    ]);
    const bids = bidsResponse.ok ? await bidsResponse.json() : [];
    const providers = providersResponse.ok ? await providersResponse.json() : [];
    offerIdentity = resolveOfferIdentity({
      intent, allocationId, allocationReceiptId, bidId, providerId,
      bids: Array.isArray(bids) ? bids : [],
      providers: Array.isArray(providers) ? providers : [],
    });
  } catch {
    offerIdentity = resolveOfferIdentity({ intent, allocationId, allocationReceiptId, bidId, providerId, bids: [], providers: [] });
  }

  return {
    status: "shadow",
    opportunityId,
    allocationId,
    allocationReceiptId,
    bidId,
    providerId,
    clearingAmount: typeof allocation.clearing_amount === "number" ? allocation.clearing_amount : undefined,
    currency: allocation.currency ? String(allocation.currency) : undefined,
    offerIdentity,
    evaluated,
  };
}
