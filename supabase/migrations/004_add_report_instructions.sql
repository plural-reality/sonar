-- Add report_instructions column to sessions table
-- This column stores instructions that are only used during final report generation
ALTER TABLE sessions ADD COLUMN report_instructions TEXT;
