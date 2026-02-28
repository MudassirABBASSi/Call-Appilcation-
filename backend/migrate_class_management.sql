-- Alburhan Classroom - Class Management System Migration
-- This file adds class management, enrollments, and notification features

USE alburhan_classroom;

-- Step 1: Modify classes table to add timing and status
ALTER TABLE classes 
ADD COLUMN start_time DATETIME NULL AFTER date,
ADD COLUMN end_time DATETIME NULL AFTER start_time,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER end_time;

-- Step 2: Create enrollments table for student-class assignments
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (class_id, student_id),
  INDEX idx_student (student_id),
  INDEX idx_class (class_id)
);

-- Step 3: Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'class_reminder',
  related_class_id INT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
);

-- Step 4: Ensure users table has phone, course_name, teacher_id (if not already present)
-- This is safer using information_schema check
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS course_name VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS teacher_id INT NULL;

-- Add foreign key for teacher_id if it doesn't exist
ALTER TABLE users 
ADD CONSTRAINT fk_teacher_id FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 5: Create class_students table for alternative enrollment tracking (if needed for backwards compatibility)
CREATE TABLE IF NOT EXISTS class_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_class_student (class_id, student_id)
);

-- Step 6: Create class schedule table for recurring classes (optional feature)
CREATE TABLE IF NOT EXISTS class_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Step 7: Create notification schedule log (to prevent duplicate notifications)
CREATE TABLE IF NOT EXISTS notification_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  user_id INT NOT NULL,
  notify_at DATETIME NOT NULL,
  minutes_before INT NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_schedule (class_id, user_id, minutes_before),
  INDEX idx_notify_at (notify_at),
  INDEX idx_sent (is_sent)
);

COMMIT;
