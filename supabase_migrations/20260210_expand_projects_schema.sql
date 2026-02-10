-- Add project_type and custom_fields to projects table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_type') THEN
        ALTER TABLE public.projects ADD COLUMN project_type text DEFAULT 'civil';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'custom_fields') THEN
        ALTER TABLE public.projects ADD COLUMN custom_fields jsonb DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Update existing projects to be 'civil' if not set
UPDATE public.projects SET project_type = 'civil' WHERE project_type IS NULL;
