-- Add new fields to users table for student management
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS course_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS teacher_id INT;

-- Add foreign key constraint if it doesn't exist
ALTER TABLE users ADD CONSTRAINT fk_teacher_id 
FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL;

-- Verify the changes
DESCRIBE users;
