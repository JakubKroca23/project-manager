-- Add updated_at to projects and a trigger to auto-update it
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'updated_at') THEN
        ALTER TABLE public.projects ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Create or replace the function to set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_projects') THEN
        CREATE TRIGGER set_updated_at_projects
        BEFORE UPDATE ON public.projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
