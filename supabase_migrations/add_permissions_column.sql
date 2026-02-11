-- Add permissions column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"timeline": true, "projects": true, "service": true, "production": true, "purchasing": true}'::jsonb;