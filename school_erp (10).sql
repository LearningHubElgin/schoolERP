-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 14, 2026 at 12:26 PM
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `school_id`, `user_id`, `user_name`, `user_email`, `user_role`, `action`, `details`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES
(2, 1, 3774, 'Sumaira Kamal ', 'Unknown Email', 'student', 'Login', 'User logged in successfully: Sumaira Kamal  (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-22 11:15:58'),
(3, 1, 3774, 'Sumaira Kamal ', 'Unknown Email', 'student', 'Login', 'User logged in successfully: Sumaira Kamal  (student)', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-04-22 11:17:31'),
(4, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-04-22 11:17:57'),
(5, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:3b:6d9:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-04-22 11:35:37'),
(6, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e1:1109:d025:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-04-23 03:43:36'),
(7, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8828:c29a:18f6:6ee9:a527:9fc0', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-04-26 04:43:35'),
(8, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8828:c29a:7999:1aca:eb80:a644', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-26 09:57:21'),
(9, 1, 311, 'fauzia kamal', 'yamankamal16.pratt@gmail.com', 'teacher', 'Login', 'User logged in successfully: fauzia kamal (teacher)', '2402:3a80:1986:d6f6:478:5634:1232:5476', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-04-27 05:51:34'),
(10, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '117.199.0.131', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'Success', '2026-04-27 06:32:08'),
(11, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:46:c0b1:b199:67d7:fb98:ba08', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-27 19:28:47'),
(12, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:882b:3ad1:d577:64d:7547:be6c', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 05:58:16'),
(13, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:04:59'),
(14, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:05:53'),
(15, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:882b:3ad1:d1d0:27f7:fb16:7ec9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:21:15'),
(16, 3, 333, 'jaswal', 'jaswal@jhgh.djyf', 'student', 'Login', 'User logged in successfully: jaswal (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:29:32'),
(17, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 06:34:20'),
(18, 3, 266, 'library demo', 'admin', 'admin', 'Update', 'Updated user: library demo (ID: 269)', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:34:30'),
(19, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 06:34:32'),
(20, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 06:34:34'),
(21, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:35:03'),
(22, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library@school.edu', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 06:39:42'),
(23, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library@school.edu', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 06:41:50'),
(24, 1, 136, 'Librarian', 'library@school.edu', 'librarian', 'Login', 'User logged in successfully: Librarian (librarian)', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:41:53'),
(25, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (librarian@school.com)', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 06:50:49'),
(26, 1, 28, 'Librarian', 'admin@school.edu', 'admin', 'Update', 'Updated user: Librarian (ID: 136)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:51:08'),
(27, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library@school.edu', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 06:51:25'),
(28, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library@school.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Failed', '2026-04-30 06:53:20'),
(29, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library@school.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Failed', '2026-04-30 06:56:45'),
(30, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for library@school.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Failed', '2026-04-30 06:56:46'),
(31, 1, 28, 'Librarian', 'admin@school.edu', 'admin', 'Update', 'Updated user: Librarian (ID: 136)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:57:13'),
(32, 1, 136, 'Librarian', 'library@school.edu', 'librarian', 'Login', 'User logged in successfully: Librarian (librarian)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-04-30 06:57:17'),
(33, 1, 136, 'Librarian', 'library@school.edu', 'librarian', 'Login', 'User logged in successfully: Librarian (librarian)', '2401:4900:882b:3ad1:d1d0:27f7:fb16:7ec9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 06:59:04'),
(34, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 07:23:47'),
(35, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 07:35:16'),
(36, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 09:29:42'),
(37, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission@school.edu', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 09:55:42'),
(38, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission@school.edu', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-04-30 09:55:49'),
(39, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '223.185.34.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 09:56:03'),
(40, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '2401:4900:882b:3ad1:d1d0:27f7:fb16:7ec9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-04-30 10:56:30'),
(41, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-04-30 13:42:08'),
(42, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '2401:4900:882b:3ad1:2dd7:d498:3ed0:4a43', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-01 06:05:33'),
(43, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (admin@example.com)', '2409:40e0:4c:975e:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Failed', '2026-05-01 10:43:17'),
(44, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2409:40e0:4c:975e:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-01 10:43:39'),
(45, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2409:40e0:1b:4545:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-01 15:08:13'),
(46, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-01 18:46:07'),
(47, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2409:40e0:3b:e47b:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-02 01:10:54'),
(48, 3, 266, 'library demo', 'admin', 'admin', 'Update', 'Updated user: library demo (ID: 269)', '2409:40e1:107a:247b:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-02 05:27:58'),
(49, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2409:40e0:102c:ea07:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-02 08:56:44'),
(50, 3, 333, 'jaswal', 'jaswal@jhgh.djyf', 'student', 'Login', 'User logged in successfully: jaswal (student)', '2409:40e0:102c:ea07:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-02 09:05:13'),
(51, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (admin2)', '223.185.33.113', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-02 14:08:24'),
(52, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '223.185.33.113', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-02 14:10:04'),
(53, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:882b:b92f:4d7f:c298:fd40:e9ca', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-02 14:13:12'),
(54, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2409:40e1:100b:25ab:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-02 22:58:17'),
(55, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '2409:40e1:100b:25ab:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-02 23:03:01'),
(56, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '2409:40e1:100b:25ab:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-02 23:10:54'),
(57, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:7593:2e8::15c:e5c9', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-04 05:47:52'),
(58, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (admin@example.com)', '2409:40e1:100a:2ed8:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Failed', '2026-05-04 08:27:22'),
(59, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (admin@achool.edu)', '2409:40e1:100a:2ed8:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Failed', '2026-05-04 08:27:34'),
(60, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e1:100a:2ed8:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-04 08:27:44'),
(61, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '2402:3a80:42e8:add:378:5634:1232:5476', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-05 03:02:05'),
(62, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 06:51:31'),
(63, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 07:27:57'),
(64, 1, 307, 'Afreen akhtar', 'Afreenakhtar9864@gmail.com', 'teacher', 'Login', 'User logged in successfully: Afreen akhtar (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 08:53:16'),
(65, 1, 308, 'Ghazi salauddin', 'ghazi@gmail.com', 'teacher', 'Login', 'User logged in successfully: Ghazi salauddin (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 08:55:01'),
(66, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-05 08:59:43'),
(67, 1, 3750, 'Abdul Hasan', 'Unknown Email', 'student', 'Login', 'User logged in successfully: Abdul Hasan (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 08:59:52'),
(68, 1, 422, 'Aliza Fatma', 'Unknown Email', 'student', 'Login', 'User logged in successfully: Aliza Fatma (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 09:00:58'),
(69, 1, 3777, 'ghfh', 'Unknown Email', 'student', 'Login', 'User logged in successfully: ghfh (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 09:08:19'),
(70, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for Afreenakhtar9864@gmail.com', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-05 09:10:42'),
(71, 1, 307, 'Afreen akhtar', 'Afreenakhtar9864@gmail.com', 'teacher', 'Login', 'User logged in successfully: Afreen akhtar (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 09:10:51'),
(72, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 09:27:46'),
(73, 1, 3776, 'aaaa', 'Unknown Email', 'student', 'Login', 'User logged in successfully: aaaa (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-05 09:30:30'),
(74, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 07:50:31'),
(75, 1, 309, 'Sabiha mahmud', 'knowmesabiha02@gmail.com', 'teacher', 'Login', 'User logged in successfully: Sabiha mahmud (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 08:23:00'),
(76, 1, 28, 'Unknown User', 'admin@school.edu', 'admin', 'Delete', 'Deleted student record (ID: 491)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 08:23:57'),
(77, 1, 28, 'Unknown User', 'admin@school.edu', 'admin', 'Delete', 'Deleted student record (ID: 490)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 08:23:59'),
(78, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:37:10'),
(79, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:44:26'),
(80, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:44:27'),
(81, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:48:26'),
(82, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:48:27'),
(83, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:48:27'),
(84, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:48:27'),
(85, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:48:28'),
(86, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:49:09'),
(87, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 09:49:12'),
(88, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 09:49:19'),
(89, 3, 266, 'admission demo', 'admin', 'admin', 'Update', 'Updated user: admission demo (ID: 268)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 09:49:46'),
(90, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 09:49:48'),
(91, 3, 266, 'admission demo', 'admin', 'admin', 'Update', 'Updated user: admission demo (ID: 268)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 09:51:11'),
(92, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 09:51:23'),
(93, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 10:02:10'),
(94, 1, 311, 'fauzia kamal', 'yamankamal16.pratt@gmail.com', 'teacher', 'Login', 'User logged in successfully: fauzia kamal (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-06 10:12:54'),
(95, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 11:21:11'),
(96, 5, 3781, 'abcd Administrator', 'abc@school.erp', 'admin', 'Login', 'User logged in successfully: abcd Administrator (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-06 12:08:45'),
(97, 5, 3781, 'abcd Administrator', 'abc@school.erp', 'admin', 'Login', 'User logged in successfully: abcd Administrator (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-06 12:09:01'),
(98, 5, 3781, 'abcd Administrator', 'abc@school.erp', 'admin', 'Login', 'User logged in successfully: abcd Administrator (admin)', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-06 12:10:31'),
(99, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (superadmin@school.edu)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-06 12:56:12'),
(100, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 12:57:43'),
(101, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '2401:4900:8829:451b:356a:83e7:123f:9b4d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-06 14:40:21'),
(102, 1, 310, 'Ayesha khatoon', 'ayeshakhan9038486059.ak@gmail.com', 'teacher', 'Login', 'User logged in successfully: Ayesha khatoon (teacher)', '2409:40e0:2f:6d4d:1916:b0c7:8503:a89f', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-07 02:54:46'),
(103, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '2401:4900:8829:c0f3:290f:fa11:4c13:4782', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 05:04:32'),
(104, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:290f:fa11:4c13:4782', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 05:05:48'),
(105, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (admin2)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-07 05:17:33'),
(106, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admin@school.edu', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-07 05:24:17'),
(107, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 05:24:22'),
(108, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:7433:e786:cd00:df10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 06:58:28'),
(109, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 07:21:50'),
(110, 1, 28, 'Unknown User', 'admin@school.edu', 'admin', 'Delete', 'Deleted student record (ID: 487)', '2401:4900:8829:c0f3:290f:fa11:4c13:4782', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 08:02:41'),
(111, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 09:52:11'),
(112, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 09:55:27'),
(113, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 09:55:56'),
(114, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '::1', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-07 13:25:14'),
(115, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 13:29:55'),
(116, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 13:43:40'),
(117, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 13:44:02'),
(118, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '2401:4900:8829:c0f3:290f:fa11:4c13:4782', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 13:47:12'),
(119, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admin', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Failed', '2026-05-07 13:51:43'),
(120, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-07 13:51:51'),
(121, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admin', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Failed', '2026-05-07 13:56:35'),
(122, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-07 13:56:46'),
(123, 3, 266, 'Unknown User', 'admin', 'admin', 'Delete', 'Deleted student record (ID: 495)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-07 14:10:22'),
(124, 3, 266, 'Unknown User', 'admin', 'admin', 'Delete', 'Deleted student record (ID: 494)', '2401:4900:8829:c0f3:b8c8:7bdc:1ce6:4745', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-07 14:10:27'),
(125, 3, 3790, 'aqwcdAdswdwsdwdqw', 'rrout5486@gmail.com', 'student', 'Login', 'User logged in successfully: aqwcdAdswdwsdwdqw (student)', '2401:4900:8829:c0f3:290f:fa11:4c13:4782', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-07 14:27:25'),
(126, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (admin@school.ed)', '2401:4900:8829:c0f3:290f:fa11:4c13:4782', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-08 04:42:16'),
(127, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:290f:fa11:4c13:4782', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 04:42:21'),
(128, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 07:10:46'),
(129, 1, 131, 'Shah faisal', 'accounts@school.edu', 'accountant', 'Login', 'User logged in successfully: Shah faisal (accountant)', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 07:11:29'),
(130, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 07:21:12'),
(131, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 07:25:39'),
(132, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 10:07:28'),
(133, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-08 10:09:59'),
(134, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 10:10:17'),
(135, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:2427:1ee0:bc74:ccef:d943:729a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 10:39:10'),
(136, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:b09c:f7ae:4a18:e0d8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 12:38:51'),
(137, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '2401:4900:8829:c0f3:a99a:aa68:bd92:55e2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Failed', '2026-05-08 12:59:00'),
(138, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '2401:4900:8829:c0f3:a99a:aa68:bd92:55e2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 12:59:06'),
(139, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '2401:4900:8829:c0f3:6077:b088:c63c:c650', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 14:07:19'),
(140, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:8829:c0f3:6077:b088:c63c:c650', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-08 14:33:18'),
(141, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-09 05:36:02'),
(142, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:a124:884a:ecad:390b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-09 09:48:32'),
(143, 1, 303, 'OROOSA ORAJEE ', 'orajeeoroosa@gmail.com', 'teacher', 'Login', 'User logged in successfully: OROOSA ORAJEE  (teacher)', '2409:40e0:243b:432a:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-09 15:38:04'),
(144, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admin', '2401:4900:8829:c0f3:8bc:6cf8:af1a:425b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Failed', '2026-05-10 06:31:04'),
(145, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:8829:c0f3:8bc:6cf8:af1a:425b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-10 06:31:10'),
(146, 3, 3797, 'add', 'Unknown Email', 'student', 'Login', 'User logged in successfully: add (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-10 07:19:52'),
(147, 3, 3791, 'AScd ', 'Unknown Email', 'student', 'Login', 'User logged in successfully: AScd  (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-10 07:20:49'),
(148, 3, 3790, 'aqwcdAdswdwsdwdqw', 'rrout5486@gmail.com', 'student', 'Login', 'User logged in successfully: aqwcdAdswdwsdwdqw (student)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-10 07:21:49'),
(149, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-10 07:22:24'),
(150, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-10 07:43:47'),
(151, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-10 07:47:44'),
(152, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-10 07:52:44'),
(153, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:8bc:6cf8:af1a:425b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-10 10:21:29'),
(154, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', 'Success', '2026-05-10 11:12:01'),
(155, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-10 11:44:40'),
(156, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-10 12:36:15'),
(157, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-10 12:36:24'),
(158, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '2401:4900:8829:c0f3:8bc:6cf8:af1a:425b', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-10 13:22:30'),
(159, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:c0f3:8c87:f7a4:64c2:4751', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-10 14:14:00'),
(160, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2409:40e0:1049:b6d5:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-10 15:53:40'),
(161, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '2409:40e0:53:ed83:a966:f086:2070:8106', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-10 17:47:46'),
(162, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '223.185.29.157', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-11 05:22:15'),
(163, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:100f:7955:8000::', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-11 06:21:46'),
(164, 1, 3800, 'Tanusree Paul', 'tanusreepaul872@gmail.com', 'teacher', 'Login', 'User logged in successfully: Tanusree Paul (teacher)', '2401:4900:735c:bd8b::1237:626c', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-11 06:55:07');
INSERT INTO `activity_logs` (`id`, `school_id`, `user_id`, `user_name`, `user_email`, `user_role`, `action`, `details`, `ip_address`, `user_agent`, `status`, `created_at`) VALUES
(165, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '2409:40e0:100f:7955:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-11 07:00:53'),
(166, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:100f:7955:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-11 07:06:44'),
(167, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:100f:7955:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-11 07:13:44'),
(168, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:882b:eff:48c7:ba69:5307:2647', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-12 13:20:08'),
(169, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:882b:eff:d517:e7e1:24a3:8c69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-13 04:44:27'),
(170, 1, 28, 'Unknown User', 'admin@school.edu', 'admin', 'Delete', 'Deleted student record (ID: 511)', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-13 08:23:34'),
(171, 1, 300, '   Samina Ahmed                                                                                     ', 'saminaaahmedd@gmail.com', 'teacher', 'Login', 'User logged in successfully:    Samina Ahmed                                                                                                                                                                                 (teacher)', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0', 'Success', '2026-05-13 08:27:32'),
(172, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (nilumaji@gmail.com)', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'Failed', '2026-05-13 11:53:52'),
(173, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (nilumaji@gmail.com)', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'Failed', '2026-05-13 11:53:56'),
(174, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (nilumaji@gmail.com)', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'Failed', '2026-05-13 11:53:58'),
(175, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:882b:eff:d517:e7e1:24a3:8c69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-13 11:54:40'),
(176, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-13 11:55:04'),
(177, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-13 13:05:04'),
(178, 3, 324, 'Unknown User', 'nilu@gmail.com', 'teacher', 'Password Changed', 'User changed their own password', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-13 14:12:26'),
(179, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-13 14:12:48'),
(180, 3, 324, 'Unknown User', 'nilu@gmail.com', 'teacher', 'Password Changed', 'User changed their own password', '2401:4900:882b:eff:60ba:5280:26f8:8397', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-13 14:13:18'),
(181, 3, 324, 'nilu sir', 'nilu@gmail.com', 'teacher', 'Login', 'User logged in successfully: nilu sir (teacher)', '2409:40e0:102c:6c7f:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-13 18:55:37'),
(182, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: User not found (admin@scholl.edu)', '2409:40e0:102c:7559:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Failed', '2026-05-14 02:19:27'),
(183, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2409:40e0:102c:7559:8000::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-14 02:19:36'),
(184, 1, 311, 'fauzia kamal', 'yamankamal16.pratt@gmail.com', 'teacher', 'Login', 'User logged in successfully: fauzia kamal (teacher)', '117.231.224.54', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', 'Success', '2026-05-14 03:06:58'),
(185, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 05:02:36'),
(186, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 05:18:23'),
(187, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 06:27:45'),
(188, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '223.185.33.37', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 06:41:36'),
(189, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 06:47:35'),
(190, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 06:55:53'),
(191, 1, 28, 'Admin User', 'admin@school.edu', 'admin', 'Login', 'User logged in successfully: Admin User (admin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 06:57:45'),
(192, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 07:15:10'),
(193, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 07:51:08'),
(194, 6, 3808, 'xyz Administrator', 'sss@gmail.com', 'admin', 'Login', 'User logged in successfully: xyz Administrator (admin)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 07:53:13'),
(195, 6, 3808, 'xyz Administrator', 'sss@gmail.com', 'admin', 'Login', 'User logged in successfully: xyz Administrator (admin)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 07:54:50'),
(196, 3, 266, 'Unknown User', 'admin', 'admin', 'Passout', 'Student marked as passed out (ID: 512)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 08:08:37'),
(197, 3, 266, 'Unknown User', 'admin', 'admin', 'Restore', 'Student restored from passed out (ID: 512)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 08:09:43'),
(198, 3, 266, 'Unknown User', 'admin', 'admin', 'Passout', 'Student marked as passed out (ID: 512)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 08:09:52'),
(199, 3, 266, 'Unknown User', 'admin', 'admin', 'Restore', 'Student restored from passed out (ID: 512)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 08:10:04'),
(200, 3, 3809, 'fdhgfdgh', 'mgtyrghi266@gmail.com', 'student', 'Login', 'User logged in successfully: fdhgfdgh (student)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 08:15:27'),
(201, 3, 266, 'Unknown User', 'admin', 'admin', 'Passout', 'Student marked as passed out (ID: 512)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 08:26:03'),
(202, 3, 266, 'Unknown User', 'admin', 'admin', 'Restore', 'Student restored from passed out (ID: 512)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 08:26:37'),
(203, 7, 3811, 'prit sir school  Administrator', 'preet@gmail.com', 'admin', 'Login', 'User logged in successfully: prit sir school  Administrator (admin)', '2401:4900:8829:f552:4ccc:2f10:75ab:b48d', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:17:01'),
(204, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for dfgfd@ethy.gfjt', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Failed', '2026-05-14 09:25:00'),
(205, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for dfgfd@ethy.gfjt', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Failed', '2026-05-14 09:25:06'),
(206, 7, 3811, 'prit sir school  Administrator', 'preet@gmail.com', 'admin', 'Login', 'User logged in successfully: prit sir school  Administrator (admin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:25:26'),
(207, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:26:46'),
(208, 3, 266, 'Unknown User', 'admin', 'admin', 'Delete', 'Deleted student record (ID: 496)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:27:34'),
(209, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for admission', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Failed', '2026-05-14 09:34:14'),
(210, 3, 266, 'admission demo', 'admin', 'admin', 'Update', 'Updated user: admission demo (ID: 268)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:37:02'),
(211, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:37:18'),
(212, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for accounts', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Failed', '2026-05-14 09:38:22'),
(213, 3, 266, 'accountant', 'admin', 'admin', 'Update', 'Updated user: accountant (ID: 267)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:38:29'),
(214, 3, 267, 'accountant', 'accounts', 'accountant', 'Login', 'User logged in successfully: accountant (accountant)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:38:35'),
(215, 1, 3780, 'Super Admin', 'superadmin@school.erp', 'superadmin', 'Login', 'User logged in successfully: Super Admin (superadmin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 09:49:23'),
(216, 3, 266, 'admin', 'admin', 'admin', 'Login', 'User logged in successfully: admin (admin)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 10:00:50'),
(217, 3, 268, 'admission demo', 'admission', 'admission', 'Login', 'User logged in successfully: admission demo (admission)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 10:09:56'),
(218, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for accounts', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Failed', '2026-05-14 10:10:34'),
(219, NULL, NULL, 'Unknown User', 'Unknown Email', 'Unknown Role', 'Login', 'Failed login attempt: Invalid password for accounts', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Failed', '2026-05-14 10:10:38'),
(220, 3, 267, 'accountant', 'accounts', 'accountant', 'Login', 'User logged in successfully: accountant (accountant)', '2401:4900:8829:f552:d14f:d339:9bd9:b870', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 10:10:53'),
(221, 3, 3810, 'aceer', 'Unknown Email', 'student', 'Login', 'User logged in successfully: aceer (student)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 10:13:13'),
(222, 3, 266, 'Unknown User', 'admin', 'admin', 'Passout', 'Student marked as passed out (ID: 513)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 10:15:57'),
(223, 3, 266, 'Unknown User', 'admin', 'admin', 'Restore', 'Student restored from passed out (ID: 513)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 10:25:55'),
(224, 3, 266, 'Unknown User', 'admin', 'admin', 'Passout', 'Student marked as passed out (ID: 513)', '2401:4900:8829:f552:1984:c725:77c0:9e98', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'Success', '2026-05-14 10:26:10');

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

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `school_id`, `name`, `class_number`, `sort_order`, `class_category`, `description`, `created_at`, `updated_at`) VALUES
(77, 1, 'Class 1', '1', 0, 'primary', 'abcd', '2026-02-25 11:42:59', '2026-02-25 11:42:59'),
(80, 1, 'Class 2', '2', 0, 'primary', 'Class Two', '2026-02-27 04:48:45', '2026-02-27 04:48:45'),
(81, 1, 'Class 3', '3', 0, 'primary', 'Class Three', '2026-02-27 04:49:19', '2026-02-27 04:49:19'),
(82, 1, 'Class 4', '4', 0, 'primary', NULL, '2026-02-27 04:49:34', '2026-02-27 04:49:34'),
(83, 1, 'Class 5', '5', 0, 'primary', NULL, '2026-02-27 04:49:50', '2026-02-27 04:49:50'),
(84, 1, 'Class 6', '6', 0, 'middle', NULL, '2026-02-27 04:50:07', '2026-02-27 04:50:07'),
(85, 1, 'Class 7', '7', 0, 'middle', NULL, '2026-02-27 04:50:23', '2026-02-27 04:50:23'),
(86, 1, 'Class 8', '8', 0, 'middle', NULL, '2026-02-27 04:50:37', '2026-02-27 04:50:37'),
(87, 1, 'Class 9', '9', 0, 'secondary', NULL, '2026-02-27 04:50:51', '2026-02-27 04:50:51'),
(88, 1, 'Class 10', '10', 0, 'secondary', NULL, '2026-02-27 04:51:04', '2026-02-27 04:51:04'),
(89, 1, 'Class 11', '11', 0, 'higher_secondary', NULL, '2026-02-27 04:51:17', '2026-02-27 04:51:17'),
(90, 1, 'Class 12', '12', 0, 'higher_secondary', NULL, '2026-02-27 04:51:28', '2026-02-27 04:51:28'),
(91, 1, 'LN', 'LN', 0, 'primary', NULL, '2026-03-09 08:35:26', '2026-03-09 08:35:26'),
(92, 1, 'UN', 'UN', 0, 'primary', NULL, '2026-03-09 08:35:44', '2026-03-09 08:35:44'),
(93, 1, 'KG', 'KG', 0, 'primary', NULL, '2026-03-09 08:35:54', '2026-03-09 08:35:54'),
(94, 3, 'Class 1', '1', 0, 'primary', NULL, '2026-03-20 05:37:50', '2026-03-20 05:37:50'),
(95, 3, 'class 2', '2', 0, 'primary', NULL, '2026-03-20 05:38:36', '2026-03-20 05:38:36'),
(96, 3, 'class 3', '3', 0, 'primary', NULL, '2026-03-20 05:40:21', '2026-03-20 05:40:21'),
(97, 3, 'class 4', '4', 0, 'primary', NULL, '2026-03-20 10:09:47', '2026-03-20 10:09:47'),
(98, 3, 'class 5', '5', 0, 'primary', NULL, '2026-03-22 09:59:52', '2026-03-22 09:59:52'),
(99, 3, 'class 11', '11', 0, 'higher_secondary', NULL, '2026-03-22 10:02:04', '2026-03-22 10:02:04'),
(100, 3, 'class 10', '10', 0, 'secondary', NULL, '2026-05-14 08:06:37', '2026-05-14 08:06:37');

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

--
-- Dumping data for table `class_sections`
--

INSERT INTO `class_sections` (`id`, `school_id`, `class_id`, `section_id`, `stream_id`, `created_at`) VALUES
(224, 1, 77, 46, NULL, '2026-02-26 12:17:17'),
(226, 1, 82, 46, NULL, '2026-02-27 04:56:14'),
(227, 1, 80, 46, NULL, '2026-02-27 06:45:09'),
(228, 1, 81, 46, NULL, '2026-02-27 06:45:11'),
(229, 1, 83, 46, NULL, '2026-02-27 06:45:16'),
(230, 1, 84, 46, NULL, '2026-02-27 06:45:18'),
(231, 1, 85, 46, NULL, '2026-02-27 06:45:20'),
(232, 1, 86, 46, NULL, '2026-02-27 06:45:22'),
(233, 1, 87, 46, NULL, '2026-02-27 06:45:24'),
(234, 1, 88, 46, NULL, '2026-02-27 06:45:26'),
(235, 1, 89, 46, 11, '2026-02-27 06:45:36'),
(236, 1, 90, 46, 11, '2026-02-27 06:45:48'),
(237, 3, 96, 49, NULL, '2026-03-20 05:40:26'),
(239, 3, 94, 49, NULL, '2026-03-20 05:43:38'),
(242, 3, 97, 49, NULL, '2026-03-20 10:09:57'),
(245, 3, 94, 51, NULL, '2026-03-20 10:13:19'),
(247, 3, 97, 51, NULL, '2026-03-21 10:44:28'),
(248, 3, 97, 52, NULL, '2026-03-21 10:44:35'),
(249, 3, 95, 51, NULL, '2026-03-21 12:20:04'),
(250, 3, 98, 49, NULL, '2026-03-22 09:59:55'),
(251, 3, 98, 51, NULL, '2026-03-22 09:59:57'),
(252, 3, 98, 52, NULL, '2026-03-22 09:59:58'),
(253, 3, 96, 51, NULL, '2026-03-22 10:09:42'),
(254, 3, 99, 49, 16, '2026-03-22 10:31:52'),
(255, 1, 91, 46, NULL, '2026-04-10 05:37:33'),
(256, 1, 93, 46, NULL, '2026-04-10 05:37:46'),
(257, 1, 92, 46, NULL, '2026-04-10 05:37:52'),
(260, 1, 89, 46, 17, '2026-04-17 10:11:34'),
(261, 1, 90, 46, 17, '2026-04-17 11:13:47'),
(262, 3, 95, 49, NULL, '2026-05-08 10:17:07'),
(263, 3, 100, 49, NULL, '2026-05-14 08:06:44'),
(264, 3, 99, 49, 15, '2026-05-14 10:01:05');

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

--
-- Dumping data for table `class_streams`
--

INSERT INTO `class_streams` (`id`, `school_id`, `class_id`, `stream_id`, `created_at`) VALUES
(33, 1, 89, 11, '2026-02-27 04:52:37'),
(34, 1, 90, 11, '2026-02-27 06:45:44'),
(39, 1, 89, 17, '2026-04-17 10:11:04'),
(40, 1, 90, 17, '2026-04-17 11:13:14'),
(41, 3, 99, 15, '2026-05-07 13:57:36'),
(42, 3, 99, 16, '2026-05-07 13:57:38');

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

--
-- Dumping data for table `class_subjects`
--

INSERT INTO `class_subjects` (`id`, `school_id`, `class_id`, `subject_id`, `stream_id`, `is_mandatory`, `created_at`) VALUES
(89, 1, 77, 49, NULL, 1, '2026-02-25 11:44:38'),
(98, 3, 96, 52, NULL, 1, '2026-03-20 05:40:32'),
(99, 3, 94, 52, NULL, 1, '2026-03-20 05:43:43'),
(100, 3, 95, 52, NULL, 1, '2026-03-20 05:48:02'),
(102, 1, 80, 53, NULL, 1, '2026-03-20 06:15:00'),
(103, 1, 80, 49, NULL, 1, '2026-03-20 06:15:02'),
(104, 3, 97, 55, NULL, 1, '2026-03-20 10:10:47'),
(105, 3, 97, 52, NULL, 1, '2026-03-20 10:10:48'),
(106, 3, 97, 56, NULL, 1, '2026-03-20 10:11:07'),
(107, 3, 96, 56, NULL, 1, '2026-03-20 10:11:23'),
(108, 3, 94, 55, NULL, 1, '2026-03-20 10:13:55'),
(109, 3, 94, 56, NULL, 1, '2026-03-20 10:13:56'),
(110, 3, 97, 57, NULL, 1, '2026-03-21 10:45:51'),
(111, 3, 98, 55, NULL, 1, '2026-03-22 10:00:00'),
(112, 3, 98, 57, NULL, 1, '2026-03-22 10:00:01'),
(113, 3, 99, 52, 16, 1, '2026-03-22 10:31:56'),
(114, 3, 99, 55, 16, 1, '2026-03-22 13:26:17'),
(115, 3, 99, 57, 16, 1, '2026-03-22 13:26:18'),
(117, 1, 77, 53, NULL, 1, '2026-04-13 06:05:32'),
(120, 1, 77, 65, NULL, 1, '2026-04-13 06:25:27'),
(121, 1, 77, 66, NULL, 1, '2026-04-13 06:25:30'),
(122, 1, 77, 58, NULL, 1, '2026-04-13 06:25:34'),
(123, 1, 77, 67, NULL, 1, '2026-04-13 06:25:41'),
(124, 1, 77, 61, NULL, 1, '2026-04-13 06:25:43'),
(125, 1, 77, 62, NULL, 1, '2026-04-13 06:25:46'),
(126, 1, 77, 63, NULL, 1, '2026-04-13 06:26:21'),
(127, 1, 77, 68, NULL, 1, '2026-04-13 06:27:34'),
(128, 1, 83, 63, NULL, 1, '2026-04-13 06:27:54'),
(129, 1, 83, 53, NULL, 1, '2026-04-13 06:28:02'),
(130, 1, 83, 65, NULL, 1, '2026-04-13 06:28:04'),
(131, 1, 83, 58, NULL, 1, '2026-04-13 06:28:06'),
(132, 1, 83, 66, NULL, 1, '2026-04-13 06:28:07'),
(133, 1, 83, 68, NULL, 1, '2026-04-13 06:28:11'),
(134, 1, 83, 51, NULL, 1, '2026-04-13 06:28:13'),
(135, 1, 83, 49, NULL, 1, '2026-04-13 06:28:14'),
(136, 1, 83, 67, NULL, 1, '2026-04-13 06:28:17'),
(137, 1, 83, 61, NULL, 1, '2026-04-13 06:28:22'),
(139, 1, 83, 69, NULL, 1, '2026-04-13 06:29:46'),
(140, 1, 80, 63, NULL, 1, '2026-04-13 06:33:59'),
(141, 1, 80, 65, NULL, 1, '2026-04-13 06:34:04'),
(142, 1, 80, 58, NULL, 1, '2026-04-13 06:34:09'),
(143, 1, 80, 67, NULL, 1, '2026-04-13 06:34:36'),
(144, 1, 80, 61, NULL, 1, '2026-04-13 06:34:41'),
(145, 1, 80, 62, NULL, 1, '2026-04-13 06:34:43'),
(146, 1, 80, 66, NULL, 1, '2026-04-13 06:34:54'),
(148, 1, 80, 68, NULL, 1, '2026-04-13 06:35:11'),
(149, 1, 81, 63, NULL, 1, '2026-04-13 06:35:31'),
(150, 1, 81, 65, NULL, 1, '2026-04-13 06:35:35'),
(151, 1, 81, 53, NULL, 1, '2026-04-13 06:35:37'),
(152, 1, 81, 58, NULL, 1, '2026-04-13 06:35:38'),
(153, 1, 81, 66, NULL, 1, '2026-04-13 06:35:41'),
(154, 1, 81, 68, NULL, 1, '2026-04-13 06:35:46'),
(155, 1, 81, 49, NULL, 1, '2026-04-13 06:35:50'),
(156, 1, 81, 67, NULL, 1, '2026-04-13 06:35:52'),
(157, 1, 81, 62, NULL, 1, '2026-04-13 06:35:56'),
(158, 1, 81, 61, NULL, 1, '2026-04-13 06:35:58'),
(159, 1, 82, 63, NULL, 1, '2026-04-13 06:36:18'),
(160, 1, 82, 65, NULL, 1, '2026-04-13 06:36:22'),
(161, 1, 82, 53, NULL, 1, '2026-04-13 06:36:25'),
(162, 1, 82, 58, NULL, 1, '2026-04-13 06:36:26'),
(163, 1, 82, 66, NULL, 1, '2026-04-13 06:36:29'),
(164, 1, 82, 68, NULL, 1, '2026-04-13 06:36:34'),
(165, 1, 82, 67, NULL, 1, '2026-04-13 06:36:38'),
(166, 1, 82, 49, NULL, 1, '2026-04-13 06:36:41'),
(167, 1, 82, 62, NULL, 1, '2026-04-13 06:36:45'),
(168, 1, 82, 61, NULL, 1, '2026-04-13 06:36:46'),
(169, 1, 84, 63, NULL, 1, '2026-04-13 06:38:02'),
(170, 1, 84, 65, NULL, 1, '2026-04-13 06:38:05'),
(171, 1, 84, 53, NULL, 1, '2026-04-13 06:38:07'),
(172, 1, 84, 58, NULL, 1, '2026-04-13 06:38:08'),
(173, 1, 84, 66, NULL, 1, '2026-04-13 06:38:10'),
(174, 1, 84, 68, NULL, 1, '2026-04-13 06:38:14'),
(175, 1, 84, 49, NULL, 1, '2026-04-13 06:38:18'),
(176, 1, 84, 67, NULL, 1, '2026-04-13 06:38:21'),
(177, 1, 84, 62, NULL, 1, '2026-04-13 06:38:27'),
(178, 1, 84, 61, NULL, 1, '2026-04-13 06:38:29'),
(179, 1, 85, 63, NULL, 1, '2026-04-13 06:38:38'),
(180, 1, 85, 65, NULL, 1, '2026-04-13 06:38:44'),
(181, 1, 85, 53, NULL, 1, '2026-04-13 06:38:47'),
(182, 1, 85, 58, NULL, 1, '2026-04-13 06:38:48'),
(183, 1, 85, 66, NULL, 1, '2026-04-13 06:38:52'),
(184, 1, 85, 68, NULL, 1, '2026-04-13 06:38:55'),
(185, 1, 85, 49, NULL, 1, '2026-04-13 06:39:00'),
(186, 1, 85, 62, NULL, 1, '2026-04-13 06:39:04'),
(187, 1, 85, 61, NULL, 1, '2026-04-13 06:39:06'),
(188, 1, 85, 67, NULL, 1, '2026-04-13 06:39:16'),
(189, 1, 86, 63, NULL, 1, '2026-04-13 06:39:36'),
(190, 1, 86, 65, NULL, 1, '2026-04-13 06:39:47'),
(191, 1, 86, 53, NULL, 1, '2026-04-13 06:39:52'),
(192, 1, 86, 58, NULL, 1, '2026-04-13 06:39:54'),
(193, 1, 86, 68, NULL, 1, '2026-04-13 06:40:04'),
(194, 1, 86, 49, NULL, 1, '2026-04-13 06:40:11'),
(195, 1, 86, 67, NULL, 1, '2026-04-13 06:40:12'),
(196, 1, 86, 62, NULL, 1, '2026-04-13 06:40:15'),
(197, 1, 86, 61, NULL, 1, '2026-04-13 06:40:19'),
(198, 1, 86, 66, NULL, 1, '2026-04-13 06:40:31'),
(199, 1, 87, 63, NULL, 1, '2026-04-13 06:40:57'),
(200, 1, 87, 65, NULL, 1, '2026-04-13 06:41:03'),
(201, 1, 87, 53, NULL, 1, '2026-04-13 06:41:06'),
(202, 1, 87, 58, NULL, 1, '2026-04-13 06:41:07'),
(203, 1, 87, 66, NULL, 1, '2026-04-13 06:41:10'),
(204, 1, 87, 68, NULL, 1, '2026-04-13 06:41:16'),
(205, 1, 87, 49, NULL, 1, '2026-04-13 06:41:28'),
(206, 1, 87, 61, NULL, 1, '2026-04-13 06:41:35'),
(207, 1, 87, 62, NULL, 1, '2026-04-13 06:41:37'),
(208, 1, 87, 67, NULL, 1, '2026-04-13 06:41:48'),
(209, 1, 88, 63, NULL, 1, '2026-04-13 06:42:06'),
(210, 1, 88, 65, NULL, 1, '2026-04-13 06:42:12'),
(211, 1, 88, 53, NULL, 1, '2026-04-13 06:42:19'),
(212, 1, 88, 58, NULL, 1, '2026-04-13 06:42:20'),
(213, 1, 88, 66, NULL, 1, '2026-04-13 06:42:32'),
(214, 1, 88, 68, NULL, 1, '2026-04-13 06:42:37'),
(215, 1, 88, 62, NULL, 1, '2026-04-13 06:42:43'),
(216, 1, 88, 61, NULL, 1, '2026-04-13 06:42:45'),
(217, 1, 88, 49, NULL, 1, '2026-04-13 06:42:51'),
(218, 1, 88, 67, NULL, 1, '2026-04-13 06:42:55'),
(219, 1, 85, 70, NULL, 1, '2026-04-17 08:12:10'),
(220, 1, 84, 70, NULL, 1, '2026-04-17 08:13:19'),
(221, 1, 86, 70, NULL, 1, '2026-04-17 08:13:40'),
(222, 1, 87, 70, NULL, 1, '2026-04-17 08:22:52'),
(223, 1, 87, 51, NULL, 1, '2026-04-17 08:23:45'),
(224, 1, 87, 69, NULL, 1, '2026-04-17 08:23:47'),
(225, 1, 86, 69, NULL, 1, '2026-04-17 08:24:51'),
(226, 1, 86, 51, NULL, 1, '2026-04-17 08:24:53'),
(227, 1, 85, 69, NULL, 1, '2026-04-17 08:25:13'),
(228, 1, 85, 51, NULL, 1, '2026-04-17 08:25:20'),
(229, 1, 88, 69, NULL, 1, '2026-04-17 10:02:49'),
(230, 1, 88, 70, NULL, 1, '2026-04-17 10:02:50'),
(231, 1, 88, 51, NULL, 1, '2026-04-17 10:02:50'),
(232, 1, 84, 60, NULL, 1, '2026-04-17 10:03:46'),
(233, 1, 85, 60, NULL, 1, '2026-04-17 10:08:44'),
(234, 1, 86, 60, NULL, 1, '2026-04-17 10:08:49'),
(235, 1, 87, 60, NULL, 1, '2026-04-17 10:09:13'),
(236, 1, 88, 60, NULL, 1, '2026-04-17 10:09:57'),
(241, 1, 89, 60, 11, 1, '2026-04-17 10:12:36'),
(242, 1, 89, 59, 11, 1, '2026-04-17 10:12:38'),
(243, 1, 89, 49, 11, 1, '2026-04-17 10:13:04'),
(244, 1, 89, 50, 11, 1, '2026-04-17 10:13:05'),
(245, 1, 85, 50, NULL, 1, '2026-04-17 10:22:52'),
(246, 1, 85, 59, NULL, 1, '2026-04-17 10:23:09'),
(247, 1, 90, 60, 11, 1, '2026-04-17 11:13:52'),
(248, 1, 90, 59, 11, 1, '2026-04-17 11:13:54'),
(249, 1, 90, 53, 11, 1, '2026-04-17 11:13:56'),
(250, 1, 90, 50, 11, 1, '2026-04-17 11:13:57'),
(251, 1, 90, 49, 11, 1, '2026-04-17 11:14:01'),
(252, 1, 87, 72, NULL, 1, '2026-04-18 11:01:03'),
(253, 1, 88, 72, NULL, 1, '2026-04-18 11:01:10'),
(254, 1, 89, 72, 17, 1, '2026-04-18 11:01:20'),
(255, 1, 90, 72, 17, 1, '2026-04-18 11:01:32'),
(256, 1, 88, 50, NULL, 1, '2026-05-14 05:10:22'),
(257, 1, 87, 50, NULL, 1, '2026-05-14 05:14:57'),
(258, 1, 84, 50, NULL, 1, '2026-05-14 05:23:28');

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

--
-- Dumping data for table `daywise_attendance_teachers`
--

INSERT INTO `daywise_attendance_teachers` (`id`, `school_id`, `teacher_id`, `class_number`, `section`, `created_at`, `stream_id`) VALUES
(11, 3, 80, '4', 'B', '2026-03-22 09:23:05', NULL),
(12, 1, 65, '1', 'A', '2026-04-14 12:23:26', NULL),
(13, 1, 74, '2', 'A', '2026-04-14 12:23:42', NULL),
(14, 1, 75, '3', 'A', '2026-04-14 12:23:58', NULL),
(15, 1, 66, '4', 'A', '2026-04-14 12:24:19', NULL),
(16, 1, 76, '5', 'A', '2026-04-14 12:24:50', NULL);

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

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `title`, `amount`, `gst_amount`, `category`, `payment_method`, `expense_date`, `description`, `date`, `receipt_path`, `status`, `school_id`, `created_at`, `updated_at`, `expense_time`) VALUES
(17, 'Electric Bill', 1000.00, 152.54, 'Maintenance', 'cash', '2026-03-08', '', NULL, NULL, 'approved', 1, '2026-03-18 06:44:28', '2026-03-18 06:44:28', '17:43:00');

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

--
-- Dumping data for table `fee_admission`
--

INSERT INTO `fee_admission` (`id`, `school_id`, `amount`, `created_at`, `updated_at`) VALUES
(3, 1, 10000.00, '2026-02-25 11:59:36', '2026-03-09 08:22:54');

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

--
-- Dumping data for table `fee_column_types`
--

INSERT INTO `fee_column_types` (`id`, `school_id`, `column_key`, `display_name`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 1, 'tuition_fee', 'Tuition', 1, 1, '2026-02-27 06:05:43'),
(2, 1, 'library_fee', 'Library', 2, 1, '2026-02-27 06:05:43'),
(3, 1, 'sports_fee', 'Sports', 3, 1, '2026-02-27 06:05:43'),
(4, 1, 'lab_fee', 'Lab', 4, 1, '2026-02-27 06:05:43'),
(5, 1, 'exam_fee', 'Exam', 5, 1, '2026-02-27 06:05:43'),
(6, 1, 'transport_fee', 'Transport', 6, 1, '2026-02-27 06:05:43'),
(8, 1, 'misc_fee', 'late fee', 8, 1, '2026-02-27 06:05:43'),
(19, 3, 'tuition_fee', 'Tuition', 1, 1, '2026-03-20 06:47:32'),
(20, 3, 'library_fee', 'Library', 2, 1, '2026-03-20 06:47:32'),
(21, 3, 'sports_fee', 'Sports', 3, 1, '2026-03-20 06:47:32'),
(22, 3, 'lab_fee', 'Lab', 4, 1, '2026-03-20 06:47:32'),
(23, 3, 'exam_fee', 'Exam', 5, 1, '2026-03-20 06:47:32'),
(25, 3, 'hostel_fee', 'Hostel', 7, 1, '2026-03-20 06:47:32'),
(26, 3, 'misc_fee', 'Misc', 8, 1, '2026-03-20 06:47:32'),
(27, 7, 'tuition_fee', 'Tuition', 1, 1, '2026-05-14 09:46:35'),
(28, 7, 'library_fee', 'Library', 2, 1, '2026-05-14 09:46:35'),
(29, 7, 'sports_fee', 'Sports', 3, 1, '2026-05-14 09:46:35'),
(30, 7, 'lab_fee', 'Lab', 4, 1, '2026-05-14 09:46:35'),
(31, 7, 'exam_fee', 'Exam', 5, 1, '2026-05-14 09:46:35'),
(32, 7, 'transport_fee', 'Transport', 6, 1, '2026-05-14 09:46:35'),
(33, 7, 'hostel_fee', 'Hostel', 7, 1, '2026-05-14 09:46:35'),
(34, 7, 'misc_fee', 'Misc', 8, 1, '2026-05-14 09:46:35');

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

--
-- Dumping data for table `fee_column_values`
--

INSERT INTO `fee_column_values` (`id`, `fee_structure_id`, `column_type_id`, `amount`) VALUES
(16, 48, 1, 700.00),
(17, 58, 1, 700.00),
(18, 59, 1, 750.00),
(19, 60, 1, 750.00),
(20, 61, 1, 800.00),
(21, 62, 1, 850.00),
(22, 63, 1, 950.00),
(23, 64, 1, 1100.00),
(24, 65, 1, 1300.00),
(25, 66, 1, 1500.00),
(26, 67, 1, 1700.00),
(27, 68, 1, 1700.00),
(28, 69, 19, 5000.00),
(29, 70, 19, 6000.00),
(30, 71, 19, 7000.00),
(31, 72, 19, 5000.00),
(32, 73, 19, 1000.00),
(33, 74, 19, 12000.00),
(34, 75, 19, 500.00),
(35, 75, 20, 5000.00),
(36, 76, 19, 98765.00),
(37, 77, 19, 5000.00);

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

--
-- Dumping data for table `fee_records`
--

INSERT INTO `fee_records` (`id`, `school_id`, `student_id`, `student_name`, `class_name`, `fee_type`, `total_amount`, `paid_amount`, `pending_amount`, `gst_amount`, `net_amount`, `payment_method`, `transaction_id`, `payment_date`, `last_payment_date`, `status`, `transaction_remarks`, `received_by`, `academic_year`, `created_at`, `updated_at`) VALUES
(214, 3, 494, 'niladri sekhar', '11', 'Annual Fee', 98765.00, 0.00, 98765.00, 0.00, 0.00, 'online', NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'pending', NULL, 268, '2026-2027', '2026-05-07 14:07:35', '2026-05-07 14:07:35'),
(215, 3, 495, 'bal jhal', '2', 'Annual Fee', 6000.00, 0.00, 6000.00, 0.00, 0.00, 'offline', NULL, NULL, NULL, 'pending', NULL, 268, '2026-2027', '2026-05-07 14:09:38', '2026-05-07 14:09:38'),
(216, 3, 496, 'aqwcdAdswdwsdwdqw', '1', 'Annual Fee', 5000.00, 0.00, 5000.00, 0.00, 0.00, 'offline', NULL, NULL, NULL, 'pending', NULL, 268, '2026-2027', '2026-05-07 14:25:20', '2026-05-07 14:25:20'),
(217, 3, 497, 'AScd ', '2', 'Annual Fee', 6000.00, 0.00, 6000.00, 0.00, 0.00, 'offline', NULL, NULL, NULL, 'pending', NULL, 268, '2026-2027', '2026-05-07 14:26:36', '2026-05-07 14:26:36'),
(218, 3, 503, 'add', 'Class 1', 'Annual Fee', 5000.00, 0.00, 5000.00, 0.00, 0.00, 'offline', NULL, NULL, NULL, 'pending', NULL, 267, '2025-2026', '2026-05-14 09:38:59', '2026-05-14 09:38:59'),
(219, 3, 503, 'add', 'Class 1', 'Annual Fee', 0.00, 5000.00, 0.00, 0.00, 5000.00, 'offline', NULL, '2026-05-14 15:08:59', NULL, 'paid', 'Payment Received', 267, '2025-2026', '2026-05-14 09:38:59', '2026-05-14 09:38:59'),
(220, 3, 503, 'add', 'class 2', 'Annual Fee', 6000.00, 0.00, 6000.00, 0.00, 0.00, 'offline', NULL, NULL, NULL, 'pending', NULL, 266, '2026-2027', '2026-05-14 09:40:06', '2026-05-14 09:40:06'),
(221, 3, 503, 'add', 'class 2', 'Annual Fee', 0.00, 6000.00, 0.00, 0.00, 6000.00, 'offline', NULL, '2026-05-14 15:11:30', NULL, 'paid', 'Payment Received', 267, '2026-2027', '2026-05-14 09:41:30', '2026-05-14 09:41:30'),
(222, 3, 513, 'aceer', 'class 10', 'Annual Fee', 5000.00, 0.00, 5000.00, 0.00, 0.00, 'offline', NULL, NULL, NULL, 'pending', NULL, 267, '2025-2026', '2026-05-14 10:11:10', '2026-05-14 10:11:10'),
(223, 3, 513, 'aceer', 'class 10', 'Annual Fee', 0.00, 5000.00, 0.00, 0.00, 5000.00, 'online', 'Sfdsf', '2026-05-14 15:41:10', NULL, 'paid', 'Payment Received', 267, '2025-2026', '2026-05-14 10:11:10', '2026-05-14 10:11:10'),
(224, 3, 513, 'aceer', 'class 11', 'Annual Fee', 1000.00, 0.00, 1000.00, 0.00, 0.00, 'offline', NULL, NULL, NULL, 'pending', NULL, 266, '2026-2027', '2026-05-14 10:11:26', '2026-05-14 10:11:26'),
(225, 3, 513, 'aceer', 'class 11', 'Annual Fee', 0.00, 1000.00, 0.00, 0.00, 1000.00, 'offline', NULL, '2026-05-14 15:42:16', NULL, 'paid', 'Payment Received', 267, '2026-2027', '2026-05-14 10:12:16', '2026-05-14 10:12:16');

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

--
-- Dumping data for table `fee_structures`
--

INSERT INTO `fee_structures` (`id`, `school_id`, `class_id`, `stream_id`, `group_name`, `tuition_fee`, `library_fee`, `sports_fee`, `lab_fee`, `exam_fee`, `hostel_fee`, `misc_fee`, `total_fee`, `created_at`, `updated_at`) VALUES
(48, 1, 77, 0, 'General', 700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 700.00, '2026-02-25 11:53:11', '2026-03-09 08:30:05'),
(58, 1, 80, 0, 'General', 700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 700.00, '2026-03-09 08:30:57', '2026-03-09 08:30:57'),
(59, 1, 81, 0, 'General', 750.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 750.00, '2026-03-09 08:31:15', '2026-03-09 08:31:15'),
(60, 1, 82, 0, 'General', 750.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 750.00, '2026-03-09 08:31:27', '2026-03-09 08:31:27'),
(61, 1, 83, 0, 'General', 800.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 800.00, '2026-03-09 08:31:37', '2026-03-09 08:31:37'),
(62, 1, 84, 0, 'General', 850.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 850.00, '2026-03-09 08:31:52', '2026-03-09 08:31:52'),
(63, 1, 85, 0, 'General', 950.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 950.00, '2026-03-09 08:32:07', '2026-03-09 08:32:07'),
(64, 1, 86, 0, 'General', 1100.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1100.00, '2026-03-09 08:32:19', '2026-03-09 08:32:19'),
(65, 1, 87, 0, 'General', 1300.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1300.00, '2026-03-09 08:32:32', '2026-03-09 08:32:32'),
(66, 1, 88, 0, 'General', 1500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1500.00, '2026-03-09 08:32:54', '2026-03-09 08:32:54'),
(67, 1, 89, 11, 'General', 1700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1700.00, '2026-03-09 08:33:04', '2026-03-09 08:33:04'),
(68, 1, 90, 11, 'General', 1700.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1700.00, '2026-03-09 08:33:21', '2026-03-09 08:33:21'),
(69, 3, 94, 0, 'General', 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000.00, '2026-03-20 06:47:39', '2026-03-20 06:47:39'),
(70, 3, 95, 0, 'General', 6000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 6000.00, '2026-03-20 06:47:53', '2026-03-20 06:47:54'),
(71, 3, 96, 0, 'General', 7000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 7000.00, '2026-03-20 06:48:04', '2026-03-20 06:48:04'),
(72, 3, 97, 0, 'General', 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000.00, '2026-03-22 08:37:24', '2026-03-22 08:37:24'),
(73, 3, 99, 16, 'General', 1000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1000.00, '2026-03-22 10:48:16', '2026-03-22 10:48:16'),
(74, 3, 98, 0, 'General', 12000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 12000.00, '2026-03-22 10:48:25', '2026-03-22 10:48:25'),
(75, 3, 99, 0, 'General', 500.00, 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5500.00, '2026-05-07 13:52:26', '2026-05-07 13:52:26'),
(76, 3, 99, 15, 'General', 98765.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 98765.00, '2026-05-07 13:58:31', '2026-05-07 13:58:31'),
(77, 3, 100, 0, 'General', 5000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 5000.00, '2026-05-14 08:09:21', '2026-05-14 08:09:21');

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

--
-- Dumping data for table `lesson_plans`
--

INSERT INTO `lesson_plans` (`id`, `school_id`, `teacher_id`, `class_number`, `section`, `subject_id`, `week_start_date`, `scheduled_date`, `topic`, `sub_topics`, `description`, `completion_percentage`, `completion_date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 79, '1', 'A', 56, '2026-05-04', NULL, 'Chapter 1 ', '\"[{\\\"title\\\":\\\"introduction of history\\\",\\\"completed\\\":true},{\\\"title\\\":\\\"why we study hist\\\",\\\"completed\\\":true}]\"', NULL, 100, '2026-05-13', 'completed', NULL, '2026-05-07 09:56:55', '2026-05-13 18:56:07');

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

--
-- Dumping data for table `marksheet_templates`
--

INSERT INTO `marksheet_templates` (`id`, `school_id`, `name`, `config`, `is_default`, `created_at`, `updated_at`, `assigned_class`, `assigned_section`, `assigned_stream`) VALUES
(13, 1, 'Class 11 commerce', '{\"designType\":\"academic_record\",\"header\":{\"showLogo\":true,\"schoolNameFontSize\":20,\"showAddress\":true,\"showPhone\":false,\"showEmail\":false,\"title\":\"MARKSHEET\",\"titleFontSize\":16,\"showTermInfo\":true},\"studentFields\":{\"name\":{\"enabled\":true,\"label\":\"Student Name\"},\"roll_number\":{\"enabled\":true,\"label\":\"Roll Number\"},\"class\":{\"enabled\":true,\"label\":\"Class\"},\"father_name\":{\"enabled\":true,\"label\":\"Father\'s Name\"},\"mother_name\":{\"enabled\":false,\"label\":\"Mother\'s Name\"},\"dob\":{\"enabled\":false,\"label\":\"Date of Birth\"},\"admission_no\":{\"enabled\":false,\"label\":\"Admission No\"}},\"marksColumns\":{\"subject\":{\"enabled\":true,\"label\":\"Subject\"},\"max_marks\":{\"enabled\":false,\"label\":\"Max Marks\"},\"marks_obtained\":{\"enabled\":false,\"label\":\"Marks Obtained\"},\"grade\":{\"enabled\":false,\"label\":\"Grade\"},\"percentage\":{\"enabled\":false,\"label\":\"Percentage\"},\"remarks\":{\"enabled\":false,\"label\":\"Remarks\"},\"theory_marks\":{\"enabled\":false,\"label\":\"Theory Marks\"},\"practical_marks\":{\"enabled\":false,\"label\":\"Practical Marks\"},\"internal_marks\":{\"enabled\":false,\"label\":\"Internal Marks\"},\"external_marks\":{\"enabled\":false,\"label\":\"External Marks\"}},\"customColumns\":[{\"key\":\"custom_1772118455268\",\"label\":\"1st\",\"enabled\":true},{\"key\":\"custom_1772118494222\",\"label\":\"2nd\",\"enabled\":true},{\"key\":\"custom_1772118528604\",\"label\":\"total\",\"enabled\":true}],\"customStudentFields\":[],\"summary\":{\"showTotal\":true,\"showPercentage\":true,\"showResult\":true,\"showGrade\":true,\"passingPercentage\":33},\"footer\":{\"showDate\":true,\"showSignatureLines\":true,\"signatureLabels\":[\"Class Teacher\",\"Principal\"],\"footerText\":\"This is a computer generated marksheet.\",\"showRemarks\":false},\"styling\":{\"primaryColor\":\"#191970\",\"headerBgColor\":\"#1aff34\",\"headerTextColor\":\"#FFFFFF\",\"tableHeaderBg\":\"#191970\",\"tableHeaderText\":\"#FFFFFF\",\"evenRowBg\":\"#F5F5FF\",\"oddRowBg\":\"#FFFFFF\",\"borderColor\":\"#CBD5E1\",\"fontFamily\":\"helvetica\",\"showBorder\":true,\"borderStyle\":\"full\"},\"page\":{\"orientation\":\"portrait\",\"size\":\"a4\",\"marginTop\":15,\"marginBottom\":15,\"marginLeft\":20,\"marginRight\":20}}', 0, '2026-02-26 15:09:16', '2026-04-30 09:48:07', '89', NULL, '17'),
(14, 3, 'Classic Formal', '{\"designType\":\"classic\",\"header\":{\"showLogo\":true,\"schoolNameFontSize\":22,\"showAddress\":true,\"showPhone\":false,\"showEmail\":false,\"title\":\"MARKSHEET\",\"titleFontSize\":18,\"showTermInfo\":true},\"studentFields\":{\"name\":{\"enabled\":true,\"label\":\"Student Name\"},\"roll_number\":{\"enabled\":true,\"label\":\"Roll Number\"},\"class\":{\"enabled\":true,\"label\":\"Class\"},\"father_name\":{\"enabled\":true,\"label\":\"Father\'s Name\"},\"mother_name\":{\"enabled\":false,\"label\":\"Mother\'s Name\"},\"dob\":{\"enabled\":false,\"label\":\"Date of Birth\"},\"admission_no\":{\"enabled\":false,\"label\":\"Admission No\"}},\"marksColumns\":{\"subject\":{\"enabled\":true,\"label\":\"Subject\"},\"max_marks\":{\"enabled\":true,\"label\":\"Max Marks\"},\"marks_obtained\":{\"enabled\":true,\"label\":\"Marks Obtained\"},\"grade\":{\"enabled\":true,\"label\":\"Grade\"},\"percentage\":{\"enabled\":false,\"label\":\"Percentage\"},\"remarks\":{\"enabled\":false,\"label\":\"Remarks\"},\"theory_marks\":{\"enabled\":false,\"label\":\"Theory Marks\"},\"practical_marks\":{\"enabled\":false,\"label\":\"Practical Marks\"},\"internal_marks\":{\"enabled\":false,\"label\":\"Internal Marks\"},\"external_marks\":{\"enabled\":false,\"label\":\"External Marks\"}},\"customColumns\":[],\"customStudentFields\":[],\"summary\":{\"showTotal\":true,\"showPercentage\":true,\"showResult\":true,\"showGrade\":true,\"passingPercentage\":33},\"footer\":{\"showDate\":true,\"showSignatureLines\":true,\"signatureLabels\":[\"Class Teacher\",\"Principal\"],\"footerText\":\"This is a computer generated marksheet.\",\"showRemarks\":false},\"styling\":{\"primaryColor\":\"#191970\",\"headerBgColor\":\"#191970\",\"headerTextColor\":\"#FFFFFF\",\"tableHeaderBg\":\"#191970\",\"tableHeaderText\":\"#FFFFFF\",\"evenRowBg\":\"#F0F0FF\",\"oddRowBg\":\"#FFFFFF\",\"borderColor\":\"#CBD5E1\",\"fontFamily\":\"helvetica\",\"showBorder\":true,\"borderStyle\":\"full\"},\"page\":{\"orientation\":\"portrait\",\"size\":\"a4\",\"marginTop\":15,\"marginBottom\":15,\"marginLeft\":20,\"marginRight\":20}}', 1, '2026-03-21 10:47:39', '2026-03-21 10:47:39', NULL, NULL, NULL),
(16, 1, 'Class 1, 2 , 3', '{\"designType\":\"bordered_formal\",\"header\":{\"showLogo\":true,\"schoolNameFontSize\":20,\"showAddress\":true,\"showPhone\":false,\"showEmail\":false,\"title\":\"MARKSHEET\",\"titleFontSize\":16,\"showTermInfo\":true},\"studentFields\":{\"name\":{\"enabled\":true,\"label\":\"Student Name\"},\"roll_number\":{\"enabled\":true,\"label\":\"Roll Number\"},\"class\":{\"enabled\":true,\"label\":\"Class\"},\"father_name\":{\"enabled\":true,\"label\":\"Father\'s Name\"},\"mother_name\":{\"enabled\":false,\"label\":\"Mother\'s Name\"},\"dob\":{\"enabled\":false,\"label\":\"Date of Birth\"},\"admission_no\":{\"enabled\":false,\"label\":\"Admission No\"}},\"marksColumns\":{},\"customColumns\":[{\"key\":\"custom_1777629384954\",\"label\":\"Subject\",\"enabled\":true,\"order\":1},{\"key\":\"custom_1777629610514\",\"label\":\"1st internal\",\"enabled\":true,\"order\":2,\"group\":\"group_1777629912196\"},{\"key\":\"custom_1777629637975\",\"label\":\"1st obtained marks\",\"enabled\":true,\"order\":3,\"group\":\"group_1777629912196\"},{\"key\":\"custom_1777629723004\",\"label\":\"2nd Internal\",\"enabled\":true,\"order\":4,\"group\":\"group_1777629929204\"},{\"key\":\"custom_1777629735076\",\"label\":\"2nd obtained marks\",\"enabled\":true,\"order\":5,\"group\":\"group_1777629929204\"},{\"key\":\"custom_1777629745050\",\"label\":\"Final exam\",\"enabled\":true,\"order\":6,\"group\":\"group_1777629945092\"},{\"key\":\"custom_1777629782789\",\"label\":\"final Obtained marks\",\"enabled\":true,\"order\":7,\"group\":\"group_1777629945092\"},{\"key\":\"custom_1777629798067\",\"label\":\"practical\",\"enabled\":true,\"order\":8,\"group\":\"group_1777629945092\"},{\"key\":\"custom_1777629830922\",\"label\":\"Obtained Practical Marks\",\"enabled\":true,\"order\":9,\"group\":\"group_1777629945092\"},{\"key\":\"custom_1777629850949\",\"label\":\"Total marks\",\"enabled\":true,\"order\":10},{\"key\":\"custom_1777629902262\",\"label\":\"Percentage\",\"enabled\":true,\"order\":11},{\"key\":\"custom_1777629909181\",\"label\":\"Grade\",\"enabled\":true,\"order\":12}],\"columnGroups\":[{\"id\":\"group_1777629912196\",\"name\":\"1st\"},{\"id\":\"group_1777629929204\",\"name\":\"2nd\"},{\"id\":\"group_1777629945092\",\"name\":\"Final\"}],\"customStudentFields\":[],\"summary\":{\"showTotal\":true,\"showPercentage\":true,\"showResult\":true,\"showGrade\":true,\"passingPercentage\":33},\"footer\":{\"showDate\":true,\"showSignatureLines\":true,\"signatureLabels\":[\"Class Teacher\",\"Principal\"],\"footerText\":\"This is a computer generated marksheet.\",\"showRemarks\":false},\"styling\":{\"primaryColor\":\"#191970\",\"headerBgColor\":\"#191970\",\"headerTextColor\":\"#FFFFFF\",\"tableHeaderBg\":\"#191970\",\"tableHeaderText\":\"#FFFFFF\",\"evenRowBg\":\"#F5F5FF\",\"oddRowBg\":\"#FFFFFF\",\"borderColor\":\"#CBD5E1\",\"fontFamily\":\"helvetica\",\"showBorder\":true,\"borderStyle\":\"full\"},\"page\":{\"orientation\":\"landscape\",\"size\":\"a4\",\"marginTop\":15,\"marginBottom\":15,\"marginLeft\":20,\"marginRight\":20}}', 0, '2026-04-30 09:50:45', '2026-05-01 11:23:42', '77,80,81', NULL, NULL);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
  `min_hours_full_day` decimal(3,1) DEFAULT 6.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `code`, `name`, `address`, `city`, `state`, `pincode`, `phone`, `email`, `logo`, `principal_name`, `established_year`, `board`, `website`, `status`, `subscription_plan`, `subscription_start`, `subscription_end`, `created_at`, `updated_at`, `latitude`, `longitude`, `attendance_radius_meters`, `principal_signature`, `min_hours_half_day`, `min_hours_full_day`) VALUES
(1, 'BALLY', 'Ballygunge Park Day School', ' P, 1, Suhrawardy Ave, Park Circus, Beniapukur, Kolkata, West Bengal 700017', 'Kolkata', 'West Bengal', NULL, '09883317064', NULL, '/upload/schools/Ballygunge_Park_Day_School.png', NULL, NULL, 'N/A', NULL, 'active', 'premium', NULL, NULL, '2026-02-08 09:01:21', '2026-05-12 06:41:24', 22.5442191, 88.3671007, 500, NULL, 4.0, 6.0),
(3, 'GORAB', 'Gorabazar I.C. Institution', 'Gorabazar, Berhampore', 'Berhampore', 'West Bengal', '742101', NULL, NULL, '/upload/schools/GIIC.png', NULL, NULL, 'WBBSE', NULL, 'active', 'basic', NULL, NULL, '2026-02-08 09:58:21', '2026-05-13 11:58:28', 22.5425950, 88.3587570, 500, NULL, 4.0, 6.0),
(5, 'ABC01', 'abcd', 'Road, Barrackpore-Barasat Road', 'Kolkata', 'West Bengal', '700126', '4569871230', 'niladri82@gmail.com', '/upload/schools/school_abcd.png', 'ms dhoni', 1996, 'WBBSE', 'abc@gmail.com', 'active', 'premium', '2026-05-06', '2026-06-04', '2026-05-06 11:36:50', '2026-05-06 13:02:58', NULL, NULL, 500, NULL, 4.0, 6.0),
(7, 'PRI01', 'prit sir school ', NULL, NULL, NULL, NULL, NULL, NULL, '/upload/schools/school_prit_sir_school.jpg', 'preet sir', NULL, 'CBSE', NULL, 'active', 'basic', '2026-05-14', NULL, '2026-05-14 09:16:27', '2026-05-14 09:16:27', NULL, NULL, 500, NULL, 4.0, 6.0),
(8, 'DGD01', 'dgdgfhgfhg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'CBSE', NULL, 'active', 'basic', '2026-05-14', NULL, '2026-05-14 09:17:21', '2026-05-14 09:17:21', NULL, NULL, 500, NULL, 4.0, 6.0);

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

--
-- Dumping data for table `school_settings`
--

INSERT INTO `school_settings` (`id`, `school_id`, `setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES
(7, 1, 'student_attendance_mode', 'day_wise', '2026-02-22 07:09:16', '2026-02-23 10:47:07');

-- --------------------------------------------------------

--
-- Table structure for table `school_weekly_schedule`
--

CREATE TABLE `school_weekly_schedule` (
  `school_id` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `is_working` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_weekly_schedule`
--

INSERT INTO `school_weekly_schedule` (`school_id`, `day_of_week`, `is_working`) VALUES
(1, 0, 0),
(1, 1, 1),
(1, 2, 1),
(1, 3, 1),
(1, 4, 1),
(1, 5, 1),
(1, 6, 0);

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

--
-- Dumping data for table `school_working_days`
--

INSERT INTO `school_working_days` (`id`, `school_id`, `date`, `day_type`, `note`, `created_at`) VALUES
(1, 1, '2026-05-04', 'holiday', 'Marked as holiday by Admin', '2026-05-05 10:44:33'),
(3, 1, '2026-05-05', 'working', NULL, '2026-05-05 10:44:35'),
(4, 1, '2026-05-06', 'holiday', 'Marked as holiday by Admin', '2026-05-05 10:44:35'),
(53, 1, '2026-05-03', 'working', NULL, '2026-05-05 10:47:42');

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

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `school_id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(46, 1, 'Section A', 'A', NULL, '2026-02-25 11:43:25', '2026-02-25 11:43:25'),
(47, 1, 'Section B', 'B', NULL, '2026-02-25 11:43:39', '2026-02-25 11:43:39'),
(48, 1, 'Section c', 'C', NULL, '2026-02-27 04:52:11', '2026-02-27 04:52:11'),
(49, 3, 'Section A', 'A', NULL, '2026-03-20 05:38:52', '2026-05-14 08:06:51'),
(51, 3, 'section B', 'B', NULL, '2026-03-20 10:12:48', '2026-03-20 10:12:48'),
(52, 3, 'section c', 'C', NULL, '2026-03-20 10:12:58', '2026-03-20 10:13:14');

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

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `school_id`, `name`, `slug`, `icon`, `description`, `is_active`, `created_at`) VALUES
(1, 1, 'Sports Store', 'sports', '⚽', NULL, 1, '2026-02-12 09:46:41'),
(2, 1, 'Music Store', 'music', '🎵', NULL, 1, '2026-02-12 09:46:41'),
(3, 1, 'Library Store', 'library-store', '📚', NULL, 1, '2026-02-12 09:46:41'),
(4, 1, 'Food Store', 'food', '🍔', NULL, 1, '2026-02-12 09:46:41'),
(5, 1, 'Medical Store', 'medical', '🏥', NULL, 1, '2026-02-12 09:46:41'),
(6, 1, 'Uniform Store', 'uniform', '👔', NULL, 1, '2026-02-12 09:46:41'),
(7, 1, 'Convenience Store', 'convenience', '🏪', NULL, 1, '2026-02-12 09:46:41'),
(8, 3, 'Sports Store', 'sports', '⚽', NULL, 1, '2026-02-12 09:46:41'),
(9, 3, 'Music Store', 'music', '🎵', NULL, 1, '2026-02-12 09:46:41'),
(10, 3, 'Library Store', 'library-store', '📚', NULL, 1, '2026-02-12 09:46:41'),
(11, 3, 'Food Store', 'food', '🍔', NULL, 1, '2026-02-12 09:46:41'),
(12, 3, 'Medical Store', 'medical', '🏥', NULL, 1, '2026-02-12 09:46:41'),
(13, 3, 'Uniform Store', 'uniform', '👔', NULL, 1, '2026-02-12 09:46:41'),
(14, 3, 'Convenience Store', 'convenience', '🏪', NULL, 1, '2026-02-12 09:46:41');

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

--
-- Dumping data for table `store_inventory`
--

INSERT INTO `store_inventory` (`id`, `store_id`, `school_id`, `item_name`, `category`, `sku`, `quantity`, `unit_price`, `selling_price`, `low_stock_threshold`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Cricket Bat', 'Cricket', 'SPT001', 21, 800.00, 1200.00, 5, '', '2026-02-12 11:34:45', '2026-02-13 07:50:57'),
(2, 1, 1, 'Football', 'Football', 'SPT002', 37, 500.00, 750.00, 10, '', '2026-02-12 11:34:45', '2026-02-13 07:50:57'),
(3, 1, 1, 'Badminton Racket', 'Badminton', 'SPT003', 25, 400.00, 650.00, 5, '', '2026-02-12 11:34:45', '2026-02-13 07:36:52'),
(4, 1, 1, 'Tennis Ball (Pack of 6)', 'Cricket', 'SPT004', 98, 80.00, 150.00, 20, '', '2026-02-12 11:34:45', '2026-02-13 07:30:13'),
(5, 1, 1, 'Sports Shoes', 'Footwear', 'SPT005', 13, 1200.00, 1800.00, 3, '', '2026-02-12 11:34:45', '2026-02-13 07:30:13'),
(6, 1, 1, 'Yoga Mat', 'Fitness', 'SPT006', 18, 300.00, 500.00, 5, '', '2026-02-12 11:34:45', '2026-02-13 07:30:13'),
(7, 2, 1, 'Guitar Strings Set', 'Strings', 'MUS001', 48, 150.00, 250.00, 10, '', '2026-02-12 11:34:45', '2026-02-15 04:57:03'),
(8, 2, 1, 'Recorder Flute', 'Wind', 'MUS002', 19, 200.00, 350.00, 5, '', '2026-02-12 11:34:45', '2026-02-15 04:57:03'),
(9, 2, 1, 'Tabla Pair', 'Percussion', 'MUS003', 7, 2000.00, 3500.00, 2, '', '2026-02-12 11:34:45', '2026-02-13 07:37:31'),
(10, 2, 1, 'Music Notebook', 'Stationery', 'MUS004', 59, 30.00, 50.00, 15, '', '2026-02-12 11:34:45', '2026-02-13 07:37:31'),
(11, 4, 1, 'Samosa (2 pcs)', 'Snacks', 'FD001', 500, 8.00, 15.00, 50, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(12, 4, 1, 'Cold Drink 250ml', 'Beverages', 'FD002', 300, 15.00, 25.00, 50, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(13, 4, 1, 'Sandwich', 'Snacks', 'FD003', 200, 20.00, 40.00, 30, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(14, 4, 1, 'Juice Box', 'Beverages', 'FD004', 150, 12.00, 20.00, 30, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(15, 4, 1, 'Biscuit Pack', 'Snacks', 'FD005', 400, 5.00, 10.00, 50, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(16, 5, 1, 'Band-Aid Strip (10)', 'First Aid', 'MED001', 100, 20.00, 35.00, 20, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(17, 5, 1, 'ORS Sachet', 'Medicine', 'MED002', 200, 5.00, 10.00, 30, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(18, 5, 1, 'Dettol 50ml', 'Antiseptic', 'MED003', 30, 40.00, 65.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(19, 5, 1, 'Cotton Roll', 'First Aid', 'MED004', 50, 25.00, 40.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(20, 6, 1, 'White Shirt (M)', 'Shirts', 'UNI001', 30, 250.00, 450.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(21, 6, 1, 'White Shirt (L)', 'Shirts', 'UNI002', 30, 260.00, 460.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(22, 6, 1, 'Grey Trousers (M)', 'Trousers', 'UNI003', 25, 300.00, 500.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(23, 6, 1, 'Grey Trousers (L)', 'Trousers', 'UNI004', 25, 310.00, 520.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(24, 6, 1, 'School Tie', 'Accessories', 'UNI005', 50, 80.00, 150.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(25, 6, 1, 'School Belt', 'Accessories', 'UNI006', 40, 60.00, 120.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(26, 6, 1, 'School Blazer', 'Blazer', 'UNI007', 15, 800.00, 1500.00, 3, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(27, 7, 1, 'Pencil Box', 'Stationery', 'CNV001', 60, 50.00, 100.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(28, 7, 1, 'Eraser (Pack 5)', 'Stationery', 'CNV002', 200, 10.00, 20.00, 30, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(29, 7, 1, 'Glue Stick', 'Stationery', 'CNV003', 98, 15.00, 30.00, 20, '', '2026-02-12 11:34:45', '2026-02-17 06:12:59'),
(30, 7, 1, 'Scissors', 'Tools', 'CNV004', 40, 30.00, 60.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(31, 7, 1, 'Water Bottle 1L', 'Essentials', 'CNV005', 35, 80.00, 150.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(32, 7, 1, 'Umbrella', 'Essentials', 'CNV006', 20, 150.00, 300.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(33, 8, 3, 'Cricket Bat', 'Cricket', 'SPT001', 25, 800.00, 1200.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(34, 8, 3, 'Football', 'Football', 'SPT002', 40, 500.00, 750.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(35, 8, 3, 'Badminton Racket', 'Badminton', 'SPT003', 30, 400.00, 650.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(36, 8, 3, 'Tennis Ball (Pack of 6)', 'Cricket', 'SPT004', 100, 80.00, 150.00, 20, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(37, 8, 3, 'Sports Shoes', 'Footwear', 'SPT005', 15, 1200.00, 1800.00, 3, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(38, 8, 3, 'Yoga Mat', 'Fitness', 'SPT006', 20, 300.00, 500.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(39, 9, 3, 'Guitar Strings Set', 'Strings', 'MUS001', 50, 150.00, 250.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(40, 9, 3, 'Recorder Flute', 'Wind', 'MUS002', 20, 200.00, 350.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(41, 9, 3, 'Tabla Pair', 'Percussion', 'MUS003', 8, 2000.00, 3500.00, 2, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(42, 9, 3, 'Music Notebook', 'Stationery', 'MUS004', 60, 30.00, 50.00, 15, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(43, 11, 3, 'Samosa (2 pcs)', 'Snacks', 'FD001', 494, 8.00, 15.00, 50, '', '2026-02-12 11:34:45', '2026-03-21 11:51:02'),
(44, 11, 3, 'Cold Drink 250ml', 'Beverages', 'FD002', 296, 15.00, 25.00, 50, '', '2026-02-12 11:34:45', '2026-03-21 11:51:02'),
(45, 11, 3, 'Sandwich', 'Snacks', 'FD003', 192, 20.00, 40.00, 30, '', '2026-02-12 11:34:45', '2026-03-21 11:51:02'),
(46, 11, 3, 'Juice Box', 'Beverages', 'FD004', 146, 12.00, 20.00, 30, '', '2026-02-12 11:34:45', '2026-03-21 11:51:02'),
(47, 11, 3, 'Biscuit Pack', 'Snacks', 'FD005', 391, 5.00, 10.00, 50, '', '2026-02-12 11:34:45', '2026-03-21 11:51:02'),
(48, 12, 3, 'Band-Aid Strip (10)', 'First Aid', 'MED001', 100, 20.00, 35.00, 20, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(49, 12, 3, 'ORS Sachet', 'Medicine', 'MED002', 200, 5.00, 10.00, 30, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(50, 12, 3, 'Dettol 50ml', 'Antiseptic', 'MED003', 30, 40.00, 65.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(51, 12, 3, 'Cotton Roll', 'First Aid', 'MED004', 50, 25.00, 40.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(52, 13, 3, 'White Shirt (M)', 'Shirts', 'UNI001', 30, 250.00, 450.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(53, 13, 3, 'White Shirt (L)', 'Shirts', 'UNI002', 30, 260.00, 460.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(54, 13, 3, 'Grey Trousers (M)', 'Trousers', 'UNI003', 25, 300.00, 500.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(55, 13, 3, 'Grey Trousers (L)', 'Trousers', 'UNI004', 25, 310.00, 520.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(56, 13, 3, 'School Tie', 'Accessories', 'UNI005', 50, 80.00, 150.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(57, 13, 3, 'School Belt', 'Accessories', 'UNI006', 40, 60.00, 120.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(58, 13, 3, 'School Blazer', 'Blazer', 'UNI007', 15, 800.00, 1500.00, 3, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(59, 14, 3, 'Pencil Box', 'Stationery', 'CNV001', 60, 50.00, 100.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(60, 14, 3, 'Eraser (Pack 5)', 'Stationery', 'CNV002', 200, 10.00, 20.00, 30, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(61, 14, 3, 'Glue Stick', 'Stationery', 'CNV003', 100, 15.00, 30.00, 20, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(62, 14, 3, 'Scissors', 'Tools', 'CNV004', 40, 30.00, 60.00, 10, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(63, 14, 3, 'Water Bottle 1L', 'Essentials', 'CNV005', 35, 80.00, 150.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45'),
(64, 14, 3, 'Umbrella', 'Essentials', 'CNV006', 20, 150.00, 300.00, 5, '', '2026-02-12 11:34:45', '2026-02-12 11:34:45');

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

--
-- Dumping data for table `store_transactions`
--

INSERT INTO `store_transactions` (`id`, `store_id`, `school_id`, `student_id`, `student_name`, `buyer_type`, `class_name`, `item_id`, `item_name`, `quantity`, `unit_price`, `total_amount`, `transaction_type`, `payment_method`, `payment_status`, `bill_number`, `notes`, `created_by`, `created_at`) VALUES
(23, 11, 3, NULL, 'Walk-in Customer', 'student', '', 43, 'Samosa (2 pcs)', 6, 15.00, 90.00, 'sale', 'upi', 'paid', 'BILL-FOOD-20260321-001', '', 326, '2026-03-21 11:51:02'),
(24, 11, 3, NULL, 'Walk-in Customer', 'student', '', 46, 'Juice Box', 4, 20.00, 80.00, 'sale', 'upi', 'paid', 'BILL-FOOD-20260321-001', '', 326, '2026-03-21 11:51:02'),
(25, 11, 3, NULL, 'Walk-in Customer', 'student', '', 44, 'Cold Drink 250ml', 4, 25.00, 100.00, 'sale', 'upi', 'paid', 'BILL-FOOD-20260321-001', '', 326, '2026-03-21 11:51:02'),
(26, 11, 3, NULL, 'Walk-in Customer', 'student', '', 47, 'Biscuit Pack', 9, 10.00, 90.00, 'sale', 'upi', 'paid', 'BILL-FOOD-20260321-001', '', 326, '2026-03-21 11:51:02'),
(27, 11, 3, NULL, 'Walk-in Customer', 'student', '', 45, 'Sandwich', 8, 40.00, 320.00, 'sale', 'upi', 'paid', 'BILL-FOOD-20260321-001', '', 326, '2026-03-21 11:51:02');

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

--
-- Dumping data for table `streams`
--

INSERT INTO `streams` (`id`, `school_id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(11, 1, 'Science', 'SCI', NULL, '2026-02-25 11:46:44', '2026-02-25 11:46:44'),
(15, 3, 'arts', 'ARTS', NULL, '2026-03-22 10:04:57', '2026-03-22 10:04:57'),
(16, 3, 'Science', 'SCI', NULL, '2026-03-22 10:06:30', '2026-05-06 09:57:00'),
(17, 1, 'Commerce', 'COM', NULL, '2026-04-17 10:11:04', '2026-04-17 10:11:04');

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

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `school_id`, `user_id`, `student_unique_id`, `application_id`, `student_name`, `email`, `phone`, `roll_no`, `class`, `section`, `stream_id`, `combination_id`, `date_of_birth`, `gender`, `address`, `father_name`, `mother_name`, `guardian_phone`, `admission_date`, `blood_group`, `medical_conditions`, `previous_school`, `previous_class`, `batch_id`, `created_at`, `updated_at`, `photo_path`, `created_by`, `father_photo`, `mother_photo`, `student_aadhaar`, `father_aadhaar`, `mother_aadhaar`, `father_pan`, `mother_pan`, `status`, `passed_out_date`, `passed_out_class`, `passed_out_year`, `remarks`) VALUES
(264, 3, 264, 'GORAB1899001', NULL, 'Demo Student', 'demo', '9999888877', '1235', '1', 'A', NULL, NULL, '1899-11-30', 'MALE', 'DEMO ADDRESS', 'DEMO FATHER', 'DEMO MOTHER', '6547893214', '0000-00-00', 'A+', 'NO MEDICAL CONDITION', 'SAME SCHOOL', '7', NULL, '2026-02-08 10:06:11', '2026-04-13 12:57:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(291, 3, 331, 'GORAB2026002', NULL, 'blue', 'fgjhsgfd@jhygcf.jyfdg', '123456', '54', '5', 'C', NULL, NULL, '2026-03-22', 'Male', 'gfhjngfhj', 'dfg', 'fghb', '56767675', '2026-03-22', 'A+', 'gfhjf', NULL, NULL, NULL, '2026-03-22 08:36:56', '2026-05-02 23:01:11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(292, 3, 332, 'GORAB2026003', NULL, 'subhas', 'sf@fjhg.fygrt', '111111', '11', '11', 'A', 16, NULL, '2026-03-22', 'Female', 'fgh', 'cdfgr', 'gtfdhy', 'rfh', '2026-03-22', 'A-', 'fdhg', NULL, NULL, NULL, '2026-03-22 10:41:55', '2026-04-13 12:57:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(293, 3, 333, 'GORAB2026004', NULL, 'jaswal', 'jaswal@jhgh.djyf', '789', '222', '5', 'A', NULL, NULL, '2026-03-20', 'Male', 'hgdgrdr', 'fhggf', 'fghngfn', '453453', '2026-03-22', 'O-', 'jhhgfh', NULL, NULL, NULL, '2026-03-22 11:01:54', '2026-05-13 18:58:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(295, 1, 336, 'BALLY2026251', NULL, 'Abdul shad ', NULL, '9330616809', '1', '3', 'A', NULL, NULL, '2017-08-07', 'Male', '7/b/h/7 rameshwar shaw road , kolkata-700014', 'Md. shabbir', 'Nikhat perween', 'Nikhat perween', '2026-04-09', '', '', NULL, NULL, NULL, '2026-04-09 06:34:44', '2026-04-18 06:44:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(296, 1, 337, 'BALLY2026259', NULL, 'Humaira Anwar ', NULL, '9831333498', '9', '3', 'A', NULL, NULL, '2016-10-23', 'Female', '22/E, gora chand lane- kolkata-700014', 'Perwez Anwar', 'Jahan ara', 'Jahan ara', '2026-04-09', 'O+', '', NULL, NULL, NULL, '2026-04-09 06:40:05', '2026-04-18 06:45:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(297, 1, 338, 'BALLY2026267', NULL, 'Umar Akhter ', NULL, '6204447827', '17', '3', 'A', NULL, NULL, '2017-07-05', 'Male', '7/B/H/7 rameshwar shaw road, ', 'Md shahid Akhter', 'Sanober Perveen', '', '2026-04-09', '', '', NULL, NULL, NULL, '2026-04-09 06:48:46', '2026-04-18 06:47:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(298, 1, 339, 'BALLY2026264', NULL, 'Simra jamil', NULL, '6289106706', '14', '3', 'A', NULL, NULL, '2016-10-01', 'Female', '39/1/H/4 sir syed ahmed road', 'Jamil Akhter', 'Sahani Khatoon', '', '2026-04-09', 'B+', '', NULL, NULL, NULL, '2026-04-09 06:57:25', '2026-04-18 06:46:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(299, 1, 340, 'BALLY2026266', NULL, 'Tawhed Ali Mallik', NULL, '6290328567', '16', '3', 'A', NULL, NULL, '2017-11-21', 'Male', '2A/H20, Tiljala lane', 'Asgar Ali mallick', 'Tara khatun', '', '2026-04-09', 'B+', '', NULL, NULL, NULL, '2026-04-09 07:03:27', '2026-04-18 06:47:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(300, 1, 341, 'BALLY2026258', NULL, 'Ekra khatoon', NULL, '7980660536', '8', '3', 'A', NULL, NULL, '2017-07-17', 'Female', '7/h/11, Jannagar road kolkata-700017', 'Md Shahzada', 'Shabnam Begum', '', '2026-04-09', '', '', NULL, NULL, NULL, '2026-04-09 07:07:23', '2026-04-18 06:45:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(301, 1, 342, 'BALLY2026255', NULL, 'Arhama Rahaman', NULL, '9143148128', '5', '3', 'A', NULL, NULL, '2017-09-15', 'Male', '3/8 Green park , kolkata -700019', 'Arshadul Rahaman', 'Shaina rahaman', '', '2026-04-09', '', '', NULL, NULL, NULL, '2026-04-09 07:17:32', '2026-04-18 06:44:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(302, 1, 343, 'BALLY2026261', NULL, 'Kanika Sarfaraz ', NULL, '8820169620', '11', '3', 'A', NULL, NULL, '2016-06-22', 'Female', '2/1 Jannagar road , kolkta -700017', 'Md Rajesh ', 'Shivani Sarfaraz', '', '2026-04-09', 'B+', '', NULL, NULL, NULL, '2026-04-09 07:21:42', '2026-04-18 06:46:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(303, 1, 344, 'BALLY2026256', NULL, 'Asifa Shahid', NULL, '7980202041', '6', '3', 'A', NULL, NULL, '2017-03-18', 'Female', '29/A/H, 15 palm avenue kol-19', 'Md Shahid', 'Asifa Shahid ', '', '2026-04-09', 'B+', '', NULL, NULL, NULL, '2026-04-09 07:25:09', '2026-04-18 06:45:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(304, 1, 345, 'BALLY2026263', NULL, 'Shresthi Kumari', NULL, '7278540642', '13', '3', 'A', NULL, NULL, '2017-09-26', 'Female', '1/4, tiljala road , kol- 46', 'Amar Sujeet Kumar', 'Prity Shaw', '', '2026-04-09', 'A+', '', NULL, NULL, NULL, '2026-04-09 07:32:50', '2026-04-18 06:46:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(305, 1, 347, 'BALLY2026005', NULL, 'Mohammad Ambiya', NULL, '8240560680', '5', 'LN', 'A', NULL, NULL, '2022-04-14', 'Male', '7B/H/7 Rameshwar Shaw road , kolkata', 'Mohhamad Wasim', 'Sufi Parvin', '6291857440', '2026-04-10', 'B+', 'none\n', NULL, NULL, NULL, '2026-04-10 05:41:28', '2026-05-07 08:33:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(306, 1, 348, 'BALLY2026003', NULL, 'MD. FAIQ', NULL, '6289524332', '3', 'LN', 'A', NULL, NULL, '2021-09-04', 'Male', '98 H/2 LINTON STREET KOLKATA 700014', 'MD. SHAIK', 'Farkhanda Ejaz', '8777760521', '2026-04-10', 'A+', '', NULL, NULL, NULL, '2026-04-10 05:44:46', '2026-05-07 08:27:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(307, 1, 349, 'BALLY2026008', NULL, 'Khadija Ali', NULL, '8420768236', '8', 'LN', 'A', NULL, NULL, '2021-12-02', 'Female', '23a gorachand lane', 'Wasim Ali', 'Nafisa Parvin', '8585081125', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 05:45:46', '2026-05-07 08:34:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(308, 1, 350, 'BALLY2026007', NULL, 'MD Uzair Ali', NULL, '705982558', '7', 'LN', 'A', NULL, NULL, '2022-12-10', 'Male', '98/H/10 linton street', 'MD Zahid', 'Rani Begam', '8961666068', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 05:49:18', '2026-05-07 08:33:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(309, 1, 351, 'BALLY2026002', NULL, 'MD. Taimur', NULL, '6289966864', '2', 'LN', 'A', NULL, NULL, '2022-08-12', 'Male', '5/2 gora chand lane kol-14', 'MD Manauwar', 'Shabina Khanam', '7439694094', '2026-04-10', 'B-', 'no', NULL, NULL, NULL, '2026-04-10 05:49:56', '2026-05-07 08:27:31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(310, 1, 352, 'BALLY2026006', NULL, 'MD Aariz Shajeb', NULL, '8373882151', '6', 'LN', 'A', NULL, NULL, '2022-11-14', 'Male', '3c, Kimber street kolkata-17', 'MD Shajeb', 'Afsari Khatoon', '8373882151', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 05:52:55', '2026-05-07 08:33:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(311, 1, 353, 'BALLY2026015', NULL, 'Raza Hussain', NULL, '6290195166', '1', 'UN', 'A', NULL, NULL, '2021-11-24', 'Male', '23/5 Gorachand Lane', 'Nazbun Hussain', 'Ayesha Khatoon', '9876544358', '2026-04-10', '', 'none\n', NULL, NULL, NULL, '2026-04-10 05:56:29', '2026-05-07 09:23:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(312, 1, 354, 'BALLY2026051', NULL, 'Md Arish', NULL, '9007814319', '1', 'KG', 'A', NULL, NULL, '2019-11-29', 'Male', '5b ostagar land kol 14', 'Md Azhar', 'Fatma Khanum', '', '2026-04-10', '', 'no', NULL, NULL, NULL, '2026-04-10 05:58:17', '2026-05-07 10:15:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(313, 1, 355, 'BALLY2026016', NULL, 'Mohammed Shazan', NULL, '9007267963', '2', 'UN', 'A', NULL, NULL, '2021-08-15', 'Male', '25/4 Kustia Masjid Bari Lane', 'Mohammed Auranzeb', 'Shabnam Khatoon', '9903281648', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 06:00:08', '2026-05-07 09:23:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(314, 1, 356, 'BALLY2026017', NULL, 'Irfan Alam', NULL, '9681613383', '3', 'UN', 'A', NULL, NULL, '2021-10-10', 'Male', '7/1 kasa para lane kolkata-17', 'Imtiaz Alam', 'Gudia Khatoon', '9831683622', '2026-04-10', 'A+', 'none', NULL, NULL, NULL, '2026-04-10 06:04:47', '2026-05-07 09:23:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(315, 1, 357, 'BALLY2026052', NULL, 'Sanaya Khatoon', NULL, '8017178962', '2', 'KG', 'A', NULL, NULL, '2019-10-10', 'Female', '7/B/H/6 DEHI SERAMPUR ROAD', 'Md siraj Kalander', 'Shahina Khatoon', '6291873159', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 06:05:38', '2026-05-07 10:15:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(316, 1, 358, 'BALLY2026018', NULL, 'Aaira Shadab', NULL, '7044900297', '4', 'UN', 'A', NULL, NULL, '2021-10-06', 'Female', '7,b kustia road, kolkata-39', 'Shadab Ahmed', 'Nahid Yasin', '9874814345', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 06:07:32', '2026-05-07 10:46:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(317, 1, 359, 'BALLY2026053', NULL, 'Md  Koinaan Raza', NULL, '9331051827', '3', 'KG', 'A', NULL, NULL, '2020-12-15', 'Male', '7/d ostagar lane kol-14', 'Md Main', 'Hena Begum', '7003128216', '2026-04-10', 'B+', '', NULL, NULL, NULL, '2026-04-10 06:11:15', '2026-05-07 10:33:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(318, 1, 362, 'BALLY2026001', NULL, 'Arya Khan', NULL, '9903090214', '1', 'LN', 'A', NULL, NULL, '2023-01-19', 'Female', '13/6/1A/H/1 Rameshwar shaw road, kolkata-14', 'Ashar Khan', 'Nafisa Rahmat', '7439720664', '2026-04-10', 'O+', 'none\n', NULL, NULL, NULL, '2026-04-10 06:12:22', '2026-05-07 08:27:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(319, 1, 363, 'BALLY2026054', NULL, 'Hania Haris', NULL, '9051462904', '4', 'KG', 'A', NULL, NULL, '2020-09-12', 'Female', '89 d shakesperare sarani ', 'MD. Haris', 'Neha Shahid', '8240470365', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 06:16:39', '2026-05-07 10:33:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(320, 1, 364, 'BALLY2026019', NULL, 'Fariya Parveen', NULL, '9875381690', '5', 'UN', 'A', NULL, NULL, '2021-03-02', 'Female', '38, Gorachand road, kolkata-14', 'Mirajul Haque', 'Faima Khatoon', '6289011595', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 06:17:03', '2026-05-07 10:47:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(321, 1, 365, 'BALLY2026020', NULL, 'Raida Naaz', NULL, '9073198696', '6', 'UN', 'A', NULL, NULL, '2021-11-14', 'Female', '29 Tiljala road,kolkata-700046', 'Abdus Soib', 'Saiqua Parveen', '6291984235', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:20:41', '2026-05-07 10:46:51', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(322, 1, 366, 'BALLY2026055', NULL, 'Ruqaiya Sultan', NULL, '6289099050', '5', 'KG', 'A', NULL, NULL, '2021-03-02', 'Male', '4b, ram mohan beralane kolkata', '', 'Shamsida Khatoon', '7003441974', '2026-04-10', '', 'no', NULL, NULL, NULL, '2026-04-10 06:24:42', '2026-05-07 10:33:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(323, 1, 367, 'BALLY2026021', NULL, 'MD Rehan KKhan', NULL, '9073447091', '7', 'UN', 'A', NULL, NULL, '2021-12-09', 'Male', '8/3, Ahiripukur 1st lane, Ballygung', 'Mazhar Khan', 'Shahina Parveen', '8910069588', '2026-04-10', 'O+', 'none', NULL, NULL, NULL, '2026-04-10 06:25:28', '2026-05-07 10:47:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(324, 1, 368, 'BALLY2026022', NULL, 'Azifa hussain', NULL, '8240044199', '8', 'UN', 'A', NULL, NULL, '2020-12-13', 'Female', '2d Gorachand lane, kolkata-14', 'MD Adil Hussain', 'Minnat Khatoon', '6289312884', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:28:19', '2026-05-07 10:48:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(325, 1, 369, 'BALLY2026056', NULL, 'Md. Shifan Ali Khan', NULL, '9162062270', '6', 'KG', 'A', NULL, NULL, '2020-09-01', 'Male', 'mullick bazer kol-17', 'Sabir Ali', 'Shagufta Zahid', '7003583558', '2026-04-10', 'O+', 'no ', NULL, NULL, NULL, '2026-04-10 06:30:07', '2026-05-07 10:33:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(326, 1, 370, 'BALLY2026023', NULL, 'Shaifan Fahim', NULL, '8697323550', '9', 'UN', 'A', NULL, NULL, '2020-12-28', 'Male', '23/5, Gorachand lane , kol-14', 'Md Fahim', 'Sana Rahim', '8420210189', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:30:44', '2026-05-07 10:48:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(327, 1, 371, 'BALLY2026057', NULL, 'Ayat Aslam ', NULL, '9798956432', '7', 'KG', 'A', NULL, NULL, '2019-12-25', 'Female', '98/H/7 LINTON STREET KOLKATA', '', 'Rukshana Khatoon', '9748270356', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 06:32:22', '2026-05-07 10:33:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(328, 1, 372, 'BALLY2026024', NULL, 'Amrik Kumar', NULL, '8443814485', '10', 'UN', 'A', NULL, NULL, '2022-03-25', 'Male', '114, Tiltala road, kolkata-46', 'Amar Suieet', 'Prity Shaw', '8443814485', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 06:33:43', '2026-05-07 10:48:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(329, 1, 373, 'BALLY2026058', NULL, 'Ali Shanawar', NULL, '9330667069', '8', 'KG', 'A', NULL, NULL, '2020-12-18', 'Male', '7/H/5 Jannnagar road kol-17', 'Shanawaz Alam', 'Heena Tavir', '9123801958', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 06:37:07', '2026-05-07 10:34:11', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(330, 1, 374, 'BALLY2026522', NULL, 'Anam Ali', NULL, '8240030314', '22', '5', 'A', NULL, NULL, '2014-01-02', 'Female', '38/1H/2 sumsul huda road, kolkata-17', 'Haidar Ali', 'Reshma Begam', '8240030314', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 06:37:37', '2026-04-14 07:45:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(331, 1, 375, 'BALLY2026521', NULL, 'Zikra Niaz', NULL, '9681669275', '21', '5', 'A', NULL, NULL, '2015-03-13', 'Female', '4/A, Bright street, 2nd floor', 'Niaz Ahmed', 'Seema Salim', '8232961038', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:40:56', '2026-04-14 07:45:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(332, 1, 376, 'BALLY2026059', NULL, 'Zayan Ali', NULL, '8585833583', '9', 'KG', 'A', NULL, NULL, '2021-02-18', 'Male', '100 h/2, Dilkusha street , kol -17', 'Zubiar Ali', 'Shahin Hossain', '9903006037', '2026-04-10', '', 'no', NULL, NULL, NULL, '2026-04-10 06:41:02', '2026-05-07 10:34:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(333, 1, 377, 'BALLY2026520', NULL, 'Zainat Feroz', NULL, '8240524996', '20', '5', 'A', NULL, NULL, '2014-04-30', 'Female', '21, Gorachand lane, kolkata-14', 'Sk Feroz', 'Ayesha Begum', '8240324996', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:45:00', '2026-04-14 07:44:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(334, 1, 378, 'BALLY2026060', NULL, 'Shad Alam', NULL, '8910192621', '10', 'KG', 'A', NULL, NULL, '2020-09-07', 'Male', '4b jannaga Road', 'Shah Alam', 'Shagufta praveen', '9910559975', '2026-04-10', 'A+', 'no', NULL, NULL, NULL, '2026-04-10 06:47:27', '2026-05-07 10:34:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(335, 1, 379, 'BALLY2026518', NULL, 'Sk Burhan Uddin', NULL, '9163764933', '18', '5', 'A', NULL, NULL, '2016-08-29', 'Male', '13F/1A , Tiljala lane , kolkata-19', 'Sk Sahabuddin', 'kayenat Naghma', '6289786221', '2026-04-10', 'A+', 'none', NULL, NULL, NULL, '2026-04-10 06:49:03', '2026-04-14 07:44:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(336, 1, 380, 'BALLY2026517', NULL, 'Shiggha Imran', NULL, '8100422741', '17', '5', 'A', NULL, NULL, '2015-05-05', 'Female', '911 Jannagar road , kolkata-17', 'Sk Imran', 'Simran Imran', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:52:33', '2026-04-14 07:43:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(337, 1, 381, 'BALLY2026061', NULL, 'Sarthak Shaw', NULL, '6289712123', '11', 'KG', 'A', NULL, NULL, '2020-08-24', 'Male', '14c Ahiri Pukur 2nd lane ', 'Sachin Kumar Shaw', 'Poonam Kumari Shaw', '6291217945', '2026-04-10', '', 'no', NULL, NULL, NULL, '2026-04-10 06:52:49', '2026-05-07 10:34:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(338, 1, 382, 'BALLY2026062', NULL, 'Aira Waseem', NULL, '912380036', '12', 'KG', 'A', NULL, NULL, '2020-05-16', 'Female', '29/2 BENIA PARA', 'Md Waseem', 'Firdous Begum', '9162671123', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 06:55:51', '2026-05-07 10:34:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(339, 1, 383, 'BALLY2026516', NULL, 'Sidra Zahid', NULL, '9038142609', '16', '5', 'A', NULL, NULL, '2013-12-13', 'Female', '4, Crema Torium street, kolkata-14', 'MD Zahid', 'Tarannum Jabeen', '9038142609', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:56:11', '2026-04-14 07:43:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(340, 1, 384, 'BALLY2026515', NULL, 'Shafika Alam', NULL, '7980192673', '15', '5', 'A', NULL, NULL, '2015-01-12', 'Female', '239 Tiljala road , kolkata- 46', 'Shahid Alam', 'Sana Parveen', '8296583040', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 06:59:26', '2026-04-14 07:43:07', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(341, 1, 385, 'BALLY2026063', NULL, 'Aamir Ali ', NULL, '8340475639', '13', 'KG', 'A', NULL, NULL, '2019-08-20', 'Male', '23/7 gorachand lane  kol-14', 'Shabbir Ali', 'Sultana Parween', '7044654845', '2026-04-10', '', 'no', NULL, NULL, NULL, '2026-04-10 07:00:14', '2026-05-07 10:35:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(342, 1, 386, 'BALLY2026512', NULL, 'MD Zaki Alam', NULL, '9007729419', '12', '5', 'A', NULL, NULL, '2015-08-03', 'Male', '7/1 Jan Nagar road, kolkata-17', 'Mahtab Alam', 'Tarannum Naaz', '7003762645', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 07:01:58', '2026-04-14 07:42:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(343, 1, 387, 'BALLY2026301', NULL, 'Aizah Azed', NULL, '8013482550', '1', '4', 'A', NULL, NULL, '2017-01-13', 'Female', '', 'Mehtab Alam', 'Zarina Khatoon', '7439530461', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 07:05:10', '2026-04-18 06:48:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(344, 1, 388, 'BALLY2026510', NULL, 'MD Tahmid Alam', NULL, '7003689447', '10', '5', 'A', NULL, NULL, '2015-07-28', 'Male', '7/B rameshwar Shaw road kolkata-14', 'Shamsh Tabrez Alam', 'Nikhat Khanum', '6204447827', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 07:09:57', '2026-04-14 07:42:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(345, 1, 389, 'BALLY2026302', NULL, 'Alizay Zaman', NULL, '8777242342', '2', '4', 'A', NULL, NULL, '2016-11-19', 'Female', '7b/h/7 rameshwar shaw road kol-14', 'Zamiruz Zaman', 'Madina Bibi', '', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 07:11:22', '2026-04-18 06:49:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(346, 1, 390, 'BALLY2026509', NULL, 'MD Shanawaz Ahmed', NULL, '8100425981', '9', '5', 'A', NULL, NULL, '2013-06-20', 'Male', '22B Gorachand lane', 'Md Sayeed Ahmed', 'Shamshad Begum', '7044583512', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 07:12:24', '2026-04-14 07:42:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(347, 1, 391, 'BALLY2026508', NULL, 'MD Osman Khan', NULL, '9123008819', '8', '5', 'A', NULL, NULL, '2015-12-21', 'Male', '5/2 Gorachand lane ', 'Wakil Ahmed Khan', 'Tahera Khatoon', '9123008819', '2026-04-10', '', ' none', NULL, NULL, NULL, '2026-04-10 07:16:01', '2026-04-14 07:41:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(348, 1, 392, 'BALLY2026303', NULL, 'Alfiya Salim', NULL, '8420100786', '3', '4', 'A', NULL, NULL, '2015-09-29', 'Female', '3/H/7, Gorachand Road, kolkata, 700014', 'Md Saiful Islam', 'Asiya Khatoon', '8282852258', '2026-04-10', 'A+', 'no', NULL, NULL, NULL, '2026-04-10 07:16:11', '2026-04-18 06:49:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(349, 1, 393, 'BALLY2026506', NULL, 'MD Bilal', NULL, '7044277914', '6', '5', 'A', NULL, NULL, '2016-01-02', 'Male', '24/1 Gorachand lane, kolkata', 'Md Daulat', 'Ruksana Begum', '7044277914', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 07:19:09', '2026-04-14 07:41:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(350, 1, 394, 'BALLY2026304', NULL, 'Ayesha Firdous', NULL, '9163694198', '4', '4', 'A', NULL, NULL, '2016-07-15', 'Female', '41/c jannagar road', 'Md. Sabir', 'Tarannum Perveen', '9163694198', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 07:19:37', '2026-04-18 06:49:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(351, 1, 395, 'BALLY2026505', NULL, 'Hamsha Ahmed ', NULL, '8240018756', '5', '5', 'A', NULL, NULL, '2015-08-07', 'Female', '21/1 Gorachand lane', 'Md Ahmed', 'Kursiya Parveen', '8100447667', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 07:24:11', '2026-04-14 07:41:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(352, 1, 396, 'BALLY2026305', NULL, 'Md. Subhan Khan', NULL, '9681989845', '5', '4', 'A', NULL, NULL, '2015-10-06', 'Male', '18.a.j.l Bose Road Kol-17', 'Taseen Khan', 'Rozi Khatoon', '8910614339', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 07:24:47', '2026-04-18 06:49:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(353, 1, 397, 'BALLY2026504', NULL, 'Ayat Ilham', NULL, '9330188784', '4', '5', 'A', NULL, NULL, '2015-05-19', 'Female', '40/B, DR. Sundari Mohan Avenue', 'Md Nazbullah', 'Nuzhat Parveen', '6290309744', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 07:27:11', '2026-04-14 07:41:19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(354, 1, 398, 'BALLY2026306', NULL, 'Md Sahil', NULL, '9163886692', '6', '4', 'A', NULL, NULL, '2015-09-21', 'Male', '7/h/7 kasial paralane kol-17', 'Md. Khalid', 'Khusbu Parveen', '7980985820', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 07:29:45', '2026-04-18 06:49:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(355, 1, 399, 'BALLY2026503', NULL, 'Ayat Haque', NULL, '7439458558', '3', '5', 'A', NULL, NULL, '2016-04-27', 'Female', '11/A Gorachand lane kolkata-14', 'MD Mujibul Haque', 'Kankashan', '7980236918', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 07:30:48', '2026-04-14 07:41:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(356, 1, 400, 'BALLY2026307', NULL, 'Md Zaid', NULL, '8240654299', '7', '4', 'A', NULL, NULL, '2016-11-22', 'Male', '6/1a dehi Serampur Roas', 'Md Anwar', 'Shabnam Begum', '7439624255', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 07:32:51', '2026-04-18 06:49:53', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(357, 1, 401, 'BALLY2026502', NULL, 'Sayed Aryan Alam', NULL, '8274955838', '2', '5', 'A', NULL, NULL, '2013-08-27', 'Male', '100H/ 13 Dilkusha Street kolkata-17', 'Mahtab Alam', 'Mussarrat Tabassum', '9339498961', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 07:33:41', '2026-04-14 07:40:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(358, 1, 402, 'BALLY2026501', NULL, 'Adnan Hussain', NULL, '91635832844', '1', '5', 'A', NULL, NULL, '2014-11-29', 'Male', '2/1 Jannagar road , kolkata 700017', 'Md Ishfaqoe', 'tabassom Ara', '8910819830', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 07:36:34', '2026-04-14 07:40:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(359, 1, 403, 'BALLY2026308', NULL, 'Md. Shayam Alchtar', NULL, '9007346735', '8', '4', 'A', NULL, NULL, '2017-04-02', 'Male', '13 G/ ic tiljala lane kol-19', 'Md. Akhtar', 'Reshma Ichatoon', '9836099425', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 07:36:49', '2026-04-18 06:50:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(360, 1, 404, 'BALLY2026310', NULL, 'Mahira Islam', NULL, '7980616326', '10', '4', 'A', NULL, NULL, '2016-01-16', 'Male', '86/c Jhawtala Road Kolkata 70017', 'Mohammed Islam', 'Sakina Khatoon', '9831560786', '2026-04-10', 'O-', 'no ', NULL, NULL, NULL, '2026-04-10 08:23:52', '2026-04-18 06:50:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(361, 1, 405, 'BALLY2026311', NULL, 'Md. Aman', NULL, '9748413806', '11', '4', 'A', NULL, NULL, '2016-10-10', 'Male', '10 MiaJan Ostagar Lane kol -17 ', 'Md. Arif', 'Kanchan Ahmed', '', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 08:27:07', '2026-04-18 06:50:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(362, 1, 406, 'BALLY2026312', NULL, 'Sugra Khatoon', NULL, '6291805082', '12', '4', 'A', NULL, NULL, '2016-08-18', 'Female', '7/h/7 kasai para lane kolkata 700017', 'Sher Md', 'Rukshar Khatoon', '8229908451', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 08:30:50', '2026-04-18 06:50:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(363, 1, 407, 'BALLY2026313', NULL, 'Sk Fahim Ahamed', NULL, '6291214326', '13', '4', 'A', NULL, NULL, '2015-11-22', 'Male', '13/H raicharan pal lane - 700046', 'Sk Mahammadul Hoque', 'Faizun Nesha', '7547939146', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 08:41:38', '2026-04-18 06:50:56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(364, 1, 408, 'BALLY2026269', NULL, 'Md Faisal', NULL, '9330824113', '19', '3', 'A', NULL, NULL, '2016-09-02', 'Male', '8/A chamru khan sama lane', '', '', '', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 08:42:21', '2026-04-18 06:48:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(365, 1, 409, 'BALLY2026314', NULL, 'Syed Zain Alam', NULL, '9339498961', '14', '4', 'A', NULL, NULL, '2014-10-10', 'Male', '100 H/13 Dilkusma Street Kol-17', 'Mahtab Alam', 'Mussarrat Tabassum', '8274955828', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 08:44:45', '2026-04-18 06:51:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(366, 1, 410, 'BALLY2026268', NULL, 'Md Zohaan Arsad', NULL, '6290015214', '18', '3', 'A', NULL, NULL, '2018-02-23', 'Male', '7.H.8 Kasa para lane kolkata-17', 'Md Arsad', '', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 08:45:21', '2026-04-18 06:47:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(367, 1, 411, 'BALLY2026315', NULL, 'Saaiq Ahmed', NULL, '7003689158', '15', '4', 'A', NULL, NULL, '2017-10-15', 'Male', '24, Linton Street Kol-14', 'Iftekhar Ahmed', 'Shaista Ahmed', '9330376631', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 08:47:38', '2026-04-18 06:51:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(368, 1, 412, 'BALLY2026265', NULL, 'Tahzim Khatoon', NULL, '6289981194', '15', '3', 'A', NULL, NULL, '2017-03-24', 'Female', '7/H/7 kasai para lane kolkata-700017', 'Abul Asheaque', 'Mehzabin Begum', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 08:50:38', '2026-04-18 06:47:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(369, 1, 413, 'BALLY2026254', NULL, 'Alisha Anwar', NULL, '8697218105', '4', '3', 'A', NULL, NULL, '2016-03-14', 'Female', '46/1/H/13 Gorachand road, kolkata-700014', 'Md Anwar', 'Shabnam Begum', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 08:52:22', '2026-04-18 06:44:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(370, 1, 414, 'BALLY2026257', NULL, 'Ayana Hashim', NULL, '9831883223', '7', '3', 'A', NULL, NULL, '2017-07-26', 'Female', '7/H/2 kasai para lane kolkata-17', 'Md Hashim', 'Tabassum hashim', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 08:55:13', '2026-04-18 06:45:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(371, 1, 415, 'BALLY2026317', NULL, 'Md. Faizan', NULL, '62899082537', '17', '4', 'A', NULL, NULL, '2015-07-22', 'Male', '64, Tiljala Road , Kol - 39', 'Md Sabir', 'Sabra Parveen', '9801326491', '2026-04-10', 'O+', '', NULL, NULL, NULL, '2026-04-10 08:56:05', '2026-04-18 06:52:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(372, 1, 416, 'BALLY2026262', NULL, 'Md Azan', NULL, '7980608718', '12', '3', 'A', NULL, NULL, '2016-06-13', 'Male', '2/2 tiljala road, kolkata-46', 'Md Chand', 'Anjum Begum', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 08:57:53', '2026-04-18 06:46:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(373, 1, 417, 'BALLY2026260', NULL, 'Iqra Fatma', NULL, '7439591535', '10', '3', 'A', NULL, NULL, '2018-01-25', 'Female', '6/1B/H/4 Rameshwar shaw kolkata-14', 'Abdul Waheed', 'Zeenat Parveen', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:06:29', '2026-04-18 06:45:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(374, 1, 418, 'BALLY2026203', NULL, 'Angelina Ghose', NULL, '9875375134', '3', '2', 'A', NULL, NULL, '2017-11-22', 'Female', '7/B Deshi serampur road kol-14', 'Amiya Ghose', 'Saba Ghose', '7439097774', '2026-04-10', 'A+', '', NULL, NULL, NULL, '2026-04-10 09:06:50', '2026-05-13 05:49:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(375, 1, 419, 'BALLY2026253', NULL, 'Alex Das', NULL, '6290655798', '3', '3', 'A', NULL, NULL, '2017-06-19', 'Male', '4/1/H/4 Ram Mohan Bera lane', 'Sujoy Samuel Das', 'Rehana Khatoon', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:09:16', '2026-04-18 07:06:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(376, 1, 420, 'BALLY2026205', NULL, 'Maira Zeeshan', NULL, '7044144764', '5', '2', 'A', NULL, NULL, '2018-04-04', 'Female', '70 C/H/3 iljola Road ', 'Zeeshan Ali', 'Rukshar Begun', '7044144764', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 09:17:07', '2026-04-18 06:40:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(377, 1, 421, 'BALLY2026152', NULL, 'Ahzaan Ahmed', NULL, '8337014425', '2', '1', 'A', NULL, NULL, '2018-09-22', 'Male', '4/1 New kasia bagan lane kolkata-17', 'Sajeed Ahmed', 'Rina Sheikh', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:25:03', '2026-04-18 06:54:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(378, 1, 422, 'BALLY2026153', NULL, 'Aliza Fatma', NULL, '7980025456', '3', '1', 'A', NULL, NULL, '2019-07-25', 'Female', 'B 7/H/17 kasai para lane kolkata-17', 'Md Shahnanaj', 'Tabassum Parween', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:27:57', '2026-04-18 06:54:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(379, 1, 423, 'BALLY2026208', NULL, 'Md. Ashfaque Alam', NULL, '7980332119', '8', '2', 'A', NULL, NULL, '2017-08-04', 'Male', '16b , Gorachand Road kol-700014', 'md . naushed', 'Nusrat begum', '8420790222', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 09:28:32', '2026-04-18 06:41:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(380, 1, 424, 'BALLY2026154', NULL, 'Ashfiya Fatima', NULL, '9836058557', '4', '1', 'A', NULL, NULL, '2019-03-12', 'Female', '41/c, jannagar road kolkata-17', 'Syed Md Hasnain', 'Sayada Khatoon', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:30:12', '2026-04-18 06:54:43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(381, 1, 425, 'BALLY2026155', NULL, 'Azhaan Khan', NULL, '7003629659', '5', '1', 'A', NULL, NULL, '2020-01-06', 'Male', '5,Noor Ali lane kolkata-700014', 'Nasim Khan', 'Nasim Khan', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:33:50', '2026-04-18 06:55:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(382, 1, 426, 'BALLY2026210', NULL, 'Nobiya khatoon', NULL, '9830076482', '10', '2', 'A', NULL, NULL, '2018-04-17', 'Female', '13g/ ic Tiljala Lane', 'SK AZAD', 'Nikhat Parveen', '8017034513', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 09:35:54', '2026-04-18 06:42:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(383, 1, 427, 'BALLY2026156', NULL, 'Dastaghir Hussain', NULL, '8240536290', '6', '1', 'A', NULL, NULL, '2018-12-11', 'Male', '2. kasai para lane kolkata-17', 'Md Gulzar', 'Nagma Parween', '', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 09:36:27', '2026-04-18 06:55:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(384, 1, 428, 'BALLY2026157', NULL, 'Mahad Hussain', NULL, '6291047708', '7', '1', 'A', NULL, NULL, '2020-01-17', 'Male', '4/c jannagar road kolkata-17', 'Mukhtar Hussain', 'Aklima Khatoon', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:39:14', '2026-04-18 06:55:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(385, 1, 429, 'BALLY2026212', NULL, 'Rimsha Sagir', NULL, '7003519841', '12', '2', 'A', NULL, NULL, '2019-01-20', 'Female', '7/H/5 jannagar Road kd 700017', 'Sagir Ahmed', 'Rukhsar perveen', '9231851867', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 09:39:38', '2026-04-18 06:42:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(386, 1, 430, 'BALLY2026159', NULL, 'Md Amir', NULL, '9038996760', '9', '1', 'A', NULL, NULL, '2018-05-08', 'Male', '6/h/3 ostager lane kolkata-14', 'Md Reyaz', 'Firdous Parveen', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:42:51', '2026-04-18 06:55:55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(387, 1, 431, 'BALLY2026213', NULL, 'Sagufa khan', NULL, '8910614339', '13', '2', 'A', NULL, NULL, '2017-11-05', 'Female', '18, a.j.c. Bose Road Kol-17', 'Taseer khan', 'Rozi Khatoon', '9685989845', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 09:44:10', '2026-04-18 06:42:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(388, 1, 432, 'BALLY2026160', NULL, 'Md Arsh Firoz', NULL, '6290805230', '10', '1', 'A', NULL, NULL, '2019-07-12', 'Male', '55-v tiljala road kolkata-700046', 'Firoj Alam', 'Gulafshan Parween', '', '2026-04-10', 'B+', 'none', NULL, NULL, NULL, '2026-04-10 09:45:40', '2026-05-05 03:05:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(390, 1, 434, 'BALLY2026214', NULL, 'Shabaan Alam', NULL, '7980290269', '14', '2', 'A', NULL, NULL, '2018-05-19', 'Male', '7/B Dehi Serampur Road  kol - 700014', 'Tabrez Alam', 'Neha Ambar', '8697226525', '2026-04-10', 'AB+', '', NULL, NULL, NULL, '2026-04-10 09:49:18', '2026-04-18 06:42:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(391, 1, 435, 'BALLY2026161', NULL, 'Md Daniyal Haque', NULL, '9038507915', '11', '1', 'A', NULL, NULL, '2020-08-29', 'Male', 'B/45/H/5/ mono ranjan roy choudhary road, kolkata-17', 'MD Fazlul Haque', 'Amna Khatoon', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:50:10', '2026-04-18 06:56:20', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(392, 1, 436, 'BALLY2026162', NULL, 'Md Fatir anis', NULL, '9903700729', '12', '1', 'A', NULL, NULL, '2018-12-13', 'Male', '26/North Range kolkata-17', 'Md Anis', 'Shaheena Khatoon', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:52:18', '2026-04-18 06:56:29', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(393, 1, 437, 'BALLY2026215', NULL, 'Shabbir Ali', NULL, '8100199251', '15', '2', 'A', NULL, NULL, '2017-09-13', 'Male', '8, Gora Chand Road', 'Shahadat Ali', '', '8100199251', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 09:52:20', '2026-04-18 06:42:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(394, 1, 438, 'BALLY2026163', NULL, 'Md Hafiz', NULL, '8229908451', '13', '1', 'A', NULL, NULL, '2018-09-25', 'Male', '7/H/7, kasai para lane kolkata-700017', 'Sher Md', 'Rukshar Khatoon', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:54:33', '2026-04-18 06:56:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(395, 1, 439, 'BALLY2026216', NULL, 'Sk Taimur ', NULL, '6290833495', '16', '2', 'A', NULL, NULL, '2019-05-01', 'Male', '7/1 jannagar road kol- 17', 'Sk Allauddin', 'Rizwana Bilkis', '6290633787', '2026-04-10', 'O+', '', NULL, NULL, NULL, '2026-04-10 09:55:55', '2026-04-18 06:42:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(396, 1, 440, 'BALLY2026164', NULL, 'Md Hammad', NULL, '8240470365', '14', '1', 'A', NULL, NULL, '2019-09-25', 'Male', '89,D Shakespeare sarani', 'Md Haris', 'Neha Shahid', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 09:58:23', '2026-05-05 03:06:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(397, 1, 441, 'BALLY2026217', NULL, 'Zaara Feroz', NULL, '6290196168', '17', '2', 'A', NULL, NULL, '2018-03-26', 'Female', '21, gora Chand Lane Kol- 14', 'Sk Feroz', 'Ayesha Begum', '8240524996', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 09:59:16', '2026-04-18 06:43:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(398, 1, 442, 'BALLY2026165', NULL, 'Rafia Shams', NULL, '9892263824', '15', '1', 'A', NULL, NULL, '2019-08-09', 'Female', 'B/23A/H/7, Gorachand lane, kolkata-14', 'Md Shamsul Haque', 'Arshi Khatoon', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 10:00:36', '2026-04-18 06:57:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(399, 1, 443, 'BALLY2026218', NULL, 'Zainab Eram', NULL, '9007689476', '18', '2', 'A', NULL, NULL, '2019-11-10', 'Male', '11A jannagar Road Kol-17', 'Md Zafar', 'Farzana Tabassum', '7003951125', '2026-04-10', '', '', NULL, NULL, NULL, '2026-04-10 10:03:06', '2026-04-18 06:43:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(400, 1, 444, 'BALLY2026166', NULL, 'Shafaq Fatima', NULL, '9038986771', '16', '1', 'A', NULL, NULL, '2019-04-18', 'Female', '7/B/H/7 Rameshwar Shaw road kolkata700014', 'Md Shabbir', 'Nikhat Parween', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 10:04:26', '2026-04-18 06:57:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(401, 1, 445, 'BALLY2026167', NULL, 'Sk Anas', NULL, '8017034513', '17', '1', 'A', NULL, NULL, '2019-12-25', 'Male', '19G/IC tiljala lane kolkata-19', 'Sk Azad', 'Nikhat Parveen', '', '2026-04-10', '', 'none', NULL, NULL, NULL, '2026-04-10 10:07:09', '2026-04-18 06:57:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(405, 1, 451, 'BALLY2026168', NULL, 'Sk Asad Hossain', NULL, '9903956829', '18', '1', 'A', NULL, NULL, '1899-11-30', 'Male', '161,karaya road kol- 17', 'Sk Ghulam Hossain', 'Neha Parven', '9903956829', '2026-04-12', '', '', NULL, NULL, NULL, '2026-04-12 09:40:23', '2026-04-18 06:58:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(406, 1, 3659, 'BALLY2026601', NULL, 'Md Zaid', NULL, '7278689336', '1', '6', 'A', NULL, NULL, '2014-02-12', 'Male', 'B/12H/H/5 Raicharan pallane', 'Md Salhuddin', 'Mussarat', '9123937816', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 10:41:53', '2026-04-14 07:31:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(407, 1, 3660, 'BALLY2026602', NULL, 'Sharya Asif', NULL, '7003056735', '2', '6', 'A', NULL, NULL, '2014-08-13', 'Male', '9/c enamru khan somalane-kol=700017', 'SyedMd Asif Ali', 'Saima Begum', '9330844131', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 10:53:14', '2026-04-14 07:31:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(408, 1, 3661, 'BALLY2026603', NULL, 'Md Huzar', NULL, '7439387214', '3', '6', 'A', NULL, NULL, '2014-02-11', 'Male', '21/b Gora Chand Lane Kol-14', 'Md Dulara', 'Shabana Begum', '6290556122', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 10:58:42', '2026-04-14 07:33:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(409, 1, 3662, 'BALLY2026604', NULL, 'Sidra Nigar', NULL, '8100163622', '4', '6', 'A', NULL, NULL, '2013-11-28', 'Female', '4A, Dr.Biresh Guha Street Kol-17', 'Abdul Shahid', 'Simmi Begum', '9830350292', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:04:18', '2026-04-14 07:33:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(410, 1, 3663, 'BALLY2026605', NULL, 'Rifat Faihma', NULL, '7980616326', '5', '6', 'A', NULL, NULL, '2014-03-07', 'Female', '86/c Jhawtala Road Kolkata 70017', 'Mohammed Islam', 'Sakina Khatoon', '9831560786', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:12:05', '2026-04-14 07:33:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(411, 1, 3664, 'BALLY2026606', NULL, 'Irshad Ansari', NULL, '7003056735', '6', '6', 'A', NULL, NULL, '2014-05-05', 'Male', '9/c Chamru Khan Sama Lane Kolkata-17', 'Md Afzal Ansari', 'Sakila Khatoon', '9330844131', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:16:24', '2026-04-14 07:33:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(412, 1, 3665, 'BALLY2026607', NULL, 'Minhajul Haque', NULL, '6289011595', '7', '6', 'A', NULL, NULL, '2013-06-15', 'Male', '38, Gorachand Road, Kol-14', 'Mirajul Haque', 'Fatma Khatoon', '9875381690', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:21:17', '2026-04-14 07:34:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(413, 1, 3668, 'BALLY2026608', NULL, 'Zainab Feroz', NULL, '6290196168', '8', '6', 'A', NULL, NULL, '2013-03-05', 'Female', '21, Gora Chand Lane Kol-14', 'Sk Feroz', 'Ayesha Begum', '8240524996', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:30:18', '2026-04-14 07:34:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(414, 1, 3669, 'BALLY2026609', NULL, 'Md Mehrab Hussan', NULL, '9163233275', '9', '6', 'A', NULL, NULL, '2014-04-09', 'Male', '16c Beck Begum Row Kol-17', 'Md Shakir Husain', 'Kamrun Nisha', '8240113084', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:36:51', '2026-04-14 07:34:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(415, 1, 3670, 'BALLY2026610', NULL, 'Tawaab Ali', NULL, '9123354709', '10', '6', 'A', NULL, NULL, '2013-02-21', 'Male', '100/H/11 Dilkusha Street Kol-17', 'Sk Shabab', 'Tamanna Siddiqi', '9903259398', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:42:18', '2026-04-14 07:34:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(416, 1, 3671, 'BALLY2026751', NULL, 'Md Akib', NULL, '6291144762', '1', '8', 'A', NULL, NULL, '1899-11-30', 'Male', 'Gora chand road', 'Md Asgar', 'Ladly begum', '7003155362', '2026-04-13', 'O+', '', NULL, NULL, NULL, '2026-04-13 11:43:25', '2026-04-18 06:38:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(417, 1, 3672, 'BALLY2026752', NULL, 'Iqra Ashfaque', NULL, '9163583284', '2', '8', 'A', NULL, NULL, '2011-07-26', 'Female', 'jannagar road', 'Md Ishaque', 'Tabassum ara', '', '2026-04-13', 'A+', '', NULL, NULL, NULL, '2026-04-13 11:46:32', '2026-04-18 06:38:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(418, 1, 3673, 'BALLY2026611', NULL, 'Sibtain Nawaz', NULL, '9330976021', '11', '6', 'A', NULL, NULL, '2013-12-24', 'Male', '5/2 Gora Chand lane', 'Asif Nawaz', 'Kaniz Fatma', '9804522319', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:47:22', '2026-04-14 07:34:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(419, 1, 3674, 'BALLY2026753', NULL, 'sarita parween', NULL, '7044375024', '3', '8', 'A', NULL, NULL, '2012-05-21', 'Female', 'tiljala road ', 'Md shaiq', 'sabava khatdon', '', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:51:02', '2026-04-18 06:38:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(420, 1, 3675, 'BALLY2026612', NULL, 'Ayan Jilani', NULL, '9681324281', '12', '6', 'A', NULL, NULL, '2013-12-18', 'Male', '3/7 Gora Chand Rd Kol-14', 'Ghulam Jilani', 'Musarrat Begum', '9007930662', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:52:02', '2026-04-14 07:34:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(421, 1, 3676, 'BALLY2026754', NULL, 'MEHWISH FATMA', NULL, '9163132515', '4', '8', 'A', NULL, NULL, '2012-09-15', 'Female', 'RAMESHWAR SHAW', 'MD SHAHAZADA', 'ZAKAWAT FATMA', '', '2026-04-13', 'O+', '', NULL, NULL, NULL, '2026-04-13 11:54:47', '2026-04-18 06:37:56', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(422, 1, 3677, 'BALLY2026613', NULL, 'Afiya Parveen', NULL, '6291144762', '13', '6', 'A', NULL, NULL, '2012-08-30', 'Female', '46 D/M16 Gora Chand Road Kol-700014', 'Md Asgar', 'Ladly Begum', '7003155362', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:55:44', '2026-04-14 07:35:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(423, 1, 3678, 'BALLY2026755', NULL, 'HANZALA ALT', NULL, '9836395082', '5', '8', 'A', NULL, NULL, '2012-07-29', 'Male', 'TILJALA ROAD', 'SK. SHAKIR ALI', 'SALMA BEGUM', '', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:57:27', '2026-04-18 06:38:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(424, 1, 3679, 'BALLY2026614', NULL, 'Md Farhan', NULL, '9883056159', '14', '6', 'A', NULL, NULL, '2014-05-11', 'Male', 'B/2A/H/16, Tiljala Lane -Kol-19', 'Md Salim', 'Feroza Jahan', '9342966116', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:59:40', '2026-04-14 07:35:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(425, 1, 3680, 'BALLY2026756', NULL, 'MD. ANAS', NULL, '9330649237', '6', '8', 'A', NULL, NULL, '2012-08-01', 'Male', '', 'MD. SHAKIL', 'TABASSUM BEGUM', '', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 11:59:47', '2026-05-07 11:15:57', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(427, 1, 3684, 'BALLY2026615', NULL, 'Abu Sufiyan', NULL, '7439591535', '15', '6', 'A', NULL, NULL, '2014-04-03', 'Male', '6/1B/H/4 Rameshwar Shaw Kol-14', 'Abdul Waheed', 'Zeenat Parveen', '7439591535', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 12:05:23', '2026-04-14 07:35:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL);
INSERT INTO `students` (`id`, `school_id`, `user_id`, `student_unique_id`, `application_id`, `student_name`, `email`, `phone`, `roll_no`, `class`, `section`, `stream_id`, `combination_id`, `date_of_birth`, `gender`, `address`, `father_name`, `mother_name`, `guardian_phone`, `admission_date`, `blood_group`, `medical_conditions`, `previous_school`, `previous_class`, `batch_id`, `created_at`, `updated_at`, `photo_path`, `created_by`, `father_photo`, `mother_photo`, `student_aadhaar`, `father_aadhaar`, `mother_aadhaar`, `father_pan`, `mother_pan`, `status`, `passed_out_date`, `passed_out_class`, `passed_out_year`, `remarks`) VALUES
(428, 1, 3685, 'BALLY2026616', NULL, 'Shayan Khan', NULL, '8777760180', '16', '6', 'A', NULL, NULL, '2013-06-25', 'Male', '3/1 Gora Chand Lane', 'Zainul Khan', 'Shirin Fatma', '9748660865', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 12:55:38', '2026-04-14 07:35:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(429, 1, 3687, 'BALLY2026617', NULL, 'Md Ashmir Akhtar', NULL, '9007346735', '17', '6', 'A', NULL, NULL, '2014-06-12', 'Male', '13G/IC Tiljala Lane Kol-19', 'Md Akhtar', 'Reshma Khatoon', '9836099425', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 13:11:54', '2026-04-14 07:37:24', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(433, 1, 3691, 'BALLY2026757', NULL, 'ALAIKA ALI', NULL, '8777230114', '7', '8', 'A', NULL, NULL, '2011-09-04', 'Female', 'KASAI PARA LANE', 'ABID ALI', 'SHAHEEN ALI', '9123848118', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 13:55:50', '2026-05-07 11:18:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(434, 1, 3692, 'BALLY2026618', NULL, 'Kinza Fatma', NULL, '7439591535', '18', '6', 'A', NULL, NULL, '2013-05-27', 'Female', '6/1B/H/4 Rameswar Shaw Kol-14', 'Abdul Waheel', 'Zeenat Parveen', '7439591535', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 13:56:09', '2026-04-14 07:37:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(435, 1, 3693, 'BALLY2026759', NULL, 'MD. ARIF MUKHTAR', NULL, '7439915789', '9', '8', 'A', NULL, NULL, '2011-08-12', 'Male', 'ANJUMAN ROAD', 'MD.MUKHTAR', 'RAHAT ARZOO', '', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 13:59:08', '2026-05-07 11:27:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(436, 1, 3694, 'BALLY2026758', NULL, 'ALIYA FATHMA', NULL, '7044275197', '8', '8', 'A', NULL, NULL, '2013-04-05', 'Female', 'TILIALA MASJID BARI LANE', 'MAHTAB AHMED SIDDIQUE', 'AMRIN HOSSAIN', '8420884298', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:02:29', '2026-05-07 11:25:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(437, 1, 3695, 'BALLY2026619', NULL, 'Adiba Khatoon', NULL, '9088918885', '19', '6', 'A', NULL, NULL, '2014-02-09', 'Female', '38/I/H/3, Shamsul HudaRoad Kol-17', 'Md Azad', 'Mahjabeen Khatoon', '9433847975', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:03:08', '2026-04-14 07:37:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(438, 1, 3698, 'BALLY2026760', NULL, 'MD. AZHAR', NULL, '9073148893', '10', '8', 'A', NULL, NULL, '2011-12-22', 'Male', 'JANNAGAR ROAD', 'MD. IZHAR', 'RESHMA BEGUM', '9073148893', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:05:50', '2026-05-07 11:28:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(439, 1, 3699, 'BALLY2026761', NULL, 'FALAK PARVEEN ', NULL, '9875381690', '11', '8', 'A', NULL, NULL, '2012-05-24', 'Female', 'GORA CHAND ROAD', 'MIRAJUL HAQUE', 'FATMA KHATOON', '', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:07:53', '2026-05-07 11:31:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(440, 1, 3711, 'BALLY2026620', NULL, 'Shanvi Firdous', NULL, '7003781698', '20', '6', 'A', NULL, NULL, '2015-07-26', 'Female', '9H/I Topsia Road Kol-39', 'Md Abdul', 'Tarannum Parveen', '7003781698', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:09:10', '2026-04-14 07:38:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(442, 1, 3713, 'BALLY2026621', NULL, 'Sk Rayan Hossain', NULL, '9681372886', '21', '6', 'A', NULL, NULL, '2014-10-21', 'Male', '36 H/4 linton street Kol-700014', 'Sk Sahid Hossain', 'Farzana Alam', '9681372886', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:12:46', '2026-04-14 07:38:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(443, 1, 3714, 'BALLY2026762', NULL, 'MD. FAIZAN SHAFIQUE', NULL, '7439541474', '12', '8', 'A', NULL, NULL, '2011-08-10', 'Male', 'SHAMSUL HUDA ROAD', 'MD SHAFIQUE', 'PRAVEEN RAHMAN', '7439541474', '2026-04-13', 'B+', '', NULL, NULL, NULL, '2026-04-13 14:13:07', '2026-05-07 11:31:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(444, 1, 3715, 'BALLY2026763', NULL, 'ALISHA KHATOON', NULL, '759594298', '13', '8', 'A', NULL, NULL, '2010-09-30', 'Female', 'DEHI SERAM PUR ROAD', 'MD KAUSAR', 'GAJAL BIBI', '7439373262', '2026-04-13', 'B+', '', NULL, NULL, NULL, '2026-04-13 14:15:05', '2026-05-07 11:31:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(445, 1, 3716, 'BALLY2026764', NULL, 'ROZA WASIM', NULL, '85838826265', '14', '8', 'A', NULL, NULL, '2012-08-03', 'Female', 'TILJALA ROAD', 'MD WASIM ', 'ROSHNI ISRAIL', '', '2026-04-13', 'B+', '', NULL, NULL, NULL, '2026-04-13 14:16:59', '2026-05-07 11:32:05', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(446, 1, 3717, 'BALLY2026622', NULL, 'Sehrish Fatma', NULL, '9163132515', '22', '6', 'A', NULL, NULL, '2014-12-24', 'Female', 'B/I/I/H/S, Rameshwar Shaw Rd', 'Md Shahzada', 'Zakawat Fatma', '8282979297', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:17:12', '2026-04-14 07:38:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(447, 1, 3718, 'BALLY2026765', NULL, 'MD FAUZAAN ALI', NULL, '8981505057', '15', '8', 'A', NULL, NULL, '2012-11-22', 'Male', 'JANANAGAR ROAD', 'SHAMSHAER ALI', 'NAFISA LAI', '', '2026-04-13', 'O+', '', NULL, NULL, NULL, '2026-04-13 14:19:14', '2026-05-07 11:32:19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(448, 1, 3719, 'BALLY2026767', NULL, 'ALFIYA FIROZ', NULL, '7439584171', '17', '8', 'A', NULL, NULL, '2011-10-31', 'Female', 'NORTHA RANGE KOLKATA', 'MD FIROZ', 'TABASSIM SIDDIQUE', '7439584171', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:21:32', '2026-05-07 11:32:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(449, 1, 3720, 'BALLY2026766', NULL, 'Safiya Sanawar', NULL, '6289028889', '16', '8', 'A', NULL, NULL, '2010-12-14', 'Female', '3/H2 Gora Chand Road Kolkata-700014', 'Sanawar Alam', 'Shaheen Parveen', '9836507967', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:22:38', '2026-05-07 11:32:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(450, 1, 3721, 'BALLY2026768', NULL, 'Zoya', NULL, '7980595650', '18', '8', 'A', NULL, NULL, '2012-12-24', 'Female', 'B-29A/H 13, Palm Avenue Kol-700019', 'Md Feroz', 'Tabassum', '9748750069', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:28:41', '2026-05-07 11:33:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(451, 1, 3722, 'BALLY2026769', NULL, 'Nishad Parveen', NULL, '8583891333', '19', '8', 'A', NULL, NULL, '2012-08-15', 'Female', '64, Tiljala Road Kol-700039', 'Md Irshad Alam', 'Rizwana Khatoon', '8583891333', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:33:33', '2026-05-07 11:33:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(452, 1, 3723, 'BALLY2026770', NULL, 'Muawiya Hassan Khan', NULL, '9674156950', '20', '8', 'A', NULL, NULL, '2010-10-24', 'Male', '42 H/10/Jannagarroad 700017', '', '', '9330721907', '2026-04-13', '', '', NULL, NULL, NULL, '2026-04-13 14:37:17', '2026-05-07 11:33:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(453, 1, 3724, 'BALLY2026701', NULL, 'Md Faizan Younus', NULL, '9007032534', '1', '7', 'A', NULL, NULL, '2012-04-17', 'Male', '25/A Tiljala Road Kol-700046', 'Md Younus', 'Sajda Khatoon', '7044366839', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 06:18:05', '2026-04-14 06:28:06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(454, 1, 3725, 'BALLY2026702', NULL, 'Yunus Khan', NULL, '8336051408', '2', '7', 'A', NULL, NULL, '2011-05-16', 'Male', '5/A Behiapukur Road', 'Talha Khan', 'Ayesha Khan', '9831135185', '2026-04-14', NULL, NULL, NULL, NULL, NULL, '2026-04-14 06:31:47', '2026-04-14 06:31:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(455, 1, 3726, 'BALLY2026703', NULL, 'Md Faizan', NULL, '9163694198', '3', '7', 'A', NULL, NULL, '2013-11-11', 'Male', '41/c Jannager Road', 'Md Sabir', 'Tarannum Parveen', '8296682566', '2026-04-14', NULL, NULL, NULL, NULL, NULL, '2026-04-14 06:35:52', '2026-04-14 06:35:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(456, 1, 3727, 'BALLY2026704', NULL, 'Sufiya Yasmin', NULL, '7439363660', '4', '7', 'A', NULL, NULL, '2012-01-23', 'Female', '66/D/Park Street Kol-16', 'Md Tanweer', 'Muzffari Yasmin', '9831980222', '2026-04-14', NULL, NULL, NULL, NULL, NULL, '2026-04-14 06:39:46', '2026-04-14 06:39:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(457, 1, 3728, 'BALLY2026705', NULL, 'Md Rakib', NULL, '84439750409', '5', '7', 'A', NULL, NULL, '2012-08-20', 'Male', '9/A Gora Chand Lane Kol-14', 'Md Nasim', 'Rasihda Khatton', '9073162074', '2026-04-14', NULL, NULL, NULL, NULL, NULL, '2026-04-14 06:44:49', '2026-04-14 06:44:49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(458, 1, 3730, 'BALLY2026706', NULL, 'Fashi-Ur-Rahman', NULL, '7980660536', '6', '7', 'A', NULL, NULL, '2013-01-13', 'Male', '7/M/11 Jannagar Road', 'Md Shamzada', 'Shabnam Begum', '8981228642', '2026-04-14', NULL, NULL, NULL, NULL, NULL, '2026-04-14 06:49:41', '2026-04-14 06:49:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(459, 1, 3731, 'BALLY2026708', NULL, 'Ayesha Shams', NULL, '9330712858', '8', '7', 'A', NULL, NULL, '2014-02-12', 'Female', 'B/23A/H/7 Gora Chand Lane Kol-14', 'Md Shamsul Haque', 'Arshi Khatoon', '9123080779', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 06:57:40', '2026-04-14 07:03:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(460, 1, 3732, 'BALLY2026709', NULL, 'Aalnah Parveen', NULL, '98362241991', '9', '7', 'A', NULL, NULL, '2013-04-29', 'Male', '22B/H/1 Beck bagan road', 'Md. Ishtiaqua', 'Mokima Khatoon', '964443317', '2026-04-14', NULL, 'No..', NULL, NULL, NULL, '2026-04-14 07:06:00', '2026-04-14 07:06:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(461, 1, 3733, 'BALLY2026712', NULL, 'MD. BARKATUILHA', NULL, '9038322287', '12', '7', 'A', NULL, NULL, '2013-01-15', 'Male', 'GORACHAND ROAD', 'MD. NURUILAH', 'JASULKHATOOLY', '90378322287', '2026-04-14', 'O+', '', NULL, NULL, NULL, '2026-04-14 07:07:23', '2026-04-14 07:10:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(462, 1, 3734, 'BALLY2026710', NULL, 'Md. Sufiyan Alam', NULL, '7980131987', '10', '7', 'A', NULL, NULL, '2014-08-09', 'Male', '168 c/1 Tiljala Road', 'Md. Sikandar Alam', 'Tabassum Parveen', '7980131987', '2026-04-14', 'O+', '', NULL, NULL, NULL, '2026-04-14 07:09:58', '2026-04-14 07:10:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(463, 1, 3735, 'BALLY2026713', NULL, 'AYAN DAS', NULL, '6290655798', '13', '7', 'A', NULL, NULL, '2013-03-29', 'Male', 'RAM MOHAN BERA STREET', 'SUJOY SAMUER DAS', 'REHANA KHATOON', NULL, '2026-04-14', NULL, NULL, NULL, NULL, NULL, '2026-04-14 07:11:40', '2026-04-14 07:11:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(464, 1, 3736, 'BALLY2026711', NULL, 'Danish Mussain', NULL, '8420830439', '11', '7', 'A', NULL, NULL, '2012-08-26', 'Male', '64, Tiljala Road Kol-700038', 'Javed Hussain', 'Samina Parveen', '6289082534', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 07:14:26', '2026-04-14 07:29:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(465, 1, 3737, 'BALLY2026025', NULL, 'MD WAHBAN ALI', NULL, '7980579802', '11', 'UN', 'A', NULL, NULL, '2022-06-02', 'Male', '', 'MD WAJID ALI', 'TAMANA BEGUM', '', '2026-04-14', 'B+', 'NAZIR LANE WATGANG', NULL, NULL, NULL, '2026-04-14 07:16:39', '2026-05-07 10:48:59', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(466, 1, 3738, 'BALLY2026009', NULL, 'Arhaan Raja Khan', NULL, '8240083125', '9', 'LN', 'A', NULL, NULL, '2021-05-12', 'Male', '1/1a Jannagar Road', 'Fardeen Raja Khan', 'Sana Siddiqt', '6289671014', '2026-04-14', '', 'no..\n', NULL, NULL, NULL, '2026-04-14 07:18:06', '2026-05-07 08:34:22', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(467, 1, 3739, 'BALLY2026026', NULL, 'ARHAM RAJA KHAN', NULL, '6289671014', '12', 'UN', 'A', NULL, NULL, '2020-01-10', 'Male', 'JANNAGA ROAD', 'FARDEEN RAJA KHAN', 'SANA SIDDIIQT', '6289671014', '2026-04-14', 'B-', '', NULL, NULL, NULL, '2026-04-14 07:19:53', '2026-05-07 10:49:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(468, 1, 3740, 'BALLY2026707', NULL, 'Md Ali-ul-Haque', NULL, '8961070650', '7', '7', 'A', NULL, NULL, '2013-07-05', 'Male', '10/2 Jannagar Road', 'Md wasim-ul-Haque', 'Shamima Khatoon', '8910897317', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 07:21:46', '2026-05-07 11:24:32', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(469, 1, 3741, 'BALLY2026010', NULL, 'Sk. Ibrahim', NULL, '6291405692', '10', 'LN', 'A', NULL, NULL, '2024-04-20', 'Male', '124 Tiljala Road Road kol-46', 'Sk. Dawood', 'Shahna Begum', '9330427389', '2026-04-14', 'B+', '', NULL, NULL, NULL, '2026-04-14 07:24:08', '2026-05-07 08:34:33', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(470, 1, 3742, 'BALLY2026169', NULL, 'TAUFIQUE ALAM', NULL, '9433823790', '19', '1', 'A', NULL, NULL, '2019-03-12', 'Male', 'LINTON STREET', 'AFTAB ALAM', 'ANJUM AARA', '', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 07:28:07', '2026-05-10 12:41:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(471, 1, 3745, 'BALLY2026309', NULL, 'Md Atmal Aslam', NULL, '9798956432', '9', '4', 'A', NULL, NULL, '2015-05-09', 'Male', '98/H/7 Linton Street', 'Md Aslam', 'Rukshana Khatoon', '9748270356', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 07:38:57', '2026-04-18 06:50:14', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(472, 1, 3746, 'BALLY2026511', NULL, 'Ubada Akhter', NULL, '6204447827', '11', '5', 'A', NULL, NULL, '2015-05-21', 'Male', '7/B/H/7 Ramesawar shaw Road', 'Md Shahid Aktar', 'Sanober Perveen', '6204447827', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 07:44:48', '2026-04-14 07:46:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(473, 1, 3747, 'BALLY2026316', NULL, 'Sanchita Shaw', NULL, '6289712123', '16', '4', 'A', NULL, NULL, '2017-12-21', 'Female', '14c Ahiri Pukur 2nd Lane', 'Sachin Kumar Shaw', 'Poonam Kumar Shaw', '6289712123', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 08:32:58', '2026-04-18 06:51:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(474, 1, 3748, 'BALLY2026204', NULL, 'Ifra Hussain', NULL, '8240044199', '4', '2', 'A', NULL, NULL, '2017-04-30', 'Female', '2,D Gora Chand Lane ', 'Md Adil Hussain', 'Minnai Khatoon', '6289312884', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 08:37:28', '2026-04-18 06:40:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(475, 1, 3749, 'BALLY2026206', NULL, 'Maisha Fiza', NULL, '6291214326', '6', '2', 'A', NULL, NULL, '2018-08-04', 'Female', 'Raicharan pal Lane Kol-700046', 'Sk Mahammadul Haque', 'Faizun Nesha', '6291214326', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 08:45:59', '2026-04-18 06:41:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(476, 1, 3750, 'BALLY2026151', NULL, 'Abdul Hasan', NULL, '6289981194', '1', '1', 'A', NULL, NULL, '2019-04-20', 'Male', '7/H/7 Kasai Para Lane Kol-700017', 'Abdul Asheaque', 'Mehzabin Begum', '7003319635', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 08:53:50', '2026-04-18 06:54:03', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(477, 1, 3751, 'BALLY2026207', NULL, 'Md Afaan', NULL, '8240654299', '7', '2', 'A', NULL, NULL, '2019-02-25', 'Male', '6/1A Dehi Serampur Road Kol-14', 'Md Anwar', 'Shabnam Begum', '8240654299', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 08:59:07', '2026-04-18 06:41:19', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(478, 1, 3752, 'BALLY2026209', NULL, 'Md Arsh', NULL, '7980985820', '9', '2', 'A', NULL, NULL, '2017-07-31', 'Male', '7/H/7 Kasai Paralane Kol-17', 'Md Khalid', 'Khusbu Parveen', '9163886692', '2026-04-14', '', '', NULL, NULL, NULL, '2026-04-14 09:03:41', '2026-04-18 06:41:38', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(479, 1, 3760, 'BALLY2026172', NULL, 'Md. Ariz Laskar', NULL, '9330824677', '24', '1', 'A', NULL, NULL, '2019-04-18', 'Male', '7B/h/7 Rameswar Shaw Road', 'Md. Musawar Laskar', 'Anowara Laskar', '9330824677', '2026-04-17', '', '', NULL, NULL, NULL, '2026-04-17 11:51:08', '2026-05-07 10:40:45', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(480, 1, 3763, 'BALLY2026171', NULL, 'Sk. Arshad', NULL, '9903827202', '23', '1', 'A', NULL, NULL, '2017-09-25', 'Male', '27,P North Range kol-700017', 'Sk. Ashraf', 'Muskan Begum', '8981007187', '2026-04-17', '', '', NULL, NULL, NULL, '2026-04-17 12:20:55', '2026-05-07 10:40:35', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(481, 1, 3764, 'BALLY2026158', NULL, 'Md Ali Iqbal', NULL, '7439010609', '8', '1', 'A', NULL, NULL, '2018-10-17', 'Male', '6/H/2 Ostagar Lane', 'Md Asif Tqbal', 'Nahid Fatima', '700397062', '2026-04-17', 'A+', '', NULL, NULL, NULL, '2026-04-17 13:00:13', '2026-05-05 03:05:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(482, 1, 3765, 'BALLY2026211', NULL, 'Md Hazma', NULL, '890247299', '11', '2', 'A', NULL, NULL, '2016-03-26', 'Male', '32 Mahendra Roy Lan.Kol 700046', 'Ezaz Alam', 'Tara Nnum', '890247299', '2026-04-17', '', '', NULL, NULL, NULL, '2026-04-17 13:05:46', '2026-04-18 06:42:09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(483, 1, 3769, 'BALLY2026219', NULL, 'Afifa Noor', NULL, '7488656440', '19', '2', 'A', NULL, NULL, '2018-02-03', 'Female', '20 , Cantopher Lame,Kal-14', 'Md Kalimullah Rahmani', 'Afsana Khatoon', '9065507984', '2026-04-17', '', '', NULL, NULL, NULL, '2026-04-17 13:19:53', '2026-04-18 06:43:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(484, 1, 3770, 'BALLY2026318', NULL, 'Shadin Nawar Azam', NULL, '8240650795', '18', '4', 'A', NULL, NULL, '2016-12-21', 'Male', '5/12 Jannahak Road', 'Shahnawaz Alam', 'Asia Khatoon', '6290966989', '2026-04-17', '', '', NULL, NULL, NULL, '2026-04-17 13:24:27', '2026-04-18 06:52:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(485, 1, 3771, 'BALLY2026320', NULL, 'Anam', NULL, '6291482059', '20', '4', 'A', NULL, NULL, '2015-12-25', 'Female', 'Ram Mohalane kol-700014', 'Shahnawaz Alam', 'Tara Parveen', '6291482059', '2026-04-17', '', '', NULL, NULL, NULL, '2026-04-17 13:28:09', '2026-04-18 06:52:26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(486, 1, 3772, 'BALLY2026252', NULL, 'Anam Salam', NULL, '9903973991', '2', '3', 'A', NULL, NULL, '2017-02-04', 'Male', '11/1 Gora chand land kol-14', 'Md. Salam', 'Sultana Parveen', '9430584273', '2026-04-18', '', '', NULL, NULL, NULL, '2026-04-18 07:06:10', '2026-04-27 05:51:02', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(488, 1, 3774, 'BALLY2026220', NULL, 'Sumaira Kamal ', NULL, '7980488692', '20', '2', 'A', NULL, NULL, '2018-01-25', 'Female', '26p, street/lane north range - kol-700017', 'Md. Kamaluddin', 'Sajda Khatun', '7980488692', '2026-04-22', 'A+', '', NULL, NULL, NULL, '2026-04-22 07:58:49', '2026-05-09 10:17:09', NULL, 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(489, 1, 3775, 'BALLY2026170', NULL, 'Abdus Shahan', NULL, '6291984235', '22', '1', 'A', NULL, NULL, '2019-04-17', 'Male', '29 Tiljala Road, Kolkata 46', 'Abdus Soib', 'Saiqua Parven', '9073198696', '2026-05-05', '', '', NULL, NULL, NULL, '2026-05-05 04:14:46', '2026-05-07 10:40:17', NULL, 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(492, 1, 3778, 'BALLY2026507', NULL, 'Md Nawaz', NULL, NULL, '7', '5', 'A', NULL, NULL, '0000-00-00', 'Male', '7/H/7 Jannnagar road. Kolkata 17', 'Md Ehsan', 'Neha Perveen', '', '2026-05-06', 'O+', '', NULL, NULL, NULL, '2026-05-06 10:23:18', '2026-05-07 11:23:25', NULL, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(493, 1, 3779, 'BALLY2026513', NULL, ' Nabira Amir', NULL, '8240581878', '13', '5', 'A', NULL, NULL, '1899-11-30', 'Female', '7/H/7 Kasai Para lane Kolkata 17', 'Amir Hussain', 'Ishrat Begum', '8240581878', '2026-05-06', 'B+', '', NULL, NULL, NULL, '2026-05-06 10:26:20', '2026-05-08 12:20:21', NULL, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(497, 3, 3791, 'GORAB2026006', 115, 'AScd ', NULL, 'Z', '34', '3', 'B', NULL, NULL, '2026-05-20', 'Male', 'AX', 'az', 'q', 'sdxw', '2026-05-07', 'O+', 'Z', 'AZX', 'azxAZ', NULL, '2026-05-07 14:26:36', '2026-05-14 09:40:55', '/upload/student_photos/app-115-student_photo-1778163975977-140834104.jpg', NULL, NULL, NULL, '/upload/application_documents/app-115-student_aadhaar-1778163975997-841562582.jpg', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(498, 1, 3792, 'BALLY2026771', NULL, 'Sk Moinuddin ', NULL, '8420768236', '19', '5', 'A', NULL, NULL, NULL, 'Male', '23A Gora chand lane Kolkata 17', 'Sk Feroz Uddin ', 'Shanaz Begum ', NULL, '2026-05-08', NULL, NULL, NULL, NULL, NULL, '2026-05-08 04:02:38', '2026-05-08 04:02:38', NULL, 311, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(501, 1, 3795, 'BALLY2026004', NULL, 'Md Faiz Alam', NULL, '6291278508', '4', 'LN', 'A', NULL, NULL, '2021-04-25', 'Male', NULL, 'Md. Faroz Alam', 'Nikhat parveen', '8100438090', '2026-05-08', NULL, NULL, NULL, NULL, NULL, '2026-05-08 04:50:08', '2026-05-08 04:50:08', NULL, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(502, 1, 3796, 'BALLY2026222', NULL, 'Zubair Ahmed', NULL, '6289376780', '22', '2', 'A', NULL, NULL, '2017-04-27', 'Male', 'linto streert', 'Nasir Ahemd', 'Halima khatoon', '7980978882', '2026-05-09', '', '', NULL, NULL, NULL, '2026-05-09 09:54:55', '2026-05-13 05:50:40', NULL, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(503, 3, 3797, 'GORAB2026007', NULL, 'add', NULL, NULL, '34', '2', 'B', NULL, NULL, '2026-05-10', 'Male', 'fgdfgfd', 'aaa', 'bbbb', NULL, '2026-05-10', 'A+', 'dfg', NULL, NULL, NULL, '2026-05-10 07:19:27', '2026-05-14 09:40:06', NULL, 266, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(504, 1, 3799, 'BALLY2026202', NULL, 'Areeeba Alam', NULL, '9831346708', '2', '2', 'A', NULL, NULL, '2018-12-15', 'Male', '34/H/1 lintonstreet, kol- 700014', 'Arshad Alam', 'Nikhat Parveen', '79806863392', '2026-05-10', 'O+', '', NULL, NULL, NULL, '2026-05-10 12:59:31', '2026-05-13 05:50:16', NULL, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(508, 1, 3804, 'BALLY2026201', NULL, 'Alisha Azad', NULL, '8013482550', '1', '2', 'A', NULL, NULL, '2018-11-07', 'Female', '4c/1c Gora Chand lane kolkata 700014', 'Mehtab Alam', 'Zarina Khatoon', '', '2026-05-13', '', '', NULL, NULL, NULL, '2026-05-13 05:38:27', '2026-05-13 05:50:25', NULL, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(509, 1, 3805, 'BALLY2026223', NULL, 'Rahil Hussain', NULL, '9875447141', '23', '2', 'A', NULL, NULL, '2018-08-12', 'Male', '7/B, H/6, disrampur road -kol-14', 'Sabbir Hussain', 'Saba Begum', '8345050144', '2026-05-13', 'O+', NULL, NULL, NULL, NULL, '2026-05-13 05:58:38', '2026-05-13 05:58:38', NULL, 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL),
(512, 3, 3809, 'GORAB2026008', NULL, 'fdhgfdgh', 'mgtyrghi266@gmail.com', '0934863336578698', '10', '10', 'A', NULL, NULL, '2026-05-04', 'Male', '4c_Aquland Squre,Kolkata', '', '', '', '2026-05-14', '', '', NULL, NULL, NULL, '2026-05-14 08:07:36', '2026-05-14 08:26:37', NULL, 266, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, 'Passed out from Class 10'),
(513, 3, 3810, 'GORAB2026009', NULL, 'aceer', NULL, NULL, '10', '12', 'A', 15, NULL, '2026-05-06', 'Female', NULL, NULL, NULL, NULL, '2026-05-14', NULL, NULL, NULL, NULL, NULL, '2026-05-14 08:29:49', '2026-05-14 10:26:10', NULL, 266, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'passed_out', '2026-05-14', '12', '2026', 'Passed out from Class 12');

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
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students_attendance`
--

INSERT INTO `students_attendance` (`id`, `school_id`, `student_id`, `date`, `subject`, `status`, `marked_by`, `remarks`, `created_at`, `updated_at`) VALUES
(99, 3, 292, '2026-03-20', 'Math', 'present', 266, NULL, '2026-03-22 10:59:33', '2026-03-22 14:15:35'),
(110, 3, 264, '2026-03-22', 'day_wise', 'present', 266, NULL, '2026-03-22 13:01:16', '2026-03-22 13:01:16'),
(111, 3, 290, '2026-03-22', 'day_wise', 'absent', 266, NULL, '2026-03-22 13:01:18', '2026-03-22 13:01:18'),
(114, 3, 290, '2026-03-18', 'day_wise', 'present', 266, NULL, '2026-03-22 13:14:07', '2026-03-22 13:14:07'),
(115, 3, 292, '2026-03-22', 'IOS Dev', 'absent', 266, NULL, '2026-03-22 13:28:35', '2026-03-22 14:06:48'),
(116, 3, 292, '2026-03-21', 'day_wise', 'present', 266, NULL, '2026-03-22 13:53:52', '2026-03-22 13:53:52'),
(117, 3, 292, '2026-03-18', 'day_wise', 'present', 266, NULL, '2026-03-22 13:53:57', '2026-03-22 13:57:29'),
(118, 3, 292, '2026-03-22', 'day_wise', 'present', 266, NULL, '2026-03-22 13:54:01', '2026-03-22 14:09:48'),
(119, 3, 292, '2026-03-17', 'day_wise', 'present', 266, NULL, '2026-03-22 13:57:33', '2026-03-22 13:57:33'),
(121, 3, 292, '2026-03-20', 'day_wise', 'absent', 266, NULL, '2026-03-22 14:08:40', '2026-03-22 14:08:43'),
(122, 3, 292, '2026-03-16', 'Math', 'present', 266, NULL, '2026-03-22 14:15:38', '2026-03-22 14:15:38'),
(123, 3, 292, '2026-03-07', 'Math', 'present', 266, NULL, '2026-03-22 14:15:59', '2026-03-22 14:15:59'),
(124, 3, 264, '2026-03-23', 'day_wise', 'absent', 79, NULL, '2026-03-23 10:43:14', '2026-03-23 10:44:48'),
(126, 1, 388, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(127, 1, 391, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(128, 1, 392, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(129, 1, 394, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(130, 1, 396, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(131, 1, 398, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(132, 1, 400, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(133, 1, 401, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(134, 1, 405, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(135, 1, 377, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(136, 1, 378, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(137, 1, 380, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(138, 1, 381, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(139, 1, 383, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(140, 1, 384, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(141, 1, 386, '2026-04-13', 'day_wise', 'present', 65, NULL, '2026-04-13 07:42:00', '2026-04-13 07:42:00'),
(142, 1, 358, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(143, 1, 357, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(144, 1, 355, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(145, 1, 353, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(146, 1, 351, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(147, 1, 349, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(148, 1, 347, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(149, 1, 346, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(150, 1, 344, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(151, 1, 472, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(152, 1, 342, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(153, 1, 340, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(154, 1, 339, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(155, 1, 336, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(156, 1, 335, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(157, 1, 333, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(158, 1, 331, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(159, 1, 330, '2026-04-16', 'day_wise', 'present', 76, NULL, '2026-04-16 02:54:39', '2026-04-16 02:54:39'),
(160, 1, 343, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(161, 1, 345, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(162, 1, 348, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(163, 1, 350, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(164, 1, 352, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(165, 1, 354, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(166, 1, 356, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(167, 1, 359, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(168, 1, 471, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(169, 1, 360, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(170, 1, 361, '2026-04-16', 'day_wise', 'absent', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(171, 1, 362, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(172, 1, 363, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(173, 1, 365, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(174, 1, 367, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(175, 1, 473, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(176, 1, 371, '2026-04-16', 'day_wise', 'present', 66, NULL, '2026-04-16 05:49:32', '2026-04-16 05:49:32'),
(177, 1, 374, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(178, 1, 474, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(179, 1, 376, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(180, 1, 475, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(181, 1, 477, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(182, 1, 379, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(183, 1, 478, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(184, 1, 382, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(185, 1, 482, '2026-04-20', 'day_wise', 'absent', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(186, 1, 385, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(187, 1, 387, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(188, 1, 390, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(189, 1, 393, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(190, 1, 395, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(191, 1, 397, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(192, 1, 399, '2026-04-20', 'day_wise', 'absent', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(193, 1, 483, '2026-04-20', 'day_wise', 'present', 309, NULL, '2026-04-20 02:46:59', '2026-04-20 02:46:59'),
(194, 1, 358, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(195, 1, 357, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(196, 1, 355, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(197, 1, 353, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(198, 1, 351, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(199, 1, 349, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(200, 1, 347, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(201, 1, 346, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(202, 1, 344, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(203, 1, 472, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(204, 1, 342, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(205, 1, 340, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(206, 1, 339, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(207, 1, 336, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(208, 1, 335, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(209, 1, 333, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(210, 1, 331, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(211, 1, 330, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(212, 1, 487, '2026-04-20', 'day_wise', 'present', 311, NULL, '2026-04-20 02:47:41', '2026-04-20 02:48:01'),
(232, 1, 374, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(233, 1, 474, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(234, 1, 376, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(235, 1, 475, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(236, 1, 477, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(237, 1, 379, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(238, 1, 478, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(239, 1, 382, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(240, 1, 482, '2026-04-21', 'day_wise', 'absent', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(241, 1, 385, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(242, 1, 387, '2026-04-21', 'day_wise', 'absent', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(243, 1, 390, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(244, 1, 393, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(245, 1, 395, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(246, 1, 397, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(247, 1, 399, '2026-04-21', 'day_wise', 'absent', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(248, 1, 483, '2026-04-21', 'day_wise', 'present', 309, NULL, '2026-04-21 03:04:14', '2026-04-21 03:04:14'),
(249, 1, 295, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(250, 1, 486, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(251, 1, 375, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(252, 1, 369, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(253, 1, 301, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(254, 1, 303, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(255, 1, 370, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(256, 1, 300, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(257, 1, 296, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(258, 1, 373, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(259, 1, 302, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(260, 1, 372, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(261, 1, 304, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(262, 1, 298, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(263, 1, 368, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(264, 1, 299, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(265, 1, 297, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(266, 1, 366, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(267, 1, 364, '2026-04-21', 'day_wise', 'present', 310, NULL, '2026-04-21 04:50:06', '2026-04-21 04:50:06'),
(268, 1, 374, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(269, 1, 474, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(270, 1, 376, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(271, 1, 475, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(272, 1, 477, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(273, 1, 379, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(274, 1, 478, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(275, 1, 382, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(276, 1, 482, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(277, 1, 385, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(278, 1, 387, '2026-04-22', 'day_wise', 'absent', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(279, 1, 390, '2026-04-22', 'day_wise', 'absent', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(280, 1, 393, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(281, 1, 395, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(282, 1, 397, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(283, 1, 399, '2026-04-22', 'day_wise', 'absent', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(284, 1, 483, '2026-04-22', 'day_wise', 'present', 309, NULL, '2026-04-22 02:43:11', '2026-04-22 02:43:11'),
(285, 1, 358, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(286, 1, 357, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(287, 1, 355, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(288, 1, 353, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(289, 1, 351, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(290, 1, 349, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(291, 1, 347, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(292, 1, 346, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(293, 1, 344, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(294, 1, 472, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(295, 1, 342, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(296, 1, 340, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(297, 1, 339, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(298, 1, 336, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(299, 1, 335, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(300, 1, 333, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(301, 1, 331, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(302, 1, 330, '2026-04-22', 'day_wise', 'absent', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(303, 1, 487, '2026-04-22', 'day_wise', 'present', 311, NULL, '2026-04-22 04:11:44', '2026-04-22 04:11:44'),
(304, 1, 374, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(305, 1, 474, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(306, 1, 376, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(307, 1, 475, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(308, 1, 477, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(309, 1, 379, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(310, 1, 478, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(311, 1, 382, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(312, 1, 482, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(313, 1, 385, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(314, 1, 387, '2026-04-23', 'day_wise', 'absent', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(315, 1, 390, '2026-04-23', 'day_wise', 'absent', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(316, 1, 393, '2026-04-23', 'day_wise', 'absent', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(317, 1, 395, '2026-04-23', 'day_wise', 'absent', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(318, 1, 397, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(319, 1, 399, '2026-04-23', 'day_wise', 'absent', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(320, 1, 483, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(321, 1, 488, '2026-04-23', 'day_wise', 'present', 309, NULL, '2026-04-23 03:08:42', '2026-04-23 03:08:42'),
(322, 1, 374, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(323, 1, 474, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(324, 1, 376, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(325, 1, 475, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(326, 1, 477, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(327, 1, 379, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(328, 1, 478, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(329, 1, 382, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(330, 1, 482, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(331, 1, 385, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(332, 1, 387, '2026-04-24', 'day_wise', 'absent', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(333, 1, 390, '2026-04-24', 'day_wise', 'absent', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(334, 1, 393, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(335, 1, 395, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(336, 1, 397, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(337, 1, 399, '2026-04-24', 'day_wise', 'absent', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(338, 1, 483, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(339, 1, 488, '2026-04-24', 'day_wise', 'present', 309, NULL, '2026-04-24 04:12:24', '2026-04-24 04:12:24'),
(340, 1, 374, '2026-05-06', 'day_wise', 'absent', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(341, 1, 474, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(342, 1, 376, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(343, 1, 475, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(344, 1, 477, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(345, 1, 379, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(346, 1, 478, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(347, 1, 382, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(348, 1, 482, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(349, 1, 385, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(350, 1, 387, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(351, 1, 390, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(352, 1, 393, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(353, 1, 395, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(354, 1, 397, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(355, 1, 399, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(356, 1, 483, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(357, 1, 488, '2026-05-06', 'day_wise', 'present', 309, NULL, '2026-05-06 08:26:07', '2026-05-06 09:25:25'),
(484, 1, 1, '2026-05-06', 'day_wise', 'present', 1, NULL, '2026-05-06 08:39:36', '2026-05-06 08:39:36'),
(503, 1, 358, '2026-05-06', 'day_wise', 'absent', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(504, 1, 357, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(505, 1, 355, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(506, 1, 353, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(507, 1, 351, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(508, 1, 349, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(509, 1, 347, '2026-05-06', 'day_wise', 'absent', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(510, 1, 346, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(511, 1, 344, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(512, 1, 472, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(513, 1, 342, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(514, 1, 340, '2026-05-06', 'day_wise', 'absent', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(515, 1, 339, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(516, 1, 336, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(517, 1, 335, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(518, 1, 333, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(519, 1, 331, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(520, 1, 330, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(521, 1, 487, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:15:17', '2026-05-06 10:40:20'),
(522, 1, 492, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:32:35', '2026-05-06 10:40:20'),
(523, 1, 493, '2026-05-06', 'day_wise', 'present', 311, NULL, '2026-05-06 10:32:35', '2026-05-06 10:40:20'),
(648, 1, 374, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(649, 1, 474, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(650, 1, 376, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(651, 1, 475, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(652, 1, 477, '2026-05-07', 'day_wise', 'absent', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(653, 1, 379, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(654, 1, 478, '2026-05-07', 'day_wise', 'absent', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(655, 1, 382, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(656, 1, 482, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(657, 1, 385, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(658, 1, 387, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(659, 1, 390, '2026-05-07', 'day_wise', 'absent', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(660, 1, 393, '2026-05-07', 'day_wise', 'absent', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(661, 1, 395, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(662, 1, 397, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(663, 1, 399, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(664, 1, 483, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(665, 1, 488, '2026-05-07', 'day_wise', 'present', 309, NULL, '2026-05-07 02:50:00', '2026-05-07 02:50:00'),
(666, 1, 295, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(667, 1, 486, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(668, 1, 375, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(669, 1, 369, '2026-05-07', 'day_wise', 'absent', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(670, 1, 301, '2026-05-07', 'day_wise', 'absent', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(671, 1, 303, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(672, 1, 370, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(673, 1, 300, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(674, 1, 296, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(675, 1, 373, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(676, 1, 302, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(677, 1, 372, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(678, 1, 304, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(679, 1, 298, '2026-05-07', 'day_wise', 'absent', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(680, 1, 368, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(681, 1, 299, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(682, 1, 297, '2026-05-07', 'day_wise', 'present', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(683, 1, 366, '2026-05-07', 'day_wise', 'absent', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(684, 1, 364, '2026-05-07', 'day_wise', 'absent', 310, NULL, '2026-05-07 02:55:45', '2026-05-07 02:55:45'),
(685, 1, 374, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(686, 1, 474, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(687, 1, 376, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(688, 1, 475, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(689, 1, 477, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(690, 1, 379, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(691, 1, 478, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(692, 1, 382, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(693, 1, 482, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(694, 1, 385, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(695, 1, 387, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(696, 1, 390, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(697, 1, 393, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(698, 1, 395, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(699, 1, 397, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(700, 1, 399, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(701, 1, 483, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(702, 1, 488, '2026-05-08', 'day_wise', 'present', 309, NULL, '2026-05-08 02:56:11', '2026-05-08 02:56:11'),
(703, 1, 358, '2026-05-07', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(704, 1, 357, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(705, 1, 355, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(706, 1, 353, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(707, 1, 351, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(708, 1, 349, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(709, 1, 492, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(710, 1, 347, '2026-05-07', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(711, 1, 346, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(712, 1, 344, '2026-05-07', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(713, 1, 472, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(714, 1, 342, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(715, 1, 493, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(716, 1, 340, '2026-05-07', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(717, 1, 339, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(718, 1, 336, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(719, 1, 335, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(720, 1, 333, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(721, 1, 331, '2026-05-07', 'day_wise', 'present', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(722, 1, 330, '2026-05-07', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:17:57', '2026-05-08 03:17:57'),
(723, 1, 358, '2026-05-08', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(724, 1, 357, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(725, 1, 355, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(726, 1, 353, '2026-05-08', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(727, 1, 351, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(728, 1, 349, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(729, 1, 492, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(730, 1, 347, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(731, 1, 346, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(732, 1, 344, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(733, 1, 472, '2026-05-08', 'day_wise', 'absent', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(734, 1, 342, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(735, 1, 493, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(736, 1, 340, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(737, 1, 339, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(738, 1, 336, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(739, 1, 335, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(740, 1, 333, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(741, 1, 331, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(742, 1, 330, '2026-05-08', 'day_wise', 'present', 311, NULL, '2026-05-08 03:18:45', '2026-05-08 03:19:28'),
(764, 1, 358, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(765, 1, 357, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(766, 1, 355, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(767, 1, 353, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(768, 1, 351, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(769, 1, 349, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(770, 1, 492, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(771, 1, 347, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(772, 1, 346, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(773, 1, 344, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(774, 1, 472, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(775, 1, 342, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(776, 1, 493, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(777, 1, 340, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(778, 1, 339, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(779, 1, 336, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(780, 1, 335, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(781, 1, 498, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(782, 1, 333, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(783, 1, 331, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(784, 1, 330, '2026-05-11', 'day_wise', 'present', 311, NULL, '2026-05-11 02:48:40', '2026-05-11 02:48:40'),
(785, 1, 504, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(786, 1, 374, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(787, 1, 474, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(788, 1, 376, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(789, 1, 475, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(790, 1, 477, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(791, 1, 379, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(792, 1, 478, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(793, 1, 382, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(794, 1, 482, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(795, 1, 385, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(796, 1, 387, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(797, 1, 390, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(798, 1, 393, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(799, 1, 395, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(800, 1, 397, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(801, 1, 399, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(802, 1, 483, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(803, 1, 488, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(804, 1, 502, '2026-05-11', 'day_wise', 'present', 309, NULL, '2026-05-11 04:09:34', '2026-05-11 04:09:34'),
(805, 1, 358, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(806, 1, 357, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(807, 1, 355, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(808, 1, 353, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(809, 1, 351, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(810, 1, 349, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(811, 1, 492, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(812, 1, 347, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(813, 1, 346, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(814, 1, 344, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(815, 1, 472, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(816, 1, 342, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(817, 1, 493, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(818, 1, 340, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(819, 1, 339, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(820, 1, 336, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(821, 1, 335, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(822, 1, 498, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(823, 1, 333, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(824, 1, 331, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(825, 1, 330, '2026-05-12', 'day_wise', 'present', 311, NULL, '2026-05-12 02:46:55', '2026-05-12 02:46:55'),
(826, 1, 504, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(827, 1, 374, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(828, 1, 474, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(829, 1, 376, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(830, 1, 475, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(831, 1, 477, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(832, 1, 379, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(833, 1, 478, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(834, 1, 382, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(835, 1, 482, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(836, 1, 385, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(837, 1, 387, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(838, 1, 390, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(839, 1, 393, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(840, 1, 395, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(841, 1, 397, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(842, 1, 399, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(843, 1, 483, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(844, 1, 488, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(845, 1, 502, '2026-05-12', 'day_wise', 'present', 309, NULL, '2026-05-12 02:52:23', '2026-05-12 02:52:23'),
(846, 3, 503, '2026-05-13', 'day_wise', 'absent', 324, NULL, '2026-05-13 19:00:01', '2026-05-13 19:00:01'),
(847, 1, 358, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(848, 1, 357, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(849, 1, 355, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(850, 1, 353, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(851, 1, 351, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(852, 1, 349, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(853, 1, 492, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(854, 1, 347, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(855, 1, 346, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(856, 1, 344, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(857, 1, 472, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(858, 1, 342, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(859, 1, 493, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(860, 1, 340, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(861, 1, 339, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(862, 1, 336, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(863, 1, 335, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(864, 1, 498, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(865, 1, 333, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(866, 1, 331, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11'),
(867, 1, 330, '2026-05-14', 'day_wise', 'present', 311, NULL, '2026-05-14 03:07:11', '2026-05-14 03:07:11');

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

--
-- Dumping data for table `student_applications`
--

INSERT INTO `student_applications` (`id`, `school_id`, `application_no`, `student_name`, `date_of_birth`, `gender`, `class`, `stream_id`, `section`, `father_name`, `mother_name`, `parent_phone`, `phone`, `email`, `address`, `previous_school`, `previous_class`, `blood_group`, `medical_conditions`, `student_photo`, `father_photo`, `mother_photo`, `student_aadhaar`, `father_aadhaar`, `mother_aadhaar`, `father_pan`, `mother_pan`, `photo_path`, `status`, `applied_date`, `admitted_date`, `rejected_date`, `rejection_reason`, `processed_by`, `created_at`, `updated_at`) VALUES
(107, 1, 'APP2026002', 'Adiba khatoon', '2014-02-09', 'Female', '6', NULL, NULL, 'Md azad', 'Mahjabeen khatoon', '9433847975', '9088918885', '', '38/1H/3, shamsul huda road, kolkata- 700017', 'daffodils high school ', '5', 'AB+', '', '/upload/student_photos/app-107-student_photo-1773042795788-540603400.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', '2026-03-09', NULL, NULL, NULL, NULL, '2026-03-09 07:53:15', '2026-03-09 07:53:17'),
(108, 1, 'APP2026003', 'Alifiya salim', '2015-09-29', 'Female', '4', NULL, NULL, 'Md saiful islam', 'ASiya khatoon', '8420100786', '8420100786', '', '3/7 gora chand road , kolkata-700017', 'A.S. model school', '3', 'A+', '', '/upload/student_photos/app-108-student_photo-1773043535584-874005277.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', '2026-03-09', NULL, NULL, NULL, NULL, '2026-03-09 08:02:51', '2026-03-09 08:05:37'),
(109, 1, 'APP2026004', 'Arhaan raja khan', '2021-05-12', 'Male', '1', NULL, NULL, ' fardeen raja khan', 'sana siddiqi', '6289671014', '8240083125', '', '1/1A, jannagar road, kol-700017', '', '', 'B+', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', '2026-03-09', NULL, NULL, NULL, NULL, '2026-03-09 08:21:00', '2026-03-09 08:21:00'),
(111, 3, 'APP2026005', 'sidhartha mahunta', '2026-05-15', 'Male', '11', 15, NULL, 'santan mahunta', 'sanjulata mahunta', '9692949791', '7418529632', 'rrout5486@gmail.com', 'sx SXAZxA', 'ZAX', 'Azxq', 'A+', 'azx', '/upload/student_photos/app-111-student_photo-1778161854367-142309860.webp', '/upload/application_documents/app-111-father_photo-1778161854980-264936243.jpg', '/upload/application_documents/app-111-mother_photo-1778161855211-450460205.jpg', '/upload/application_documents/app-111-student_aadhaar-1778161855239-489383376.webp', '/upload/application_documents/app-111-father_aadhaar-1778161855251-405597021.webp', '/upload/application_documents/app-111-mother_aadhaar-1778161855408-689458211.jpg', '/upload/application_documents/app-111-father_pan-1778161855418-245311965.webp', '/upload/application_documents/app-111-mother_pan-1778161855427-449085115.jpg', NULL, 'rejected', '2026-05-07', NULL, '2026-05-07', 'lk', 268, '2026-05-07 13:50:49', '2026-05-07 13:54:50'),
(114, 3, 'APP2026006', 'aqwcdAdswdwsdwdqw', '2026-05-21', 'Male', '1', NULL, 'A', 'AXax', 'aXazxAasxxXD', '`13w2121212121212121', 'qsdAQSZXZX', 'rrout5486@gmail.com', 'AXSSSSSDQWFD', 'asdxasw', 'ascasc ', 'B+', 'axc', '/upload/student_photos/app-114-student_photo-1778163904376-409400173.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'admitted', '2026-05-07', '2026-05-07', NULL, NULL, 268, '2026-05-07 14:25:03', '2026-05-07 14:25:20'),
(115, 3, 'APP2026007', 'AScd ', '2026-05-20', 'Male', '2', NULL, 'B', 'az', 'q', 'sdxw', 'Z', '', 'AX', 'AZX', 'azxAZ', 'O+', 'Z', '/upload/student_photos/app-115-student_photo-1778163975977-140834104.jpg', NULL, NULL, '/upload/application_documents/app-115-student_aadhaar-1778163975997-841562582.jpg', NULL, NULL, NULL, NULL, NULL, 'admitted', '2026-05-07', '2026-05-07', NULL, NULL, 268, '2026-05-07 14:26:15', '2026-05-07 14:26:36'),
(116, 3, 'APP2026008', 'niladri maji', '2001-05-10', 'Male', '2', NULL, NULL, 'nihar maji', 'kakali maji', '8768335422', '9382472550', '', 'kolkata', 'abcd', '5', 'A+', 'na', '/upload/student_photos/app-116-student_photo-1778235329664-129821847.jpg', NULL, NULL, '/upload/application_documents/app-116-student_aadhaar-1778235329992-417133093.jpeg', NULL, NULL, NULL, NULL, NULL, 'pending', '2026-05-08', NULL, NULL, NULL, NULL, '2026-05-08 10:15:28', '2026-05-08 10:15:30');

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

--
-- Dumping data for table `study_playlists`
--

INSERT INTO `study_playlists` (`id`, `school_id`, `subject_id`, `title`, `description`, `created_by`, `created_at`, `updated_at`) VALUES
(3, 1, 51, 'abc', '', 136, '2026-03-08 11:35:58', '2026-03-08 11:35:58');

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

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `school_id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(49, 1, 'Maths', 'MATHS', NULL, '2026-02-25 11:43:57', '2026-05-11 05:14:08'),
(50, 1, 'Physics', 'PHYS', NULL, '2026-02-25 11:44:31', '2026-04-16 13:29:09'),
(51, 1, 'History', 'HIS', NULL, '2026-02-25 11:48:05', '2026-02-25 11:48:05'),
(52, 3, 'Math', 'MATH', 'mathematics', '2026-03-20 05:39:41', '2026-03-20 05:39:41'),
(53, 1, 'English Language', 'ENG LAN', NULL, '2026-03-20 06:02:45', '2026-04-13 06:18:13'),
(54, 1, 'Hindi', 'HIN', 'Hindi', '2026-03-20 06:04:08', '2026-03-20 06:04:08'),
(55, 3, 'English', 'EN', NULL, '2026-03-20 06:26:56', '2026-03-22 06:31:26'),
(56, 3, 'history', 'HIS', 'fgnhghn', '2026-03-20 10:11:01', '2026-03-20 10:11:01'),
(57, 3, 'IOS Dev', 'IOS_D', NULL, '2026-03-21 10:45:42', '2026-03-21 10:45:42'),
(58, 1, 'English Lit', 'ENG LIT', NULL, '2026-04-13 06:19:17', '2026-04-16 13:28:23'),
(59, 1, 'Chemistry', 'CHEM', NULL, '2026-04-13 06:20:13', '2026-04-16 13:28:06'),
(60, 1, 'Biology', 'BIO', NULL, '2026-04-13 06:21:13', '2026-04-16 13:28:35'),
(61, 1, 'Science', 'SCI', NULL, '2026-04-13 06:21:25', '2026-04-13 06:21:25'),
(62, 1, 'Social Studies', 'S.ST', NULL, '2026-04-13 06:22:14', '2026-04-13 06:22:14'),
(63, 1, 'Art and Craft', 'A&C', NULL, '2026-04-13 06:22:44', '2026-04-13 06:22:44'),
(64, 1, 'Bengali', 'BEN', NULL, '2026-04-13 06:23:02', '2026-04-13 06:23:02'),
(65, 1, 'Computer', 'COM', NULL, '2026-04-13 06:23:21', '2026-04-13 06:23:21'),
(66, 1, 'Genaral Knowledge', 'G.K', NULL, '2026-04-13 06:23:51', '2026-04-13 06:23:51'),
(67, 1, 'Moral Science', 'MSC', NULL, '2026-04-13 06:24:22', '2026-04-13 06:24:22'),
(68, 1, 'Hindi/Bengali', 'H/B', NULL, '2026-04-13 06:26:53', '2026-04-13 06:26:53'),
(69, 1, 'Geography', 'GEO', NULL, '2026-04-13 06:28:43', '2026-04-13 06:28:43'),
(70, 1, 'History/Geography', 'HIS/GEO', NULL, '2026-04-17 05:42:58', '2026-04-17 05:42:58'),
(71, 1, 'Math/Economics', 'MATH/ECO', NULL, '2026-04-17 10:14:53', '2026-04-17 10:14:53'),
(72, 1, 'Economics', 'ECO', NULL, '2026-04-18 11:00:31', '2026-04-18 11:00:31');

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
  `file_path` varchar(255) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `syllabus`
--

INSERT INTO `syllabus` (`id`, `school_id`, `class`, `section`, `subject_id`, `title`, `file_path`, `uploaded_by`, `created_at`) VALUES
(4, 3, '1', NULL, 52, 'abdc', '/upload/syllabus/syllabus-1-52-1778422901348-588812628.pdf', 324, '2026-05-10 14:21:41');

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

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `school_id`, `user_id`, `employee_id`, `name`, `email`, `phone`, `subject`, `qualification`, `experience`, `joining_date`, `created_at`, `updated_at`, `address`, `date_of_birth`, `gender`, `emergency_contact`, `photo_path`, `basic_salary`, `allowance`, `deduction`, `can_manage_students`, `managed_classes`, `managed_streams`) VALUES
(65, 1, 300, 'TCH2026300', '   Samina Ahmed                                                                                                                                                                                ', 'saminaaahmedd@gmail.com', '9804510928', 'english', 'B.A in Communicative English Majors, B.Ed, pursuing M.A in English', '', '2024-04-04', '2026-02-27 05:47:14', '2026-05-09 05:45:16', '', '2000-07-06', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 1, '[\"1\"]', '[]'),
(66, 1, 301, 'TCH2026301', 'Syeda Tabinda Hasan', '0602tabi@gmail.com', '9804811809', 'english', 'B.A in English ,M.A in English NTT, Pursuing B.ed', '5 years', '2021-02-01', '2026-02-27 05:49:33', '2026-04-27 05:52:03', '', '1997-02-06', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 1, '[\"4\"]', NULL),
(67, 1, 302, 'TCH2026302', 'Pinki Jaiswal ', 'pinkijaiswalbinay4@gmail.com', '9163598537', ' Lower Nursery teaching ', '- BA,MA in History  Diploma in Nursery and Primary  education  Pursuing B.ed', '', '2025-04-05', '2026-02-27 05:51:41', '2026-04-27 05:47:27', '', '1983-04-28', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 1, '[\"LN\"]', NULL),
(68, 1, 303, 'TCH2026303', 'OROOSA ORAJEE ', 'orajeeoroosa@gmail.com', '7439035570', 'History and Geography ', 'B.Com Honours in finance and accounting', '1 year', '2025-09-04', '2026-02-27 05:57:16', '2026-04-27 19:38:21', '', '2000-01-26', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 0, '[\"all\"]', NULL),
(69, 1, 304, 'TCH2026304', 'sarfaraz jalal', 'sarfarazjalal2009@gmail.com', '9831892710', ' Mathematics', 'B.Sc', '', '2021-10-01', '2026-02-27 06:01:12', '2026-02-27 06:01:12', '13/1, Tiljala road, kolkata-700017', NULL, 'Male', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(70, 1, 305, 'TCH2026305', 'Mustub Sherah Salam', 'mustubsherahsalam@gmail.com', ' 8777737455', 'Biology & Chemistry ', 'B.Sc Botany(H)', '', '2023-11-06', '2026-02-27 06:03:18', '2026-02-27 06:03:18', '128,Karaya Road.Kol-700017', '2002-02-05', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(71, 1, 306, 'TCH2026306', 'Arshad hussain', 'arshadhossain@gmail.com', '8100148754', 'Moral Science, GK', 'B.ed', '', '1996-06-06', '2026-02-27 06:05:43', '2026-02-27 06:05:43', '', '1968-02-06', 'Male', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(72, 1, 307, 'TCH2026307', 'Afreen akhtar', 'Afreenakhtar9864@gmail.com', '7980781841', 'Financial Accounting and Commerce', 'Pursuing B.Ed', '5 years', '2025-09-01', '2026-02-27 06:09:11', '2026-02-27 06:09:11', '21/A Nasiruddin Road Kolkata 17', '2001-06-04', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(73, 1, 308, 'TCH2026308', 'Ghazi salauddin', 'ghazi@gmail.com', '6289197401', 'maths', 'civil diploma', '37 years', '2016-03-01', '2026-02-27 06:11:49', '2026-02-27 06:11:49', '', '1970-03-07', 'Male', '7003666787', NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(74, 1, 309, 'TCH2026309', 'Sabiha mahmud', 'knowmesabiha02@gmail.com', '7044292361', 'history ', 'b.ed', '8 year', '2018-07-18', '2026-02-27 06:17:55', '2026-04-27 05:52:24', '', '1979-04-02', 'Male', '9830762493', NULL, 0.00, 0.00, 0.00, 1, '[\"2\"]', NULL),
(75, 1, 310, 'TCH2026310', 'Ayesha khatoon', 'ayeshakhan9038486059.ak@gmail.com', '9123318284', 'hindi, bengali', 'b.ed', '', '2024-06-10', '2026-02-27 06:21:23', '2026-04-27 05:50:26', '', '1996-08-20', 'Female', '9038486059', NULL, 0.00, 0.00, 0.00, 1, '[\"3\"]', NULL),
(76, 1, 311, 'TCH2026311', 'fauzia kamal', 'yamankamal16.pratt@gmail.com', '8697636653', 'history', 'P.G in history', '7', '2019-07-03', '2026-02-27 06:24:46', '2026-04-27 05:51:39', '', '1985-08-05', 'Female', '8820075613', NULL, 0.00, 0.00, 0.00, 1, '[\"5\"]', NULL),
(77, 1, 312, 'TCH2026312', 'D.N tiwari', 'dn@gmail.com', '9163709891', 'Hindi', 'B.sc', '10', '2025-06-16', '2026-02-27 06:30:35', '2026-02-27 06:30:35', '', '1971-03-03', 'Male', '8910442586', NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(78, 1, 313, 'TCH2026313', 'Snigdha panja', 'snighda.panja@gmail.com', '8820105572', 'English', 'M.A, B.ed', '35', '2025-06-06', '2026-02-27 06:34:05', '2026-02-27 06:34:05', '', '1962-07-01', 'Female', '9874646004', NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(79, 3, 324, 'TCH2026324', 'nilu sir', 'nilu@gmail.com', '8348684225', 'ght', 'gghjgt', '7', '2026-03-18', '2026-03-20 06:46:10', '2026-05-10 07:47:57', 'ghjnghj', '2001-05-07', 'Male', NULL, NULL, 0.00, 0.00, 0.00, 1, NULL, NULL),
(80, 3, 328, 'TCH2026328', 'Arnab', 'a30311412@gmail.com', '9874519164', 'cyber security', '3rd yr', '0', '2026-03-20', '2026-03-21 12:37:45', '2026-05-10 07:48:11', '', '2026-03-10', 'Male', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(81, 3, 334, 'TCH2026334', 'sanjit', 'sanjit@gmail.com', '454', 'dsgdfg', 'grfd', '8', '2026-03-22', '2026-03-22 12:09:53', '2026-03-22 12:09:53', 'cfbgfd', '2026-03-19', 'Male', '34534', NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(82, 1, 3656, 'TCH20263656', 'Md shadab Rizwi', 'rizwishadab16@gmail.com', '8240725162', 'Chemistry Biology and physics', 'Bachelor in science (B Sc)', '8 years ', '2026-04-06', '2026-04-13 07:14:08', '2026-04-13 07:14:08', '102/H/4 Madan Mohan Burman street Kolkata 700007', '1998-05-04', 'Male', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(83, 1, 3657, 'TCH20263657', 'Preeti kumari Rajak', 'prishapreeti1608@gmail.com', '9836366094', 'Computer science , mathematics ', 'MCA ', '7 years ', '2026-04-05', '2026-04-13 07:17:12', '2026-04-13 08:28:03', '16B Madan Chatterjee  lane kolkata 700007', '2000-01-15', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(84, 1, 3658, 'TCH20263658', 'Rajat Arora', 'rajataarora11@gmail.com', '9073903907', 'School counsellor ', 'M.Sc clinical psychology', '3 years', '2026-04-05', '2026-04-13 08:31:44', '2026-04-16 09:02:13', '49B, sarat bose road , kl-25', '1998-08-02', 'Male', NULL, NULL, 0.00, 0.00, 0.00, 0, NULL, NULL),
(85, 3, 3798, 'TCH20263798', 'Sayantan Sinha Biswas', 'saya266@gmail.com', '08240083465', 'dvxcv', 'sdgsdg', '6', '2026-05-28', '2026-05-10 12:13:37', '2026-05-10 12:13:56', '4c_Aquland Squre,Kolkata', '2026-05-10', 'Male', NULL, NULL, 0.00, 0.00, 0.00, 1, '[\"11\"]', '[15]'),
(86, 1, 3800, 'TCH20263800', 'Tanusree Paul', 'tanusreepaul872@gmail.com', '9831536354', 'Biology, chemistry, bengali ', 'B.sc', '10', '2025-04-21', '2026-05-11 06:53:15', '2026-05-11 06:53:15', 'A/104 baghajatin kolkata 92', '1978-09-19', 'Female', NULL, NULL, 0.00, 0.00, 0.00, 1, NULL, NULL);

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

--
-- Dumping data for table `teachers_requisition`
--

INSERT INTO `teachers_requisition` (`id`, `school_id`, `teacher_id`, `teacher_name`, `item`, `quantity`, `description`, `urgency`, `category`, `status`, `submitted_date`, `approved_date`, `rejected_date`, `rejection_reason`, `created_at`) VALUES
(8, 1, 65, '   Samina Ahmed                                                                                                                                                                                ', 'Room freshener ', 1, 'Often, rooms smell. It would be good to have a room fresher at hand ', 'High', 'Other', 'Approved', '2026-04-21', '2026-04-21', NULL, NULL, '2026-04-21 04:49:51');

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

--
-- Dumping data for table `teacher_attendance`
--

INSERT INTO `teacher_attendance` (`id`, `school_id`, `teacher_id`, `date`, `status`, `check_in_time`, `check_out_time`, `location_verified`, `latitude`, `longitude`, `created_at`) VALUES
(5, 1, 65, '2026-04-13', 'Absent', NULL, NULL, 0, NULL, NULL, '2026-04-13 07:17:48'),
(6, 3, 79, '2026-05-13', 'Present', '17:28:54', '19:23:32', 1, 22.54259500, 88.35875700, '2026-05-13 11:58:54'),
(7, 3, 79, '2026-05-12', 'Present', '17:28:54', '17:33:00', 0, NULL, NULL, '2026-05-13 12:03:46');

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

--
-- Dumping data for table `teacher_grievance`
--

INSERT INTO `teacher_grievance` (`id`, `school_id`, `teacher_id`, `teacher_name`, `department`, `subject`, `category`, `description`, `priority`, `status`, `submitted_date`, `assigned_to`, `resolution`, `resolved_date`, `created_at`) VALUES
(3, 3, 79, 'nilu sir', '', 'fdhgrfhtgtfjygjn', 'Workload', 'sedffdgh', 'Medium', 'Pending', '2026-03-20', NULL, NULL, NULL, '2026-03-20 09:42:46');

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

--
-- Dumping data for table `teacher_leaves`
--

INSERT INTO `teacher_leaves` (`id`, `teacher_id`, `school_id`, `start_date`, `end_date`, `reason`, `status`, `rejection_reason`, `created_at`) VALUES
(2, 79, 3, '2026-03-20', '2026-03-23', 'Sick leave\n', 'Pending', NULL, '2026-03-20 09:32:05');

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

--
-- Dumping data for table `teacher_payslips`
--

INSERT INTO `teacher_payslips` (`id`, `school_id`, `teacher_id`, `month`, `year`, `title`, `file_path`, `created_at`) VALUES
(4, 3, 79, 'March', 2026, 'grretg', '/upload/teacher_payslips/payslip-79-1774189778712-537868716.pdf', '2026-03-22 14:29:38'),
(5, 3, 80, 'March', 2026, 'ert', '/upload/teacher_payslips/payslip-80-1774189802256-509523687.pdf', '2026-03-22 14:30:02');

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

--
-- Dumping data for table `tenders`
--

INSERT INTO `tenders` (`id`, `title`, `description`, `opening_date`, `closing_date`, `min_bid_amount`, `status`, `school_id`, `created_by`, `created_at`, `updated_at`, `requisition_id`) VALUES
(1, 'Tender for book', 'sdgdftht (Qty: 1)', '2026-02-10', '2026-02-16', 0.00, 'published', 1, NULL, '2026-02-10 13:49:58', '2026-02-10 13:52:39', 4);

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

--
-- Dumping data for table `timetable`
--

INSERT INTO `timetable` (`id`, `school_id`, `class_number`, `section`, `stream_id`, `day_of_week`, `time_slot_id`, `time_slot_name`, `subject_id`, `subject_name`, `teacher_id`, `teacher_name`, `room_number`, `created_at`, `updated_at`, `is_elective`, `is_merged`, `merged_id`, `merge_group_id`) VALUES
(47, 3, '8', 'A', NULL, 'Wednesday', 3, '08:45:00 - 09:30:00', NULL, 'Arts', NULL, 'soumya', '45', '2026-02-07 08:59:37', '2026-02-07 08:59:37', 0, 0, NULL, NULL),
(49, 3, '1', 'E', NULL, 'Monday', 1, '', NULL, 'Arts', NULL, 'soumya', '102', '2026-02-09 07:16:47', '2026-02-09 07:16:47', 0, 0, NULL, NULL),
(79, 3, '1', 'A', NULL, 'Friday', 1, '', 52, 'Math', 79, 'nilu sir', 'hjg', '2026-03-20 06:49:32', '2026-03-20 06:49:32', 0, 0, NULL, NULL),
(80, 3, '4', 'B', NULL, 'Thursday', 1, '', 57, 'IOS Dev', 79, 'nilu sir', '152', '2026-03-21 10:46:26', '2026-03-21 10:46:26', 0, 0, NULL, NULL),
(82, 3, '4', 'B', NULL, 'Monday', 2, '', 56, 'history', 79, 'nilu sir', NULL, '2026-03-22 08:55:37', '2026-03-22 08:55:37', 0, 0, NULL, NULL),
(83, 3, '11', 'A', 16, 'Tuesday', 1, '', 52, 'Math', 80, 'Arnab', '123', '2026-03-22 10:32:23', '2026-03-22 10:32:23', 0, 0, NULL, NULL),
(84, 3, '5', 'A', NULL, 'Thursday', 1, '', 55, 'English', 80, 'Arnab', 'ghjg5', '2026-03-22 11:03:01', '2026-03-22 11:03:43', 0, 0, NULL, NULL),
(85, 3, '11', 'A', 16, 'Tuesday', 2, '', 57, 'IOS Dev', 80, 'Arnab', NULL, '2026-03-22 13:26:44', '2026-03-22 13:26:44', 0, 0, NULL, NULL),
(86, 1, '1', 'A', NULL, 'Monday', 1, '08:00:00 - 08:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:22:38', '2026-04-13 07:22:38', 0, 0, NULL, NULL),
(87, 1, '5', 'A', NULL, 'Monday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:25:58', '2026-04-13 07:25:58', 0, 0, NULL, NULL),
(88, 1, '4', 'A', NULL, 'Monday', 3, '', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:26:31', '2026-04-13 07:26:31', 0, 0, NULL, NULL),
(89, 1, '3', 'A', NULL, 'Monday', 5, '10:00:00 - 10:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:26:49', '2026-04-13 07:26:49', 0, 0, NULL, NULL),
(90, 1, '2', 'A', NULL, 'Monday', 6, '10:40:00 - 23:10:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:27:13', '2026-04-13 07:27:13', 0, 0, NULL, NULL),
(91, 1, '1', 'A', NULL, 'Tuesday', 1, '08:00:00 - 08:40:00', 65, 'Computer', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:28:55', '2026-04-13 07:28:55', 0, 0, NULL, NULL),
(92, 1, '5', 'A', NULL, 'Tuesday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:30:27', '2026-04-13 07:30:27', 0, 0, NULL, NULL),
(93, 1, '2', 'A', NULL, 'Monday', 1, '08:00:00 - 08:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:31:52', '2026-04-13 07:31:52', 0, 0, NULL, NULL),
(94, 1, '4', 'A', NULL, 'Tuesday', 3, '', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-13 07:32:16', '2026-04-13 07:32:16', 0, 0, NULL, NULL),
(95, 1, '1', 'A', NULL, 'Monday', 2, '08:40:00 - 09:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:32:25', '2026-04-13 07:34:41', 0, 0, NULL, NULL),
(96, 1, '5', 'A', NULL, 'Monday', 3, '', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:32:47', '2026-04-13 07:34:56', 0, 0, NULL, NULL),
(97, 1, '4', 'A', NULL, 'Monday', 5, '10:00:00 - 10:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:33:31', '2026-04-13 07:35:14', 0, 0, NULL, NULL),
(98, 1, '3', 'A', NULL, 'Monday', 6, '10:40:00 - 23:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:35:29', '2026-04-13 07:35:29', 0, 0, NULL, NULL),
(99, 1, '2', 'A', NULL, 'Tuesday', 1, '08:00:00 - 08:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:35:53', '2026-04-13 14:32:21', 0, 0, NULL, NULL),
(100, 1, '1', 'A', NULL, 'Tuesday', 2, '08:40:00 - 09:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:36:07', '2026-04-13 07:36:07', 0, 0, NULL, NULL),
(101, 1, '5', 'A', NULL, 'Tuesday', 3, '', 51, 'History', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:36:21', '2026-04-13 07:36:21', 0, 0, NULL, NULL),
(102, 1, '4', 'A', NULL, 'Tuesday', 5, '10:00:00 - 10:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:36:35', '2026-04-13 07:36:35', 0, 0, NULL, NULL),
(103, 1, '3', 'A', NULL, 'Tuesday', 6, '10:40:00 - 23:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:36:49', '2026-04-13 07:36:49', 0, 0, NULL, NULL),
(104, 1, '5', 'A', NULL, 'Tuesday', 7, '23:10:00 - 23:40:00', 69, 'Geography', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:37:06', '2026-04-13 07:37:06', 0, 0, NULL, NULL),
(105, 1, '2', 'A', NULL, 'Wednesday', 1, '08:00:00 - 08:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:37:37', '2026-04-13 07:37:37', 0, 0, NULL, NULL),
(106, 1, '1', 'A', NULL, 'Wednesday', 2, '08:40:00 - 09:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:38:15', '2026-04-13 07:38:15', 0, 0, NULL, NULL),
(107, 1, '5', 'A', NULL, 'Wednesday', 3, '', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:38:32', '2026-04-13 07:39:02', 0, 0, NULL, NULL),
(108, 1, '4', 'A', NULL, 'Wednesday', 5, '10:00:00 - 10:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:39:21', '2026-04-13 07:39:21', 0, 0, NULL, NULL),
(109, 1, '3', 'A', NULL, 'Wednesday', 6, '10:40:00 - 23:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:39:50', '2026-04-13 07:39:50', 0, 0, NULL, NULL),
(110, 1, '2', 'A', NULL, 'Thursday', 1, '08:00:00 - 08:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:40:24', '2026-04-13 07:40:24', 0, 0, NULL, NULL),
(111, 1, '1', 'A', NULL, 'Thursday', 2, '08:40:00 - 09:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:40:38', '2026-04-13 07:40:38', 0, 0, NULL, NULL),
(112, 1, '5', 'A', NULL, 'Thursday', 3, '', 69, 'Geography', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:40:56', '2026-04-13 07:40:56', 0, 0, NULL, NULL),
(113, 1, '4', 'A', NULL, 'Thursday', 5, '10:00:00 - 10:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:41:25', '2026-04-13 07:41:25', 0, 0, NULL, NULL),
(114, 1, '3', 'A', NULL, 'Thursday', 6, '10:40:00 - 23:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:42:02', '2026-04-13 07:42:19', 0, 0, NULL, NULL),
(115, 1, '5', 'A', NULL, 'Thursday', 7, '23:10:00 - 23:40:00', 63, 'Art and Craft', 74, 'Sabiha mahmud', NULL, '2026-04-13 07:42:36', '2026-04-13 07:42:36', 0, 0, NULL, NULL),
(116, 1, '2', 'A', NULL, 'Friday', 1, '08:00:00 - 08:40:00', 67, 'Moral Science', 74, 'Sabiha mahmud', NULL, '2026-04-13 14:08:54', '2026-04-13 14:08:54', 0, 0, NULL, NULL),
(117, 1, '1', 'A', NULL, 'Friday', 2, '08:40:00 - 09:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 14:09:42', '2026-04-13 14:09:42', 0, 0, NULL, NULL),
(118, 1, '5', 'A', NULL, 'Friday', 3, '', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 14:09:57', '2026-04-13 14:09:57', 0, 0, NULL, NULL),
(119, 1, '4', 'A', NULL, 'Friday', 5, '10:00:00 - 10:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 14:10:12', '2026-04-13 14:10:12', 0, 0, NULL, NULL),
(120, 1, '3', 'A', NULL, 'Friday', 6, '10:40:00 - 11:10:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 14:12:06', '2026-04-13 14:12:06', 0, 0, NULL, NULL),
(121, 1, '2', 'A', NULL, 'Friday', 7, '23:10:00 - 23:40:00', 49, 'Math', 74, 'Sabiha mahmud', NULL, '2026-04-13 14:12:16', '2026-04-13 14:12:16', 0, 0, NULL, NULL),
(122, 1, '3', 'A', NULL, 'Monday', 1, '08:00:00 - 08:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:13:23', '2026-04-13 14:13:23', 0, 0, NULL, NULL),
(123, 1, '3', 'A', NULL, 'Tuesday', 1, '08:00:00 - 08:40:00', 65, 'Computer', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:13:56', '2026-04-13 14:13:56', 0, 0, NULL, NULL),
(124, 1, '3', 'A', NULL, 'Wednesday', 1, '08:00:00 - 08:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:14:07', '2026-04-13 14:14:07', 0, 0, NULL, NULL),
(125, 1, '3', 'A', NULL, 'Thursday', 1, '08:00:00 - 08:40:00', 65, 'Computer', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:14:36', '2026-04-13 14:14:36', 0, 0, NULL, NULL),
(126, 1, '3', 'A', NULL, 'Friday', 1, '08:00:00 - 08:40:00', 67, 'Moral Science', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:16:45', '2026-04-13 14:16:45', 0, 0, NULL, NULL),
(127, 1, '2', 'A', NULL, 'Monday', 2, '08:40:00 - 09:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:17:25', '2026-04-13 14:17:25', 0, 0, NULL, NULL),
(128, 1, '2', 'A', NULL, 'Tuesday', 2, '08:40:00 - 09:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:17:34', '2026-04-13 14:17:34', 0, 0, NULL, NULL),
(129, 1, '2', 'A', NULL, 'Wednesday', 2, '08:40:00 - 09:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:17:48', '2026-04-13 14:17:48', 0, 0, NULL, NULL),
(130, 1, '2', 'A', NULL, 'Thursday', 2, '08:40:00 - 09:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:17:56', '2026-04-13 14:17:56', 0, 0, NULL, NULL),
(131, 1, '2', 'A', NULL, 'Friday', 2, '08:40:00 - 09:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:20:33', '2026-04-13 14:20:33', 0, 0, NULL, NULL),
(132, 1, '1', 'A', NULL, 'Monday', 3, '', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:20:57', '2026-04-13 14:20:57', 0, 0, NULL, NULL),
(133, 1, '1', 'A', NULL, 'Tuesday', 3, '', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:21:05', '2026-04-13 14:21:05', 0, 0, NULL, NULL),
(134, 1, '1', 'A', NULL, 'Wednesday', 3, '', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:21:12', '2026-04-13 14:21:12', 0, 0, NULL, NULL),
(135, 1, '1', 'A', NULL, 'Thursday', 3, '', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:21:19', '2026-04-13 14:21:19', 0, 0, NULL, NULL),
(136, 1, '1', 'A', NULL, 'Friday', 3, '', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:21:38', '2026-04-13 14:21:38', 0, 0, NULL, NULL),
(137, 1, '5', 'A', NULL, 'Monday', 5, '10:00:00 - 10:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:22:26', '2026-04-13 14:22:26', 0, 0, NULL, NULL),
(138, 1, '5', 'A', NULL, 'Tuesday', 5, '10:00:00 - 10:40:00', 65, 'Computer', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:22:41', '2026-04-13 14:22:41', 0, 0, NULL, NULL),
(139, 1, '5', 'A', NULL, 'Wednesday', 5, '10:00:00 - 10:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:23:44', '2026-04-13 14:23:44', 0, 0, NULL, NULL),
(140, 1, '5', 'A', NULL, 'Thursday', 5, '10:00:00 - 10:40:00', 65, 'Computer', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:23:57', '2026-04-13 14:23:57', 0, 0, NULL, NULL),
(141, 1, '5', 'A', NULL, 'Friday', 5, '10:00:00 - 10:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:24:19', '2026-04-13 14:24:19', 0, 0, NULL, NULL),
(142, 1, '4', 'A', NULL, 'Monday', 6, '10:40:00 - 11:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:25:22', '2026-04-13 14:25:22', 0, 0, NULL, NULL),
(143, 1, '4', 'A', NULL, 'Tuesday', 6, '10:40:00 - 11:10:00', 65, 'Computer', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:25:38', '2026-04-13 14:25:38', 0, 0, NULL, NULL),
(144, 1, '4', 'A', NULL, 'Wednesday', 6, '10:40:00 - 11:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:25:57', '2026-04-13 14:25:57', 0, 0, NULL, NULL),
(145, 1, '4', 'A', NULL, 'Thursday', 6, '10:40:00 - 11:10:00', 65, 'Computer', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:26:09', '2026-04-13 14:26:09', 0, 0, NULL, NULL),
(146, 1, '4', 'A', NULL, 'Friday', 6, '10:40:00 - 11:10:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:26:27', '2026-04-13 14:26:27', 0, 0, NULL, NULL),
(147, 1, '5', 'A', NULL, 'Monday', 7, '23:10:00 - 23:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:26:44', '2026-04-13 14:26:44', 0, 0, NULL, NULL),
(148, 1, '3', 'A', NULL, 'Thursday', 7, '23:10:00 - 23:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:27:50', '2026-04-13 14:27:50', 0, 0, NULL, NULL),
(149, 1, '4', 'A', NULL, 'Friday', 7, '23:10:00 - 23:40:00', 68, 'Hindi/Bengali', 75, 'Ayesha khatoon', NULL, '2026-04-13 14:28:00', '2026-04-13 14:28:00', 0, 0, NULL, NULL),
(150, 1, '4', 'A', NULL, 'Wednesday', 3, '', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:54:02', '2026-04-14 05:54:02', 0, 0, NULL, NULL),
(151, 1, '4', 'A', NULL, 'Thursday', 3, '', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:54:14', '2026-04-14 05:54:14', 0, 0, NULL, NULL),
(152, 1, '4', 'A', NULL, 'Friday', 3, '', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:54:30', '2026-04-14 05:54:30', 0, 0, NULL, NULL),
(153, 1, '3', 'A', NULL, 'Tuesday', 5, '10:00:00 - 10:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:55:01', '2026-04-14 05:55:01', 0, 0, NULL, NULL),
(154, 1, '3', 'A', NULL, 'Wednesday', 5, '10:00:00 - 10:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:55:19', '2026-04-14 05:55:19', 0, 0, NULL, NULL),
(155, 1, '3', 'A', NULL, 'Thursday', 5, '10:00:00 - 10:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:55:58', '2026-04-14 05:55:58', 0, 0, NULL, NULL),
(156, 1, '3', 'A', NULL, 'Friday', 5, '10:00:00 - 10:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:56:17', '2026-04-14 05:56:17', 0, 0, NULL, NULL),
(157, 1, '2', 'A', NULL, 'Tuesday', 6, '10:40:00 - 11:10:00', 62, 'Social Studies', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:57:55', '2026-04-14 05:57:55', 0, 0, NULL, NULL),
(158, 1, '2', 'A', NULL, 'Wednesday', 6, '10:40:00 - 11:10:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:58:13', '2026-04-14 05:58:13', 0, 0, NULL, NULL),
(159, 1, '2', 'A', NULL, 'Thursday', 6, '10:40:00 - 11:10:00', 62, 'Social Studies', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:58:36', '2026-04-14 05:58:36', 0, 0, NULL, NULL),
(160, 1, '2', 'A', NULL, 'Friday', 6, '10:40:00 - 11:10:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:59:05', '2026-04-14 05:59:05', 0, 0, NULL, NULL),
(161, 1, '1', 'A', NULL, 'Wednesday', 1, '08:00:00 - 08:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 05:59:52', '2026-04-14 05:59:52', 0, 0, NULL, NULL),
(162, 1, '1', 'A', NULL, 'Thursday', 1, '08:00:00 - 08:40:00', 65, 'Computer', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:00:14', '2026-04-14 06:00:14', 0, 0, NULL, NULL),
(163, 1, '1', 'A', NULL, 'Friday', 1, '08:00:00 - 08:40:00', 67, 'Moral Science', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:00:25', '2026-04-14 06:00:25', 0, 0, NULL, NULL),
(164, 1, '5', 'A', NULL, 'Wednesday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:01:48', '2026-04-14 06:01:48', 0, 0, NULL, NULL),
(165, 1, '5', 'A', NULL, 'Thursday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:02:21', '2026-04-14 06:02:21', 0, 0, NULL, NULL),
(166, 1, '5', 'A', NULL, 'Friday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:02:32', '2026-04-14 06:02:32', 0, 0, NULL, NULL),
(167, 1, '3', 'A', NULL, 'Tuesday', 7, '23:10:00 - 23:40:00', 63, 'Art and Craft', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:03:01', '2026-04-14 06:03:01', 0, 0, NULL, NULL),
(168, 1, '1', 'A', NULL, 'Wednesday', 7, '23:10:00 - 23:40:00', 58, 'ENGLISH LIT', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:03:12', '2026-04-14 06:03:12', 0, 0, NULL, NULL),
(169, 1, '1', 'A', NULL, 'Thursday', 7, '23:10:00 - 23:40:00', 63, 'Art and Craft', 65, '   Samina Ahmed                                                                                                                                                                                ', NULL, '2026-04-14 06:03:33', '2026-04-14 06:03:33', 0, 0, NULL, NULL),
(170, 1, '4', 'A', NULL, 'Monday', 1, '08:00:00 - 08:40:00', 58, 'ENGLISH LIT', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:27:42', '2026-04-16 13:27:42', 0, 0, NULL, NULL),
(171, 1, '4', 'A', NULL, 'Tuesday', 1, '08:00:00 - 08:40:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:32:59', '2026-04-16 13:32:59', 0, 0, NULL, NULL),
(172, 1, '4', 'A', NULL, 'Wednesday', 1, '08:00:00 - 08:40:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:33:34', '2026-04-16 13:33:34', 0, 0, NULL, NULL),
(173, 1, '4', 'A', NULL, 'Thursday', 1, '08:00:00 - 08:40:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:33:44', '2026-04-16 13:33:44', 0, 0, NULL, NULL),
(174, 1, '4', 'A', NULL, 'Friday', 1, '08:00:00 - 08:40:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:33:53', '2026-04-16 13:33:53', 0, 0, NULL, NULL),
(175, 1, '3', 'A', NULL, 'Monday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:34:25', '2026-04-16 13:34:25', 0, 0, NULL, NULL),
(176, 1, '3', 'A', NULL, 'Tuesday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:35:22', '2026-04-16 13:35:22', 0, 0, NULL, NULL),
(177, 1, '3', 'A', NULL, 'Wednesday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:35:35', '2026-04-16 13:36:03', 0, 0, NULL, NULL),
(178, 1, '3', 'A', NULL, 'Thursday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:35:47', '2026-04-16 13:35:47', 0, 0, NULL, NULL),
(179, 1, '3', 'A', NULL, 'Friday', 2, '08:40:00 - 09:10:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:36:36', '2026-04-16 13:36:36', 0, 0, NULL, NULL),
(180, 1, '2', 'A', NULL, 'Monday', 3, '', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:37:15', '2026-04-16 13:37:15', 0, 0, NULL, NULL),
(181, 1, '2', 'A', NULL, 'Tuesday', 3, '', 65, 'Computer', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:37:31', '2026-04-16 13:37:31', 0, 0, NULL, NULL),
(182, 1, '2', 'A', NULL, 'Wednesday', 3, '', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:37:43', '2026-04-16 13:37:43', 0, 0, NULL, NULL),
(183, 1, '2', 'A', NULL, 'Thursday', 3, '', 65, 'Computer', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:39:09', '2026-04-16 13:39:09', 0, 0, NULL, NULL),
(184, 1, '2', 'A', NULL, 'Friday', 3, '', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:39:19', '2026-04-16 13:39:58', 0, 0, NULL, NULL),
(185, 1, '1', 'A', NULL, 'Monday', 5, '10:00:00 - 10:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:40:25', '2026-04-16 13:40:25', 0, 0, NULL, NULL),
(186, 1, '1', 'A', NULL, 'Tuesday', 5, '10:00:00 - 10:40:00', 62, 'Social Studies', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:40:41', '2026-04-16 13:40:41', 0, 0, NULL, NULL),
(187, 1, '1', 'A', NULL, 'Wednesday', 5, '10:00:00 - 10:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:41:29', '2026-04-16 13:41:29', 0, 0, NULL, NULL),
(188, 1, '1', 'A', NULL, 'Thursday', 5, '10:00:00 - 10:40:00', 62, 'Social Studies', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:42:01', '2026-04-16 13:42:01', 0, 0, NULL, NULL),
(189, 1, '1', 'A', NULL, 'Friday', 5, '10:00:00 - 10:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:42:35', '2026-04-16 13:42:35', 0, 0, NULL, NULL),
(190, 1, '5', 'A', NULL, 'Monday', 6, '10:40:00 - 11:10:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:43:43', '2026-04-16 13:43:43', 0, 0, NULL, NULL),
(191, 1, '5', 'A', NULL, 'Tuesday', 6, '10:40:00 - 11:10:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:44:02', '2026-04-16 13:44:02', 0, 0, NULL, NULL),
(192, 1, '5', 'A', NULL, 'Wednesday', 6, '10:40:00 - 11:10:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:44:17', '2026-04-16 13:44:17', 0, 0, NULL, NULL),
(193, 1, '5', 'A', NULL, 'Thursday', 6, '10:40:00 - 11:10:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:44:28', '2026-04-16 13:44:28', 0, 0, NULL, NULL),
(194, 1, '5', 'A', NULL, 'Friday', 6, '10:40:00 - 11:10:00', 58, 'English Lit', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:44:39', '2026-04-16 13:44:39', 0, 0, NULL, NULL),
(195, 1, '2', 'A', NULL, 'Monday', 7, '23:10:00 - 23:40:00', 63, 'Art and Craft', 66, 'Syeda Tabinda Hasan', NULL, '2026-04-16 13:45:29', '2026-04-16 13:45:29', 0, 0, NULL, NULL),
(196, 1, '5', 'A', NULL, 'Monday', 1, '08:00:00 - 08:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 13:51:20', '2026-04-16 13:51:20', 0, 0, NULL, NULL),
(197, 1, '5', 'A', NULL, 'Tuesday', 1, '08:00:00 - 08:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 13:51:39', '2026-04-16 13:51:39', 0, 0, NULL, NULL),
(198, 1, '5', 'A', NULL, 'Wednesday', 1, '08:00:00 - 08:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 13:51:54', '2026-04-16 13:51:54', 0, 0, NULL, NULL),
(199, 1, '5', 'A', NULL, 'Thursday', 1, '08:00:00 - 08:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 13:52:04', '2026-04-16 13:52:04', 0, 0, NULL, NULL),
(200, 1, '5', 'A', NULL, 'Friday', 1, '08:00:00 - 08:40:00', 67, 'Moral Science', 76, 'fauzia kamal', NULL, '2026-04-16 13:52:35', '2026-04-16 13:52:35', 0, 0, NULL, NULL),
(201, 1, '4', 'A', NULL, 'Monday', 2, '08:40:00 - 09:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 13:52:57', '2026-04-16 13:52:57', 0, 0, NULL, NULL),
(202, 1, '4', 'A', NULL, 'Tuesday', 2, '08:40:00 - 09:10:00', 62, 'Social Studies', 76, 'fauzia kamal', NULL, '2026-04-16 13:56:17', '2026-04-16 13:56:17', 0, 0, NULL, NULL),
(203, 1, '4', 'A', NULL, 'Wednesday', 2, '08:40:00 - 09:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 13:56:34', '2026-04-16 13:56:34', 0, 0, NULL, NULL),
(204, 1, '4', 'A', NULL, 'Thursday', 2, '08:40:00 - 09:10:00', 62, 'Social Studies', 76, 'fauzia kamal', NULL, '2026-04-16 14:28:25', '2026-04-16 14:28:25', 0, 0, NULL, NULL),
(205, 1, '4', 'A', NULL, 'Friday', 2, '08:40:00 - 09:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:28:48', '2026-04-16 14:28:48', 0, 0, NULL, NULL),
(206, 1, '3', 'A', NULL, 'Monday', 3, '', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:29:28', '2026-04-16 14:29:28', 0, 0, NULL, NULL),
(207, 1, '3', 'A', NULL, 'Tuesday', 3, '', 62, 'Social Studies', 76, 'fauzia kamal', NULL, '2026-04-16 14:29:56', '2026-04-16 14:29:56', 0, 0, NULL, NULL),
(208, 1, '3', 'A', NULL, 'Wednesday', 3, '', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:30:24', '2026-04-16 14:30:24', 0, 0, NULL, NULL),
(209, 1, '3', 'A', NULL, 'Thursday', 3, '', 62, 'Social Studies', 76, 'fauzia kamal', NULL, '2026-04-16 14:30:40', '2026-04-16 14:30:40', 0, 0, NULL, NULL),
(210, 1, '3', 'A', NULL, 'Friday', 3, '', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:31:00', '2026-04-16 14:31:00', 0, 0, NULL, NULL),
(211, 1, '2', 'A', NULL, 'Monday', 5, '10:00:00 - 10:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:31:19', '2026-04-16 14:31:19', 0, 0, NULL, NULL),
(212, 1, '2', 'A', NULL, 'Tuesday', 5, '10:00:00 - 10:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:31:32', '2026-04-16 14:31:32', 0, 0, NULL, NULL),
(213, 1, '2', 'A', NULL, 'Wednesday', 5, '10:00:00 - 10:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:31:58', '2026-04-16 14:31:58', 0, 0, NULL, NULL),
(214, 1, '2', 'A', NULL, 'Thursday', 5, '10:00:00 - 10:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:32:15', '2026-04-16 14:32:15', 0, 0, NULL, NULL),
(216, 1, '2', 'A', NULL, 'Friday', 5, '10:00:00 - 10:40:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:32:53', '2026-04-16 14:32:53', 0, 0, NULL, NULL),
(217, 1, '1', 'A', NULL, 'Monday', 6, '10:40:00 - 11:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:33:20', '2026-04-16 14:33:20', 0, 0, NULL, NULL),
(218, 1, '1', 'A', NULL, 'Tuesday', 6, '10:40:00 - 11:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:33:29', '2026-04-16 14:33:29', 0, 0, NULL, NULL),
(219, 1, '1', 'A', NULL, 'Wednesday', 6, '10:40:00 - 11:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:33:36', '2026-04-16 14:33:36', 0, 0, NULL, NULL),
(220, 1, '1', 'A', NULL, 'Thursday', 6, '10:40:00 - 11:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:33:45', '2026-04-16 14:33:45', 0, 0, NULL, NULL),
(221, 1, '1', 'A', NULL, 'Friday', 6, '10:40:00 - 11:10:00', 61, 'Science', 76, 'fauzia kamal', NULL, '2026-04-16 14:33:57', '2026-04-16 14:34:05', 0, 0, NULL, NULL),
(222, 1, '4', 'A', NULL, 'Monday', 7, '23:10:00 - 23:40:00', 62, 'Social Studies', 76, 'fauzia kamal', NULL, '2026-04-16 14:34:18', '2026-04-16 14:34:18', 0, 0, NULL, NULL),
(223, 1, '4', 'A', NULL, 'Wednesday', 7, '23:10:00 - 23:40:00', 63, 'Art and Craft', 76, 'fauzia kamal', NULL, '2026-04-16 14:34:38', '2026-04-16 14:34:38', 0, 0, NULL, NULL),
(224, 1, '3', 'A', NULL, 'Friday', 7, '23:10:00 - 23:40:00', 62, 'Social Studies', 76, 'fauzia kamal', NULL, '2026-04-16 14:35:13', '2026-04-16 14:35:13', 0, 0, NULL, NULL),
(225, 1, '7', 'A', NULL, 'Monday', 17, '12:00:00 - 12:40:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:38:27', '2026-04-17 10:38:27', 0, 0, NULL, NULL),
(226, 1, '7', 'A', NULL, 'Tuesday', 17, '12:00:00 - 12:40:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:38:42', '2026-04-17 10:38:42', 0, 0, NULL, NULL),
(227, 1, '7', 'A', NULL, 'Wednesday', 17, '12:00:00 - 12:40:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:38:53', '2026-04-17 10:38:53', 0, 0, NULL, NULL),
(228, 1, '7', 'A', NULL, 'Thursday', 17, '12:00:00 - 12:40:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:39:03', '2026-04-17 10:39:03', 0, 0, NULL, NULL),
(229, 1, '7', 'A', NULL, 'Friday', 17, '12:00:00 - 12:40:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:39:15', '2026-04-17 10:39:15', 0, 0, NULL, NULL),
(230, 1, '6', 'A', NULL, 'Monday', 18, '12:40:00 - 13:20:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:39:32', '2026-04-17 10:39:32', 0, 0, NULL, NULL),
(231, 1, '6', 'A', NULL, 'Tuesday', 18, '12:40:00 - 13:20:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:39:43', '2026-04-17 10:39:43', 0, 0, NULL, NULL),
(232, 1, '6', 'A', NULL, 'Wednesday', 18, '12:40:00 - 13:20:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:39:54', '2026-04-17 10:39:54', 0, 0, NULL, NULL),
(233, 1, '6', 'A', NULL, 'Thursday', 18, '12:40:00 - 13:20:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:40:03', '2026-04-17 10:40:03', 0, 0, NULL, NULL),
(234, 1, '6', 'A', NULL, 'Friday', 18, '12:40:00 - 13:20:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:40:11', '2026-04-17 10:40:11', 0, 0, NULL, NULL),
(235, 1, '9', 'A', NULL, 'Monday', 21, '15:00:00 - 15:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:40:36', '2026-04-17 10:40:36', 0, 0, NULL, NULL),
(236, 1, '9', 'A', NULL, 'Tuesday', 21, '15:00:00 - 15:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:41:09', '2026-04-17 10:41:09', 0, 0, NULL, NULL),
(237, 1, '9', 'A', NULL, 'Wednesday', 21, '15:00:00 - 15:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:41:21', '2026-04-17 10:41:21', 0, 0, NULL, NULL),
(238, 1, '9', 'A', NULL, 'Thursday', 21, '15:00:00 - 15:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:41:29', '2026-04-17 10:41:29', 0, 0, NULL, NULL),
(239, 1, '9', 'A', NULL, 'Friday', 21, '15:00:00 - 15:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:41:38', '2026-04-17 10:41:38', 0, 0, NULL, NULL),
(240, 1, '10', 'A', NULL, 'Monday', 22, '15:30:00 - 16:00:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:41:52', '2026-04-17 10:41:52', 0, 0, NULL, NULL),
(241, 1, '10', 'A', NULL, 'Tuesday', 22, '15:30:00 - 16:00:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:42:04', '2026-04-17 10:42:04', 0, 0, NULL, NULL),
(242, 1, '10', 'A', NULL, 'Wednesday', 22, '15:30:00 - 16:00:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:44:01', '2026-04-17 10:44:01', 0, 0, NULL, NULL),
(243, 1, '10', 'A', NULL, 'Thursday', 22, '15:30:00 - 16:00:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:44:12', '2026-04-17 10:44:12', 0, 0, NULL, NULL),
(244, 1, '10', 'A', NULL, 'Friday', 22, '15:30:00 - 16:00:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:44:23', '2026-04-17 10:44:23', 0, 0, NULL, NULL),
(245, 1, '8', 'A', NULL, 'Monday', 23, '16:00:00 - 16:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:44:45', '2026-04-17 10:44:45', 0, 0, NULL, NULL),
(246, 1, '8', 'A', NULL, 'Tuesday', 23, '16:00:00 - 16:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:44:52', '2026-04-17 10:45:51', 0, 0, NULL, NULL),
(247, 1, '8', 'A', NULL, 'Wednesday', 23, '16:00:00 - 16:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:45:00', '2026-04-17 10:46:01', 0, 0, NULL, NULL),
(248, 1, '8', 'A', NULL, 'Thursday', 23, '16:00:00 - 16:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:46:17', '2026-04-17 10:46:17', 0, 0, NULL, NULL),
(249, 1, '8', 'A', NULL, 'Friday', 23, '16:00:00 - 16:30:00', 70, 'History/Geography', 68, 'OROOSA ORAJEE ', NULL, '2026-04-17 10:47:07', '2026-04-17 10:47:07', 0, 0, NULL, NULL),
(250, 1, '6', 'A', NULL, 'Tuesday', 17, '12:00:00 - 12:40:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:00:40', '2026-04-17 11:00:40', 0, 0, NULL, NULL),
(251, 1, '6', 'A', NULL, 'Thursday', 17, '12:00:00 - 12:40:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:00:55', '2026-04-17 11:00:55', 0, 0, NULL, NULL),
(252, 1, '10', 'A', NULL, 'Monday', 18, '12:40:00 - 13:20:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:04:07', '2026-04-17 11:04:07', 0, 0, NULL, NULL),
(253, 1, '10', 'A', NULL, 'Wednesday', 18, '12:40:00 - 13:20:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:04:30', '2026-04-17 11:04:30', 0, 0, NULL, NULL),
(254, 1, '10', 'A', NULL, 'Thursday', 18, '12:40:00 - 13:20:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:06:04', '2026-04-17 11:06:04', 0, 0, NULL, NULL),
(255, 1, '7', 'A', NULL, 'Friday', 18, '12:40:00 - 13:20:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:06:22', '2026-04-18 11:38:53', 0, 0, NULL, NULL),
(256, 1, '11', 'A', 11, 'Monday', 19, '13:20:00 - 14:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:07:54', '2026-04-17 11:07:54', 0, 0, NULL, NULL),
(257, 1, '9', 'A', NULL, 'Tuesday', 19, '13:20:00 - 14:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:08:17', '2026-04-17 11:08:17', 0, 0, NULL, NULL),
(258, 1, '6', 'A', NULL, 'Wednesday', 19, '13:20:00 - 14:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:09:03', '2026-04-17 11:09:03', 0, 0, NULL, NULL),
(259, 1, '9', 'A', NULL, 'Thursday', 19, '13:20:00 - 14:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:10:34', '2026-04-17 11:10:34', 0, 0, NULL, NULL),
(260, 1, '8', 'A', NULL, 'Monday', 20, '14:00:00 - 14:40:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:11:11', '2026-04-17 11:11:11', 0, 0, NULL, NULL),
(261, 1, '7', 'A', NULL, 'Tuesday', 20, '14:00:00 - 14:40:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:11:24', '2026-04-17 11:11:24', 0, 0, NULL, NULL),
(262, 1, '8', 'A', NULL, 'Wednesday', 20, '14:00:00 - 14:40:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:11:33', '2026-04-17 11:11:33', 0, 0, NULL, NULL),
(263, 1, '7', 'A', NULL, 'Thursday', 20, '14:00:00 - 14:40:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:11:56', '2026-04-17 11:11:56', 0, 0, NULL, NULL),
(264, 1, '8', 'A', NULL, 'Friday', 20, '14:00:00 - 14:40:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:12:08', '2026-04-17 11:12:08', 0, 0, NULL, NULL),
(265, 1, '12', 'A', 11, 'Monday', 21, '15:00:00 - 15:30:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:14:30', '2026-04-17 11:14:30', 0, 0, NULL, NULL),
(266, 1, '12', 'A', 11, 'Tuesday', 21, '15:00:00 - 15:30:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:14:42', '2026-04-17 11:14:42', 0, 0, NULL, NULL),
(267, 1, '12', 'A', 11, 'Wednesday', 21, '15:00:00 - 15:30:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:14:57', '2026-04-17 11:14:57', 0, 0, NULL, NULL),
(268, 1, '12', 'A', 11, 'Thursday', 21, '15:00:00 - 15:30:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:15:31', '2026-04-17 11:15:31', 0, 0, NULL, NULL),
(269, 1, '12', 'A', 11, 'Friday', 21, '15:00:00 - 15:30:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:15:46', '2026-04-17 11:15:46', 0, 0, NULL, NULL),
(270, 1, '11', 'A', 11, 'Monday', 22, '15:30:00 - 16:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:17:34', '2026-04-17 11:17:34', 0, 0, NULL, NULL),
(271, 1, '11', 'A', 11, 'Tuesday', 22, '15:30:00 - 16:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:17:48', '2026-04-17 11:17:48', 0, 0, NULL, NULL),
(272, 1, '11', 'A', 11, 'Wednesday', 22, '15:30:00 - 16:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:18:03', '2026-04-17 11:18:03', 0, 0, NULL, NULL),
(273, 1, '11', 'A', 11, 'Thursday', 22, '15:30:00 - 16:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:18:25', '2026-04-17 11:18:25', 0, 0, NULL, NULL),
(274, 1, '11', 'A', 11, 'Friday', 22, '15:30:00 - 16:00:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:19:07', '2026-04-17 11:19:07', 0, 0, NULL, NULL),
(275, 1, '9', 'A', NULL, 'Monday', 23, '16:00:00 - 16:30:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:19:36', '2026-04-17 11:19:36', 0, 0, NULL, NULL),
(276, 1, '10', 'A', NULL, 'Friday', 23, '16:00:00 - 16:30:00', 60, 'Biology', 70, 'Mustub Sherah Salam', NULL, '2026-04-17 11:19:51', '2026-04-17 11:19:51', 0, 0, NULL, NULL),
(277, 1, '10', 'A', NULL, 'Monday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:49:48', '2026-04-18 10:49:48', 0, 0, NULL, NULL),
(278, 1, '10', 'A', NULL, 'Tuesday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:50:10', '2026-04-18 10:50:10', 0, 0, NULL, NULL),
(279, 1, '10', 'A', NULL, 'Wednesday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:50:30', '2026-04-18 10:50:30', 0, 0, NULL, NULL),
(280, 1, '10', 'A', NULL, 'Thursday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:51:28', '2026-04-18 10:51:28', 0, 0, NULL, NULL),
(281, 1, '10', 'A', NULL, 'Friday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:51:54', '2026-04-18 10:51:54', 0, 0, NULL, NULL),
(282, 1, '9', 'A', NULL, 'Monday', 22, '15:30:00 - 16:00:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:54:50', '2026-04-18 10:54:50', 0, 0, NULL, NULL),
(283, 1, '9', 'A', NULL, 'Tuesday', 22, '15:30:00 - 16:00:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:55:08', '2026-04-18 10:55:08', 0, 0, NULL, NULL),
(284, 1, '9', 'A', NULL, 'Wednesday', 22, '15:30:00 - 16:00:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:55:24', '2026-04-18 10:55:24', 0, 0, NULL, NULL),
(285, 1, '9', 'A', NULL, 'Thursday', 22, '15:30:00 - 16:00:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:55:34', '2026-04-18 10:55:34', 0, 0, NULL, NULL),
(286, 1, '9', 'A', NULL, 'Friday', 22, '15:30:00 - 16:00:00', 53, 'English Language', 78, 'Snigdha panja', NULL, '2026-04-18 10:55:43', '2026-04-18 10:55:43', 0, 0, NULL, NULL),
(287, 1, '10', 'A', NULL, 'Monday', 20, '14:00:00 - 14:40:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:03:20', '2026-05-05 09:17:01', 1, 0, NULL, NULL),
(293, 1, '11', 'A', 17, 'Monday', 21, '15:00:00 - 15:30:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:05:32', '2026-04-18 11:05:32', 0, 0, NULL, NULL),
(294, 1, '11', 'A', 17, 'Tuesday', 21, '15:00:00 - 15:30:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:05:45', '2026-04-18 11:05:45', 0, 0, NULL, NULL),
(295, 1, '11', 'A', 17, 'Wednesday', 21, '15:00:00 - 15:30:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:05:57', '2026-04-18 11:05:57', 0, 0, NULL, NULL),
(296, 1, '11', 'A', 17, 'Thursday', 21, '15:00:00 - 15:30:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:06:31', '2026-04-18 11:06:31', 0, 0, NULL, NULL),
(297, 1, '11', 'A', 17, 'Friday', 21, '15:00:00 - 15:30:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:07:05', '2026-04-18 11:07:05', 0, 0, NULL, NULL),
(298, 1, '12', 'A', 17, 'Monday', 22, '15:30:00 - 16:00:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:09:49', '2026-04-18 11:09:49', 0, 0, NULL, NULL),
(299, 1, '12', 'A', 17, 'Tuesday', 22, '15:30:00 - 16:00:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:10:24', '2026-04-18 11:10:24', 0, 0, NULL, NULL),
(300, 1, '12', 'A', 17, 'Wednesday', 22, '15:30:00 - 16:00:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:11:02', '2026-04-18 11:11:02', 0, 0, NULL, NULL),
(301, 1, '12', 'A', 17, 'Thursday', 22, '15:30:00 - 16:00:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:11:15', '2026-04-18 11:11:15', 0, 0, NULL, NULL),
(302, 1, '12', 'A', 17, 'Friday', 22, '15:30:00 - 16:00:00', 72, 'Economics', 72, 'Afreen akhtar', NULL, '2026-04-18 11:15:19', '2026-04-18 11:15:19', 0, 0, NULL, NULL),
(303, 1, '6', 'A', NULL, 'Monday', 17, '12:00:00 - 12:40:00', 49, 'Math', 71, 'Arshad hussain', NULL, '2026-04-18 11:23:31', '2026-04-18 11:23:31', 0, 0, NULL, NULL),
(304, 1, '7', 'A', NULL, 'Monday', 21, '15:00:00 - 15:30:00', 67, 'Moral Science', 71, 'Arshad hussain', NULL, '2026-04-18 11:24:17', '2026-04-18 11:24:17', 0, 0, NULL, NULL),
(305, 1, '6', 'A', NULL, 'Monday', 22, '15:30:00 - 16:00:00', 66, 'Genaral Knowledge', 71, 'Arshad hussain', NULL, '2026-04-18 11:25:24', '2026-04-18 11:25:24', 0, 0, NULL, NULL),
(306, 1, '6', 'A', NULL, 'Monday', 23, '16:00:00 - 16:30:00', 67, 'Moral Science', 71, 'Arshad hussain', NULL, '2026-04-18 11:25:46', '2026-04-18 11:25:46', 0, 0, NULL, NULL),
(307, 1, '8', 'A', NULL, 'Tuesday', 20, '14:00:00 - 14:40:00', 67, 'Moral Science', 71, 'Arshad hussain', NULL, '2026-04-18 11:27:42', '2026-04-18 11:27:42', 0, 0, NULL, NULL),
(308, 1, '6', 'A', NULL, 'Tuesday', 21, '15:00:00 - 15:30:00', 66, 'Genaral Knowledge', 71, 'Arshad hussain', NULL, '2026-04-18 11:28:04', '2026-04-18 11:28:04', 0, 0, NULL, NULL),
(309, 1, '6', 'A', NULL, 'Tuesday', 22, '15:30:00 - 16:00:00', 49, 'Math', 71, 'Arshad hussain', NULL, '2026-04-18 11:29:16', '2026-04-18 11:29:16', 0, 0, NULL, NULL),
(310, 1, '9', 'A', NULL, 'Monday', 17, '12:00:00 - 12:40:00', 49, 'Maths', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:29:59', '2026-05-14 05:27:50', 1, 0, NULL, NULL),
(311, 1, '6', 'A', NULL, 'Wednesday', 17, '12:00:00 - 12:40:00', 67, 'Moral Science', 71, 'Arshad hussain', NULL, '2026-04-18 11:30:10', '2026-04-18 11:30:10', 0, 0, NULL, NULL),
(312, 1, '9', 'A', NULL, 'Tuesday', 17, '12:00:00 - 12:40:00', 49, 'Maths', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:30:25', '2026-05-14 05:28:10', 1, 0, NULL, NULL),
(313, 1, '7', 'A', NULL, 'Wednesday', 21, '15:00:00 - 15:30:00', 66, 'Genaral Knowledge', 71, 'Arshad hussain', NULL, '2026-04-18 11:30:40', '2026-04-18 11:30:40', 0, 0, NULL, NULL),
(314, 1, '9', 'A', NULL, 'Wednesday', 17, '12:00:00 - 12:40:00', 49, 'Maths', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:30:50', '2026-05-14 05:28:15', 1, 0, NULL, NULL),
(315, 1, '6', 'A', NULL, 'Wednesday', 23, '16:00:00 - 16:30:00', 49, 'Math', 71, 'Arshad hussain', NULL, '2026-04-18 11:30:55', '2026-04-18 11:30:55', 0, 0, NULL, NULL),
(316, 1, '9', 'A', NULL, 'Thursday', 17, '12:00:00 - 12:40:00', 49, 'Maths', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:31:02', '2026-05-14 05:28:20', 1, 0, NULL, NULL),
(317, 1, '9', 'A', NULL, 'Friday', 17, '12:00:00 - 12:40:00', 49, 'Maths', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:31:10', '2026-05-14 05:28:25', 1, 0, NULL, NULL),
(318, 1, '8', 'A', NULL, 'Monday', 18, '12:40:00 - 13:20:00', 49, 'Math', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:31:28', '2026-04-18 11:31:28', 0, 0, NULL, NULL),
(319, 1, '8', 'A', NULL, 'Thursday', 20, '14:00:00 - 14:40:00', 67, 'Moral Science', 71, 'Arshad hussain', NULL, '2026-04-18 11:31:29', '2026-04-18 11:31:29', 0, 0, NULL, NULL),
(320, 1, '8', 'A', NULL, 'Tuesday', 18, '12:40:00 - 13:20:00', 49, 'Math', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:31:36', '2026-04-18 11:31:36', 0, 0, NULL, NULL),
(321, 1, '8', 'A', NULL, 'Wednesday', 18, '12:40:00 - 13:20:00', 49, 'Math', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:31:43', '2026-04-18 11:31:43', 0, 0, NULL, NULL),
(322, 1, '8', 'A', NULL, 'Thursday', 18, '12:40:00 - 13:20:00', 49, 'Math', 73, 'Ghazi salauddin', NULL, '2026-04-18 11:31:51', '2026-04-18 11:31:51', 0, 0, NULL, NULL),
(323, 1, '7', 'A', NULL, 'Thursday', 21, '15:00:00 - 15:30:00', 66, 'Genaral Knowledge', 71, 'Arshad hussain', NULL, '2026-04-18 11:31:54', '2026-04-18 11:31:54', 0, 0, NULL, NULL),
(324, 1, '6', 'A', NULL, 'Thursday', 23, '16:00:00 - 16:30:00', 49, 'Math', 71, 'Arshad hussain', NULL, '2026-04-18 11:32:34', '2026-04-18 11:32:34', 0, 0, NULL, NULL),
(325, 1, '6', 'A', NULL, 'Friday', 17, '12:00:00 - 12:40:00', 49, 'Math', 71, 'Arshad hussain', NULL, '2026-04-18 11:33:00', '2026-04-18 11:33:00', 0, 0, NULL, NULL),
(326, 1, '8', 'A', NULL, 'Friday', 18, '12:40:00 - 13:20:00', 66, 'Genaral Knowledge', 71, 'Arshad hussain', NULL, '2026-04-18 11:40:36', '2026-04-18 11:40:36', 0, 0, NULL, NULL),
(327, 1, '7', 'A', NULL, 'Friday', 21, '15:00:00 - 15:30:00', 66, 'Genaral Knowledge', 71, 'Arshad hussain', NULL, '2026-04-18 11:41:09', '2026-04-18 11:41:09', 0, 0, NULL, NULL),
(328, 1, '6', 'A', NULL, 'Friday', 23, '16:00:00 - 16:30:00', 66, 'Genaral Knowledge', 71, 'Arshad hussain', NULL, '2026-04-18 11:41:47', '2026-04-18 11:41:47', 0, 0, NULL, NULL),
(333, 1, '10', 'A', NULL, 'Monday', 20, '14:00:00 - 14:40:00', 49, 'Math', 73, 'Ghazi salauddin', NULL, '2026-05-05 09:17:06', '2026-05-05 09:17:06', 1, 0, NULL, NULL),
(334, 1, '10', 'A', NULL, 'Tuesday', 20, '14:00:00 - 14:40:00', 49, 'Math', 73, 'Ghazi salauddin', NULL, '2026-05-05 09:51:24', '2026-05-05 09:51:24', 1, 0, NULL, NULL),
(336, 1, '8', 'A', NULL, 'Monday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:36:32', '2026-05-07 08:36:32', 0, 0, NULL, NULL),
(337, 1, '7', 'A', NULL, 'Monday', 18, '12:40:00 - 13:20:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:36:48', '2026-05-07 08:36:48', 0, 0, NULL, NULL),
(338, 1, '6', 'A', NULL, 'Monday', 19, '13:20:00 - 14:00:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:40:55', '2026-05-07 08:40:55', 0, 0, NULL, NULL),
(339, 1, '8', 'A', NULL, 'Tuesday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:41:15', '2026-05-07 08:41:15', 0, 0, NULL, NULL),
(340, 1, '7', 'A', NULL, 'Tuesday', 18, '12:40:00 - 13:20:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:41:27', '2026-05-07 08:41:27', 0, 0, NULL, NULL),
(341, 1, '6', 'A', NULL, 'Tuesday', 19, '13:20:00 - 14:00:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:41:45', '2026-05-07 08:41:45', 0, 0, NULL, NULL),
(342, 1, '8', 'A', NULL, 'Wednesday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:42:35', '2026-05-07 08:42:35', 0, 0, NULL, NULL),
(343, 1, '7', 'A', NULL, 'Wednesday', 18, '12:40:00 - 13:20:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:43:09', '2026-05-07 08:43:09', 0, 0, NULL, NULL),
(344, 1, '8', 'A', NULL, 'Thursday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:43:41', '2026-05-07 08:43:41', 0, 0, NULL, NULL),
(345, 1, '7', 'A', NULL, 'Thursday', 18, '12:40:00 - 13:20:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:43:58', '2026-05-07 08:43:58', 0, 0, NULL, NULL),
(346, 1, '6', 'A', NULL, 'Thursday', 19, '13:20:00 - 14:00:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:44:08', '2026-05-07 08:44:08', 0, 0, NULL, NULL),
(347, 1, '8', 'A', NULL, 'Friday', 17, '12:00:00 - 12:40:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:44:32', '2026-05-07 08:44:32', 0, 0, NULL, NULL),
(348, 1, '6', 'A', NULL, 'Friday', 19, '13:20:00 - 14:00:00', 53, 'English Language', 66, 'Syeda Tabinda Hasan', NULL, '2026-05-07 08:44:53', '2026-05-07 08:44:53', 0, 0, NULL, NULL),
(353, 3, '1', 'A', NULL, 'Monday', 1, '', 55, 'English', 80, 'Arnab', NULL, '2026-05-10 06:41:06', '2026-05-10 06:41:06', 1, 0, NULL, NULL),
(355, 3, '1', 'A', NULL, 'Monday', 1, '', 56, 'history', 79, 'nilu sir', NULL, '2026-05-10 06:48:11', '2026-05-10 06:48:11', 1, 0, NULL, NULL);
INSERT INTO `timetable` (`id`, `school_id`, `class_number`, `section`, `stream_id`, `day_of_week`, `time_slot_id`, `time_slot_name`, `subject_id`, `subject_name`, `teacher_id`, `teacher_name`, `room_number`, `created_at`, `updated_at`, `is_elective`, `is_merged`, `merged_id`, `merge_group_id`) VALUES
(360, 3, '3', 'A', NULL, 'Thursday', 3, '09:10:00 - 09:40:00', 52, 'Math', 80, 'Arnab', 'fg', '2026-05-10 07:12:13', '2026-05-10 07:12:13', 0, 0, NULL, NULL),
(361, 3, '1', 'A', NULL, 'Wednesday', 1, '', 56, 'history', 79, 'nilu sir', NULL, '2026-05-10 11:58:14', '2026-05-10 11:58:14', 0, 0, NULL, '81cdd8fe-bd4a-4c88-81aa-28da960b9848'),
(362, 3, '1', 'B', NULL, 'Wednesday', 1, '', 56, 'history', 79, 'nilu sir', NULL, '2026-05-10 11:58:14', '2026-05-10 11:58:14', 0, 0, NULL, '81cdd8fe-bd4a-4c88-81aa-28da960b9848'),
(363, 1, '10', 'A', NULL, 'Monday', 16, '11:30:00 - 12:00:00', 50, 'Physics', 69, 'sarfaraz jalal', NULL, '2026-05-14 05:10:47', '2026-05-14 05:10:47', 0, 0, NULL, NULL),
(364, 1, '11', 'A', 11, 'Monday', 17, '12:00:00 - 12:40:00', 49, 'Maths', 69, 'sarfaraz jalal', NULL, '2026-05-14 05:14:06', '2026-05-14 05:14:06', 0, 0, NULL, NULL),
(365, 1, '12', 'A', 11, 'Monday', 18, '12:40:00 - 13:20:00', 49, 'Maths', 69, 'sarfaraz jalal', NULL, '2026-05-14 05:14:22', '2026-05-14 05:14:22', 0, 0, NULL, NULL),
(366, 1, '9', 'A', NULL, 'Monday', 19, '13:20:00 - 14:00:00', 50, 'Physics', 69, 'sarfaraz jalal', NULL, '2026-05-14 05:19:41', '2026-05-14 05:19:41', 0, 0, NULL, NULL),
(367, 1, '7', 'A', NULL, 'Monday', 20, '14:00:00 - 14:40:00', 50, 'Physics', 69, 'sarfaraz jalal', NULL, '2026-05-14 05:22:39', '2026-05-14 05:22:39', 0, 0, NULL, NULL),
(368, 1, '6', 'A', NULL, 'Monday', 21, '15:00:00 - 15:30:00', 50, 'Physics', 69, 'sarfaraz jalal', NULL, '2026-05-14 05:23:38', '2026-05-14 05:23:38', 0, 0, NULL, NULL);

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

--
-- Dumping data for table `timetable_elective_students`
--

INSERT INTO `timetable_elective_students` (`id`, `timetable_id`, `student_id`, `school_id`, `created_at`) VALUES
(11, 333, 490, 1, '2026-05-05 10:21:02'),
(12, 333, 491, 1, '2026-05-05 10:21:02'),
(13, 334, 490, 1, '2026-05-05 10:21:02'),
(14, 334, 491, 1, '2026-05-05 10:21:02'),
(31, 353, 264, 3, '2026-05-10 06:41:06'),
(33, 355, 496, 3, '2026-05-10 06:48:11');

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

--
-- Dumping data for table `time_slots`
--

INSERT INTO `time_slots` (`id`, `school_id`, `start_time`, `end_time`, `slot_name`, `is_break`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 1, '08:00:00', '08:40:00', '08:00 - 08:45', 0, 1, '2026-01-20 05:30:18', '2026-04-13 07:02:50'),
(2, 1, '08:40:00', '09:10:00', '08:45 - 09:30', 0, 2, '2026-01-20 05:30:18', '2026-04-13 07:03:03'),
(3, 3, '09:10:00', '09:40:00', '09:30 - 10:15', 0, 3, '2026-01-20 05:30:18', '2026-04-13 07:09:43'),
(5, 1, '10:00:00', '10:40:00', '10:45 - 11:30', 0, 5, '2026-01-20 05:30:18', '2026-04-13 07:10:43'),
(6, 1, '10:40:00', '11:10:00', '11:30 - 12:15', 0, 6, '2026-01-20 05:30:18', '2026-04-13 14:11:32'),
(7, 1, '23:10:00', '23:40:00', '12:15 - 01:00', 0, 7, '2026-01-20 05:30:18', '2026-04-13 07:12:00'),
(16, 1, '11:30:00', '12:00:00', '12:00 - 12:40', 0, 8, '2026-04-13 07:12:49', '2026-04-17 05:44:35'),
(17, 1, '12:00:00', '12:40:00', '12:00 - 12:40', 0, 9, '2026-04-17 05:46:57', '2026-04-17 05:46:57'),
(18, 1, '12:40:00', '13:20:00', '12:40 - 13:22', 0, 10, '2026-04-17 05:50:41', '2026-04-17 05:50:49'),
(19, 1, '13:20:00', '14:00:00', '13:20 - 14:40', 0, 11, '2026-04-17 05:52:11', '2026-04-17 05:52:29'),
(20, 1, '14:00:00', '14:40:00', '14:00 - 14:40', 0, 12, '2026-04-17 05:52:52', '2026-04-17 05:52:52'),
(21, 1, '15:00:00', '15:30:00', '15:00 - 15:30', 0, 13, '2026-04-17 05:53:41', '2026-04-17 05:53:41'),
(22, 1, '15:30:00', '16:00:00', '15:30 - 16:00', 0, 14, '2026-04-17 05:54:45', '2026-04-17 05:54:45'),
(23, 1, '16:00:00', '16:30:00', '16:00 - 16:30', 0, 15, '2026-04-17 05:57:16', '2026-04-17 05:57:16');

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

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `school_id`, `student_id`, `transaction_id`, `payment_method`, `amount`, `net_amount`, `gst_amount`, `payment_date`, `status`, `created_at`) VALUES
(1, 1, 120, 'TXN9013', 'cash', 5000.00, 4237.29, 762.71, '2026-02-01', 'success', '2026-02-10 14:04:56'),
(2, 1, 120, 'TXN9341', 'online', 15000.00, 12711.86, 2288.14, '2026-02-02', 'success', '2026-02-10 14:04:56'),
(3, 1, 265, 'TXN2514', 'online', 12000.00, 10169.49, 1830.51, '2026-02-03', 'success', '2026-02-10 14:04:56'),
(4, 1, 266, 'TXN5227', 'cash', 2500.00, 2118.64, 381.36, '2026-02-05', 'success', '2026-02-10 14:04:56'),
(5, 1, 120, 'TXN7929', 'cash', 4000.00, 3389.83, 610.17, '2026-02-08', 'success', '2026-02-10 14:04:56'),
(6, 1, 120, 'TXN3365', 'cash', 5000.00, 4237.29, 762.71, '2026-02-01', 'success', '2026-02-10 14:05:43'),
(7, 1, 120, 'TXN9677', 'online', 15000.00, 12711.86, 2288.14, '2026-02-02', 'success', '2026-02-10 14:05:43'),
(8, 1, 265, 'TXN6537', 'online', 12000.00, 10169.49, 1830.51, '2026-02-03', 'success', '2026-02-10 14:05:43'),
(9, 1, 266, 'TXN1170', 'cash', 2500.00, 2118.64, 381.36, '2026-02-05', 'success', '2026-02-10 14:05:43'),
(10, 1, 120, 'TXN5069', 'cash', 4000.00, 3389.83, 610.17, '2026-02-08', 'success', '2026-02-10 14:05:43'),
(11, 1, 120, 'TXN4184', 'cash', 5000.00, 4237.29, 762.71, '2026-02-01', 'success', '2026-02-10 14:07:17'),
(12, 1, 120, 'TXN4635', 'online', 15000.00, 12711.86, 2288.14, '2026-02-02', 'success', '2026-02-10 14:07:17'),
(13, 1, 265, 'TXN3541', 'online', 12000.00, 10169.49, 1830.51, '2026-02-03', 'success', '2026-02-10 14:07:17'),
(14, 1, 266, 'TXN4615', 'cash', 2500.00, 2118.64, 381.36, '2026-02-05', 'success', '2026-02-10 14:07:17'),
(15, 1, 120, 'TXN8749', 'cash', 4000.00, 3389.83, 610.17, '2026-02-08', 'success', '2026-02-10 14:07:17'),
(16, 1, 120, 'TXN36805', 'cash', 5000.00, 4237.29, 762.71, '2026-02-01', 'success', '2026-02-10 14:08:18'),
(17, 1, 120, 'TXN10279', 'online', 15000.00, 12711.86, 2288.14, '2026-02-02', 'success', '2026-02-10 14:08:18'),
(18, 1, 265, 'TXN32777', 'online', 12000.00, 10169.49, 1830.51, '2026-02-03', 'success', '2026-02-10 14:08:18'),
(19, 1, 266, 'TXN26089', 'cash', 2500.00, 2118.64, 381.36, '2026-02-05', 'success', '2026-02-10 14:08:18'),
(20, 1, 120, 'TXN8782', 'cash', 4000.00, 3389.83, 610.17, '2026-02-08', 'success', '2026-02-10 14:08:18'),
(21, 1, 120, 'TXN81667', 'cash', 5000.00, 4237.29, 762.71, '2026-02-01', 'success', '2026-02-10 14:11:41'),
(22, 1, 120, 'TXN23291', 'online', 15000.00, 12711.86, 2288.14, '2026-02-02', 'success', '2026-02-10 14:11:41'),
(23, 1, 265, 'TXN90816', 'online', 12000.00, 10169.49, 1830.51, '2026-02-03', 'success', '2026-02-10 14:11:41'),
(24, 1, 266, 'TXN18480', 'cash', 2500.00, 2118.64, 381.36, '2026-02-05', 'success', '2026-02-10 14:11:41'),
(25, 1, 120, 'TXN9012', 'cash', 4000.00, 3389.83, 610.17, '2026-02-08', 'success', '2026-02-10 14:11:41');

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

--
-- Dumping data for table `transfer_certificates`
--

INSERT INTO `transfer_certificates` (`id`, `school_id`, `student_id`, `student_name`, `class`, `section`, `roll_no`, `father_name`, `mother_name`, `admission_no`, `date_of_leaving`, `last_class_attended`, `reason_for_leaving`, `conduct`, `total_attendance_percentage`, `eligible_for_admission`, `fees_cleared`, `outstanding_fees`, `certificate_number`, `issued_date`, `remarks`, `issued_by`, `created_at`) VALUES
(1, 3, 503, 'add', '1', 'B', '34', 'aaa', 'bbbb', NULL, '2026-05-10', 'Class 1 - B', 'Family relocation', 'Good', NULL, 1, 0, 0.00, 'TC-3-2026-0001', '2026-05-10', NULL, 266, '2026-05-10 07:25:23');

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

--
-- Dumping data for table `transport_assignments`
--

INSERT INTO `transport_assignments` (`id`, `school_id`, `student_id`, `vehicle_id`, `route_name`, `pickup_point`, `created_at`, `updated_at`) VALUES
(1, 3, 264, 3, 'Standard Route', 'Main Gate', '2026-03-24 06:20:17', '2026-03-24 06:20:17');

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

--
-- Dumping data for table `transport_drivers`
--

INSERT INTO `transport_drivers` (`id`, `user_id`, `school_id`, `license_no`, `experience_years`, `status`, `created_at`, `updated_at`) VALUES
(5, 329, 3, 'gjhyytj', 6, 'active', '2026-03-22 07:20:13', '2026-03-22 07:20:13');

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

--
-- Dumping data for table `transport_vehicles`
--

INSERT INTO `transport_vehicles` (`id`, `school_id`, `vehicle_no`, `type`, `model`, `capacity`, `registration_no`, `status`, `driver_id`, `created_at`, `updated_at`, `route`, `current_latitude`, `current_longitude`, `is_tracking`, `last_location_update`, `tracking_start_time`, `current_place_name`) VALUES
(3, 3, 'abc', 'Mini Bus', 'abc', 20, 'ghjfghj', 'Active', 329, '2026-03-23 10:54:32', '2026-03-24 06:31:09', 'kolkata to barrackpore', 22.54262676, 88.35880792, 0, '2026-03-24 06:31:09', NULL, NULL);

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

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `school_id`, `email`, `password`, `role`, `name`, `phone`, `student_unique_id`, `status`, `created_at`, `updated_at`) VALUES
(27, 1, 'admission@school.edu', '$2b$10$iENzjrGnbc9j1kfhWZUrZ.mevx4uH2TEdJCdlG498hM/5on0X.Uq2', 'admission', 'Shah faisal', '988337064', NULL, 'active', '2026-01-19 15:44:35', '2026-04-13 05:43:17'),
(28, 1, 'admin@school.edu', '$2b$10$5GbWF.Wt0cBzN60kQOTL0.KKxNUrjovteKXjycN6LodfRDbT.pZmu', 'admin', 'Admin User', '9999999999', NULL, 'active', '2026-01-19 15:51:39', '2026-04-07 06:17:17'),
(131, 1, 'accounts@school.edu', '$2b$10$S1u1wdu/Q0hWc4x1fA51TuoV4KPK37ODxLChA.BvrMpEj1w83U6/.', 'accountant', 'Shah faisal', '9883317064', NULL, 'active', '2026-01-20 12:04:04', '2026-04-12 11:33:19'),
(136, 1, 'library@school.edu', '$2b$10$h0EdRuVtPdFe3ttMefZOC.cZvfxOVL9pHMY4CoSRj4R6o9Rd/I8LS', 'librarian', 'Librarian', '9876500001', NULL, 'active', '2026-01-27 06:18:32', '2026-04-30 06:57:13'),
(264, 3, 'demo', 'demo123', 'student', 'Demo Student', '9999888877', 'GORAB1899001', 'active', '2026-02-08 09:58:21', '2026-04-13 12:57:47'),
(266, 3, 'admin', '$2b$10$pCKjsov/GsfUdNKaSTFGM.P4mSLBXE8E7YhI8QWd.fRNu6InjEUWS', 'admin', 'admin', '1236547896', NULL, 'active', '2026-02-08 10:18:16', '2026-04-12 09:27:41'),
(267, 3, 'accounts', '$2b$10$G.czTfn.13wbu5T3IeSTqeGLmD0Emgp0CdY8ItMIFtdcIRoClOK6m', 'accountant', 'accountant', '1236547896', NULL, 'active', '2026-02-08 10:18:16', '2026-05-14 09:38:29'),
(268, 3, 'admission', '$2b$10$AGDTJxXDgEFDhgUElEOtWeWIkI/UXHLC0DzatjKrq9acuVh3o2kKS', 'admission', 'admission demo', '1234', NULL, 'active', '2026-02-08 10:18:16', '2026-05-14 09:37:02'),
(269, 3, 'library', '$2b$10$rNYTE3Cn9Kt1UGBjUbk7/.lzsaSkdGSy33937.Mj8g3jOoTXFTnlq', 'librarian', 'library demo', '1236547896', NULL, 'active', '2026-02-08 10:18:16', '2026-05-02 05:27:58'),
(273, 1, 'store@school.edu', 'store123', 'storemanager', 'Store Manager', '9900990099', NULL, 'active', '2026-02-12 10:30:45', '2026-02-12 10:51:11'),
(300, 1, 'saminaaahmedd@gmail.com', '$2b$10$pJLnupe9DAxIN2pEWJMtG.w3EBU6wg2UpNTXJpiYxFLlh5./YueKa', 'teacher', '   Samina Ahmed                                                                                                                                                                                ', '9804510928', NULL, 'active', '2026-02-27 05:47:14', '2026-04-22 07:03:01'),
(301, 1, '0602tabi@gmail.com', '$2b$10$fJRLyf8b.XmbgOJLFdeln.qXqZCmpR0sOGISRLnYc9kb3uvoWcZ7q', 'teacher', 'Syeda Tabinda Hasan', '9804811809', NULL, 'active', '2026-02-27 05:49:33', '2026-04-09 06:28:11'),
(302, 1, 'pinkijaiswalbinay4@gmail.com', '$2b$10$oyxW/N7QRjeD.ALvCU8LVu9UH9TbBAPDZZR0qkNhVtILVuF4TZMre', 'teacher', 'Pinki Jaiswal ', '9163598537', NULL, 'active', '2026-02-27 05:51:41', '2026-04-13 05:05:36'),
(303, 1, 'orajeeoroosa@gmail.com', '$2b$10$HjjInmLUmEBY.HG96S72ruB.15ticVMRr/3N5TFFIKfNBUHHDHDNm', 'teacher', 'OROOSA ORAJEE ', '7439035570', NULL, 'active', '2026-02-27 05:57:16', '2026-04-22 08:37:12'),
(304, 1, 'sarfarazjalal2009@gmail.com', '9831892710', 'teacher', 'sarfaraz jalal', '9831892710', NULL, 'active', '2026-02-27 06:01:12', '2026-02-27 06:01:12'),
(305, 1, 'mustubsherahsalam@gmail.com', ' 8777737455', 'teacher', 'Mustub Sherah Salam', ' 8777737455', NULL, 'active', '2026-02-27 06:03:18', '2026-02-27 06:03:18'),
(306, 1, 'arshadhossain@gmail.com', '8100148754', 'teacher', 'Arshad hussain', '8100148754', NULL, 'active', '2026-02-27 06:05:43', '2026-02-27 06:05:43'),
(307, 1, 'Afreenakhtar9864@gmail.com', '$2b$10$GsIw6lRRf87YFhbjWpbE6OGj2i9DcI92nK0xcXXnZTKfBb7S1d4se', 'teacher', 'Afreen akhtar', '7980781841', NULL, 'active', '2026-02-27 06:09:11', '2026-05-05 08:53:16'),
(308, 1, 'ghazi@gmail.com', '$2b$10$pQwghHN9W5yh5nEpnj.EkeBqhc.i9laahzeeoy8hz4CSiopgf/UdC', 'teacher', 'Ghazi salauddin', '6289197401', NULL, 'active', '2026-02-27 06:11:49', '2026-05-05 08:55:01'),
(309, 1, 'knowmesabiha02@gmail.com', '$2b$10$LggvSMyscmWw/4omwpilQeZjyz37QnQq9L831DtH77A0EHhRkkxJ.', 'teacher', 'Sabiha mahmud', '7044292361', NULL, 'active', '2026-02-27 06:17:55', '2026-04-09 06:30:17'),
(310, 1, 'ayeshakhan9038486059.ak@gmail.com', '$2b$10$qHDHi.R/yiidJqCWySaDQej4fi5xJPdzpBeq5maAryCnm4sTK2mMa', 'teacher', 'Ayesha khatoon', '9123318284', NULL, 'active', '2026-02-27 06:21:23', '2026-04-09 06:28:13'),
(311, 1, 'yamankamal16.pratt@gmail.com', '$2b$10$TDW88yjpJKC8.Bp1UzOXKeHw3SE9vALPxUHLVQKRflSqWr5eJepmG', 'teacher', 'fauzia kamal', '8697636653', NULL, 'active', '2026-02-27 06:24:46', '2026-04-09 06:29:42'),
(312, 1, 'dn@gmail.com', '9163709891', 'teacher', 'D.N tiwari', '9163709891', NULL, 'active', '2026-02-27 06:30:35', '2026-02-27 06:30:35'),
(313, 1, 'snighda.panja@gmail.com', '8820105572', 'teacher', 'Snigdha panja', '8820105572', NULL, 'active', '2026-02-27 06:34:05', '2026-02-27 06:34:05'),
(316, 1, 'security', 'security123', 'security', 'Security Guard', '9900990098', NULL, 'active', '2026-03-16 15:10:21', '2026-03-16 15:10:21'),
(324, 3, 'nilu@gmail.com', '$2b$10$NJGEQTxRN9J685KHzBaIw./FW1iaqUKI8PD4R9/XUrltH4HSNCH9i', 'teacher', 'nilu sir', '8348684225', NULL, 'active', '2026-03-20 06:46:10', '2026-05-13 14:13:18'),
(326, 3, 'arnab@gmail.com', '7501642864', 'storemanager', 'arnab', '7501642864', NULL, 'active', '2026-03-21 11:41:03', '2026-03-21 11:41:03'),
(328, 3, 'a30311412@gmail.com', '9874519164', 'teacher', 'Arnab', '9874519164', NULL, 'active', '2026-03-21 12:37:45', '2026-03-21 12:37:45'),
(329, 3, 'mnb@gmail.com', '9382472', 'driver', 'mnb', '9382472', NULL, 'active', '2026-03-22 07:20:13', '2026-03-22 07:20:13'),
(330, 3, 'sdfd@fdhtj.gjht', '3698521470', 'security', 'cvguityf', '3698521470', NULL, 'active', '2026-03-22 07:21:00', '2026-03-22 07:21:00'),
(331, 3, 'fgjhsgfd@jhygcf.jyfdg', '22032026', 'student', 'blue', '123456', 'GORAB2026002', 'active', '2026-03-22 08:36:56', '2026-04-13 12:57:47'),
(332, 3, 'sf@fjhg.fygrt', '22032026', 'student', 'subhas', '111111', 'GORAB2026003', 'active', '2026-03-22 10:41:55', '2026-04-13 12:57:47'),
(333, 3, 'jaswal@jhgh.djyf', '$2b$10$XHtERHDqtm4p0yVgxpjmUOfNQI655hcOzR4/6AF5uQ0iYE7II4y6m', 'student', 'jaswal', '789', 'GORAB2026004', 'active', '2026-03-22 11:01:54', '2026-04-30 06:29:32'),
(334, 3, 'sanjit@gmail.com', '454', 'teacher', 'sanjit', '454', NULL, 'active', '2026-03-22 12:09:53', '2026-03-22 12:09:53'),
(336, 1, NULL, '07082017', 'student', 'Abdul shad ', '9330616809', 'BALLY2026251', 'active', '2026-04-09 06:34:44', '2026-04-18 06:44:23'),
(337, 1, NULL, '23102016', 'student', 'Humaira Anwar ', '9831333498', 'BALLY2026259', 'active', '2026-04-09 06:40:05', '2026-04-18 06:45:40'),
(338, 1, NULL, '05072017', 'student', 'Umar Akhter ', '6204447827', 'BALLY2026267', 'active', '2026-04-09 06:48:46', '2026-04-18 06:47:37'),
(339, 1, NULL, '01102016', 'student', 'Simra jamil', '6289106706', 'BALLY2026264', 'active', '2026-04-09 06:57:25', '2026-04-18 06:46:40'),
(340, 1, NULL, '21112017', 'student', 'Tawhed Ali Mallik', '6290328567', 'BALLY2026266', 'active', '2026-04-09 07:03:27', '2026-04-18 06:47:25'),
(341, 1, NULL, '17072017', 'student', 'Ekra khatoon', '7980660536', 'BALLY2026258', 'active', '2026-04-09 07:07:23', '2026-04-18 06:45:31'),
(342, 1, NULL, '15092017', 'student', 'Arhama Rahaman', '9143148128', 'BALLY2026255', 'active', '2026-04-09 07:17:32', '2026-04-18 06:44:59'),
(343, 1, NULL, '22062016', 'student', 'Kanika Sarfaraz ', '8820169620', 'BALLY2026261', 'active', '2026-04-09 07:21:42', '2026-04-18 06:46:02'),
(344, 1, NULL, '18032017', 'student', 'Asifa Shahid', '7980202041', 'BALLY2026256', 'active', '2026-04-09 07:25:09', '2026-04-18 06:45:09'),
(345, 1, NULL, '26092017', 'student', 'Shresthi Kumari', '7278540642', 'BALLY2026263', 'active', '2026-04-09 07:32:50', '2026-04-18 06:46:25'),
(346, 1, 'mumtazjahanmuslim@gmail.com', '$2b$10$nJCRhmeazIu899ao8ztp0ehjqptymqgjmNIcY/HVLbOOJHip6xAY.', 'admin', 'Mumtaz jahan', '9163288495', NULL, 'active', '2026-04-09 07:42:26', '2026-04-09 07:42:26'),
(347, 1, NULL, '14042022', 'student', 'Mohammad Ambiya', '8240560680', 'BALLY2026005', 'active', '2026-04-10 05:41:28', '2026-05-07 08:33:13'),
(348, 1, NULL, '04092021', 'student', 'MD. FAIQ', '6289524332', 'BALLY2026003', 'active', '2026-04-10 05:44:46', '2026-05-07 08:27:43'),
(349, 1, NULL, '02122021', 'student', 'Khadija Ali', '8420768236', 'BALLY2026008', 'active', '2026-04-10 05:45:46', '2026-05-07 08:34:06'),
(350, 1, NULL, '10122022', 'student', 'MD Uzair Ali', '705982558', 'BALLY2026007', 'active', '2026-04-10 05:49:18', '2026-05-07 08:33:58'),
(351, 1, NULL, '12082022', 'student', 'MD. Taimur', '6289966864', 'BALLY2026002', 'active', '2026-04-10 05:49:56', '2026-05-07 08:27:31'),
(352, 1, NULL, '14112022', 'student', 'MD Aariz Shajeb', '8373882151', 'BALLY2026006', 'active', '2026-04-10 05:52:55', '2026-05-07 08:33:49'),
(353, 1, NULL, '24112021', 'student', 'Raza Hussain', '6290195166', 'BALLY2026015', 'active', '2026-04-10 05:56:29', '2026-05-07 09:23:04'),
(354, 1, NULL, '29112019', 'student', 'Md Arish', '9007814319', 'BALLY2026051', 'active', '2026-04-10 05:58:17', '2026-05-07 10:15:22'),
(355, 1, NULL, '15082021', 'student', 'Mohammed Shazan', '9007267963', 'BALLY2026016', 'active', '2026-04-10 06:00:08', '2026-05-07 09:23:14'),
(356, 1, NULL, '10102021', 'student', 'Irfan Alam', '9681613383', 'BALLY2026017', 'active', '2026-04-10 06:04:47', '2026-05-07 09:23:22'),
(357, 1, NULL, '10102019', 'student', 'Sanaya Khatoon', '8017178962', 'BALLY2026052', 'active', '2026-04-10 06:05:38', '2026-05-07 10:15:44'),
(358, 1, NULL, '06102021', 'student', 'Aaira Shadab', '7044900297', 'BALLY2026018', 'active', '2026-04-10 06:07:32', '2026-05-07 10:46:25'),
(359, 1, NULL, '15122020', 'student', 'Md  Koinaan Raza', '9331051827', 'BALLY2026053', 'active', '2026-04-10 06:11:15', '2026-05-07 10:33:08'),
(362, 1, NULL, '19012023', 'student', 'Arya Khan', '9903090214', 'BALLY2026001', 'active', '2026-04-10 06:12:22', '2026-05-07 08:27:17'),
(363, 1, NULL, '12092020', 'student', 'Hania Haris', '9051462904', 'BALLY2026054', 'active', '2026-04-10 06:16:39', '2026-05-07 10:33:21'),
(364, 1, NULL, '02032021', 'student', 'Fariya Parveen', '9875381690', 'BALLY2026019', 'active', '2026-04-10 06:17:03', '2026-05-07 10:47:05'),
(365, 1, NULL, '14112021', 'student', 'Raida Naaz', '9073198696', 'BALLY2026020', 'active', '2026-04-10 06:20:41', '2026-05-07 10:46:51'),
(366, 1, NULL, '02032021', 'student', 'Ruqaiya Sultan', '6289099050', 'BALLY2026055', 'active', '2026-04-10 06:24:42', '2026-05-07 10:33:32'),
(367, 1, NULL, '09122021', 'student', 'MD Rehan KKhan', '9073447091', 'BALLY2026021', 'active', '2026-04-10 06:25:28', '2026-05-07 10:47:40'),
(368, 1, NULL, '13122020', 'student', 'Azifa hussain', '8240044199', 'BALLY2026022', 'active', '2026-04-10 06:28:19', '2026-05-07 10:48:05'),
(369, 1, NULL, '01092020', 'student', 'Md. Shifan Ali Khan', '9162062270', 'BALLY2026056', 'active', '2026-04-10 06:30:07', '2026-05-07 10:33:45'),
(370, 1, NULL, '28122020', 'student', 'Shaifan Fahim', '8697323550', 'BALLY2026023', 'active', '2026-04-10 06:30:44', '2026-05-07 10:48:20'),
(371, 1, NULL, '25122019', 'student', 'Ayat Aslam ', '9798956432', 'BALLY2026057', 'active', '2026-04-10 06:32:22', '2026-05-07 10:33:57'),
(372, 1, NULL, '25032022', 'student', 'Amrik Kumar', '8443814485', 'BALLY2026024', 'active', '2026-04-10 06:33:43', '2026-05-07 10:48:30'),
(373, 1, NULL, '18122020', 'student', 'Ali Shanawar', '9330667069', 'BALLY2026058', 'active', '2026-04-10 06:37:07', '2026-05-07 10:34:11'),
(374, 1, NULL, '02012014', 'student', 'Anam Ali', '8240030314', 'BALLY2026522', 'active', '2026-04-10 06:37:37', '2026-04-14 07:45:24'),
(375, 1, NULL, '13032015', 'student', 'Zikra Niaz', '9681669275', 'BALLY2026521', 'active', '2026-04-10 06:40:56', '2026-04-14 07:45:08'),
(376, 1, NULL, '18022021', 'student', 'Zayan Ali', '8585833583', 'BALLY2026059', 'active', '2026-04-10 06:41:02', '2026-05-07 10:34:24'),
(377, 1, NULL, '30042014', 'student', 'Zainat Feroz', '8240524996', 'BALLY2026520', 'active', '2026-04-10 06:45:00', '2026-04-14 07:44:23'),
(378, 1, NULL, '07092020', 'student', 'Shad Alam', '8910192621', 'BALLY2026060', 'active', '2026-04-10 06:47:27', '2026-05-07 10:34:34'),
(379, 1, NULL, '29082016', 'student', 'Sk Burhan Uddin', '9163764933', 'BALLY2026518', 'active', '2026-04-10 06:49:03', '2026-04-14 07:44:00'),
(380, 1, NULL, '05052015', 'student', 'Shiggha Imran', '8100422741', 'BALLY2026517', 'active', '2026-04-10 06:52:33', '2026-04-14 07:43:49'),
(381, 1, NULL, '24082020', 'student', 'Sarthak Shaw', '6289712123', 'BALLY2026061', 'active', '2026-04-10 06:52:49', '2026-05-07 10:34:44'),
(382, 1, NULL, '16052020', 'student', 'Aira Waseem', '912380036', 'BALLY2026062', 'active', '2026-04-10 06:55:51', '2026-05-07 10:34:54'),
(383, 1, NULL, '13122013', 'student', 'Sidra Zahid', '9038142609', 'BALLY2026516', 'active', '2026-04-10 06:56:11', '2026-04-14 07:43:28'),
(384, 1, NULL, '12012015', 'student', 'Shafika Alam', '7980192673', 'BALLY2026515', 'active', '2026-04-10 06:59:26', '2026-04-14 07:43:07'),
(385, 1, NULL, '20082019', 'student', 'Aamir Ali ', '8340475639', 'BALLY2026063', 'active', '2026-04-10 07:00:14', '2026-05-07 10:35:04'),
(386, 1, NULL, '03082015', 'student', 'MD Zaki Alam', '9007729419', 'BALLY2026512', 'active', '2026-04-10 07:01:58', '2026-04-14 07:42:57'),
(387, 1, NULL, '13012017', 'student', 'Aizah Azed', '8013482550', 'BALLY2026301', 'active', '2026-04-10 07:05:10', '2026-04-18 06:48:57'),
(388, 1, NULL, '28072015', 'student', 'MD Tahmid Alam', '7003689447', 'BALLY2026510', 'active', '2026-04-10 07:09:57', '2026-04-14 07:42:42'),
(389, 1, NULL, '19112016', 'student', 'Alizay Zaman', '8777242342', 'BALLY2026302', 'active', '2026-04-10 07:11:22', '2026-04-18 06:49:05'),
(390, 1, NULL, '20062013', 'student', 'MD Shanawaz Ahmed', '8100425981', 'BALLY2026509', 'active', '2026-04-10 07:12:24', '2026-04-14 07:42:34'),
(391, 1, NULL, '21122015', 'student', 'MD Osman Khan', '9123008819', 'BALLY2026508', 'active', '2026-04-10 07:16:01', '2026-04-14 07:41:54'),
(392, 1, NULL, '29092015', 'student', 'Alfiya Salim', '8420100786', 'BALLY2026303', 'active', '2026-04-10 07:16:11', '2026-04-18 06:49:16'),
(393, 1, NULL, '02012016', 'student', 'MD Bilal', '7044277914', 'BALLY2026506', 'active', '2026-04-10 07:19:09', '2026-04-14 07:41:41'),
(394, 1, NULL, '15072016', 'student', 'Ayesha Firdous', '9163694198', 'BALLY2026304', 'active', '2026-04-10 07:19:37', '2026-04-18 06:49:24'),
(395, 1, NULL, '07082015', 'student', 'Hamsha Ahmed ', '8240018756', 'BALLY2026505', 'active', '2026-04-10 07:24:11', '2026-04-14 07:41:28'),
(396, 1, NULL, '06102015', 'student', 'Md. Subhan Khan', '9681989845', 'BALLY2026305', 'active', '2026-04-10 07:24:47', '2026-04-18 06:49:34'),
(397, 1, NULL, '19052015', 'student', 'Ayat Ilham', '9330188784', 'BALLY2026504', 'active', '2026-04-10 07:27:11', '2026-04-14 07:41:19'),
(398, 1, NULL, '21092015', 'student', 'Md Sahil', '9163886692', 'BALLY2026306', 'active', '2026-04-10 07:29:45', '2026-04-18 06:49:45'),
(399, 1, NULL, '27042016', 'student', 'Ayat Haque', '7439458558', 'BALLY2026503', 'active', '2026-04-10 07:30:48', '2026-04-14 07:41:10'),
(400, 1, NULL, '22112016', 'student', 'Md Zaid', '8240654299', 'BALLY2026307', 'active', '2026-04-10 07:32:51', '2026-04-18 06:49:53'),
(401, 1, NULL, '27082013', 'student', 'Sayed Aryan Alam', '8274955838', 'BALLY2026502', 'active', '2026-04-10 07:33:41', '2026-04-14 07:40:43'),
(402, 1, NULL, '29112014', 'student', 'Adnan Hussain', '91635832844', 'BALLY2026501', 'active', '2026-04-10 07:36:34', '2026-04-14 07:40:30'),
(403, 1, NULL, '02042017', 'student', 'Md. Shayam Alchtar', '9007346735', 'BALLY2026308', 'active', '2026-04-10 07:36:49', '2026-04-18 06:50:03'),
(404, 1, NULL, '16012016', 'student', 'Mahira Islam', '7980616326', 'BALLY2026310', 'active', '2026-04-10 08:23:52', '2026-04-18 06:50:26'),
(405, 1, NULL, '10102016', 'student', 'Md. Aman', '9748413806', 'BALLY2026311', 'active', '2026-04-10 08:27:07', '2026-04-18 06:50:34'),
(406, 1, NULL, '18082016', 'student', 'Sugra Khatoon', '6291805082', 'BALLY2026312', 'active', '2026-04-10 08:30:50', '2026-04-18 06:50:43'),
(407, 1, NULL, '$2b$10$e77Z0/BpOHoS/YHEXjrAsOKHhQVm/cBVohSiGbzdZngQDUKFKpxWW', 'student', 'Sk Fahim Ahamed', '6291214326', 'BALLY2026313', 'active', '2026-04-10 08:41:38', '2026-04-22 11:04:11'),
(408, 1, NULL, '02092016', 'student', 'Md Faisal', '9330824113', 'BALLY2026269', 'active', '2026-04-10 08:42:21', '2026-04-18 06:48:13'),
(409, 1, NULL, '10102014', 'student', 'Syed Zain Alam', '9339498961', 'BALLY2026314', 'active', '2026-04-10 08:44:45', '2026-04-18 06:51:05'),
(410, 1, NULL, '23022018', 'student', 'Md Zohaan Arsad', '6290015214', 'BALLY2026268', 'active', '2026-04-10 08:45:21', '2026-04-18 06:47:49'),
(411, 1, NULL, '15102017', 'student', 'Saaiq Ahmed', '7003689158', 'BALLY2026315', 'active', '2026-04-10 08:47:38', '2026-04-18 06:51:14'),
(412, 1, NULL, '24032017', 'student', 'Tahzim Khatoon', '6289981194', 'BALLY2026265', 'active', '2026-04-10 08:50:38', '2026-04-18 06:47:14'),
(413, 1, NULL, '14032016', 'student', 'Alisha Anwar', '8697218105', 'BALLY2026254', 'active', '2026-04-10 08:52:22', '2026-04-18 06:44:50'),
(414, 1, NULL, '26072017', 'student', 'Ayana Hashim', '9831883223', 'BALLY2026257', 'active', '2026-04-10 08:55:13', '2026-04-18 06:45:22'),
(415, 1, NULL, '22072015', 'student', 'Md. Faizan', '62899082537', 'BALLY2026317', 'active', '2026-04-10 08:56:05', '2026-04-18 06:52:03'),
(416, 1, NULL, '13062016', 'student', 'Md Azan', '7980608718', 'BALLY2026262', 'active', '2026-04-10 08:57:53', '2026-04-18 06:46:15'),
(417, 1, NULL, '25012018', 'student', 'Iqra Fatma', '7439591535', 'BALLY2026260', 'active', '2026-04-10 09:06:29', '2026-04-18 06:45:52'),
(418, 1, NULL, '22112017', 'student', 'Angelina Ghose', '9875375134', 'BALLY2026203', 'active', '2026-04-10 09:06:50', '2026-05-13 05:49:46'),
(419, 1, NULL, '19062017', 'student', 'Alex Das', '6290655798', 'BALLY2026253', 'active', '2026-04-10 09:09:16', '2026-04-18 07:06:49'),
(420, 1, NULL, '04042018', 'student', 'Maira Zeeshan', '7044144764', 'BALLY2026205', 'active', '2026-04-10 09:17:07', '2026-04-18 06:40:59'),
(421, 1, NULL, '22092018', 'student', 'Ahzaan Ahmed', '8337014425', 'BALLY2026152', 'active', '2026-04-10 09:25:03', '2026-04-18 06:54:10'),
(422, 1, NULL, '$2b$10$RZsDpvsQM5HKIpIabQHsiOkPq7MBWGLEHCba5Um/yTPkWijEKWX2a', 'student', 'Aliza Fatma', '7980025456', 'BALLY2026153', 'active', '2026-04-10 09:27:57', '2026-05-05 09:00:58'),
(423, 1, NULL, '04082017', 'student', 'Md. Ashfaque Alam', '7980332119', 'BALLY2026208', 'active', '2026-04-10 09:28:32', '2026-04-18 06:41:28'),
(424, 1, NULL, '12032019', 'student', 'Ashfiya Fatima', '9836058557', 'BALLY2026154', 'active', '2026-04-10 09:30:12', '2026-04-18 06:54:43'),
(425, 1, NULL, '06012020', 'student', 'Azhaan Khan', '7003629659', 'BALLY2026155', 'active', '2026-04-10 09:33:50', '2026-04-18 06:55:02'),
(426, 1, NULL, '17042018', 'student', 'Nobiya khatoon', '9830076482', 'BALLY2026210', 'active', '2026-04-10 09:35:54', '2026-04-18 06:42:00'),
(427, 1, NULL, '11122018', 'student', 'Dastaghir Hussain', '8240536290', 'BALLY2026156', 'active', '2026-04-10 09:36:27', '2026-04-18 06:55:29'),
(428, 1, NULL, '17012020', 'student', 'Mahad Hussain', '6291047708', 'BALLY2026157', 'active', '2026-04-10 09:39:14', '2026-04-18 06:55:38'),
(429, 1, NULL, '20012019', 'student', 'Rimsha Sagir', '7003519841', 'BALLY2026212', 'active', '2026-04-10 09:39:38', '2026-04-18 06:42:20'),
(430, 1, NULL, '08052018', 'student', 'Md Amir', '9038996760', 'BALLY2026159', 'active', '2026-04-10 09:42:51', '2026-04-18 06:55:55'),
(431, 1, NULL, '05112017', 'student', 'Sagufa khan', '8910614339', 'BALLY2026213', 'active', '2026-04-10 09:44:10', '2026-04-18 06:42:32'),
(432, 1, NULL, '12072019', 'student', 'Md Arsh Firoz', '6290805230', 'BALLY2026160', 'active', '2026-04-10 09:45:40', '2026-05-05 03:05:44'),
(434, 1, NULL, '19052018', 'student', 'Shabaan Alam', '7980290269', 'BALLY2026214', 'active', '2026-04-10 09:49:18', '2026-04-18 06:42:40'),
(435, 1, NULL, '29082020', 'student', 'Md Daniyal Haque', '9038507915', 'BALLY2026161', 'active', '2026-04-10 09:50:10', '2026-04-18 06:56:20'),
(436, 1, NULL, '13122018', 'student', 'Md Fatir anis', '9903700729', 'BALLY2026162', 'active', '2026-04-10 09:52:18', '2026-04-18 06:56:29'),
(437, 1, NULL, '13092017', 'student', 'Shabbir Ali', '8100199251', 'BALLY2026215', 'active', '2026-04-10 09:52:20', '2026-04-18 06:42:49'),
(438, 1, NULL, '25092018', 'student', 'Md Hafiz', '8229908451', 'BALLY2026163', 'active', '2026-04-10 09:54:33', '2026-04-18 06:56:42'),
(439, 1, NULL, '01052019', 'student', 'Sk Taimur ', '6290833495', 'BALLY2026216', 'active', '2026-04-10 09:55:55', '2026-04-18 06:42:57'),
(440, 1, NULL, '25092019', 'student', 'Md Hammad', '8240470365', 'BALLY2026164', 'active', '2026-04-10 09:58:23', '2026-05-05 03:06:00'),
(441, 1, NULL, '26032018', 'student', 'Zaara Feroz', '6290196168', 'BALLY2026217', 'active', '2026-04-10 09:59:16', '2026-04-18 06:43:09'),
(442, 1, NULL, '09082019', 'student', 'Rafia Shams', '9892263824', 'BALLY2026165', 'active', '2026-04-10 10:00:36', '2026-04-18 06:57:02'),
(443, 1, NULL, '10112019', 'student', 'Zainab Eram', '9007689476', 'BALLY2026218', 'active', '2026-04-10 10:03:06', '2026-04-18 06:43:17'),
(444, 1, NULL, '18042019', 'student', 'Shafaq Fatima', '9038986771', 'BALLY2026166', 'active', '2026-04-10 10:04:26', '2026-04-18 06:57:26'),
(445, 1, NULL, '25122019', 'student', 'Sk Anas', '8017034513', 'BALLY2026167', 'active', '2026-04-10 10:07:09', '2026-04-18 06:57:50'),
(451, 1, NULL, '30111899', 'student', 'Sk Asad Hossain', '9903956829', 'BALLY2026168', 'active', '2026-04-12 09:40:23', '2026-04-18 06:58:24'),
(3656, 1, 'rizwishadab16@gmail.com', '$2b$10$NVhFmVAEf5LV9m3Xty3vjeWk9h6GqrdkcniwU.9m7Z9gZxnzAFp3O', 'teacher', 'Md shadab Rizwi', '8240725162', NULL, 'active', '2026-04-13 07:14:08', '2026-04-13 07:14:08'),
(3657, 1, 'prishapreeti1608@gmail.com', '$2b$10$xFYwCY8gGjeClfPr3rkpfuGmgr6anUITakpcpwk.HVOKeu4SSPJmi', 'teacher', 'Preeti kumari Rajak', '9836366094', NULL, 'active', '2026-04-13 07:17:12', '2026-04-13 07:17:12'),
(3658, 1, 'rajataarora11@gmail.com', '$2b$10$NL.JEkufVrJX71UMnlMvoOyX4r8QslAKuNieDdMdabTsUOyz1z.EW', 'teacher', 'Rajat Arora', '9073903907', NULL, 'active', '2026-04-13 08:31:44', '2026-04-13 08:31:44'),
(3659, 1, NULL, '12022014', 'student', 'Md Zaid', '7278689336', 'BALLY2026601', 'active', '2026-04-13 10:41:53', '2026-04-14 07:31:41'),
(3660, 1, NULL, '13082014', 'student', 'Sharya Asif', '7003056735', 'BALLY2026602', 'active', '2026-04-13 10:53:14', '2026-04-14 07:31:50'),
(3661, 1, NULL, '11022014', 'student', 'Md Huzar', '7439387214', 'BALLY2026603', 'active', '2026-04-13 10:58:42', '2026-04-14 07:33:22'),
(3662, 1, NULL, '28112013', 'student', 'Sidra Nigar', '8100163622', 'BALLY2026604', 'active', '2026-04-13 11:04:18', '2026-04-14 07:33:32'),
(3663, 1, NULL, '07032014', 'student', 'Rifat Faihma', '7980616326', 'BALLY2026605', 'active', '2026-04-13 11:12:05', '2026-04-14 07:33:41'),
(3664, 1, NULL, '05052014', 'student', 'Irshad Ansari', '7003056735', 'BALLY2026606', 'active', '2026-04-13 11:16:24', '2026-04-14 07:33:57'),
(3665, 1, NULL, '15062013', 'student', 'Minhajul Haque', '6289011595', 'BALLY2026607', 'active', '2026-04-13 11:21:17', '2026-04-14 07:34:05'),
(3668, 1, NULL, '05032013', 'student', 'Zainab Feroz', '6290196168', 'BALLY2026608', 'active', '2026-04-13 11:30:18', '2026-04-14 07:34:17'),
(3669, 1, NULL, '09042014', 'student', 'Md Mehrab Hussan', '9163233275', 'BALLY2026609', 'active', '2026-04-13 11:36:51', '2026-04-14 07:34:26'),
(3670, 1, NULL, '21022013', 'student', 'Tawaab Ali', '9123354709', 'BALLY2026610', 'active', '2026-04-13 11:42:18', '2026-04-14 07:34:36'),
(3671, 1, NULL, '30111899', 'student', 'Md Akib', '6291144762', 'BALLY2026751', 'active', '2026-04-13 11:43:25', '2026-04-18 06:38:35'),
(3672, 1, NULL, '26072011', 'student', 'Iqra Ashfaque', '9163583284', 'BALLY2026752', 'active', '2026-04-13 11:46:32', '2026-04-18 06:38:26'),
(3673, 1, NULL, '24122013', 'student', 'Sibtain Nawaz', '9330976021', 'BALLY2026611', 'active', '2026-04-13 11:47:22', '2026-04-14 07:34:46'),
(3674, 1, NULL, '21052012', 'student', 'sarita parween', '7044375024', 'BALLY2026753', 'active', '2026-04-13 11:51:02', '2026-04-18 06:38:18'),
(3675, 1, NULL, '18122013', 'student', 'Ayan Jilani', '9681324281', 'BALLY2026612', 'active', '2026-04-13 11:52:02', '2026-04-14 07:34:57'),
(3676, 1, NULL, '15092012', 'student', 'MEHWISH FATMA', '9163132515', 'BALLY2026754', 'active', '2026-04-13 11:54:47', '2026-04-18 06:37:56'),
(3677, 1, NULL, '30082012', 'student', 'Afiya Parveen', '6291144762', 'BALLY2026613', 'active', '2026-04-13 11:55:44', '2026-04-14 07:35:10'),
(3678, 1, NULL, '29072012', 'student', 'HANZALA ALT', '9836395082', 'BALLY2026755', 'active', '2026-04-13 11:57:27', '2026-04-18 06:38:52'),
(3679, 1, NULL, '11052014', 'student', 'Md Farhan', '9883056159', 'BALLY2026614', 'active', '2026-04-13 11:59:40', '2026-04-14 07:35:24'),
(3680, 1, NULL, '01082012', 'student', 'MD. ANAS', '9330649237', 'BALLY2026756', 'active', '2026-04-13 11:59:47', '2026-05-07 11:15:57'),
(3684, 1, NULL, '03042014', 'student', 'Abu Sufiyan', '7439591535', 'BALLY2026615', 'active', '2026-04-13 12:05:23', '2026-04-14 07:35:33'),
(3685, 1, NULL, '25062013', 'student', 'Shayan Khan', '8777760180', 'BALLY2026616', 'active', '2026-04-13 12:55:38', '2026-04-14 07:35:48'),
(3687, 1, NULL, '12062014', 'student', 'Md Ashmir Akhtar', '9007346735', 'BALLY2026617', 'active', '2026-04-13 13:11:54', '2026-04-14 07:37:24'),
(3691, 1, NULL, '04092011', 'student', 'ALAIKA ALI', '8777230114', 'BALLY2026757', 'active', '2026-04-13 13:55:50', '2026-05-07 11:18:49'),
(3692, 1, NULL, '27052013', 'student', 'Kinza Fatma', '7439591535', 'BALLY2026618', 'active', '2026-04-13 13:56:09', '2026-04-14 07:37:40'),
(3693, 1, NULL, '12082011', 'student', 'MD. ARIF MUKHTAR', '7439915789', 'BALLY2026759', 'active', '2026-04-13 13:59:08', '2026-05-07 11:27:58'),
(3694, 1, NULL, '05042013', 'student', 'ALIYA FATHMA', '7044275197', 'BALLY2026758', 'active', '2026-04-13 14:02:29', '2026-05-07 11:25:01'),
(3695, 1, NULL, '09022014', 'student', 'Adiba Khatoon', '9088918885', 'BALLY2026619', 'active', '2026-04-13 14:03:08', '2026-04-14 07:37:54'),
(3698, 1, NULL, '22122011', 'student', 'MD. AZHAR', '9073148893', 'BALLY2026760', 'active', '2026-04-13 14:05:50', '2026-05-07 11:28:45'),
(3699, 1, NULL, '24052012', 'student', 'FALAK PARVEEN ', '9875381690', 'BALLY2026761', 'active', '2026-04-13 14:07:53', '2026-05-07 11:31:17'),
(3711, 1, NULL, '26072015', 'student', 'Shanvi Firdous', '7003781698', 'BALLY2026620', 'active', '2026-04-13 14:09:10', '2026-04-14 07:38:08'),
(3713, 1, NULL, '21102014', 'student', 'Sk Rayan Hossain', '9681372886', 'BALLY2026621', 'active', '2026-04-13 14:12:46', '2026-04-14 07:38:26'),
(3714, 1, NULL, '10082011', 'student', 'MD. FAIZAN SHAFIQUE', '7439541474', 'BALLY2026762', 'active', '2026-04-13 14:13:07', '2026-05-07 11:31:37'),
(3715, 1, NULL, '30092010', 'student', 'ALISHA KHATOON', '759594298', 'BALLY2026763', 'active', '2026-04-13 14:15:05', '2026-05-07 11:31:50'),
(3716, 1, NULL, '03082012', 'student', 'ROZA WASIM', '85838826265', 'BALLY2026764', 'active', '2026-04-13 14:16:59', '2026-05-07 11:32:05'),
(3717, 1, NULL, '24122014', 'student', 'Sehrish Fatma', '9163132515', 'BALLY2026622', 'active', '2026-04-13 14:17:12', '2026-04-14 07:38:35'),
(3718, 1, NULL, '22112012', 'student', 'MD FAUZAAN ALI', '8981505057', 'BALLY2026765', 'active', '2026-04-13 14:19:14', '2026-05-07 11:32:19'),
(3719, 1, NULL, '31102011', 'student', 'ALFIYA FIROZ', '7439584171', 'BALLY2026767', 'active', '2026-04-13 14:21:32', '2026-05-07 11:32:42'),
(3720, 1, NULL, '14122010', 'student', 'Safiya Sanawar', '6289028889', 'BALLY2026766', 'active', '2026-04-13 14:22:38', '2026-05-07 11:32:30'),
(3721, 1, NULL, '24122012', 'student', 'Zoya', '7980595650', 'BALLY2026768', 'active', '2026-04-13 14:28:41', '2026-05-07 11:33:06'),
(3722, 1, NULL, '15082012', 'student', 'Nishad Parveen', '8583891333', 'BALLY2026769', 'active', '2026-04-13 14:33:33', '2026-05-07 11:33:17'),
(3723, 1, NULL, '24102010', 'student', 'Muawiya Hassan Khan', '9674156950', 'BALLY2026770', 'active', '2026-04-13 14:37:17', '2026-05-07 11:33:59'),
(3724, 1, NULL, '17042012', 'student', 'Md Faizan Younus', '9007032534', 'BALLY2026701', 'active', '2026-04-14 06:18:05', '2026-04-14 06:28:06'),
(3725, 1, NULL, '$2b$10$eaGEYENNFtCQjuEUCwH2OelOyFeidk4M.KKhfI3TnNmq9wfGYg5ue', 'student', 'Yunus Khan', '8336051408', 'BALLY2026702', 'active', '2026-04-14 06:31:47', '2026-04-14 06:31:47'),
(3726, 1, NULL, '$2b$10$aiF9DgJ0k.KGugO3C.pTwubFoivTXPXNLyNkSici2vqF13IqW0VYO', 'student', 'Md Faizan', '9163694198', 'BALLY2026703', 'active', '2026-04-14 06:35:52', '2026-04-14 06:35:52'),
(3727, 1, NULL, '$2b$10$FMExWbNx76Fdcj123JjEledcvEk8t7oVuHNg43XeSsnQPSzcXFxoO', 'student', 'Sufiya Yasmin', '7439363660', 'BALLY2026704', 'active', '2026-04-14 06:39:46', '2026-04-14 06:39:46'),
(3728, 1, NULL, '$2b$10$N5zVHMUXWB4LKJiWd9sRIe.pNMkDB4CKwvJbxEuIEq0xKIB8lVjky', 'student', 'Md Rakib', '84439750409', 'BALLY2026705', 'active', '2026-04-14 06:44:49', '2026-04-14 06:44:49'),
(3730, 1, NULL, '$2b$10$Fb7eC76nAAoWnZl5jZJh2urlHltqQ6A1h3Do4qi1zXi.UZj5Vzeoi', 'student', 'Fashi-Ur-Rahman', '7980660536', 'BALLY2026706', 'active', '2026-04-14 06:49:41', '2026-04-14 06:49:41'),
(3731, 1, NULL, '12022014', 'student', 'Ayesha Shams', '9330712858', 'BALLY2026708', 'active', '2026-04-14 06:57:40', '2026-04-14 07:03:00'),
(3732, 1, NULL, '$2b$10$A2Uuo9MErD1UdjBnbtnli.Oiha6RrmqxO9f5k4k2AeqN/noSOhjYW', 'student', 'Aalnah Parveen', '98362241991', 'BALLY2026709', 'active', '2026-04-14 07:06:00', '2026-04-14 07:06:00'),
(3733, 1, NULL, '15012013', 'student', 'MD. BARKATUILHA', '9038322287', 'BALLY2026712', 'active', '2026-04-14 07:07:23', '2026-04-14 07:10:36'),
(3734, 1, NULL, '09082014', 'student', 'Md. Sufiyan Alam', '7980131987', 'BALLY2026710', 'active', '2026-04-14 07:09:58', '2026-04-14 07:10:52'),
(3735, 1, NULL, '$2b$10$FMB7TuLKfNeA0G3NZat6m.dN3Lv2gaq/6tZgiRUsfE.uNz32FHmnS', 'student', 'AYAN DAS', '6290655798', 'BALLY2026713', 'active', '2026-04-14 07:11:40', '2026-04-14 07:11:40'),
(3736, 1, NULL, '26082012', 'student', 'Danish Mussain', '8420830439', 'BALLY2026711', 'active', '2026-04-14 07:14:26', '2026-04-14 07:29:45'),
(3737, 1, NULL, '02062022', 'student', 'MD WAHBAN ALI', '7980579802', 'BALLY2026025', 'active', '2026-04-14 07:16:39', '2026-05-07 10:48:59'),
(3738, 1, NULL, '12052021', 'student', 'Arhaan Raja Khan', '8240083125', 'BALLY2026009', 'active', '2026-04-14 07:18:06', '2026-05-07 08:34:21'),
(3739, 1, NULL, '10012020', 'student', 'ARHAM RAJA KHAN', '6289671014', 'BALLY2026026', 'active', '2026-04-14 07:19:53', '2026-05-07 10:49:09'),
(3740, 1, NULL, '05072013', 'student', 'Md Ali-ul-Haque', '8961070650', 'BALLY2026707', 'active', '2026-04-14 07:21:46', '2026-05-07 11:24:32'),
(3741, 1, NULL, '20042024', 'student', 'Sk. Ibrahim', '6291405692', 'BALLY2026010', 'active', '2026-04-14 07:24:08', '2026-05-07 08:34:33'),
(3742, 1, NULL, '12032019', 'student', 'TAUFIQUE ALAM', '9433823790', 'BALLY2026169', 'active', '2026-04-14 07:28:07', '2026-05-10 12:41:00'),
(3745, 1, NULL, '09052015', 'student', 'Md Atmal Aslam', '9798956432', 'BALLY2026309', 'active', '2026-04-14 07:38:57', '2026-04-18 06:50:14'),
(3746, 1, NULL, '21052015', 'student', 'Ubada Akhter', '6204447827', 'BALLY2026511', 'active', '2026-04-14 07:44:48', '2026-04-14 07:46:07'),
(3747, 1, NULL, '21122017', 'student', 'Sanchita Shaw', '6289712123', 'BALLY2026316', 'active', '2026-04-14 08:32:58', '2026-04-18 06:51:54'),
(3748, 1, NULL, '30042017', 'student', 'Ifra Hussain', '8240044199', 'BALLY2026204', 'active', '2026-04-14 08:37:28', '2026-04-18 06:40:50'),
(3749, 1, NULL, '04082018', 'student', 'Maisha Fiza', '6291214326', 'BALLY2026206', 'active', '2026-04-14 08:45:59', '2026-04-18 06:41:10'),
(3750, 1, NULL, '$2b$10$rTNwVpq59QeXcxL9mwrDGeBULkv7jQLR20vcVhsYdWbm/pUav2876', 'student', 'Abdul Hasan', '6289981194', 'BALLY2026151', 'active', '2026-04-14 08:53:50', '2026-05-05 08:59:52'),
(3751, 1, NULL, '25022019', 'student', 'Md Afaan', '8240654299', 'BALLY2026207', 'active', '2026-04-14 08:59:07', '2026-04-18 06:41:19'),
(3752, 1, NULL, '31072017', 'student', 'Md Arsh', '7980985820', 'BALLY2026209', 'active', '2026-04-14 09:03:41', '2026-04-18 06:41:38'),
(3760, 1, NULL, '18042019', 'student', 'Md. Ariz Laskar', '9330824677', 'BALLY2026172', 'active', '2026-04-17 11:51:08', '2026-05-07 10:40:45'),
(3763, 1, NULL, '25092017', 'student', 'Sk. Arshad', '9903827202', 'BALLY2026171', 'active', '2026-04-17 12:20:55', '2026-05-07 10:40:35'),
(3764, 1, NULL, '17102018', 'student', 'Md Ali Iqbal', '7439010609', 'BALLY2026158', 'active', '2026-04-17 13:00:13', '2026-05-05 03:05:21'),
(3765, 1, NULL, '26032016', 'student', 'Md Hazma', '890247299', 'BALLY2026211', 'active', '2026-04-17 13:05:46', '2026-04-18 06:42:09'),
(3769, 1, NULL, '03022018', 'student', 'Afifa Noor', '7488656440', 'BALLY2026219', 'active', '2026-04-17 13:19:53', '2026-04-18 06:43:25'),
(3770, 1, NULL, '21122016', 'student', 'Shadin Nawar Azam', '8240650795', 'BALLY2026318', 'active', '2026-04-17 13:24:27', '2026-04-18 06:52:12'),
(3771, 1, NULL, '25122015', 'student', 'Anam', '6291482059', 'BALLY2026320', 'active', '2026-04-17 13:28:09', '2026-04-18 06:52:26'),
(3772, 1, NULL, '04022017', 'student', 'Anam Salam', '9903973991', 'BALLY2026252', 'active', '2026-04-18 07:06:10', '2026-04-27 05:51:02'),
(3774, 1, NULL, '25012018', 'student', 'Sumaira Kamal ', '7980488692', 'BALLY2026220', 'active', '2026-04-22 07:58:49', '2026-05-09 10:17:09'),
(3775, 1, NULL, '17042019', 'student', 'Abdus Shahan', '6291984235', 'BALLY2026170', 'active', '2026-05-05 04:14:46', '2026-05-07 10:40:17'),
(3778, 1, NULL, '$2b$10$p2HnC8OGqdKnGj5ElSrOwuufhsYczFfiXa9K8Y5xKnF2ZwbYE8EnO', 'student', 'Md Nawaz', NULL, 'BALLY2026507', 'active', '2026-05-06 10:23:18', '2026-05-07 11:23:25'),
(3779, 1, NULL, '30111899', 'student', ' Nabira Amir', '8240581878', 'BALLY2026513', 'active', '2026-05-06 10:26:20', '2026-05-07 11:18:16'),
(3780, 1, 'superadmin@school.erp', '$2b$10$iOfxj0nQ11Y4gG1t17VuserXxfoKI.02VYtiL6Wu93UTUVaxktQsu', 'superadmin', 'Super Admin', '9999999999', NULL, 'active', '2026-05-06 11:15:52', '2026-05-06 11:15:52'),
(3781, 5, 'abc@school.erp', '$2b$10$SKD.qa/CHFe0m6yoeh1rNuhPIwUL3ZIg8kZn3l3jLZca6IOafK6P.', 'admin', 'abcd Administrator', '4569871230', NULL, 'active', '2026-05-06 11:36:50', '2026-05-06 12:07:44'),
(3791, 3, NULL, '20052026', 'student', 'AScd ', 'Z', 'GORAB2026006', 'active', '2026-05-07 14:26:36', '2026-05-14 09:40:45'),
(3792, 1, NULL, '$2b$10$SJ6eAqJd19PELhGi7KsvD.xxeTE7B8wHysf62.42LwzuuKXuV0Ifu', 'student', 'Sk Moinuddin ', '8420768236', 'BALLY2026771', 'active', '2026-05-08 04:02:38', '2026-05-08 04:02:38'),
(3795, 1, NULL, '$2b$10$1uCA8cnMKbFA2VmQwrq1cuaeupGzZTX/C3eiRsSFPfCiHnTt6hgFq', 'student', 'Md Faiz Alam', '6291278508', 'BALLY2026004', 'active', '2026-05-08 04:50:08', '2026-05-08 04:50:08'),
(3796, 1, NULL, '27042017', 'student', 'Zubair Ahmed', '6289376780', 'BALLY2026222', 'active', '2026-05-09 09:54:55', '2026-05-13 05:50:40'),
(3797, 3, NULL, '$2b$10$iZc8ElJN986xCfkodKlNfOYtZE/aAAKzI5dxP4PEaV85Ixq61gVje', 'student', 'add', '', 'GORAB2026007', 'active', '2026-05-10 07:19:27', '2026-05-10 07:19:27'),
(3798, 3, 'saya266@gmail.com', '$2b$10$oWzu3dwO9CzcBIqUWCap/upF0KJM0VhcyAE0.OTIOU.ejZSDZF7aG', 'teacher', 'Sayantan Sinha Biswas', '08240083465', NULL, 'active', '2026-05-10 12:13:37', '2026-05-10 12:13:37'),
(3799, 1, NULL, '15122018', 'student', 'Areeeba Alam', '9831346708', 'BALLY2026202', 'active', '2026-05-10 12:59:31', '2026-05-13 05:50:16'),
(3800, 1, 'tanusreepaul872@gmail.com', '$2b$10$s8fcCRA.XDmooKC5IAF9uOOhLpwpDRo1zfYpQZi88aQ59N.rmktku', 'teacher', 'Tanusree Paul', '9831536354', NULL, 'active', '2026-05-11 06:53:15', '2026-05-11 06:53:15'),
(3804, 1, NULL, '07112018', 'student', 'Alisha Azad', '8013482550', 'BALLY2026201', 'active', '2026-05-13 05:38:27', '2026-05-13 05:50:25'),
(3805, 1, NULL, '$2b$10$C9dU88K.5DkHtvYJzBiIlOhpgm/ueb0ar4Ts0ejl0qiiCY0OC9dPK', 'student', 'Rahil Hussain', '9875447141', 'BALLY2026223', 'active', '2026-05-13 05:58:38', '2026-05-13 05:58:38'),
(3808, 6, 'sss@gmail.com', '$2b$10$XOeRiukXbmb1YakRokKIA.pmRJyvpEwqgPVAZwzgcFlI4k8xShQyi', 'admin', 'xyz Administrator', '0000000000', NULL, 'active', '2026-05-14 07:52:26', '2026-05-14 07:52:26'),
(3809, 3, 'mgtyrghi266@gmail.com', '$2b$10$HPvaKfvwmexLuuLTStKTHuv7FZRlhAS5j8w.zpXU/k0BJxZEDo6Gm', 'student', 'fdhgfdgh', '0934863336578698', 'GORAB2026008', 'active', '2026-05-14 08:07:36', '2026-05-14 08:26:37'),
(3810, 3, NULL, '$2b$10$ZM4poSK9BTUMGn9xkc/9Puw7URbDSkUpi5WeMakefL0iAmslqj0kW', 'student', 'aceer', '', 'GORAB2026009', 'inactive', '2026-05-14 08:29:49', '2026-05-14 10:26:10'),
(3811, 7, 'preet@gmail.com', '$2b$10$iEee8EKNxDUmcglMZF898OpYHw2N6INhZnBx5fqzqXrxbryKo87D2', 'admin', 'prit sir school  Administrator', '0000000000', NULL, 'active', '2026-05-14 09:16:27', '2026-05-14 09:16:27'),
(3812, 8, 'dfgfd@ethy.gfjt', '$2b$10$JIiSSuuXqZrqTgWwbwaA..vi7w6RAi/8CEqWD9JuvsBjh98NJ5Eta', 'admin', 'dgdgfhgfhg Administrator', '0000000000', NULL, 'active', '2026-05-14 09:17:21', '2026-05-14 09:17:21');

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

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `school_id`, `name`, `contact_person`, `phone`, `email`, `address`, `created_at`) VALUES
(1, 1, 'Learning Hub', 'SAHIL ANSARI', '6290808997', 'sa5575650@gmail.com', 'West Bengal', '2026-02-10 13:53:06');

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

--
-- Dumping data for table `visitor_approvals`
--

INSERT INTO `visitor_approvals` (`id`, `school_id`, `visitor_name`, `phone`, `whom_to_meet`, `purpose`, `visit_date`, `visit_time`, `status`, `check_in_time`, `check_out_time`, `notes`, `created_at`) VALUES
(1, 3, 'abcd', '56351', 'to principle', 'meeting', '2026-03-31', '10:30:00', 'approved', NULL, NULL, '', '2026-03-23 11:00:44');

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
  ADD KEY `created_at` (`created_at`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=225;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `class_notes`
--
ALTER TABLE `class_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `class_sections`
--
ALTER TABLE `class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=265;

--
-- AUTO_INCREMENT for table `class_streams`
--
ALTER TABLE `class_streams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `class_subjects`
--
ALTER TABLE `class_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=259;

--
-- AUTO_INCREMENT for table `combination_subjects`
--
ALTER TABLE `combination_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daywise_attendance_teachers`
--
ALTER TABLE `daywise_attendance_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `enquiries`
--
ALTER TABLE `enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `exam_terms`
--
ALTER TABLE `exam_terms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `fee_admission`
--
ALTER TABLE `fee_admission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `fee_column_types`
--
ALTER TABLE `fee_column_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `fee_column_values`
--
ALTER TABLE `fee_column_values`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `fee_records`
--
ALTER TABLE `fee_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=226;

--
-- AUTO_INCREMENT for table `fee_structures`
--
ALTER TABLE `fee_structures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `grievances`
--
ALTER TABLE `grievances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `lesson_plans`
--
ALTER TABLE `lesson_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lesson_plan_comments`
--
ALTER TABLE `lesson_plan_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `library_books`
--
ALTER TABLE `library_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `library_issued_books`
--
ALTER TABLE `library_issued_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `marksheet_templates`
--
ALTER TABLE `marksheet_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `marks_assignments`
--
ALTER TABLE `marks_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `non_teaching_staff`
--
ALTER TABLE `non_teaching_staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `online_study_videos`
--
ALTER TABLE `online_study_videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `school_settings`
--
ALTER TABLE `school_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `school_working_days`
--
ALTER TABLE `school_working_days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `store_bills`
--
ALTER TABLE `store_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `store_grievances`
--
ALTER TABLE `store_grievances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_inventory`
--
ALTER TABLE `store_inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `store_requisitions`
--
ALTER TABLE `store_requisitions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `store_transactions`
--
ALTER TABLE `store_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `streams`
--
ALTER TABLE `streams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `stream_combinations`
--
ALTER TABLE `stream_combinations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=514;

--
-- AUTO_INCREMENT for table `students_attendance`
--
ALTER TABLE `students_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=868;

--
-- AUTO_INCREMENT for table `student_applications`
--
ALTER TABLE `student_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `student_cards`
--
ALTER TABLE `student_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_grievances`
--
ALTER TABLE `student_grievances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_leaves`
--
ALTER TABLE `student_leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_marks`
--
ALTER TABLE `student_marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `student_requisition`
--
ALTER TABLE `student_requisition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `study_notes`
--
ALTER TABLE `study_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `study_playlists`
--
ALTER TABLE `study_playlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `syllabus`
--
ALTER TABLE `syllabus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `teachers_requisition`
--
ALTER TABLE `teachers_requisition`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `teacher_attendance`
--
ALTER TABLE `teacher_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `teacher_classes`
--
ALTER TABLE `teacher_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `teacher_grievance`
--
ALTER TABLE `teacher_grievance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `teacher_leaves`
--
ALTER TABLE `teacher_leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `teacher_payslips`
--
ALTER TABLE `teacher_payslips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tenders`
--
ALTER TABLE `tenders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `timetable`
--
ALTER TABLE `timetable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=369;

--
-- AUTO_INCREMENT for table `timetable_elective_students`
--
ALTER TABLE `timetable_elective_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `time_slots`
--
ALTER TABLE `time_slots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `transfer_certificates`
--
ALTER TABLE `transfer_certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transport_assignments`
--
ALTER TABLE `transport_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transport_drivers`
--
ALTER TABLE `transport_drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `transport_driver_attendance`
--
ALTER TABLE `transport_driver_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `transport_vehicles`
--
ALTER TABLE `transport_vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3813;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `visitor_approvals`
--
ALTER TABLE `visitor_approvals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
