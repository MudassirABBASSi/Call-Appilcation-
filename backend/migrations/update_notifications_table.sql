-- Update notifications table with expanded notification types
-- This migration adds new notification types and ensures optimal indexing

USE alburhan_classroom;

-- Check if notifications table exists and update it
DROP TABLE IF EXISTS notifications_backup;

-- Create backup if table exists
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications WHERE 1=0;

-- Drop existing table to recreate with new structure
DROP TABLE IF EXISTS notifications;

-- Create notifications table with comprehensive types
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  class_id INT,
  assignment_id INT,
  submission_id INT,
  message TEXT NOT NULL,
  notification_type ENUM(
    'general',
    'class_scheduled',
    'class_reminder',
    'class_cancelled',
    'enrollment_confirmation',
    'assignment_created',
    'assignment_submitted',
    'assignment_graded',
    'assignment_deadline',
    'attendance_marked',
    'new_message',
    'student_joined_call',
    'teacher_announcement'
  ) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scheduled_at DATETIME,
  sent_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_notification_type (notification_type),
  INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restore data from backup if it exists
INSERT INTO notifications (id, user_id, class_id, assignment_id, submission_id, message, notification_type, is_read, created_at, scheduled_at, sent_at)
SELECT id, user_id, class_id, assignment_id, submission_id, message, 
  CASE 
    WHEN notification_type IN ('general', 'class_scheduled', 'class_reminder', 'class_cancelled', 'enrollment_confirmation', 
                              'assignment_created', 'assignment_submitted', 'assignment_graded', 'assignment_deadline',
                              'attendance_marked', 'new_message', 'student_joined_call', 'teacher_announcement')
    THEN notification_type 
    ELSE 'general' 
  END as notification_type,
  is_read, created_at, scheduled_at, sent_at
FROM notifications_backup
WHERE EXISTS (SELECT 1 FROM notifications_backup LIMIT 1);

-- Drop backup table
DROP TABLE IF EXISTS notifications_backup;

-- Create a view for easy notification querying with related data
CREATE OR REPLACE VIEW notification_details AS
SELECT 
  n.id,
  n.user_id,
  u.name as user_name,
  u.role as user_role,
  n.class_id,
  c.name as class_name,
  n.assignment_id,
  n.submission_id,
  n.message,
  n.notification_type,
  n.is_read,
  n.created_at,
  n.scheduled_at,
  n.sent_at
FROM notifications n
INNER JOIN users u ON n.user_id = u.id
LEFT JOIN classes c ON n.class_id = c.id;

-- Add comments for documentation
ALTER TABLE notifications COMMENT = 'Stores user notifications for the LMS system';
