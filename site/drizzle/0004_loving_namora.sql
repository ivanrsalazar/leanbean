PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_nutrition_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`meal_type` text NOT NULL,
	`name` text NOT NULL,
	`calories` real NOT NULL,
	`protein` real DEFAULT 0 NOT NULL,
	`carbs` real DEFAULT 0 NOT NULL,
	`fat` real DEFAULT 0 NOT NULL,
	`details_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_nutrition_entries`("id", "user_id", "date", "meal_type", "name", "calories", "protein", "carbs", "fat", "details_json", "created_at") SELECT "id", "user_id", "date", "meal_type", "name", "calories", "protein", "carbs", "fat", "details_json", "created_at" FROM `nutrition_entries`;--> statement-breakpoint
DROP TABLE `nutrition_entries`;--> statement-breakpoint
ALTER TABLE `__new_nutrition_entries` RENAME TO `nutrition_entries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `nutrition_user_date_idx` ON `nutrition_entries` (`user_id`,`date`);--> statement-breakpoint
ALTER TABLE `saved_meals` ADD `favorite` integer DEFAULT false NOT NULL;