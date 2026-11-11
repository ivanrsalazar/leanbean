CREATE TABLE `nutrition_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`meal_type` text NOT NULL,
	`name` text NOT NULL,
	`calories` integer NOT NULL,
	`protein` real DEFAULT 0 NOT NULL,
	`carbs` real DEFAULT 0 NOT NULL,
	`fat` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `nutrition_user_date_idx` ON `nutrition_entries` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `weigh_ins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`weight` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `weight_user_date_idx` ON `weigh_ins` (`user_id`,`date`);--> statement-breakpoint
CREATE TABLE `workout_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`workout` text NOT NULL,
	`exercise` text NOT NULL,
	`set_number` integer DEFAULT 1 NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `workout_user_date_idx` ON `workout_sets` (`user_id`,`date`);