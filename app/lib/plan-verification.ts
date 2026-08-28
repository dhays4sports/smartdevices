export type VerificationActor = "consumer" | "professional" | "carrier" | "system";
export type VerificationEventType = "researching" | "selected" | "purchased-self-reported" | "installation-scheduled" | "installed-self-reported" | "evidence-received" | "professional-reviewed" | "carrier-determined" | "carrier-unknown";
export type Determination = "accepted" | "rejected" | "unknown" | "not-applicable";
export type VerificationEvent = { id: string; planId: string; recommendationId?: string; actorType: VerificationActor; eventType: VerificationEventType; determination: Determination; assertionSource: string; idempotencyKey: string; occurredAt: string };

const allowed: Record<VerificationActor, VerificationEventType[]> = {
  consumer: ["researching", "selected", "purchased-self-reported", "installation-scheduled", "installed-self-reported"],
  professional: ["researching", "selected", "installation-scheduled", "evidence-received", "professional-reviewed"],
  carrier: ["carrier-determined", "carrier-unknown"],
  system: ["evidence-received"],
};

export function canRecordVerification(actor: VerificationActor, eventType: VerificationEventType): boolean { return allowed[actor].includes(eventType); }

export function createVerificationEvent(input: Omit<VerificationEvent, "id" | "occurredAt">): VerificationEvent {
  if (!/^plan_[A-Za-z0-9_-]{4,100}$/.test(input.planId) || !/^idem_[A-Za-z0-9_-]{8,120}$/.test(input.idempotencyKey)) throw new Error("INVALID_VERIFICATION_ENVELOPE");
  if (!canRecordVerification(input.actorType, input.eventType)) throw new Error("VERIFICATION_ACTOR_FORBIDDEN");
  if (input.eventType === "carrier-determined" && input.determination === "not-applicable") throw new Error("DETERMINATION_REQUIRED");
  if (input.eventType !== "carrier-determined" && input.determination !== "not-applicable" && input.eventType !== "carrier-unknown") throw new Error("DETERMINATION_NOT_ALLOWED");
  return { ...input, id: `verify_${crypto.randomUUID()}`, occurredAt: new Date().toISOString() };
}

export type EvidenceUploadMetadata = { planId: string; recommendationId?: string; documentClass: "receipt" | "installer-invoice" | "activation-record" | "monitoring-certificate"; retentionPolicyVersion: string };
export interface EvidenceUploadAdapter { requestUpload(metadata: EvidenceUploadMetadata): Promise<{ uploadId: string; status: "pending-scan" }> }
export class DisabledEvidenceUploadAdapter implements EvidenceUploadAdapter { async requestUpload(metadata: EvidenceUploadMetadata): Promise<never> { void metadata; throw new Error("EVIDENCE_UPLOAD_NOT_ACTIVATED"); } }
