CREATE TABLE `market_provider_callback_nonces` (
  `id` text PRIMARY KEY NOT NULL,
  `provider_id` text NOT NULL,
  `nonce` text NOT NULL,
  `timestamp` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_provider_callback_nonce_unique` ON `market_provider_callback_nonces` (`provider_id`,`nonce`);
--> statement-breakpoint
CREATE INDEX `market_provider_callback_provider_idx` ON `market_provider_callback_nonces` (`provider_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `market_conversion_receipts` (
  `id` text PRIMARY KEY NOT NULL,
  `transaction_id` text NOT NULL,
  `event` text NOT NULL,
  `source` text NOT NULL,
  `confidence` text NOT NULL,
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
  `provider_reference_hash` text,
  `callback_nonce` text,
  `binding_hash` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `market_conversion_transaction_event_source_unique` ON `market_conversion_receipts` (`transaction_id`,`event`,`source`);
--> statement-breakpoint
CREATE INDEX `market_conversion_allocation_idx` ON `market_conversion_receipts` (`allocation_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `market_conversion_provider_idx` ON `market_conversion_receipts` (`provider_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `market_conversion_confidence_idx` ON `market_conversion_receipts` (`confidence`,`created_at`);
