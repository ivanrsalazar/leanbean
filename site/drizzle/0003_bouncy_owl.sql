CREATE TABLE `nutrition_goals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`calories` integer DEFAULT 2250 NOT NULL,
	`protein` real DEFAULT 170 NOT NULL,
	`carbs` real DEFAULT 250 NOT NULL,
	`fat` real DEFAULT 75 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_weigh_ins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`weight` real,
	`body_fat` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_weigh_ins`("id", "user_id", "date", "weight", "body_fat", "created_at") SELECT "id", "user_id", "date", "weight", "body_fat", "created_at" FROM `weigh_ins`;--> statement-breakpoint
DROP TABLE `weigh_ins`;--> statement-breakpoint
ALTER TABLE `__new_weigh_ins` RENAME TO `weigh_ins`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `weight_user_date_idx` ON `weigh_ins` (`user_id`,`date`);