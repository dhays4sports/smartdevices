import { carrierIntents, sanitizeCarrierQueryValue, type CarrierIntent } from "./carrier-contract";
import type { CarrierCategory } from "./carrier";

export const carrierCategories = ["water", "gas", "security", "connected-home"] as const;
export type CarrierRouteContext = { intent?: CarrierIntent; category?: CarrierCategory };

export function sanitizeCarrierRoute(search: Record<string, string | string[] | undefined>): CarrierRouteContext {
  return {
    intent: sanitizeCarrierQueryValue(search.intent, carrierIntents) as CarrierIntent | undefined,
    category: sanitizeCarrierQueryValue(search.category, carrierCategories) as CarrierCategory | undefined,
  };
}

export function canonicalCarrierHref(context: CarrierRouteContext, basePath = "/farmers"): string {
  const query = new URLSearchParams();
  if (context.intent) query.set("intent", context.intent);
  if (context.category) query.set("category", context.category);
  const suffix = query.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}
