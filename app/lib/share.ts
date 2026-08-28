export type ShareDeliveryState = "not-requested" | "adapter-disabled" | "accepted" | "failed";
export type ShareRequest = { planId: string; recipientRef: string; consentPurpose: "protection-plan"; requestedAt: string };
export interface PlanShareAdapter {
  deliver(request: ShareRequest): Promise<{ state: Exclude<ShareDeliveryState, "not-requested">; externalReference?: string }>;
}
export class DisabledPlanShareAdapter implements PlanShareAdapter {
  async deliver(request: ShareRequest): Promise<{ state: "adapter-disabled" }> {
    void request;
    return { state: "adapter-disabled" };
  }
}
export class MemoryPlanShareAdapter implements PlanShareAdapter {
  readonly requests: ShareRequest[] = [];
  async deliver(request: ShareRequest): Promise<{ state: "accepted"; externalReference: string }> {
    this.requests.push(structuredClone(request));
    return { state: "accepted", externalReference: `test-${this.requests.length}` };
  }
}
