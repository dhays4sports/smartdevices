CREATE TABLE `agent_profiles` (
	`subject` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`agency_name` text,
	`email` text,
	`phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_type` text NOT NULL,
	`actor_ref` text,
	`action` text NOT NULL,
	`object_type` text NOT NULL,
	`object_id` text NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_object_idx` ON `audit_events` (`object_type`,`object_id`);--> statement-breakpoint
CREATE TABLE `consent_events` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text,
	`subject_ref` text,
	`purpose` text NOT NULL,
	`action` text NOT NULL,
	`policy_version` text NOT NULL,
	`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `plan_recommendations` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`device_id` text NOT NULL,
	`origin` text NOT NULL,
	`priority` text NOT NULL,
	`rationale` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_device_unique` ON `plan_recommendations` (`plan_id`,`device_id`);--> statement-breakpoint
CREATE TABLE `plan_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`recommendation_id` text NOT NULL,
	`asserted_by` text NOT NULL,
	`intent` text,
	`fulfillment` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recommendation_id`) REFERENCES `plan_recommendations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `responses_plan_idx` ON `plan_responses` (`plan_id`);--> statement-breakpoint
CREATE TABLE `plan_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_subject` text NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`concern_id` text NOT NULL,
	`device_ids_json` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `templates_owner_idx` ON `plan_templates` (`owner_subject`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_subject` text,
	`write_token_hash` text,
	`schema_version` integer DEFAULT 1 NOT NULL,
	`status` text NOT NULL,
	`domain` text NOT NULL,
	`concern_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text,
	`revoked_at` text
);
--> statement-breakpoint
CREATE INDEX `plans_owner_idx` ON `plans` (`owner_subject`);--> statement-breakpoint
CREATE INDEX `plans_status_idx` ON `plans` (`status`);--> statement-breakpoint
CREATE TABLE `rate_limit_windows` (
	`key_hash` text NOT NULL,
	`route` text NOT NULL,
	`window_start` integer NOT NULL,
	`requests` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limit_window_unique` ON `rate_limit_windows` (`key_hash`,`route`,`window_start`);--> statement-breakpoint
CREATE TABLE `suppression_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_hash` text NOT NULL,
	`channel` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `suppression_channel_unique` ON `suppression_entries` (`channel`,`channel_hash`);