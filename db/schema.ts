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
