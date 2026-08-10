-- Migration: Add student_unique_id to students and users tables
-- Run this script against your school_erp database

-- 1. Add student_unique_id to students table
ALTER TABLE students ADD COLUMN student_unique_id VARCHAR(20) UNIQUE AFTER user_id;

-- 2. Add student_unique_id to users table (for login matching)
ALTER TABLE users ADD COLUMN student_unique_id VARCHAR(20) AFTER phone;

-- 3. Backfill existing students with auto-generated unique IDs
-- Format: First 5 alpha chars of school name (uppercase) + year + serial (001)
-- This uses a stored procedure approach for reliable serial numbering

SET @counter := 0;
SET @prev_school := 0;

UPDATE students s
JOIN schools sc ON s.school_id = sc.id
SET s.student_unique_id = CONCAT(
    UPPER(LEFT(REGEXP_REPLACE(sc.name, '[^A-Za-z]', ''), 5)),
    YEAR(COALESCE(s.admission_date, CURDATE())),
    LPAD((@counter := IF(@prev_school = s.school_id, @counter + 1, 1)), 3, '0'),
    @prev_school := s.school_id
)
ORDER BY s.school_id, s.id;

-- Fix: The above might include the school_id assignment in the string.
-- Let's do it properly with a cleaner approach:

-- Reset
UPDATE students SET student_unique_id = NULL;

-- Use a proper sequential approach per school
-- We'll handle this in the Node.js migration script instead for reliability
