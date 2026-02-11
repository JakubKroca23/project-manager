-- Change abra_order and abra_project columns to TEXT to prevent time zone parsing errors
DO $$ 
BEGIN 
    -- Check and update abra_order
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'abra_order' AND data_type != 'text'
    ) THEN
        ALTER TABLE public.projects ALTER COLUMN abra_order TYPE text USING abra_order::text;
    END IF;

    -- Check and update abra_project
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'abra_project' AND data_type != 'text'
    ) THEN
        ALTER TABLE public.projects ALTER COLUMN abra_project TYPE text USING abra_project::text;
    END IF;
END $$;
