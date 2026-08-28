import { getDeviceById } from "./data";
import type { CarrierCategory } from "./carrier";

const idsByCategory: Record<CarrierCategory, string[]> = { water: ["kidde-water-freeze"], gas: [], security: ["ring-alarm-pro"], "connected-home": ["ting-sensor-service"] };

export function independentRecommendations(category: CarrierCategory) {
  return idsByCategory[category].map(getDeviceById).filter((device) => Boolean(device)).slice(0, 2);
}
