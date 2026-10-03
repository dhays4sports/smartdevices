ALTER TABLE `plan_recommendations` ADD `solution_type` text;--> statement-breakpoint
ALTER TABLE `plan_recommendations` ADD `insurance_status` text;--> statement-breakpoint
ALTER TABLE `plan_recommendations` ADD `builder_project_id` text;--> statement-breakpoint
CREATE TABLE `builder_projects` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_subject` text,
  `schema_version` integer DEFAULT 1 NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `title` text NOT NULL,
  `idea` text NOT NULL,
  `source_context` text DEFAULT 'direct' NOT NULL,
  `capability` text NOT NULL,
  `safety_class` text NOT NULL,
  `requirements_json` text DEFAULT '[]' NOT NULL,
  `answers_json` text DEFAULT '{}' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE INDEX `builder_projects_owner_idx` ON `builder_projects` (`owner_subject`);--> statement-breakpoint
CREATE INDEX `builder_projects_status_idx` ON `builder_projects` (`status`);--> statement-breakpoint
CREATE TABLE `builder_revisions` (
  `id` text PRIMARY KEY NOT NULL,
  `project_id` text NOT NULL,
  `revision_number` integer NOT NULL,
  `revision_level` text NOT NULL,
  `architecture_json` text DEFAULT '{}' NOT NULL,
  `bom_json` text DEFAULT '[]' NOT NULL,
  `firmware_json` text DEFAULT '{}' NOT NULL,
  `cad_json` text DEFAULT '{}' NOT NULL,
  `validation_json` text DEFAULT '[]' NOT NULL,
  `manifest_json` text DEFAULT '{}' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`project_id`) REFERENCES `builder_projects`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE UNIQUE INDEX `builder_revision_unique` ON `builder_revisions` (`project_id`,`revision_number`);--> statement-breakpoint
CREATE INDEX `builder_revision_project_idx` ON `builder_revisions` (`project_id`);--> statement-breakpoint
