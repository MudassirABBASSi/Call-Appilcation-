USE alburhan_classroom;

ALTER TABLE classes ADD COLUMN IF NOT EXISTS start_time DATETIME;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_time DATETIME;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS enrollments (id INT AUTO_INCREMENT PRIMARY KEY, class_id INT NOT NULL, student_id INT NOT NULL, enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE, FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE KEY unique_enrollment (class_id, student_id), INDEX idx_student_id (student_id), INDEX idx_class_id (class_id));

CREATE TABLE IF NOT EXISTS notifications (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, class_id INT, message TEXT NOT NULL, notification_type ENUM('class_reminder', 'enrollment_confirmation', 'general') DEFAULT 'general', is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, scheduled_at DATETIME, sent_at DATETIME, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL, INDEX idx_user_id (user_id), INDEX idx_is_read (is_read), INDEX idx_scheduled_at (scheduled_at));