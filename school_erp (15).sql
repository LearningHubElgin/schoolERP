-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 10, 2026 at 03:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_erp`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `user_email` varchar(100) DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Success',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `branch_id` int(11) DEFAULT NULL,
  `academic_year_id` int(11) DEFAULT NULL,
  `module_name` varchar(100) NOT NULL DEFAULT 'System',
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `entity_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `changed_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changed_fields`)),
  `performed_by_user_id` int(11) NOT NULL DEFAULT 0,
  `performed_by_name` varchar(255) DEFAULT NULL,
  `performed_by_role` varchar(100) DEFAULT NULL,
  `browser` varchar(255) DEFAULT NULL,
  `device` varchar(255) DEFAULT NULL,
  `operating_system` varchar(255) DEFAULT NULL,
  `request_method` varchar(10) DEFAULT NULL,
  `request_url` varchar(500) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `severity` enum('info','warning','error','critical') DEFAULT 'info',
  `execution_time` int(11) DEFAULT NULL,
  `request_id` varchar(100) DEFAULT NULL,
  `correlation_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `date` date NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class` varchar(50) NOT NULL,
  `section` varchar(50) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `grade` varchar(50) DEFAULT NULL,
  `feedback` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bonafide_certificates`
--

CREATE TABLE `bonafide_certificates` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `class` varchar(50) NOT NULL,
  `section` varchar(20) NOT NULL,
  `roll_no` varchar(50) NOT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) NOT NULL,
  `issued_date` date NOT NULL,
  `certificate_number` varchar(100) NOT NULL,
  `remarks` text DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `character_certificates`
--

CREATE TABLE `character_certificates` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `class` varchar(50) NOT NULL,
  `section` varchar(20) NOT NULL,
  `roll_no` varchar(50) NOT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `purpose` varchar(255) NOT NULL,
  `conduct_remarks` text DEFAULT NULL COMMENT 'Behavioral remarks',
  `issued_date` date NOT NULL,
  `certificate_number` varchar(100) NOT NULL,
  `remarks` text DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `name` varchar(50) NOT NULL,
  `class_number` varchar(20) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `class_category` enum('pre_primary','primary','middle','secondary','higher_secondary') DEFAULT 'primary',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_notes`
--

CREATE TABLE `class_notes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class` varchar(50) NOT NULL,
  `section` varchar(50) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_sections`
--

CREATE TABLE `class_sections` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `class_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_streams`
--

CREATE TABLE `class_streams` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `stream_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_subjects`
--

CREATE TABLE `class_subjects` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `class_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `is_mandatory` tinyint(1) DEFAULT 1 COMMENT '1 = mandatory, 0 = optional/elective',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `combination_subjects`
--

CREATE TABLE `combination_subjects` (
  `id` int(11) NOT NULL,
  `combination_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `is_optional` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daywise_attendance_teachers`
--

CREATE TABLE `daywise_attendance_teachers` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class_number` varchar(20) NOT NULL,
  `section` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `stream_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enquiries`
--

CREATE TABLE `enquiries` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `enquiry_number` varchar(50) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `class_applied` varchar(50) DEFAULT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `alternate_phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `source` enum('Website','Social Media','Referral','Walk-in','Phone Call','Advertisement','Other') DEFAULT 'Website',
  `status` enum('New','Contacted','Follow-up Scheduled','Converted','Dropped') DEFAULT 'New',
  `priority` enum('High','Medium','Low') DEFAULT 'Medium',
  `assigned_to` int(11) DEFAULT NULL COMMENT 'staff_id (admin/admission)',
  `follow_up_date` date DEFAULT NULL,
  `follow_up_notes` text DEFAULT NULL,
  `converted_to_application_id` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_terms`
--

CREATE TABLE `exam_terms` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL DEFAULT 1,
  `term_name` varchar(100) NOT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `status` enum('draft','active','finalized') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `gst_amount` decimal(10,2) DEFAULT 0.00,
  `category` varchar(100) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `expense_date` date NOT NULL,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `receipt_path` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'approved',
  `school_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expense_time` time DEFAULT '10:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_admission`
--

CREATE TABLE `fee_admission` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_column_types`
--

CREATE TABLE `fee_column_types` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `column_key` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_column_values`
--

CREATE TABLE `fee_column_values` (
  `id` int(11) NOT NULL,
  `fee_structure_id` int(11) NOT NULL,
  `column_type_id` int(11) NOT NULL,
  `amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_records`
--

CREATE TABLE `fee_records` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `fee_type` varchar(50) DEFAULT 'Annual Fee',
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `pending_amount` decimal(10,2) NOT NULL,
  `gst_amount` decimal(10,2) DEFAULT 0.00,
  `net_amount` decimal(10,2) DEFAULT 0.00,
  `payment_method` enum('offline','online') DEFAULT 'offline',
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `last_payment_date` datetime DEFAULT NULL,
  `status` enum('pending','paid') DEFAULT 'pending',
  `transaction_remarks` text DEFAULT NULL,
  `received_by` int(11) DEFAULT NULL,
  `academic_year` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_structures`
--

CREATE TABLE `fee_structures` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `class_id` int(11) NOT NULL,
  `stream_id` int(11) NOT NULL DEFAULT 0,
  `group_name` varchar(50) NOT NULL DEFAULT 'General',
  `tuition_fee` decimal(10,2) DEFAULT 0.00,
  `library_fee` decimal(10,2) DEFAULT 0.00,
  `sports_fee` decimal(10,2) DEFAULT 0.00,
  `lab_fee` decimal(10,2) DEFAULT 0.00,
  `exam_fee` decimal(10,2) DEFAULT 0.00,
  `hostel_fee` decimal(10,2) DEFAULT 0.00,
  `misc_fee` decimal(10,2) DEFAULT 0.00,
  `total_fee` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forms`
--

CREATE TABLE `forms` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('Seasonal','All-time') NOT NULL,
  `type` enum('File','Link') NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grievances`
--

CREATE TABLE `grievances` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `student_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `status` enum('pending','in_progress','resolved') DEFAULT 'pending',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `submitted_date` date NOT NULL,
  `resolved_date` date DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `type` enum('National','Religious','School','Other') DEFAULT 'Other',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_plans`
--

CREATE TABLE `lesson_plans` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class_number` varchar(20) NOT NULL,
  `section` varchar(10) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `week_start_date` date NOT NULL,
  `scheduled_date` date DEFAULT NULL,
  `topic` varchar(255) NOT NULL,
  `sub_topics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sub_topics`)),
  `description` text DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT 0,
  `completion_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_plan_comments`
--

CREATE TABLE `lesson_plan_comments` (
  `id` int(11) NOT NULL,
  `lesson_plan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `library_books`
--

CREATE TABLE `library_books` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `isbn` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `publisher` varchar(100) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `total_copies` int(11) NOT NULL DEFAULT 1,
  `available_copies` int(11) NOT NULL DEFAULT 1,
  `shelf_location` varchar(20) DEFAULT NULL,
  `cover_image` varchar(500) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `library_issued_books`
--

CREATE TABLE `library_issued_books` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `student_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('issued','returned','overdue') DEFAULT 'issued',
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marksheet_templates`
--

CREATE TABLE `marksheet_templates` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL DEFAULT 1,
  `name` varchar(100) NOT NULL,
  `config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`config`)),
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `assigned_class` text DEFAULT NULL,
  `assigned_section` varchar(255) DEFAULT NULL,
  `assigned_stream` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marks_assignments`
--

CREATE TABLE `marks_assignments` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL DEFAULT 1,
  `exam_term_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `class` varchar(20) NOT NULL,
  `section` varchar(10) DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_locked` tinyint(1) DEFAULT 0,
  `locked_columns` text DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `non_teaching_staff`
--

CREATE TABLE `non_teaching_staff` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `employee_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT 'General',
  `joining_date` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `school_id` int(11) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `non_teaching_staff_attendance`
--

CREATE TABLE `non_teaching_staff_attendance` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','holiday','half_day') NOT NULL DEFAULT 'absent',
  `check_in_time` varchar(20) DEFAULT NULL,
  `check_out_time` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `non_teaching_staff_cards`
--

CREATE TABLE `non_teaching_staff_cards` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) DEFAULT 'Staff Identity Card',
  `card_number` varchar(50) NOT NULL,
  `status` enum('active','revoked') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `non_teaching_staff_shifts`
--

CREATE TABLE `non_teaching_staff_shifts` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `shift_name` varchar(50) NOT NULL DEFAULT 'General',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `publish_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `target_audience` enum('all','students','teachers','parents','staff') DEFAULT 'all',
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `online_study_videos`
--

CREATE TABLE `online_study_videos` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `subject_id` int(11) DEFAULT NULL,
  `subject_name` varchar(255) DEFAULT NULL,
  `topic_name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `video_path` varchar(500) DEFAULT NULL,
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `playlist_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` int(11) NOT NULL,
  `tender_id` int(11) NOT NULL,
  `vendor_name` varchar(255) NOT NULL,
  `vendor_contact` varchar(100) DEFAULT NULL,
  `quoted_amount` decimal(15,2) NOT NULL,
  `proposal_details` text DEFAULT NULL,
  `proposal_file` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `submitted_date` date DEFAULT curdate(),
  `school_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `vendor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requisitions`
--

CREATE TABLE `requisitions` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `user_role` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `principal_name` varchar(255) DEFAULT NULL,
  `established_year` int(4) DEFAULT NULL,
  `board` varchar(50) DEFAULT NULL COMMENT 'CBSE, ICSE, State Board, etc.',
  `website` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `subscription_plan` varchar(50) DEFAULT 'basic',
  `subscription_start` date DEFAULT NULL,
  `subscription_end` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `attendance_radius_meters` int(11) DEFAULT 500,
  `principal_signature` varchar(500) DEFAULT NULL,
  `min_hours_half_day` decimal(3,1) DEFAULT 4.0,
  `min_hours_full_day` decimal(3,1) DEFAULT 6.0,
  `fee_collection_cycle` varchar(50) DEFAULT 'monthly'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_settings`
--

CREATE TABLE `school_settings` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_weekly_schedule`
--

CREATE TABLE `school_weekly_schedule` (
  `school_id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `is_working` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_working_days`
--

CREATE TABLE `school_working_days` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `day_type` enum('working','holiday') NOT NULL DEFAULT 'working',
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `name` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `icon` varchar(10) DEFAULT '?',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_bills`
--

CREATE TABLE `store_bills` (
  `id` int(11) NOT NULL,
  `bill_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `student_name` varchar(200) DEFAULT 'Walk-in Customer',
  `buyer_type` varchar(20) DEFAULT 'student',
  `class_name` varchar(50) DEFAULT '',
  `items_json` text NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gst_type` enum('none','inclusive','exclusive') DEFAULT 'none',
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `gst_amount` decimal(12,2) DEFAULT 0.00,
  `gst_percentage` decimal(5,2) DEFAULT 0.00,
  `payment_status` enum('paid','pending') DEFAULT 'paid',
  `payment_method` varchar(50) DEFAULT 'cash',
  `notes` text DEFAULT NULL,
  `bill_file_path` varchar(500) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_grievances`
--

CREATE TABLE `store_grievances` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `subject` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('pending','in_progress','resolved') DEFAULT 'pending',
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_by_name` varchar(200) DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolution_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_inventory`
--

CREATE TABLE `store_inventory` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `item_name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `unit_price` decimal(10,2) DEFAULT 0.00,
  `selling_price` decimal(10,2) DEFAULT 0.00,
  `low_stock_threshold` int(11) DEFAULT 5,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_requisitions`
--

CREATE TABLE `store_requisitions` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `item_name` varchar(200) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `urgency` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `submitted_by` int(11) DEFAULT NULL,
  `submitted_by_name` varchar(200) DEFAULT NULL,
  `approved_by` varchar(200) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store_transactions`
--

CREATE TABLE `store_transactions` (
  `id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `student_name` varchar(200) DEFAULT NULL,
  `buyer_type` varchar(20) DEFAULT 'student',
  `class_name` varchar(50) DEFAULT NULL,
  `item_id` int(11) NOT NULL,
  `item_name` varchar(200) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `transaction_type` enum('sale','return') DEFAULT 'sale',
  `payment_method` varchar(50) DEFAULT 'cash',
  `payment_status` enum('paid','pending') DEFAULT 'paid',
  `bill_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `streams`
--

CREATE TABLE `streams` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stream_combinations`
--

CREATE TABLE `stream_combinations` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `stream_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `student_unique_id` varchar(50) DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `student_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `roll_no` varchar(50) NOT NULL,
  `class` varchar(20) DEFAULT NULL,
  `section` varchar(10) NOT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `combination_id` int(11) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `father_phone` varchar(20) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `mother_phone` varchar(20) DEFAULT NULL,
  `admission_date` date NOT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `previous_school` varchar(255) DEFAULT NULL,
  `previous_class` varchar(10) DEFAULT NULL,
  `batch_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `photo_path` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `father_photo` varchar(255) DEFAULT NULL,
  `mother_photo` varchar(255) DEFAULT NULL,
  `student_aadhaar` varchar(255) DEFAULT NULL,
  `father_aadhaar` varchar(255) DEFAULT NULL,
  `mother_aadhaar` varchar(255) DEFAULT NULL,
  `father_pan` varchar(255) DEFAULT NULL,
  `mother_pan` varchar(255) DEFAULT NULL,
  `status` enum('active','passed_out','transferred') DEFAULT 'active',
  `passed_out_date` date DEFAULT NULL,
  `passed_out_class` varchar(50) DEFAULT NULL,
  `passed_out_year` year(4) DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students_attendance`
--

CREATE TABLE `students_attendance` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `subject` varchar(100) NOT NULL,
  `status` enum('present','absent') NOT NULL DEFAULT 'present',
  `marked_by` int(11) DEFAULT NULL COMMENT 'teacher_id who marked attendance',
  `marked_by_history` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_applications`
--

CREATE TABLE `student_applications` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `application_no` varchar(50) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `class` varchar(10) NOT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `section` varchar(10) DEFAULT NULL,
  `father_name` varchar(255) NOT NULL,
  `mother_name` varchar(255) NOT NULL,
  `parent_phone` varchar(20) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `previous_school` varchar(255) DEFAULT NULL,
  `previous_class` varchar(10) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `medical_conditions` text DEFAULT NULL,
  `student_photo` varchar(255) DEFAULT NULL,
  `father_photo` varchar(255) DEFAULT NULL,
  `mother_photo` varchar(255) DEFAULT NULL,
  `student_aadhaar` varchar(255) DEFAULT NULL,
  `father_aadhaar` varchar(255) DEFAULT NULL,
  `mother_aadhaar` varchar(255) DEFAULT NULL,
  `father_pan` varchar(255) DEFAULT NULL,
  `mother_pan` varchar(255) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','admitted','rejected') DEFAULT 'pending',
  `applied_date` date NOT NULL,
  `admitted_date` date DEFAULT NULL,
  `rejected_date` date DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_cards`
--

CREATE TABLE `student_cards` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `card_number` varchar(50) DEFAULT NULL,
  `card_type` enum('Identity Card','Admit Card','Library Card','Registration Card','Marks Card','Other') NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_fee_discounts`
--

CREATE TABLE `student_fee_discounts` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `discount_type` enum('flat','percentage') DEFAULT 'flat',
  `discount_value` decimal(10,2) NOT NULL DEFAULT 0.00,
  `frequency` enum('monthly','yearly','one_time') DEFAULT 'monthly',
  `reason` varchar(255) DEFAULT NULL,
  `applicable_months` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_grievances`
--

CREATE TABLE `student_grievances` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `student_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `priority` varchar(50) DEFAULT 'Medium',
  `status` varchar(50) DEFAULT 'Pending',
  `submitted_date` date DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `resolved_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_leaves`
--

CREATE TABLE `student_leaves` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_marks`
--

CREATE TABLE `student_marks` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL DEFAULT 1,
  `exam_term_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `marks_obtained` decimal(5,2) DEFAULT NULL,
  `total_marks` decimal(5,2) DEFAULT 100.00,
  `grade` varchar(5) DEFAULT NULL,
  `custom_marks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_marks`)),
  `teacher_id` int(11) NOT NULL,
  `is_finalized` tinyint(1) DEFAULT 0,
  `entered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_requisition`
--

CREATE TABLE `student_requisition` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `urgency` varchar(50) DEFAULT 'Normal',
  `status` varchar(50) DEFAULT 'Pending',
  `submitted_date` date DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `study_notes`
--

CREATE TABLE `study_notes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `parent_type` enum('playlist','video') NOT NULL,
  `parent_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `study_playlists`
--

CREATE TABLE `study_playlists` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `syllabus`
--

CREATE TABLE `syllabus` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `class` varchar(50) NOT NULL,
  `section` varchar(50) DEFAULT NULL,
  `subject_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `content` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `user_id` int(11) DEFAULT NULL,
  `employee_id` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `joining_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT 0.00,
  `allowance` decimal(10,2) DEFAULT 0.00,
  `deduction` decimal(10,2) DEFAULT 0.00,
  `can_manage_students` tinyint(4) DEFAULT 0,
  `managed_classes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`managed_classes`)),
  `managed_streams` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`managed_streams`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers_requisition`
--

CREATE TABLE `teachers_requisition` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `teacher_id` int(11) NOT NULL,
  `teacher_name` varchar(255) DEFAULT NULL,
  `item` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `description` text NOT NULL,
  `urgency` varchar(50) DEFAULT 'Medium',
  `category` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `submitted_date` date DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `rejected_date` date DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_attendance`
--

CREATE TABLE `teacher_attendance` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('Present','Absent','Half Day','Late') DEFAULT 'Present',
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `location_verified` tinyint(1) DEFAULT 0,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_classes`
--

CREATE TABLE `teacher_classes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `teacher_id` int(11) NOT NULL,
  `class` varchar(10) NOT NULL,
  `section` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `teacher_full_details`
-- (See below for the actual view)
--
CREATE TABLE `teacher_full_details` (
`id` int(11)
,`employee_id` varchar(50)
,`name` varchar(255)
,`email` varchar(255)
,`phone` varchar(20)
,`subject` varchar(255)
,`qualification` varchar(255)
,`experience` varchar(50)
,`joining_date` date
,`status` enum('active','inactive','suspended')
);

-- --------------------------------------------------------

--
-- Table structure for table `teacher_grievance`
--

CREATE TABLE `teacher_grievance` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `teacher_id` int(11) NOT NULL,
  `teacher_name` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `priority` varchar(50) DEFAULT 'Medium',
  `status` varchar(50) DEFAULT 'Pending',
  `submitted_date` date DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `resolved_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_leaves`
--

CREATE TABLE `teacher_leaves` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_payslips`
--

CREATE TABLE `teacher_payslips` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `month` varchar(20) NOT NULL,
  `year` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenders`
--

CREATE TABLE `tenders` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `opening_date` date NOT NULL,
  `closing_date` date NOT NULL,
  `min_bid_amount` decimal(15,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'open',
  `school_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `requisition_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable`
--

CREATE TABLE `timetable` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `class_number` varchar(20) NOT NULL,
  `section` varchar(10) NOT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `time_slot_id` int(11) NOT NULL,
  `time_slot_name` varchar(100) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `subject_name` varchar(255) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `teacher_name` varchar(255) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_elective` tinyint(1) DEFAULT 0,
  `is_merged` tinyint(1) DEFAULT 0,
  `merged_id` varchar(50) DEFAULT NULL,
  `merge_group_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timetable_elective_students`
--

CREATE TABLE `timetable_elective_students` (
  `id` int(11) NOT NULL,
  `timetable_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `timetable_view`
-- (See below for the actual view)
--
CREATE TABLE `timetable_view` (
`id` int(11)
,`class_number` varchar(20)
,`section` varchar(10)
,`day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
,`slot_name` varchar(50)
,`start_time` time
,`end_time` time
,`is_break` tinyint(1)
,`subject_name` varchar(100)
,`subject_code` varchar(20)
,`employee_id` varchar(50)
,`teacher_name` varchar(255)
,`room_number` varchar(50)
,`school_id` int(11)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `time_slots`
--

CREATE TABLE `time_slots` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `slot_name` varchar(50) NOT NULL,
  `is_break` tinyint(1) DEFAULT 0,
  `display_order` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `transaction_id` varchar(50) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `net_amount` decimal(10,2) DEFAULT NULL,
  `gst_amount` decimal(10,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `status` varchar(20) DEFAULT 'success',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transfer_certificates`
--

CREATE TABLE `transfer_certificates` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `class` varchar(50) NOT NULL,
  `section` varchar(20) NOT NULL,
  `roll_no` varchar(50) NOT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `admission_no` varchar(50) DEFAULT NULL,
  `date_of_leaving` date NOT NULL,
  `last_class_attended` varchar(50) NOT NULL,
  `reason_for_leaving` text NOT NULL,
  `conduct` enum('Excellent','Very Good','Good','Satisfactory','Poor') DEFAULT 'Good',
  `total_attendance_percentage` decimal(5,2) DEFAULT NULL,
  `eligible_for_admission` tinyint(1) DEFAULT 1,
  `fees_cleared` tinyint(1) DEFAULT 0,
  `outstanding_fees` decimal(10,2) DEFAULT 0.00,
  `certificate_number` varchar(100) NOT NULL,
  `issued_date` date NOT NULL,
  `remarks` text DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transport_assignments`
--

CREATE TABLE `transport_assignments` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL DEFAULT 1,
  `student_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `route_name` varchar(255) DEFAULT NULL,
  `pickup_point` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transport_drivers`
--

CREATE TABLE `transport_drivers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL DEFAULT 1,
  `license_no` varchar(50) NOT NULL,
  `experience_years` int(11) DEFAULT 0,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transport_driver_attendance`
--

CREATE TABLE `transport_driver_attendance` (
  `id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `status` enum('Present','Absent','Late','Half Day') NOT NULL DEFAULT 'Present',
  `check_in_time` varchar(15) DEFAULT NULL,
  `check_out_time` varchar(15) DEFAULT NULL,
  `location_verified` tinyint(1) DEFAULT 0,
  `school_id` int(11) NOT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `distance_from_school` decimal(10,2) DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transport_vehicles`
--

CREATE TABLE `transport_vehicles` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL DEFAULT 1,
  `vehicle_no` varchar(50) NOT NULL,
  `type` enum('Bus','Mini Bus','Van','Car (4 Wheeler)','SUV') NOT NULL DEFAULT 'Bus',
  `model` varchar(100) DEFAULT NULL,
  `capacity` int(11) NOT NULL,
  `registration_no` varchar(50) NOT NULL,
  `status` enum('Active','Maintenance','Inactive') DEFAULT 'Active',
  `driver_id` int(11) DEFAULT NULL COMMENT 'Reference to users table with role driver',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `route` varchar(255) DEFAULT 'Not Set' COMMENT 'The designated path/route this vehicle travels',
  `current_latitude` decimal(10,8) DEFAULT NULL,
  `current_longitude` decimal(11,8) DEFAULT NULL,
  `is_tracking` tinyint(1) DEFAULT 0,
  `last_location_update` timestamp NULL DEFAULT NULL,
  `tracking_start_time` timestamp NULL DEFAULT NULL,
  `current_place_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT 1,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','accountant','admin','admission','librarian','storemanager','security','driver','nonteachingstaff','superadmin') NOT NULL DEFAULT 'student',
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `student_unique_id` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visitor_approvals`
--

CREATE TABLE `visitor_approvals` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `visitor_name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `whom_to_meet` varchar(50) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `visit_date` date NOT NULL,
  `visit_time` time NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure for view `teacher_full_details`
--
DROP TABLE IF EXISTS `teacher_full_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `teacher_full_details`  AS SELECT `t`.`id` AS `id`, `t`.`employee_id` AS `employee_id`, `u`.`name` AS `name`, `u`.`email` AS `email`, `u`.`phone` AS `phone`, `t`.`subject` AS `subject`, `t`.`qualification` AS `qualification`, `t`.`experience` AS `experience`, `t`.`joining_date` AS `joining_date`, `u`.`status` AS `status` FROM (`teachers` `t` join `users` `u` on(`t`.`user_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `timetable_view`
--
DROP TABLE IF EXISTS `timetable_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `timetable_view`  AS SELECT `t`.`id` AS `id`, `t`.`class_number` AS `class_number`, `t`.`section` AS `section`, `t`.`day_of_week` AS `day_of_week`, `ts`.`slot_name` AS `slot_name`, `ts`.`start_time` AS `start_time`, `ts`.`end_time` AS `end_time`, `ts`.`is_break` AS `is_break`, `s`.`name` AS `subject_name`, `s`.`code` AS `subject_code`, `te`.`employee_id` AS `employee_id`, `u`.`name` AS `teacher_name`, `t`.`room_number` AS `room_number`, `t`.`school_id` AS `school_id`, `t`.`created_at` AS `created_at`, `t`.`updated_at` AS `updated_at` FROM ((((`timetable` `t` join `time_slots` `ts` on(`t`.`time_slot_id` = `ts`.`id`)) left join `subjects` `s` on(`t`.`subject_id` = `s`.`id`)) left join `teachers` `te` on(`t`.`teacher_id` = `te`.`id`)) left join `users` `u` on(`te`.`user_id` = `u`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `action` (`action`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `idx_school_id` (`school_id`),
  ADD KEY `idx_branch_id` (`branch_id`),
  ADD KEY `idx_module_name` (`module_name`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_entity_id` (`entity_id`),
  ADD KEY `idx_performed_by_user_id` (`performed_by_user_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_announcements_school` (`school_id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `bonafide_certificates`
--
ALTER TABLE `bonafide_certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_certificate_number` (`certificate_number`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_school_id` (`school_id`),
  ADD KEY `idx_issued_date` (`issued_date`);

--
-- Indexes for table `character_certificates`
--
ALTER TABLE `character_certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_certificate_number` (`certificate_number`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_school_id` (`school_id`),
  ADD KEY `idx_issued_date` (`issued_date`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_number_school` (`class_number`,`school_id`),
  ADD KEY `idx_class_number` (`class_number`),
  ADD KEY `idx_classes_school` (`school_id`);

--
-- Indexes for table `class_notes`
--
ALTER TABLE `class_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `class_sections`
--
ALTER TABLE `class_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_section_stream` (`school_id`,`class_id`,`section_id`,`stream_id`),
  ADD KEY `idx_class_sections_school` (`school_id`),
  ADD KEY `idx_class_sections_class` (`class_id`),
  ADD KEY `idx_class_sections_section` (`section_id`);

--
-- Indexes for table `class_streams`
--
ALTER TABLE `class_streams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_stream` (`school_id`,`class_id`,`stream_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `stream_id` (`stream_id`);

--
-- Indexes for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_subject` (`school_id`,`class_id`,`subject_id`,`stream_id`),
  ADD KEY `idx_class_subjects_school` (`school_id`),
  ADD KEY `idx_class_subjects_class` (`class_id`),
  ADD KEY `idx_class_subjects_subject` (`subject_id`),
  ADD KEY `idx_class_subjects_stream` (`class_id`,`stream_id`);

--
-- Indexes for table `combination_subjects`
--
ALTER TABLE `combination_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_combo_subject` (`combination_id`,`subject_id`);

--
-- Indexes for table `daywise_attendance_teachers`
--
ALTER TABLE `daywise_attendance_teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`school_id`,`teacher_id`,`class_number`,`stream_id`,`section`);

--
-- Indexes for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enquiry_number` (`enquiry_number`),
  ADD KEY `idx_school_id` (`school_id`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_follow_up_date` (`follow_up_date`),
  ADD KEY `fk_enquiry_stream` (`stream_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_events_school_date` (`school_id`,`event_date`);

--
-- Indexes for table `exam_terms`
--
ALTER TABLE `exam_terms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam_terms_school` (`school_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `idx_expenses_date` (`school_id`,`expense_date`);

--
-- Indexes for table `fee_admission`
--
ALTER TABLE `fee_admission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_fee_admission_school` (`school_id`);

--
-- Indexes for table `fee_column_types`
--
ALTER TABLE `fee_column_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_col_key_school` (`school_id`,`column_key`);

--
-- Indexes for table `fee_column_values`
--
ALTER TABLE `fee_column_values`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_val` (`fee_structure_id`,`column_type_id`),
  ADD KEY `column_type_id` (`column_type_id`);

--
-- Indexes for table `fee_records`
--
ALTER TABLE `fee_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_fee_records_school` (`school_id`),
  ADD KEY `idx_fees_academic` (`school_id`,`academic_year`,`status`);

--
-- Indexes for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_fee_class_school_stream` (`school_id`,`class_id`,`stream_id`),
  ADD KEY `idx_fee_structures_school` (`school_id`),
  ADD KEY `idx_fee_structures_class` (`class_id`);

--
-- Indexes for table `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `grievances`
--
ALTER TABLE `grievances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `week_start_date` (`week_start_date`);

--
-- Indexes for table `lesson_plan_comments`
--
ALTER TABLE `lesson_plan_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_plan_id` (`lesson_plan_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `library_books`
--
ALTER TABLE `library_books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_isbn_school` (`isbn`,`school_id`),
  ADD KEY `idx_library_books_title` (`title`),
  ADD KEY `idx_library_books_author` (`author`),
  ADD KEY `idx_library_books_category` (`category`),
  ADD KEY `idx_library_books_school` (`school_id`);

--
-- Indexes for table `library_issued_books`
--
ALTER TABLE `library_issued_books`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_issued_books_student` (`student_id`),
  ADD KEY `idx_issued_books_book` (`book_id`),
  ADD KEY `idx_issued_books_status` (`status`);

--
-- Indexes for table `marksheet_templates`
--
ALTER TABLE `marksheet_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_marksheet_templates_school` (`school_id`);

--
-- Indexes for table `marks_assignments`
--
ALTER TABLE `marks_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`school_id`,`exam_term_id`,`class`,`section`,`subject_id`),
  ADD KEY `idx_marks_assignments_school` (`school_id`),
  ADD KEY `idx_marks_assignments_teacher` (`teacher_id`),
  ADD KEY `idx_marks_assignments_term` (`exam_term_id`);

--
-- Indexes for table `non_teaching_staff`
--
ALTER TABLE `non_teaching_staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `non_teaching_staff_attendance`
--
ALTER TABLE `non_teaching_staff_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_staff_date` (`user_id`,`date`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `non_teaching_staff_cards`
--
ALTER TABLE `non_teaching_staff_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`card_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `non_teaching_staff_shifts`
--
ALTER TABLE `non_teaching_staff_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_school_user` (`school_id`,`user_id`),
  ADD KEY `idx_effective` (`effective_from`,`effective_to`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_notices_school_date` (`school_id`,`publish_date`),
  ADD KEY `idx_notices_active` (`school_id`,`is_active`);

--
-- Indexes for table `online_study_videos`
--
ALTER TABLE `online_study_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `fk_video_playlist` (`playlist_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tender_id` (`tender_id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Indexes for table `requisitions`
--
ALTER TABLE `requisitions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_school_code` (`code`);

--
-- Indexes for table `school_settings`
--
ALTER TABLE `school_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_setting` (`school_id`,`setting_key`);

--
-- Indexes for table `school_weekly_schedule`
--
ALTER TABLE `school_weekly_schedule`
  ADD PRIMARY KEY (`school_id`,`day_of_week`);

--
-- Indexes for table `school_working_days`
--
ALTER TABLE `school_working_days`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_school_date` (`school_id`,`date`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_section_code_school` (`code`,`school_id`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_sections_school` (`school_id`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_bills`
--
ALTER TABLE `store_bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bill_number` (`bill_number`),
  ADD KEY `idx_bill_number` (`bill_number`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_store_school` (`store_id`,`school_id`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Indexes for table `store_grievances`
--
ALTER TABLE `store_grievances`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_inventory`
--
ALTER TABLE `store_inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`);

--
-- Indexes for table `store_requisitions`
--
ALTER TABLE `store_requisitions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_transactions`
--
ALTER TABLE `store_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `streams`
--
ALTER TABLE `streams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_stream` (`school_id`,`code`);

--
-- Indexes for table `stream_combinations`
--
ALTER TABLE `stream_combinations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_combination` (`school_id`,`code`),
  ADD KEY `stream_id` (`stream_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `unique_roll_class_section_school` (`roll_no`,`class`,`section`,`school_id`),
  ADD UNIQUE KEY `student_unique_id` (`student_unique_id`),
  ADD KEY `idx_roll_no` (`roll_no`),
  ADD KEY `idx_class_section` (`class`,`section`),
  ADD KEY `idx_students_application_id` (`application_id`),
  ADD KEY `idx_students_school` (`school_id`),
  ADD KEY `idx_student_school` (`school_id`,`class`),
  ADD KEY `idx_student_search` (`student_unique_id`,`roll_no`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `students_attendance`
--
ALTER TABLE `students_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`student_id`,`date`,`subject`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_marked_by` (`marked_by`),
  ADD KEY `idx_students_attendance_school` (`school_id`),
  ADD KEY `idx_att_date_school` (`school_id`,`date`),
  ADD KEY `idx_att_student` (`student_id`,`school_id`);

--
-- Indexes for table `student_applications`
--
ALTER TABLE `student_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_application_no_school` (`application_no`,`school_id`),
  ADD KEY `idx_student_applications_school` (`school_id`);

--
-- Indexes for table `student_cards`
--
ALTER TABLE `student_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `student_fee_discounts`
--
ALTER TABLE `student_fee_discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_school` (`school_id`,`student_id`);

--
-- Indexes for table `student_grievances`
--
ALTER TABLE `student_grievances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `student_leaves`
--
ALTER TABLE `student_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `student_marks`
--
ALTER TABLE `student_marks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_mark` (`school_id`,`exam_term_id`,`student_id`,`subject_id`),
  ADD KEY `idx_student_marks_school` (`school_id`),
  ADD KEY `idx_student_marks_term` (`exam_term_id`),
  ADD KEY `idx_student_marks_student` (`student_id`);

--
-- Indexes for table `student_requisition`
--
ALTER TABLE `student_requisition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `study_notes`
--
ALTER TABLE `study_notes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `study_playlists`
--
ALTER TABLE `study_playlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_subject_code_school` (`code`,`school_id`),
  ADD KEY `idx_subjects_school` (`school_id`);

--
-- Indexes for table `syllabus`
--
ALTER TABLE `syllabus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id_idx` (`school_id`),
  ADD KEY `class_idx` (`class`),
  ADD KEY `subject_id_idx` (`subject_id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `unique_employee_id_school` (`employee_id`,`school_id`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_teachers_school` (`school_id`),
  ADD KEY `idx_teacher_school` (`school_id`);

--
-- Indexes for table `teachers_requisition`
--
ALTER TABLE `teachers_requisition`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `teacher_attendance`
--
ALTER TABLE `teacher_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`teacher_id`,`date`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `teacher_classes`
--
ALTER TABLE `teacher_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_teacher_class` (`teacher_id`,`class`,`section`);

--
-- Indexes for table `teacher_grievance`
--
ALTER TABLE `teacher_grievance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `teacher_leaves`
--
ALTER TABLE `teacher_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `teacher_payslips`
--
ALTER TABLE `teacher_payslips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `tenders`
--
ALTER TABLE `tenders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `requisition_id` (`requisition_id`);

--
-- Indexes for table `timetable`
--
ALTER TABLE `timetable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_timetable_slot_school` (`class_number`,`section`,`stream_id`,`day_of_week`,`time_slot_id`,`school_id`),
  ADD KEY `fk_time_slot` (`time_slot_id`),
  ADD KEY `fk_subject` (`subject_id`),
  ADD KEY `fk_teacher` (`teacher_id`),
  ADD KEY `idx_timetable_school` (`school_id`);

--
-- Indexes for table `timetable_elective_students`
--
ALTER TABLE `timetable_elective_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_timetable_student` (`timetable_id`,`student_id`);

--
-- Indexes for table `time_slots`
--
ALTER TABLE `time_slots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `transfer_certificates`
--
ALTER TABLE `transfer_certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_certificate_number` (`certificate_number`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_school_id` (`school_id`),
  ADD KEY `idx_issued_date` (`issued_date`);

--
-- Indexes for table `transport_assignments`
--
ALTER TABLE `transport_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_transport` (`student_id`,`school_id`),
  ADD KEY `fk_transport_vehicle` (`vehicle_id`);

--
-- Indexes for table `transport_drivers`
--
ALTER TABLE `transport_drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_driver_user` (`user_id`);

--
-- Indexes for table `transport_driver_attendance`
--
ALTER TABLE `transport_driver_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_driver_date` (`driver_id`,`date`),
  ADD KEY `idx_school_date` (`school_id`,`date`);

--
-- Indexes for table `transport_vehicles`
--
ALTER TABLE `transport_vehicles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_users_school` (`school_id`),
  ADD KEY `idx_user_login` (`email`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `visitor_approvals`
--
ALTER TABLE `visitor_approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `status` (`status`),
  ADD KEY `visit_date` (`visit_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bonafide_certificates`
--
ALTER TABLE `bonafide_certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `character_certificates`
--
ALTER TABLE `character_certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_notes`
--
ALTER TABLE `class_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_sections`
--
ALTER TABLE `class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_streams`
--
ALTER TABLE `class_streams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class_subjects`
--
ALTER TABLE `class_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `combination_subjects`
--
ALTER TABLE `combination_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daywise_attendance_teachers`
--
ALTER TABLE `daywise_attendance_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_terms`
--
ALTER TABLE `exam_terms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_admission`
--
ALTER TABLE `fee_admission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_column_types`
--
ALTER TABLE `fee_column_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_column_values`
--
ALTER TABLE `fee_column_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_records`
--
ALTER TABLE `fee_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_structures`
--
ALTER TABLE `fee_structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grievances`
--
ALTER TABLE `grievances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lesson_plan_comments`
--
ALTER TABLE `lesson_plan_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `library_books`
--
ALTER TABLE `library_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `library_issued_books`
--
ALTER TABLE `library_issued_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marksheet_templates`
--
ALTER TABLE `marksheet_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marks_assignments`
--
ALTER TABLE `marks_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `non_teaching_staff`
--
ALTER TABLE `non_teaching_staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `non_teaching_staff_attendance`
--
ALTER TABLE `non_teaching_staff_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `non_teaching_staff_cards`
--
ALTER TABLE `non_teaching_staff_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `non_teaching_staff_shifts`
--
ALTER TABLE `non_teaching_staff_shifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `online_study_videos`
--
ALTER TABLE `online_study_videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requisitions`
--
ALTER TABLE `requisitions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_settings`
--
ALTER TABLE `school_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_working_days`
--
ALTER TABLE `school_working_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_bills`
--
ALTER TABLE `store_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_grievances`
--
ALTER TABLE `store_grievances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_inventory`
--
ALTER TABLE `store_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_requisitions`
--
ALTER TABLE `store_requisitions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_transactions`
--
ALTER TABLE `store_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `streams`
--
ALTER TABLE `streams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stream_combinations`
--
ALTER TABLE `stream_combinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students_attendance`
--
ALTER TABLE `students_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_applications`
--
ALTER TABLE `student_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_cards`
--
ALTER TABLE `student_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_fee_discounts`
--
ALTER TABLE `student_fee_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_grievances`
--
ALTER TABLE `student_grievances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_leaves`
--
ALTER TABLE `student_leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_marks`
--
ALTER TABLE `student_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_requisition`
--
ALTER TABLE `student_requisition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `study_notes`
--
ALTER TABLE `study_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `study_playlists`
--
ALTER TABLE `study_playlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `syllabus`
--
ALTER TABLE `syllabus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers_requisition`
--
ALTER TABLE `teachers_requisition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_attendance`
--
ALTER TABLE `teacher_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_classes`
--
ALTER TABLE `teacher_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_grievance`
--
ALTER TABLE `teacher_grievance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_leaves`
--
ALTER TABLE `teacher_leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teacher_payslips`
--
ALTER TABLE `teacher_payslips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenders`
--
ALTER TABLE `tenders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable`
--
ALTER TABLE `timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timetable_elective_students`
--
ALTER TABLE `timetable_elective_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_slots`
--
ALTER TABLE `time_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transfer_certificates`
--
ALTER TABLE `transfer_certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transport_assignments`
--
ALTER TABLE `transport_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transport_drivers`
--
ALTER TABLE `transport_drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transport_driver_attendance`
--
ALTER TABLE `transport_driver_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transport_vehicles`
--
ALTER TABLE `transport_vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visitor_approvals`
--
ALTER TABLE `visitor_approvals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bonafide_certificates`
--
ALTER TABLE `bonafide_certificates`
  ADD CONSTRAINT `fk_bonafide_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bonafide_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `character_certificates`
--
ALTER TABLE `character_certificates`
  ADD CONSTRAINT `fk_character_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_character_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_notes`
--
ALTER TABLE `class_notes`
  ADD CONSTRAINT `class_notes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_notes_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_notes_ibfk_3` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_sections`
--
ALTER TABLE `class_sections`
  ADD CONSTRAINT `fk_class_sections_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_class_sections_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_streams`
--
ALTER TABLE `class_streams`
  ADD CONSTRAINT `class_streams_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_streams_ibfk_2` FOREIGN KEY (`stream_id`) REFERENCES `streams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD CONSTRAINT `fk_class_subjects_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_class_subjects_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enquiries`
--
ALTER TABLE `enquiries`
  ADD CONSTRAINT `fk_enquiry_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enquiry_stream` FOREIGN KEY (`stream_id`) REFERENCES `streams` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  ADD CONSTRAINT `lesson_plans_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_plans_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_plan_comments`
--
ALTER TABLE `lesson_plan_comments`
  ADD CONSTRAINT `lesson_plan_comments_ibfk_1` FOREIGN KEY (`lesson_plan_id`) REFERENCES `lesson_plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_plan_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `non_teaching_staff`
--
ALTER TABLE `non_teaching_staff`
  ADD CONSTRAINT `fk_non_teaching_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `non_teaching_staff_attendance`
--
ALTER TABLE `non_teaching_staff_attendance`
  ADD CONSTRAINT `fk_nts_attendance_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `non_teaching_staff_cards`
--
ALTER TABLE `non_teaching_staff_cards`
  ADD CONSTRAINT `non_teaching_staff_cards_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `non_teaching_staff_cards_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `timetable_elective_students`
--
ALTER TABLE `timetable_elective_students`
  ADD CONSTRAINT `timetable_elective_students_ibfk_1` FOREIGN KEY (`timetable_id`) REFERENCES `timetable` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transfer_certificates`
--
ALTER TABLE `transfer_certificates`
  ADD CONSTRAINT `fk_transfer_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_transfer_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
