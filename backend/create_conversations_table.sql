-- Create conversations table for storing teacher-student conversation pairs
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_conversation (teacher_id, student_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_student_id (student_id),
  INDEX idx_created_at (created_at)
);

-- Alter messages table to add conversation_id if it doesn't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id INT DEFAULT NULL,
ADD FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index on conversation_id for fast message retrieval
ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_conversation_id (conversation_id);

-- Create index on conversation_id with sent_at for sorted retrieval
ALTER TABLE messages ADD INDEX IF NOT EXISTS idx_conversation_sent_at (conversation_id, sent_at);

-- Alter messages table to make is_read TINYINT for consistency (optional, if not already correct)
-- This helps with storage optimization
ALTER TABLE messages MODIFY COLUMN is_read TINYINT DEFAULT 0;
