-- Add manager_id column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id);
