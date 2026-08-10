-- Migration: Add check-in/out and location verification to transport_driver_attendance
-- Date: 2026-03-27

ALTER TABLE transport_driver_attendance 
ADD COLUMN check_in_time VARCHAR(15) AFTER status,
ADD COLUMN check_out_time VARCHAR(15) AFTER check_in_time,
ADD COLUMN location_verified TINYINT(1) DEFAULT 0 AFTER check_out_time;
