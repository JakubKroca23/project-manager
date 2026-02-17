-- Add parent_id to projects table for hierarchy
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
        AND column_name = 'parent_id'
) THEN
ALTER TABLE public.projects
ADD COLUMN parent_id text REFERENCES public.projects(id);
-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON public.projects(parent_id);
END IF;
END $$;
-- Update RLS policies if necessary (usually standard select/insert works if they have access to projects)