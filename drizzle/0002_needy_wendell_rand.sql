CREATE TABLE `scan_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`scan_session_id` text NOT NULL,
	`question_id` text NOT NULL,
	`option_id` text NOT NULL,
	`answered_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`scan_session_id`) REFERENCES `scan_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scan_response_unique` ON `scan_responses` (`scan_session_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `scan_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`schema_version` integer NOT NULL,
	`question_set_version` integer NOT NULL,
	`domain` text NOT NULL,
	`primary_concern_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	`expires_at` text
);
--> statement-breakpoint
CREATE INDEX `scan_sessions_status_idx` ON `scan_sessions` (`status`);--> statement-breakpoint
ALTER TABLE `plans` ADD `scan_session_id` text;--> statement-breakpoint
ALTER TABLE `plans` ADD `selected_concern_ids_json` text;--> statement-breakpoint
ALTER TABLE `plans` ADD `rationale_json` text;--> statement-breakpoint
ALTER TABLE `plans` ADD `assumptions_json` text;--> statement-breakpoint
ALTER TABLE `plans` ADD `unknowns_json` text;