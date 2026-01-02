-- Migration: Remove difficulty columns from questions table
-- Date: 2026-01-02
-- Description: Removes difficulty_es and difficulty_en columns as the difficulty level feature is being removed

-- Drop the difficulty columns
ALTER TABLE questions 
DROP COLUMN IF EXISTS difficulty_es,
DROP COLUMN IF EXISTS difficulty_en;

-- Add comment to track the change
COMMENT ON TABLE questions IS 'Questions table - difficulty columns removed on 2026-01-02';
