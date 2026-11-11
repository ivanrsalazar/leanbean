CREATE TABLE `saved_meals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`items_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `saved_meal_user_idx` ON `saved_meals` (`user_id`);--> statement-breakpoint
ALTER TABLE `nutrition_entries` ADD `details_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `weigh_ins` ADD `body_fat` real;