CREATE TABLE `business_metric_daily` (
	`day` text NOT NULL,
	`cohort` text NOT NULL,
	`event` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_metric_daily_unique` ON `business_metric_daily` (`day`,`cohort`,`event`);