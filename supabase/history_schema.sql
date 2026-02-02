-- Tabulka pro historii změn projektu
CREATE TABLE IF NOT EXISTS project_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    -- user_id může být NULL, pokud akci provede systém, ale chceme ho logovat
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'superstructure_added', 'accessory_removed' atd.
    details JSONB, -- Ukládáme strukturovaná data o změně (např. staré vs nové hodnoty)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Povolení RLS
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;

-- Politikiy
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated select project_history" ON project_history;
    DROP POLICY IF EXISTS "Authenticated insert project_history" ON project_history;
    
    -- Každý přihlášený může vidět historii (nebo jen pro své projekty, tady dáme open pro team)
    CREATE POLICY "Authenticated select project_history" ON project_history FOR SELECT USING (auth.role() = 'authenticated');
    
    -- Každý přihlášený může zapisovat do historie
    CREATE POLICY "Authenticated insert project_history" ON project_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
END $$;
