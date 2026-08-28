CREATE TABLE `plan_verification_events` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`recommendation_id` text,
	`actor_type` text NOT NULL,
	`event_type` text NOT NULL,
	`determination` text DEFAULT 'not-applicable' NOT NULL,
	`assertion_source` text NOT NULL,
	`idempotency_key_hash` text NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recommendation_id`) REFERENCES `plan_recommendations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `verification_plan_idx` ON `plan_verification_events` (`plan_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `verification_idempotency_unique` ON `plan_verification_events` (`idempotency_key_hash`);