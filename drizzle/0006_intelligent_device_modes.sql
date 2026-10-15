ALTER TABLE `builder_projects` ADD `intelligence_mode` text DEFAULT 'connected' NOT NULL;--> statement-breakpoint
ALTER TABLE `builder_projects` ADD `mesh_profile_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
CREATE INDEX `builder_projects_intelligence_idx` ON `builder_projects` (`intelligence_mode`);--> statement-breakpoint
