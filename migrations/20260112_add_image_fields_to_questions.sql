-- Migration: Add image URL field to questions table
-- Description: Adds image_url field to support diagrams and visual content
-- Created: 2026-01-12

-- Add image URL field (same image for all languages)
ALTER TABLE questions 
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment to document the change
COMMENT ON COLUMN questions.image_url IS 'URL of the image/diagram for the question (used for all languages)';

-- Update table comment
COMMENT ON TABLE questions IS 'Questions table - Added image URL support on 2026-01-12';
