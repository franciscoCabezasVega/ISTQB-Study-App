-- Migration: Update topic names to match official ISTQB syllabus
-- Description: Updates topic names in questions and user_progress tables to reflect official ISTQB nomenclature
-- Created: 2025-12-27

BEGIN;

-- Update questions table
-- Test Techniques -> Test Analysis and Design
UPDATE questions
SET topic = 'Test Analysis and Design'
WHERE topic = 'Test Techniques';

-- Test Management -> Managing the Test Activities
UPDATE questions
SET topic = 'Managing the Test Activities'
WHERE topic = 'Test Management';

-- Tool Support for Testing -> Test Tools
UPDATE questions
SET topic = 'Test Tools'
WHERE topic = 'Tool Support for Testing';

-- Update user_progress table
-- Test Techniques -> Test Analysis and Design
UPDATE user_progress
SET topic = 'Test Analysis and Design'
WHERE topic = 'Test Techniques';

-- Test Management -> Managing the Test Activities
UPDATE user_progress
SET topic = 'Managing the Test Activities'
WHERE topic = 'Test Management';

-- Tool Support for Testing -> Test Tools
UPDATE user_progress
SET topic = 'Test Tools'
WHERE topic = 'Tool Support for Testing';

-- Verify the changes
DO $$
DECLARE
  question_count INTEGER;
  progress_count INTEGER;
BEGIN
  -- Count questions with new topic names
  SELECT COUNT(*) INTO question_count
  FROM questions
  WHERE topic IN ('Test Analysis and Design', 'Managing the Test Activities', 'Test Tools');
  
  -- Count progress records with new topic names
  SELECT COUNT(*) INTO progress_count
  FROM user_progress
  WHERE topic IN ('Test Analysis and Design', 'Managing the Test Activities', 'Test Tools');
  
  RAISE NOTICE 'Updated % question(s) to new topic names', question_count;
  RAISE NOTICE 'Updated % progress record(s) to new topic names', progress_count;
END $$;

COMMIT;

-- Add comment to document the change
COMMENT ON TABLE questions IS 'Questions table - Topic names updated to official ISTQB syllabus on 2025-12-27';
COMMENT ON TABLE user_progress IS 'User progress table - Topic names updated to official ISTQB syllabus on 2025-12-27';
