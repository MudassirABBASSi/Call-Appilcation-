USE alburhan_classroom;

-- Add days field to classes table (JSON format: ["Monday", "Tuesday", ...])
ALTER TABLE classes ADD COLUMN IF NOT EXISTS days JSON NULL DEFAULT NULL;

-- Note: days field will store an array of day names like ["Monday", "Wednesday", "Friday"]
-- This allows classes to be scheduled for specific days of the week
