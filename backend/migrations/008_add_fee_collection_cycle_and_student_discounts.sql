-- Migration 008: Add fee_collection_cycle to schools and create student_fee_discounts table

-- 1. Add fee_collection_cycle column to schools table
ALTER TABLE `schools` 
ADD COLUMN IF NOT EXISTS `fee_collection_cycle` VARCHAR(50) DEFAULT 'monthly' AFTER `subscription_end`;

-- 2. Create student_fee_discounts table for per-student custom fee setups & concessions
CREATE TABLE IF NOT EXISTS `student_fee_discounts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `school_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `discount_type` ENUM('flat', 'percentage') DEFAULT 'flat',
    `discount_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `frequency` ENUM('monthly', 'yearly', 'one_time') DEFAULT 'monthly',
    `reason` VARCHAR(255) DEFAULT NULL,
    `applicable_months` TEXT DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_student_school` (`school_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
