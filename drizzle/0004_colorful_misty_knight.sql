CREATE TABLE `evidence_decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`source_id` text NOT NULL,
	`decision` text NOT NULL,
	`actor_ref` text NOT NULL,
	`rationale` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `evidence_refresh_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `evidence_decisions_run_idx` ON `evidence_decisions` (`run_id`);--> statement-breakpoint
CREATE TABLE `evidence_publication_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`sequence` integer NOT NULL,
	`status` text NOT NULL,
	`content_hash` text NOT NULL,
	`payload_json` text NOT NULL,
	`source_run_id` text,
	`published_by` text NOT NULL,
	`published_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`source_run_id`) REFERENCES `evidence_refresh_runs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evidence_snapshot_sequence_unique` ON `evidence_publication_snapshots` (`sequence`);--> statement-breakpoint
CREATE INDEX `evidence_snapshot_status_idx` ON `evidence_publication_snapshots` (`status`);--> statement-breakpoint
CREATE TABLE `evidence_refresh_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`trigger` text NOT NULL,
	`status` text NOT NULL,
	`started_by` text NOT NULL,
	`baseline_snapshot_id` text,
	`summary_json` text DEFAULT '{}' NOT NULL,
	`error_code` text,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `evidence_runs_status_idx` ON `evidence_refresh_runs` (`status`);--> statement-breakpoint
CREATE INDEX `evidence_runs_started_idx` ON `evidence_refresh_runs` (`started_at`);--> statement-breakpoint
CREATE TABLE `evidence_source_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`source_id` text NOT NULL,
	`source_version` integer NOT NULL,
	`source_url` text NOT NULL,
	`previous_hash` text,
	`observed_hash` text,
	`http_status` integer,
	`outcome` text NOT NULL,
	`change_class` text NOT NULL,
	`proposed_payload_json` text,
	`error_code` text,
	`checked_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`run_id`) REFERENCES `evidence_refresh_runs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `evidence_checks_run_idx` ON `evidence_source_checks` (`run_id`);--> statement-breakpoint
CREATE INDEX `evidence_checks_source_idx` ON `evidence_source_checks` (`source_id`,`checked_at`);