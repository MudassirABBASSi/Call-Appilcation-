USE alburhan_classroom;

-- Add assignment_id and submission_id columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS assignment_id INT NULL,
ADD COLUMN IF NOT EXISTS submission_id INT NULL,
ADD FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
ADD FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE;

-- Update notification_type ENUM to include assignment-related types
ALTER TABLE notifications 
MODIFY COLUMN notification_type ENUM(
  'class_reminder', 
  'enrollment_confirmation', 
  'general',
  'assignment_created',
  'assignment_submitted',
  'assignment_graded'
) DEFAULT 'general';

-- Add indexes for assignment and submission lookups
CREATE INDEX IF NOT EXISTS idx_assignment_id ON notifications(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submission_id ON notifications(submission_id);
