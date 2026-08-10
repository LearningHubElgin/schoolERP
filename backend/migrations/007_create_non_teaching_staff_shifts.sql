-- Migration: Create non_teaching_staff_shifts table
-- Stores shift assignments for non-teaching staff

CREATE TABLE IF NOT EXISTS non_teaching_staff_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    user_id INT NOT NULL,
    shift_name VARCHAR(50) NOT NULL DEFAULT 'General',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_school_user (school_id, user_id),
    INDEX idx_effective (effective_from, effective_to)
);
