-- add_photo_non_teaching_staff.sql
ALTER TABLE `non_teaching_staff` 
ADD COLUMN `photo` varchar(255) DEFAULT NULL AFTER `emergency_contact`;
