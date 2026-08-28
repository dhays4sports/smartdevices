export type PlanEngagementState = "generated" | "shared-by-adapter" | "viewed" | "client-responded" | "archived";
export type DeliveryRequest = { planId: string; consentVersion: string; expiresAt: string; revokedAt?: string; suppressed: boolean; contactPreference: "email" | "sms" | "voice"; idempotencyKey: string };
export type DeliveryResult = { accepted: boolean; providerReference?: string };
export interface PlanDeliveryAdapter { deliver(request: DeliveryRequest): Promise<DeliveryResult> }
export class DisabledPlanDeliveryAdapter implements PlanDeliveryAdapter { async deliver(request: DeliveryRequest): Promise<never> { void request; throw new Error("PLAN_DELIVERY_ADAPTER_NOT_ACTIVATED"); } }
export class MemoryPlanDeliveryAdapter implements PlanDeliveryAdapter {
  private accepted = new Map<string, string>();
  async deliver(request: DeliveryRequest): Promise<DeliveryResult> {
    validateDeliveryRequest(request);
    const prior = this.accepted.get(request.idempotencyKey);
    if (prior) return { accepted: true, providerReference: prior };
    const reference = `memory_${this.accepted.size + 1}`; this.accepted.set(request.idempotencyKey, reference); return { accepted: true, providerReference: reference };
  }
}

export async function deliverWithTimeout(adapter: PlanDeliveryAdapter, request: DeliveryRequest, timeoutMs = 5_000): Promise<DeliveryResult> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30_000) throw new Error("INVALID_DELIVERY_TIMEOUT");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      adapter.deliver(request),
      new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error("PLAN_DELIVERY_TIMEOUT")), timeoutMs); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function validateDeliveryRequest(request: DeliveryRequest, now = new Date()): void {
  if (!/^plan_[A-Za-z0-9_-]{4,100}$/.test(request.planId) || !/^idem_[A-Za-z0-9_-]{8,120}$/.test(request.idempotencyKey)) throw new Error("INVALID_DELIVERY_REQUEST");
  if (!request.consentVersion) throw new Error("CONSENT_REQUIRED");
  if (request.suppressed) throw new Error("DELIVERY_SUPPRESSED");
  if (request.revokedAt) throw new Error("PLAN_REVOKED");
  if (!Number.isFinite(Date.parse(request.expiresAt)) || Date.parse(request.expiresAt) <= now.getTime()) throw new Error("PLAN_EXPIRED");
}

export function stateAfterDelivery(current: PlanEngagementState, result: DeliveryResult): PlanEngagementState { return current === "generated" && result.accepted ? "shared-by-adapter" : current; }
export function recordView(): { state: "viewed"; clientIntent: null; fulfillmentChanged: false } { return { state: "viewed", clientIntent: null, fulfillmentChanged: false }; }
