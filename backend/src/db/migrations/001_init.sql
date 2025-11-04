CREATE TABLE IF NOT EXISTS `lessons` (
	`id` integer primary key NOT NULL UNIQUE,
	`created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
	`title_id` INTEGER NOT NULL,
	`preview_image_id` INTEGER,
	`main_image_id` INTEGER,
FOREIGN KEY(`title_id`) REFERENCES `text_translations`(`id`),
FOREIGN KEY(`preview_image_id`) REFERENCES `images`(`id`),
FOREIGN KEY(`main_image_id`) REFERENCES `images`(`id`)
);
CREATE TABLE IF NOT EXISTS `users` (
	`id` integer primary key NOT NULL UNIQUE,
	`nickname` TEXT NOT NULL,
	`email` TEXT NOT NULL,
	`created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`password` TEXT NOT NULL,
	`profile_image_id` INTEGER,
	`role` TEXT NOT NULL,
FOREIGN KEY(`profile_image_id`) REFERENCES `images`(`id`)
);
CREATE TABLE IF NOT EXISTS `user_progress` (
	`id` integer primary key NOT NULL UNIQUE,
	`completed_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`user_id` INTEGER NOT NULL,
	`task_id` INTEGER NOT NULL,
FOREIGN KEY(`user_id`) REFERENCES `users`(`id`),
FOREIGN KEY(`task_id`) REFERENCES `lesson_tasks`(`id`)
);
CREATE TABLE IF NOT EXISTS `lesson_tasks` (
	`id` integer primary key NOT NULL UNIQUE,
	`title_id` INTEGER NOT NULL,
	`audio_id` INTEGER,
	`image_id` INTEGER,
	`description_id` INTEGER NOT NULL,
	`game_id` INTEGER,
	`external_link_id` INTEGER,
	`added_by` INTEGER NOT NULL,
	`lesson_id` INTEGER NOT NULL,
	`created_at` TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TEXT DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(`title_id`) REFERENCES `text_translations`(`id`),
FOREIGN KEY(`audio_id`) REFERENCES `audio_content`(`id`),
FOREIGN KEY(`image_id`) REFERENCES `images`(`id`),
FOREIGN KEY(`description_id`) REFERENCES `text_translations`(`id`),
FOREIGN KEY(`game_id`) REFERENCES `games`(`id`),
FOREIGN KEY(`external_link_id`) REFERENCES `external_links`(`id`),
FOREIGN KEY(`added_by`) REFERENCES `users`(`id`),
FOREIGN KEY(`lesson_id`) REFERENCES `lessons`(`id`)
);
CREATE TABLE IF NOT EXISTS `languages` (
	`id` integer primary key NOT NULL UNIQUE,
	`code` TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS `text_translations` (
	`id` integer primary key NOT NULL UNIQUE,
	`content` TEXT NOT NULL,
	`language_id` INTEGER NOT NULL,
FOREIGN KEY(`language_id`) REFERENCES `languages`(`id`)
);
CREATE TABLE IF NOT EXISTS `audio_content` (
	`id` integer primary key NOT NULL UNIQUE,
	`language_id` INTEGER NOT NULL,
	`file_path` TEXT NOT NULL,
FOREIGN KEY(`language_id`) REFERENCES `languages`(`id`)
);
CREATE TABLE IF NOT EXISTS `images` (
	`id` integer primary key NOT NULL UNIQUE,
	`file_path` TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS `external_links` (
	`id` integer primary key NOT NULL UNIQUE,
	`link` TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS `games` (
	`id` integer primary key NOT NULL UNIQUE,
	`title` TEXT NOT NULL,
	`path` TEXT NOT NULL
);
