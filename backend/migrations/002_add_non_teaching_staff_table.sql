DROP TABLE IF EXISTS `non_teaching_staff`;

CREATE TABLE `non_teaching_staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `joining_date` date DEFAULT NULL,
  `address` text,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `school_id` int NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `user_id` (`user_id`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `fk_non_teaching_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
