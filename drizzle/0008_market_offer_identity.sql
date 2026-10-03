CREATE TABLE `market_offer_identity_receipts` (
  `id` text PRIMARY KEY NOT NULL,
  `shadow_run_id` text NOT NULL,
  `intent_id` text NOT NULL,
  `status` text NOT NULL,
  `reason` text,
  `opportunity_id` text,
  `allocation_id` text,
  `allocation_receipt_id` text,
  `bid_id` text,
  `provider_id` text,
  `provider_name` text,
  `offer_id` text,
  `device_id` text,
  `fulfillment_type` text,
  `destination_url` text,
  `offer_payload_hash` text,
  `binding_hash` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `market_offer_identity_allocation_unique` ON `market_offer_identity_receipts` (`allocation_id`);
CREATE INDEX `market_offer_identity_status_idx` ON `market_offer_identity_receipts` (`status`,`created_at`);
CREATE INDEX `market_offer_identity_device_idx` ON `market_offer_identity_receipts` (`device_id`,`created_at`);
