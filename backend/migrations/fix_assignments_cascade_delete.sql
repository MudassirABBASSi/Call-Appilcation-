-- Fix assignments foreign key to use CASCADE DELETE
-- This ensures that when a class is deleted, all its assignments are also deleted

USE alburhan_classroom;

-- Drop the existing foreign key constraint
ALTER TABLE assignments 
DROP FOREIGN KEY assignments_ibfk_1;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE assignments 
ADD CONSTRAINT assignments_ibfk_1 
FOREIGN KEY (class_id) REFERENCES classes(id) 
ON DELETE CASCADE 
ON UPDATE NO ACTION;

-- Verify the change
SELECT 
  CONSTRAINT_NAME,
  DELETE_RULE,
  UPDATE_RULE
FROM 
  INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE 
  CONSTRAINT_NAME = 'assignments_ibfk_1'
  AND CONSTRAINT_SCHEMA = 'alburhan_classroom';
