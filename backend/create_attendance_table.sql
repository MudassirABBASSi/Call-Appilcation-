USE alburhan_classroom;

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('present', 'absent') NOT NULL DEFAULT 'absent',
  join_time DATETIME NOT NULL,
  leave_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (class_id, student_id)
);

-- Create index for faster queries
CREATE INDEX idx_class_id ON attendance(class_id);
CREATE INDEX idx_student_id ON attendance(student_id);
CREATE INDEX idx_join_time ON attendance(join_time);
