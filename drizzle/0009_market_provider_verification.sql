CREATE TABLE `market_provider_verification_receipts` (
  `id` text PRIMARY KEY NOT NULL,
  `shadow_run_id` text NOT NULL,
  `intent_id` text NOT NULL,
  `allocation_id` text,
  `provider_id` text NOT NULL,
  `device_id` text NOT NULL,
  `status` text NOT NULL,
  `reason` text,
  `verification_id` text,
  `source_url` text,
  `checked_at` text,
  `age_hours_millis` integer,
  `availability` text,
  `price_micros` integer,
  `currency` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_provider_verification_allocation_unique` ON `market_provider_verification_receipts` (`allocation_id`);
--> statement-breakpoint
CREATE INDEX `market_provider_verification_status_idx` ON `market_provider_verification_receipts` (`status`,`created_at`);
--> statement-breakpoint
CREATE INDEX `market_provider_verification_provider_idx` ON `market_provider_verification_receipts` (`provider_id`,`created_at`);
