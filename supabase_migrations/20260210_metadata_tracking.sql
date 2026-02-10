-- Add last_modified_by to projects
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'last_modified_by') THEN
        ALTER TABLE public.projects ADD COLUMN last_modified_by text;
    END IF;
END $$;

-- Create app_metadata table for global system state
CREATE TABLE IF NOT EXISTS public.app_metadata (
    key text PRIMARY KEY,
    value jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on app_metadata
ALTER TABLE public.app_metadata ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read metadata
CREATE POLICY "Allow public read of metadata" ON public.app_metadata
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to update metadata (admins or those who can import)
CREATE POLICY "Allow authenticated update of metadata" ON public.app_metadata
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
