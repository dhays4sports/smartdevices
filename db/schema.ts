import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  ownerSubject: text("owner_subject"),
  writeTokenHash: text("write_token_hash"),
  schemaVersion: integer("schema_version").notNull().default(1),
  status: text("status", { enum: ["draft", "generated", "shared", "viewed", "client-responded", "archived", "expired", "revoked"] }).notNull(),
  domain: text("domain", { enum: ["home", "vehicle", "family", "business"] }).notNull(),
  concernId: text("concern_id").notNull(),
  scanSessionId: text("scan_session_id"),
  selectedConcernIdsJson: text("selected_concern_ids_json"),
  rationaleJson: text("rationale_json"),
  assumptionsJson: text("assumptions_json"),
  unknownsJson: text("unknowns_json"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text("expires_at"),
  revokedAt: text("revoked_at"),
}, (table) => [index("plans_owner_idx").on(table.ownerSubject), index("plans_status_idx").on(table.status)]);

export const scanSessions = sqliteTable("scan_sessions", {
  id: text("id").primaryKey(),
  schemaVersion: integer("schema_version").notNull(),
  questionSetVersion: integer("question_set_version").notNull(),
  domain: text("domain", { enum: ["home", "vehicle"] }).notNull(),
  primaryConcernId: text("primary_concern_id").notNull(),
  status: text("status", { enum: ["in-progress", "completed", "expired", "revoked"] }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
  expiresAt: text("expires_at"),
}, (table) => [index("scan_sessions_status_idx").on(table.status)]);

export const scanResponses = sqliteTable("scan_responses", {
  id: text("id").primaryKey(),
  scanSessionId: text("scan_session_id").notNull().references(() => scanSessions.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  optionId: text("option_id").notNull(),
  answeredAt: text("answered_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("scan_response_unique").on(table.scanSessionId, table.questionId)]);

export const planRecommendations = sqliteTable("plan_recommendations", {
  id: text("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull(),
  origin: text("origin", { enum: ["consumer-explorer", "agent", "coveragefit", "template"] }).notNull(),
  priority: text("priority", { enum: ["essential-consideration", "strong-fit", "optional", "informational"] }).notNull(),
  rationale: text("rationale").notNull(),
  position: integer("position").notNull(),
  solutionType: text("solution_type", { enum: ["commercial", "carrier-required", "carrier-compatible", "diy", "smartdevices-build", "professional-install"] }),
  insuranceStatus: text("insurance_status", { enum: ["required", "qualifying", "potentially-qualifying", "informational-only", "not-applicable", "needs-verification"] }),
  builderProjectId: text("builder_project_id"),
}, (table) => [uniqueIndex("plan_device_unique").on(table.planId, table.deviceId)]);

export const planResponses = sqliteTable("plan_responses", {
  id: text("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  recommendationId: text("recommendation_id").notNull().references(() => planRecommendations.id, { onDelete: "cascade" }),
  assertedBy: text("asserted_by", { enum: ["client", "agent", "system", "partner"] }).notNull(),
  intent: text("intent"),
  fulfillment: text("fulfillment", { enum: ["no-action", "researching", "selected", "purchased", "installation-scheduled", "installed-self-reported", "evidence-received", "verified"] }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("responses_plan_idx").on(table.planId)]);

export const planVerificationEvents = sqliteTable("plan_verification_events", {
  id: text("id").primaryKey(),
  planId: text("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  recommendationId: text("recommendation_id").references(() => planRecommendations.id, { onDelete: "set null" }),
  actorType: text("actor_type", { enum: ["consumer", "professional", "carrier", "system"] }).notNull(),
  eventType: text("event_type", { enum: ["researching", "selected", "purchased-self-reported", "installation-scheduled", "installed-self-reported", "evidence-received", "professional-reviewed", "carrier-determined", "carrier-unknown"] }).notNull(),
  determination: text("determination", { enum: ["accepted", "rejected", "unknown", "not-applicable"] }).notNull().default("not-applicable"),
  assertionSource: text("assertion_source").notNull(),
  idempotencyKeyHash: text("idempotency_key_hash").notNull(),
  metadataJson: text("metadata_json").notNull().default("{}"),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("verification_plan_idx").on(table.planId), uniqueIndex("verification_idempotency_unique").on(table.idempotencyKeyHash)]);

export const agentProfiles = sqliteTable("agent_profiles", {
  subject: text("subject").primaryKey(),
  displayName: text("display_name").notNull(),
  agencyName: text("agency_name"),
  email: text("email"),
  phone: text("phone"),
  status: text("status", { enum: ["active", "suspended", "deleted"] }).notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const planTemplates = sqliteTable("plan_templates", {
  id: text("id").primaryKey(),
  ownerSubject: text("owner_subject").notNull(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  concernId: text("concern_id").notNull(),
  deviceIdsJson: text("device_ids_json").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("templates_owner_idx").on(table.ownerSubject)]);

export const consentEvents = sqliteTable("consent_events", {
  id: text("id").primaryKey(),
  planId: text("plan_id").references(() => plans.id, { onDelete: "set null" }),
  subjectRef: text("subject_ref"),
  purpose: text("purpose").notNull(),
  action: text("action", { enum: ["granted", "withdrawn"] }).notNull(),
  policyVersion: text("policy_version").notNull(),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorType: text("actor_type", { enum: ["anonymous", "client", "agent", "system", "partner"] }).notNull(),
  actorRef: text("actor_ref"),
  action: text("action").notNull(),
  objectType: text("object_type").notNull(),
  objectId: text("object_id").notNull(),
  metadataJson: text("metadata_json").notNull().default("{}"),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("audit_object_idx").on(table.objectType, table.objectId)]);

export const handoffReceipts = sqliteTable("handoff_receipts", {
  handoffId: text("handoff_id").primaryKey(),
  sourceSystem: text("source_system").notNull(),
  destinationSystem: text("destination_system").notNull(),
  payloadHash: text("payload_hash").notNull(),
  consentPurpose: text("consent_purpose").notNull(),
  receivedAt: text("received_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text("expires_at").notNull(),
});

export const suppressionEntries = sqliteTable("suppression_entries", {
  id: text("id").primaryKey(),
  channelHash: text("channel_hash").notNull(),
  channel: text("channel", { enum: ["email", "sms", "voice"] }).notNull(),
  reason: text("reason").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("suppression_channel_unique").on(table.channel, table.channelHash)]);

export const rateLimitWindows = sqliteTable("rate_limit_windows", {
  keyHash: text("key_hash").notNull(),
  route: text("route").notNull(),
  windowStart: integer("window_start").notNull(),
  requests: integer("requests").notNull().default(1),
}, (table) => [uniqueIndex("rate_limit_window_unique").on(table.keyHash, table.route, table.windowStart)]);

export const evidenceRefreshRuns = sqliteTable("evidence_refresh_runs", {
  id: text("id").primaryKey(),
  trigger: text("trigger", { enum: ["manual", "scheduled"] }).notNull(),
  status: text("status", { enum: ["running", "completed", "failed"] }).notNull(),
  startedBy: text("started_by").notNull(),
  baselineSnapshotId: text("baseline_snapshot_id"),
  summaryJson: text("summary_json").notNull().default("{}"),
  errorCode: text("error_code"),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
}, (table) => [index("evidence_runs_status_idx").on(table.status), index("evidence_runs_started_idx").on(table.startedAt)]);

export const evidenceSourceChecks = sqliteTable("evidence_source_checks", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => evidenceRefreshRuns.id, { onDelete: "cascade" }),
  sourceId: text("source_id").notNull(),
  sourceVersion: integer("source_version").notNull(),
  sourceUrl: text("source_url").notNull(),
  previousHash: text("previous_hash"),
  observedHash: text("observed_hash"),
  httpStatus: integer("http_status"),
  outcome: text("outcome", { enum: ["confirmed", "baseline", "changed", "unavailable", "invalid"] }).notNull(),
  changeClass: text("change_class", { enum: ["none", "product-fact", "technical-capability", "carrier-material", "source-failure"] }).notNull(),
  proposedPayloadJson: text("proposed_payload_json"),
  errorCode: text("error_code"),
  checkedAt: text("checked_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("evidence_checks_run_idx").on(table.runId), index("evidence_checks_source_idx").on(table.sourceId, table.checkedAt)]);

export const evidencePublicationSnapshots = sqliteTable("evidence_publication_snapshots", {
  id: text("id").primaryKey(),
  sequence: integer("sequence").notNull(),
  status: text("status", { enum: ["active", "superseded", "rolled-back"] }).notNull(),
  contentHash: text("content_hash").notNull(),
  payloadJson: text("payload_json").notNull(),
  sourceRunId: text("source_run_id").references(() => evidenceRefreshRuns.id, { onDelete: "set null" }),
  publishedBy: text("published_by").notNull(),
  publishedAt: text("published_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("evidence_snapshot_sequence_unique").on(table.sequence), index("evidence_snapshot_status_idx").on(table.status)]);

export const evidenceDecisions = sqliteTable("evidence_decisions", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => evidenceRefreshRuns.id, { onDelete: "cascade" }),
  sourceId: text("source_id").notNull(),
  decision: text("decision", { enum: ["approve", "reject", "mark-stale", "confirm-unchanged"] }).notNull(),
  actorRef: text("actor_ref").notNull(),
  rationale: text("rationale"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("evidence_decisions_run_idx").on(table.runId)]);


export const builderProjects = sqliteTable("builder_projects", {
  id: text("id").primaryKey(),
  ownerSubject: text("owner_subject"),
  schemaVersion: integer("schema_version").notNull().default(1),
  status: text("status", { enum: ["draft", "scoped", "prototype", "review-required", "archived"] }).notNull().default("draft"),
  title: text("title").notNull(),
  idea: text("idea").notNull(),
  sourceContext: text("source_context", { enum: ["direct", "farmers", "protection"] }).notNull().default("direct"),
  capability: text("capability").notNull(),
  intelligenceMode: text("intelligence_mode", { enum: ["standalone", "connected", "mesh-ready", "mesh-native"] }).notNull().default("connected"),
  meshProfileJson: text("mesh_profile_json").notNull().default("{}"),
  safetyClass: text("safety_class", { enum: ["supported", "review-required", "blocked-autonomous"] }).notNull(),
  requirementsJson: text("requirements_json").notNull().default("[]"),
  answersJson: text("answers_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("builder_projects_owner_idx").on(table.ownerSubject), index("builder_projects_status_idx").on(table.status), index("builder_projects_intelligence_idx").on(table.intelligenceMode)]);

export const builderRevisions = sqliteTable("builder_revisions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => builderProjects.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").notNull(),
  revisionLevel: text("revision_level", { enum: ["R0", "R1", "R2", "R3"] }).notNull(),
  architectureJson: text("architecture_json").notNull().default("{}"),
  bomJson: text("bom_json").notNull().default("[]"),
  firmwareJson: text("firmware_json").notNull().default("{}"),
  cadJson: text("cad_json").notNull().default("{}"),
  validationJson: text("validation_json").notNull().default("[]"),
  manifestJson: text("manifest_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("builder_revision_unique").on(table.projectId, table.revisionNumber), index("builder_revision_project_idx").on(table.projectId)]);

// SmartDevices ecosystem registry foundation. Registration is deliberately weaker than
// claim, verification, identity, permission, agent operation, or transaction readiness.
export const deviceRegistryRecords = sqliteTable("device_registry_records", {
  id: text("id").primaryKey(),
  registrantSubject: text("registrant_subject"),
  schemaVersion: integer("schema_version").notNull().default(1),
  recordKind: text("record_kind", { enum: ["instance"] }).notNull().default("instance"),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  variant: text("variant"),
  category: text("category").notNull(),
  capabilityIdsJson: text("capability_ids_json").notNull().default("[]"),
  externalIdentifiersJson: text("external_identifiers_json").notNull().default("[]"),
  connectionJson: text("connection_json").notNull().default("{}"),
  trustState: text("trust_state", { enum: ["registered"] }).notNull().default("registered"),
  meshReadiness: text("mesh_readiness", { enum: ["not-evaluated", "compatible", "ready"] }).notNull().default("not-evaluated"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("device_registry_registrant_idx").on(table.registrantSubject), index("device_registry_model_idx").on(table.manufacturer, table.model)]);

export const deviceControlClaims = sqliteTable("device_control_claims", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull().references(() => deviceRegistryRecords.id, { onDelete: "cascade" }),
  claimantSubject: text("claimant_subject").notNull(),
  claimType: text("claim_type", { enum: ["ownership", "control"] }).notNull(),
  status: text("status", { enum: ["asserted", "verified", "revoked"] }).notNull().default("asserted"),
  evidenceRef: text("evidence_ref"),
  assertedAt: text("asserted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  verifiedAt: text("verified_at"),
  revokedAt: text("revoked_at"),
}, (table) => [index("device_claims_device_idx").on(table.deviceId), index("device_claims_claimant_idx").on(table.claimantSubject)]);

export const deviceIntegrations = sqliteTable("device_integrations", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").notNull().references(() => deviceRegistryRecords.id, { onDelete: "cascade" }),
  adapterId: text("adapter_id").notNull(),
  status: text("status", { enum: ["declared", "configured", "connected", "revoked"] }).notNull().default("declared"),
  endpointKind: text("endpoint_kind"),
  locality: text("locality", { enum: ["local", "cloud", "hybrid", "unknown"] }).notNull().default("unknown"),
  protocolsJson: text("protocols_json").notNull().default("[]"),
  credentialRef: text("credential_ref"),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("device_integrations_device_idx").on(table.deviceId), index("device_integrations_adapter_idx").on(table.adapterId)]);

export const marketShadowRuns = sqliteTable("market_shadow_runs", {
  id: text("id").primaryKey(),
  intentId: text("intent_id").notNull(),
  opportunityId: text("opportunity_id"),
  allocationId: text("allocation_id"),
  allocationReceiptId: text("allocation_receipt_id"),
  status: text("status", { enum: ["filled", "no-market", "error"] }).notNull(),
  domain: text("domain").notNull(),
  concernId: text("concern_id").notNull(),
  jurisdiction: text("jurisdiction"),
  recommendedDeviceIdsJson: text("recommended_device_ids_json").notNull().default("[]"),
  sponsoredProviderId: text("sponsored_provider_id"),
  sponsoredDeviceId: text("sponsored_device_id"),
  clearingAmountMicros: integer("clearing_amount_micros"),
  currency: text("currency"),
  evaluatedJson: text("evaluated_json").notNull().default("[]"),
  errorCode: text("error_code"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("market_shadow_intent_unique").on(table.intentId),
  index("market_shadow_status_idx").on(table.status, table.createdAt),
  index("market_shadow_provider_idx").on(table.sponsoredProviderId, table.createdAt),
]);


export const marketOfferIdentityReceipts = sqliteTable("market_offer_identity_receipts", {
  id: text("id").primaryKey(),
  shadowRunId: text("shadow_run_id").notNull(),
  intentId: text("intent_id").notNull(),
  status: text("status", { enum: ["mapped", "unmapped", "rejected"] }).notNull(),
  reason: text("reason"),
  opportunityId: text("opportunity_id"),
  allocationId: text("allocation_id"),
  allocationReceiptId: text("allocation_receipt_id"),
  bidId: text("bid_id"),
  providerId: text("provider_id"),
  providerName: text("provider_name"),
  offerId: text("offer_id"),
  deviceId: text("device_id"),
  fulfillmentType: text("fulfillment_type", { enum: ["manufacturer-direct", "retailer", "installer", "marketplace", "carrier-program"] }),
  destinationUrl: text("destination_url"),
  offerPayloadHash: text("offer_payload_hash"),
  bindingHash: text("binding_hash").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("market_offer_identity_allocation_unique").on(table.allocationId),
  index("market_offer_identity_status_idx").on(table.status, table.createdAt),
  index("market_offer_identity_device_idx").on(table.deviceId, table.createdAt),
]);


export const marketProviderVerificationReceipts = sqliteTable("market_provider_verification_receipts", {
  id: text("id").primaryKey(),
  shadowRunId: text("shadow_run_id").notNull(),
  intentId: text("intent_id").notNull(),
  allocationId: text("allocation_id"),
  providerId: text("provider_id").notNull(),
  deviceId: text("device_id").notNull(),
  status: text("status", { enum: ["verified", "stale", "unavailable", "missing", "rejected"] }).notNull(),
  reason: text("reason"),
  verificationId: text("verification_id"),
  sourceUrl: text("source_url"),
  checkedAt: text("checked_at"),
  ageHoursMillis: integer("age_hours_millis"),
  availability: text("availability", { enum: ["available", "unavailable", "unknown"] }),
  priceMicros: integer("price_micros"),
  currency: text("currency"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("market_provider_verification_allocation_unique").on(table.allocationId),
  index("market_provider_verification_status_idx").on(table.status, table.createdAt),
  index("market_provider_verification_provider_idx").on(table.providerId, table.createdAt),
]);

export const marketOutcomeAttributions = sqliteTable("market_outcome_attributions", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id").notNull(),
  event: text("event", { enum: ["sponsored-offer-viewed", "sponsored-offer-opened", "provider-selected"] }).notNull(),
  occurredAt: text("occurred_at").notNull(),
  intentId: text("intent_id").notNull(),
  opportunityId: text("opportunity_id").notNull(),
  allocationId: text("allocation_id").notNull(),
  allocationReceiptId: text("allocation_receipt_id"),
  offerIdentityReceiptId: text("offer_identity_receipt_id").notNull(),
  providerVerificationReceiptId: text("provider_verification_receipt_id").notNull(),
  offerId: text("offer_id").notNull(),
  providerId: text("provider_id").notNull(),
  deviceId: text("device_id").notNull(),
  destinationUrl: text("destination_url").notNull(),
  source: text("source", { enum: ["preview"] }).notNull().default("preview"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("market_outcome_transaction_event_unique").on(table.transactionId, table.event),
  index("market_outcome_allocation_idx").on(table.allocationId, table.createdAt),
  index("market_outcome_provider_idx").on(table.providerId, table.createdAt),
]);

export const marketProviderCallbackNonces = sqliteTable("market_provider_callback_nonces", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull(),
  nonce: text("nonce").notNull(),
  timestamp: text("timestamp").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("market_provider_callback_nonce_unique").on(table.providerId, table.nonce),
  index("market_provider_callback_provider_idx").on(table.providerId, table.createdAt),
]);

export const marketConversionReceipts = sqliteTable("market_conversion_receipts", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id").notNull(),
  event: text("event", { enum: ["purchase", "installation"] }).notNull(),
  source: text("source", { enum: ["user-confirmed", "provider-callback"] }).notNull(),
  confidence: text("confidence", { enum: ["self-reported", "provider-verified"] }).notNull(),
  occurredAt: text("occurred_at").notNull(),
  intentId: text("intent_id").notNull(),
  opportunityId: text("opportunity_id").notNull(),
  allocationId: text("allocation_id").notNull(),
  allocationReceiptId: text("allocation_receipt_id"),
  offerIdentityReceiptId: text("offer_identity_receipt_id").notNull(),
  providerVerificationReceiptId: text("provider_verification_receipt_id").notNull(),
  offerId: text("offer_id").notNull(),
  providerId: text("provider_id").notNull(),
  deviceId: text("device_id").notNull(),
  providerReferenceHash: text("provider_reference_hash"),
  callbackNonce: text("callback_nonce"),
  bindingHash: text("binding_hash").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("market_conversion_transaction_event_source_unique").on(table.transactionId, table.event, table.source),
  index("market_conversion_allocation_idx").on(table.allocationId, table.createdAt),
  index("market_conversion_provider_idx").on(table.providerId, table.createdAt),
  index("market_conversion_confidence_idx").on(table.confidence, table.createdAt),
]);

/** Aggregate pilot counters: no visitor, account, project or search payload. */
export const businessMetricDaily = sqliteTable("business_metric_daily", {
 day:text("day").notNull(), cohort:text("cohort").notNull(), event:text("event").notNull(), count:integer("count").notNull().default(0),
}, table=>[uniqueIndex("business_metric_daily_unique").on(table.day,table.cohort,table.event)]);
