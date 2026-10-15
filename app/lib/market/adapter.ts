import type { CommercialIntentEnvelope, MarketOutcome, MarketResult, ProviderOffer } from "./contract";
import { disclosureForOffers } from "./disclosure";
import { filterEligibleOffers } from "./provider-offer";

export interface MarketAdapter {
  createOpportunity(intent: CommercialIntentEnvelope): Promise<MarketResult>;
  recordOutcome(outcome: MarketOutcome): Promise<{ status: "recorded" | "disabled" }>;
}

export class DisabledMarketAdapter implements MarketAdapter {
  async createOpportunity(intent: CommercialIntentEnvelope): Promise<MarketResult> {
    void intent;
    return { status: "disabled", offers: [] };
  }

  async recordOutcome(outcome: MarketOutcome): Promise<{ status: "disabled" }> {
    void outcome;
    return { status: "disabled" };
  }
}

export class ShadowMarketAdapter implements MarketAdapter {
  readonly opportunities: CommercialIntentEnvelope[] = [];
  readonly outcomes: MarketOutcome[] = [];

  constructor(private readonly fixtureOffers: ProviderOffer[] = []) {}

  async createOpportunity(intent: CommercialIntentEnvelope): Promise<MarketResult> {
    this.opportunities.push(structuredClone(intent));
    if (!intent.commercialization.sponsoredPlacementAllowed) return { status: "shadow", offers: [] };
    const offers = filterEligibleOffers(this.fixtureOffers, intent);
    return {
      status: "shadow",
      opportunityId: `shadow_${intent.intentId}`,
      offers,
      disclosure: disclosureForOffers(offers),
    };
  }

  async recordOutcome(outcome: MarketOutcome): Promise<{ status: "recorded" }> {
    this.outcomes.push(structuredClone(outcome));
    return { status: "recorded" };
  }
}

export class HttpMarketAdapter implements MarketAdapter {
  constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch) {}

  async createOpportunity(intent: CommercialIntentEnvelope): Promise<MarketResult> {
    const response = await this.fetcher(`${this.endpoint.replace(/\/$/, "")}/v1/opportunities`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(intent),
    });
    if (!response.ok) throw new Error("MARKET_ADAPTER_REQUEST_FAILED");
    return (await response.json()) as MarketResult;
  }

  async recordOutcome(outcome: MarketOutcome): Promise<{ status: "recorded" | "disabled" }> {
    const response = await this.fetcher(`${this.endpoint.replace(/\/$/, "")}/v1/outcomes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(outcome),
    });
    if (!response.ok) throw new Error("MARKET_OUTCOME_REQUEST_FAILED");
    return { status: "recorded" };
  }
}
