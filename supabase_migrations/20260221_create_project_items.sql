-- Create project_items table for procurement tracking
CREATE TABLE IF NOT EXISTS public.project_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Příslušenství', -- Podvozek, Nástavba, Příslušenství, Smart
    status TEXT DEFAULT 'K objednání', -- K objednání, Objednáno, Dodáno
    source TEXT DEFAULT 'Samostatně', -- Samostatně, S podvozkem, S nástavbou
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_items' AND policyname = 'Allow all access for authenticated users'
    ) THEN
        CREATE POLICY "Allow all access for authenticated users" ON public.project_items 
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Add updated_at trigger
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_project_items'
    ) THEN
        CREATE TRIGGER set_timestamp_project_items
        BEFORE UPDATE ON public.project_items
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
