-- Migration to cleanup all logging remnants that cause errors after table deletion
-- This script removes triggers and functions that try to write to project_action_logs, user_action_logs, etc.
-- 1. Cleanup Project Logging
DROP TRIGGER IF EXISTS on_project_updated_log ON public.projects;
DROP FUNCTION IF EXISTS public.log_project_changes();
-- 2. Cleanup Profile Logging (Prevention of future errors)
DROP TRIGGER IF EXISTS on_profile_updated_log ON public.profiles;
DROP FUNCTION IF EXISTS public.log_profile_changes();
-- 3. Cleanup App Settings Logging (Prevention of future errors)
DROP TRIGGER IF EXISTS on_app_settings_updated ON public.app_settings;
DROP FUNCTION IF EXISTS public.log_app_settings_changes();
-- 4. Cleanup Import Logs (If needed, although triggers were likely not used here)
-- DROP TABLE IF EXISTS public.import_logs; 
-- Note: These tables were likely already deleted by the user, 
-- but we ensure the triggers don't look for them anymore.