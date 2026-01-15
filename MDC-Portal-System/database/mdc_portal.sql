-- MDC Portal System Database
-- Run this in phpMyAdmin

CREATE DATABASE IF NOT EXISTS mdc_portal;
USE mdc_portal;

-- Users table (for login)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level VARCHAR(20) NOT NULL,
    section VARCHAR(10) NOT NULL,
    contact VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    subjects VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    units INT NOT NULL,
    faculty_id VARCHAR(50),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    prelim DECIMAL(5,2) DEFAULT 0,
    midterm DECIMAL(5,2) DEFAULT 0,
    prefinal DECIMAL(5,2) DEFAULT 0,
    final DECIMAL(5,2) DEFAULT 0,
    academic_year VARCHAR(20) DEFAULT '2025-2026',
    semester VARCHAR(20) DEFAULT '1st',
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (subject_code) REFERENCES subjects(subject_code)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') DEFAULT 'Present',
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Insert default admin
INSERT INTO users (user_id, password, user_type) VALUES 
('admin', '$2y$10$YourHashedPasswordHere', 'admin');

-- Insert sample faculty
INSERT INTO faculty (faculty_id, full_name, department) VALUES
('FAC-001', 'Dr. Roberto Villanueva', 'Nursing'),
('FAC-002', 'Prof. Elena Ramos', 'Medical Technology'),
('FAC-003', 'Dr. Miguel Torres', 'Pharmacy');

-- Insert sample subjects
INSERT INTO subjects (subject_code, subject_name, units, faculty_id) VALUES
('NUR101', 'Fundamentals of Nursing', 5, 'FAC-001'),
('NUR201', 'Medical-Surgical Nursing', 6, 'FAC-001'),
('MT301', 'Clinical Chemistry', 5, 'FAC-002'),
('MT302', 'Hematology', 4, 'FAC-002'),
('PHAR101', 'Pharmacology', 5, 'FAC-003');

-- Insert sample students
INSERT INTO students (student_id, full_name, course, year_level, section, contact) VALUES
('STU-2024-001', 'Juan Dela Cruz', 'BS Nursing', '3rd Year', 'A', '09171234567'),
('STU-2024-002', 'Maria Santos', 'BS Nursing', '2nd Year', 'B', '09182345678'),
('STU-2024-003', 'Pedro Reyes', 'BS Medical Technology', '4th Year', 'A', '09193456789'),
('STU-2024-004', 'Ana Garcia', 'BS Pharmacy', '1st Year', 'A', '09204567890'),
('STU-2024-005', 'Jose Mendoza', 'BS Nursing', '3rd Year', 'A', '09215678901');

-- Insert users for students (unique passwords for each student)
-- Students must register to create their own password
-- Only admin account is pre-created
INSERT INTO users (user_id, password, user_type) VALUES
('admin', 'admin123', 'admin');

-- Note: Students will create their own accounts via Registration
-- Sample student data is in 'students' table but they need to register to login

-- Insert sample grades
INSERT INTO grades (student_id, subject_code, prelim, midterm, prefinal, final, academic_year, semester) VALUES
('STU-2024-001', 'MT301', 95.00, 95.00, 90.00, 90.00, '2025-2026', '1st'),
('STU-2024-001', 'NUR101', 100.00, 100.00, 95.00, 95.00, '2025-2026', '1st'),
('STU-2024-001', 'PHAR101', 90.00, 90.00, 85.00, 85.00, '2025-2026', '1st'),
('STU-2024-002', 'MT301', 95.00, 90.00, 90.00, 90.00, '2025-2026', '1st'),
('STU-2024-002', 'NUR101', 100.00, 95.00, 95.00, 95.00, '2025-2026', '1st'),
('STU-2024-003', 'PHAR101', 90.00, 95.00, 90.00, 90.00, '2025-2026', '1st'),
('STU-2024-003', 'MT302', 80.00, 90.00, 85.00, 85.00, '2025-2026', '1st'),
('STU-2024-004', 'NUR101', 70.00, 80.00, 80.00, 80.00, '2025-2026', '1st'),
('STU-2024-004', 'PHAR101', 80.00, 90.00, 80.00, 70.00, '2025-2026', '1st'),
('STU-2024-005', 'MT301', 90.00, 90.00, 85.00, 85.00, '2025-2026', '1st'),
('STU-2024-005', 'NUR101', 95.00, 95.00, 90.00, 90.00, '2025-2026', '1st'),
('STU-2024-003', 'MT301', 75.00, 80.00, 75.00, 75.00, '2025-2026', '1st'),
('STU-2024-003', 'NUR201', 70.00, 75.00, 70.00, 70.00, '2025-2026', '1st'),
('STU-2024-005', 'PHAR101', 80.00, 85.00, 80.00, 80.00, '2025-2026', '1st'),
('STU-2024-004', 'MT302', 80.00, 65.00, 80.00, 70.00, '2025-2026', '1st'),
('STU-2024-002', 'PHAR101', 90.00, 95.00, 90.00, 90.00, '2025-2026', '1st'),
('STU-2024-001', 'MT302', 75.00, 80.00, 75.00, 75.00, '2025-2026', '1st'),
('STU-2024-001', 'NUR201', 70.00, 75.00, 70.00, 70.00, '2025-2026', '1st'),
('STU-2024-002', 'MT302', 80.00, 85.00, 80.00, 80.00, '2025-2026', '1st'),
('STU-2024-003', 'NUR101', 95.00, 95.00, 90.00, 90.00, '2025-2026', '1st'),
('STU-2024-004', 'NUR201', 80.00, 80.00, 80.00, 80.00, '2025-2026', '1st'),
('STU-2024-005', 'MT302', 88.00, 92.00, 90.00, 91.00, '2025-2026', '1st'),
('STU-2024-002', 'NUR201', 82.00, 85.00, 83.00, 84.00, '2025-2026', '1st'),
('STU-2024-004', 'MT301', 78.00, 82.00, 80.00, 81.00, '2025-2026', '1st'),
('STU-2024-005', 'NUR201', 85.00, 88.00, 86.00, 87.00, '2025-2026', '1st');


-- ============================================
-- ADDITIONAL TABLES FOR COMPLETE REQUIREMENTS
-- ============================================

-- Activity Logs (System Administration)
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login Attempts (Security - Rate Limiting)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    success TINYINT(1) DEFAULT 0,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academic Events (Temporal)
CREATE TABLE IF NOT EXISTS academic_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type ENUM('holiday', 'academic', 'exam', 'event') DEFAULT 'event',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Schedules (Temporal)
CREATE TABLE IF NOT EXISTS exam_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    exam_type ENUM('Prelim', 'Midterm', 'Pre-Final', 'Final') NOT NULL,
    exam_date DATE NOT NULL,
    subject_code VARCHAR(20),
    status ENUM('upcoming', 'ongoing', 'completed') DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add remember_token to users table
ALTER TABLE users ADD COLUMN remember_token VARCHAR(64) NULL;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;

-- Insert sample academic events
INSERT INTO academic_events (event_date, title, type) VALUES
('2025-12-23', 'Christmas Break Starts', 'holiday'),
('2025-12-25', 'Christmas Day', 'holiday'),
('2025-12-30', 'Rizal Day', 'holiday'),
('2025-12-31', 'New Year''s Eve', 'holiday'),
('2026-01-01', 'New Year''s Day', 'holiday'),
('2026-01-06', 'Classes Resume', 'academic'),
('2026-01-15', 'Prelim Examinations', 'exam'),
('2026-02-14', 'Foundation Day', 'event'),
('2026-03-01', 'Midterm Examinations', 'exam'),
('2026-04-15', 'Pre-Final Examinations', 'exam'),
('2026-05-15', 'Final Examinations', 'exam');

-- Insert sample exam schedules
INSERT INTO exam_schedules (academic_year, semester, exam_type, exam_date) VALUES
('2025-2026', '1st', 'Prelim', '2026-01-15'),
('2025-2026', '1st', 'Midterm', '2026-03-01'),
('2025-2026', '1st', 'Pre-Final', '2026-04-15'),
('2025-2026', '1st', 'Final', '2026-05-15');


-- Clearance Table
CREATE TABLE IF NOT EXISTS clearance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status ENUM('not_started', 'pending', 'cleared') DEFAULT 'not_started',
    signed_by VARCHAR(100),
    date_cleared DATE,
    academic_year VARCHAR(20) DEFAULT '2025-2026',
    semester VARCHAR(20) DEFAULT '1st',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Insert sample clearance data
INSERT INTO clearance (student_id, department, status, signed_by, date_cleared) VALUES
('STU-2024-001', 'Library', 'cleared', 'Mrs. Santos', '2025-12-15'),
('STU-2024-001', 'Registrar', 'cleared', 'Mr. Reyes', '2025-12-16'),
('STU-2024-001', 'Cashier', 'pending', NULL, NULL),
('STU-2024-001', 'Student Affairs', 'cleared', 'Dr. Garcia', '2025-12-14'),
('STU-2024-001', 'Department Head', 'pending', NULL, NULL),
('STU-2024-001', 'Dean', 'not_started', NULL, NULL),
('STU-2024-001', 'Guidance Office', 'cleared', 'Ms. Cruz', '2025-12-17'),
('STU-2024-001', 'Laboratory', 'cleared', 'Mr. Torres', '2025-12-13');

-- Delete record for 2022-2204 paja JM
-- Disable FK checks to prevent #1451 error during deletion
SET FOREIGN_KEY_CHECKS=0;
DELETE FROM grades WHERE student_id = '2022-2204';
DELETE FROM attendance WHERE student_id = '2022-2204';
DELETE FROM clearance WHERE student_id = '2022-2204';
DELETE FROM students WHERE student_id = '2022-2204';
DELETE FROM users WHERE user_id = '2022-2204';
SET FOREIGN_KEY_CHECKS=1;
