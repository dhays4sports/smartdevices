CREATE TABLE `market_outcome_attributions` (
  `id` text PRIMARY KEY NOT NULL,
  `transaction_id` text NOT NULL,
  `event` text NOT NULL,
  `occurred_at` text NOT NULL,
  `intent_id` text NOT NULL,
  `opportunity_id` text NOT NULL,
  `allocation_id` text NOT NULL,
  `allocation_receipt_id` text,
  `offer_identity_receipt_id` text NOT NULL,
  `provider_verification_receipt_id` text NOT NULL,
  `offer_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `device_id` text NOT NULL,
  `destination_url` text NOT NULL,
  `source` text DEFAULT 'preview' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_outcome_transaction_event_unique` ON `market_outcome_attributions` (`transaction_id`,`event`);
--> statement-breakpoint
CREATE INDEX `market_outcome_allocation_idx` ON `market_outcome_attributions` (`allocation_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `market_outcome_provider_idx` ON `market_outcome_attributions` (`provider_id`,`created_at`);
