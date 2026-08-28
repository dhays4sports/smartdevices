export type ConnectedHomeFacts = { localControl?: boolean; cloudRequired?: boolean; subscriptionRequired?: boolean; ecosystemSupported?: boolean; evidenceCurrent?: boolean };
export type ConnectedHomeAssessment = { capabilities: string[]; unknowns: string[]; carrierEligible: false };

export function assessConnectedHome(facts: ConnectedHomeFacts): ConnectedHomeAssessment {
  const capabilities: string[] = [];
  const unknowns: string[] = [];
  if (facts.localControl === true) capabilities.push("Manufacturer evidence indicates a supported local-control path.");
  else if (facts.localControl === undefined) unknowns.push("Local-control behavior is unknown.");
  if (facts.cloudRequired === true) capabilities.push("Some functions depend on the provider cloud and may be unavailable during an outage.");
  else if (facts.cloudRequired === undefined) unknowns.push("Cloud dependency and outage behavior are unknown.");
  if (facts.subscriptionRequired === undefined) unknowns.push("Subscription requirements are unknown.");
  if (facts.ecosystemSupported === false) unknowns.push("The selected ecosystem is unsupported for the stated integration.");
  if (facts.evidenceCurrent !== true) unknowns.push("Technical integration evidence is missing or stale.");
  return { capabilities, unknowns, carrierEligible: false };
}
