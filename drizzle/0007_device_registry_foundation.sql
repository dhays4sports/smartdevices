CREATE TABLE `device_registry_records` (
  `id` text PRIMARY KEY NOT NULL,
  `registrant_subject` text,
  `schema_version` integer DEFAULT 1 NOT NULL,
  `record_kind` text DEFAULT 'instance' NOT NULL,
  `manufacturer` text NOT NULL,
  `model` text NOT NULL,
  `variant` text,
  `category` text NOT NULL,
  `capability_ids_json` text DEFAULT '[]' NOT NULL,
  `external_identifiers_json` text DEFAULT '[]' NOT NULL,
  `connection_json` text DEFAULT '{}' NOT NULL,
  `trust_state` text DEFAULT 'registered' NOT NULL,
  `mesh_readiness` text DEFAULT 'not-evaluated' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE INDEX `device_registry_registrant_idx` ON `device_registry_records` (`registrant_subject`);--> statement-breakpoint
CREATE INDEX `device_registry_model_idx` ON `device_registry_records` (`manufacturer`,`model`);--> statement-breakpoint
CREATE TABLE `device_control_claims` (
  `id` text PRIMARY KEY NOT NULL,
  `device_id` text NOT NULL,
  `claimant_subject` text NOT NULL,
  `claim_type` text NOT NULL,
  `status` text DEFAULT 'asserted' NOT NULL,
  `evidence_ref` text,
  `asserted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `verified_at` text,
  `revoked_at` text,
  FOREIGN KEY (`device_id`) REFERENCES `device_registry_records`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `device_claims_device_idx` ON `device_control_claims` (`device_id`);--> statement-breakpoint
CREATE INDEX `device_claims_claimant_idx` ON `device_control_claims` (`claimant_subject`);--> statement-breakpoint
CREATE TABLE `device_integrations` (
  `id` text PRIMARY KEY NOT NULL,
  `device_id` text NOT NULL,
  `adapter_id` text NOT NULL,
  `status` text DEFAULT 'declared' NOT NULL,
  `endpoint_kind` text,
  `locality` text DEFAULT 'unknown' NOT NULL,
  `protocols_json` text DEFAULT '[]' NOT NULL,
  `credential_ref` text,
  `metadata_json` text DEFAULT '{}' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`device_id`) REFERENCES `device_registry_records`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `device_integrations_device_idx` ON `device_integrations` (`device_id`);--> statement-breakpoint
CREATE INDEX `device_integrations_adapter_idx` ON `device_integrations` (`adapter_id`);--> statement-breakpoint
