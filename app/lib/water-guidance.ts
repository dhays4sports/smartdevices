import type { CarrierContext } from "./carrier";

export type WaterCapability = "point-water-detection" | "whole-home-flow-monitoring" | "automatic-main-water-shutoff";
export type WaterCapabilityAssessment = {
  requested?: WaterCapability;
  distinctions: string[];
  confirmationSteps: string[];
  mismatch: boolean;
};

export function assessWaterCapability(context: CarrierContext): WaterCapabilityAssessment {
  const requested = context.requestedCapabilityIds.find((id): id is WaterCapability => ["point-water-detection", "whole-home-flow-monitoring", "automatic-main-water-shutoff"].includes(id));
  const distinctions = [
    "A point sensor detects water only where it is placed.",
    "Whole-home monitoring observes the main water supply but may not include a valve.",
    "Automatic main-line shutoff requires a compatible installed valve and supported configuration.",
  ];
  const mismatch = context.intent === "requirement" && !requested;
  return {
    requested,
    distinctions,
    mismatch,
    confirmationSteps: [
      "Confirm the exact policy or professional-stated capability; public category guidance is not a case requirement.",
      "Confirm pipe size, material, main-line location, permitted installation orientation, and site access.",
      "Confirm nearby power, 2.4 GHz Wi-Fi where required, outage behavior, app/account ownership, and alert recipients.",
      "Confirm qualified installation, activation, post-install function check, and maintenance steps.",
      "Ask the Farmers agent which model and documentation, if any, are accepted for this policy and property.",
    ],
  };
}

export function waterClassSatisfies(requested: WaterCapability, provided: WaterCapability): boolean {
  return requested === provided;
}
