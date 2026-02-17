-- Add body_type to projects table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
        AND column_name = 'body_type'
) THEN
ALTER TABLE public.projects
ADD COLUMN body_type text;
END IF;
END $$;