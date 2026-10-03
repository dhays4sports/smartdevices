CREATE TABLE `market_shadow_runs` (
  `id` text PRIMARY KEY NOT NULL,
  `intent_id` text NOT NULL,
  `opportunity_id` text,
  `allocation_id` text,
  `allocation_receipt_id` text,
  `status` text NOT NULL,
  `domain` text NOT NULL,
  `concern_id` text NOT NULL,
  `jurisdiction` text,
  `recommended_device_ids_json` text DEFAULT '[]' NOT NULL,
  `sponsored_provider_id` text,
  `sponsored_device_id` text,
  `clearing_amount_micros` integer,
  `currency` text,
  `evaluated_json` text DEFAULT '[]' NOT NULL,
  `error_code` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `market_shadow_intent_unique` ON `market_shadow_runs` (`intent_id`);
CREATE INDEX `market_shadow_status_idx` ON `market_shadow_runs` (`status`,`created_at`);
CREATE INDEX `market_shadow_provider_idx` ON `market_shadow_runs` (`sponsored_provider_id`,`created_at`);
