CREATE TABLE IF NOT EXISTS `non_teaching_staff_attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `school_id` int NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','holiday','half_day') NOT NULL DEFAULT 'absent',
  `check_in_time` varchar(20) DEFAULT NULL,
  `check_out_time` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_staff_date` (`user_id`, `date`),
  KEY `user_id` (`user_id`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `fk_nts_attendance_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

