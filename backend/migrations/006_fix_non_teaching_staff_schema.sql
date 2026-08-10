-- 006_fix_non_teaching_staff_schema.sql

-- Add department to non_teaching_staff
ALTER TABLE `non_teaching_staff` ADD COLUMN IF NOT EXISTS `department` varchar(100) DEFAULT 'General' AFTER `designation`;

-- Add title to non_teaching_staff_cards
ALTER TABLE `non_teaching_staff_cards` ADD COLUMN IF NOT EXISTS `title` varchar(100) DEFAULT 'Staff Identity Card' AFTER `user_id`;
