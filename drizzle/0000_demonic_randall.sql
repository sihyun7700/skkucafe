CREATE TABLE `recommendations` (
	`cafe_id` text NOT NULL,
	`voter_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`cafe_id`, `voter_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_recommendations_cafe_id` ON `recommendations` (`cafe_id`);