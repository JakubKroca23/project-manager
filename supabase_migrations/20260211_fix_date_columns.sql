-- Change date columns to TEXT to allow flexible input (e.g. ranges, notes)
-- Columns: deadline, closed_at, body_delivery, customer_handover, chassis_delivery

DO $$ 
BEGIN 
    -- deadline
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline' AND data_type != 'text') THEN
        ALTER TABLE public.projects ALTER COLUMN deadline TYPE text USING deadline::text;
    END IF;

    -- closed_at
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'closed_at' AND data_type != 'text') THEN
        ALTER TABLE public.projects ALTER COLUMN closed_at TYPE text USING closed_at::text;
    END IF;

    -- body_delivery
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'body_delivery' AND data_type != 'text') THEN
        ALTER TABLE public.projects ALTER COLUMN body_delivery TYPE text USING body_delivery::text;
    END IF;

    -- customer_handover
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'customer_handover' AND data_type != 'text') THEN
        ALTER TABLE public.projects ALTER COLUMN customer_handover TYPE text USING customer_handover::text;
    END IF;

    -- chassis_delivery
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'chassis_delivery' AND data_type != 'text') THEN
        ALTER TABLE public.projects ALTER COLUMN chassis_delivery TYPE text USING chassis_delivery::text;
    END IF;

END $$;
