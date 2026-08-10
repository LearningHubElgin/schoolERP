-- Migration: Add Staff Portal
-- Description: Updates the 'role' ENUM in the 'users' table to include 'nonteachingstaff' and inserts a default login credential for the Staff Portal.
-- Date: 2026-03-26

-- 1. Update the ENUM for the `role` column to include 'nonteachingstaff'
ALTER TABLE `users` 
MODIFY COLUMN `role` ENUM('student','teacher','accountant','admin','admission','librarian','storemanager','security','driver','nonteachingstaff') NOT NULL DEFAULT 'student';

-- 2. Insert default user for Staff Portal
INSERT INTO `users` (`school_id`, `email`, `password`, `role`, `name`, `phone`, `status`, `created_at`, `updated_at`) 
VALUES (1, 'staff@school.edu', 'staff123', 'nonteachingstaff', 'Demo Staff', '9876543210', 'active', NOW(), NOW());
