CREATE TABLE `handoff_receipts` (
	`handoff_id` text PRIMARY KEY NOT NULL,
	`source_system` text NOT NULL,
	`destination_system` text NOT NULL,
	`payload_hash` text NOT NULL,
	`consent_purpose` text NOT NULL,
	`received_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL
);
