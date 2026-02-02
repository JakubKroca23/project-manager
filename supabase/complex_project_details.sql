-- 1. Tabulka pro vícenásobné nástavby
CREATE TABLE IF NOT EXISTS superstructures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    details TEXT,
    supplier TEXT, -- Kdo nástavbu dodává
    order_status TEXT DEFAULT 'pending', -- 'pending', 'ordered', 'delivered'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Katalog příslušenství pro našeptávač (master list)
CREATE TABLE IF NOT EXISTS accessory_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Příslušenství konkrétního projektu s volbami
CREATE TABLE IF NOT EXISTS project_accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    action_type TEXT CHECK (action_type IN ('manufacture', 'purchase', 'stock')),
    supplier TEXT, -- Kdo příslušenství dodává
    order_status TEXT DEFAULT 'pending', -- 'pending', 'ordered', 'delivered'
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Povolení RLS
ALTER TABLE superstructures ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessory_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_accessories ENABLE ROW LEVEL SECURITY;

-- RLS Politiky (zjednodušené pro přihlášené uživatele)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public select superstructures" ON superstructures;
    DROP POLICY IF EXISTS "Authenticated all superstructures" ON superstructures;
    CREATE POLICY "Public select superstructures" ON superstructures FOR SELECT USING (true);
    CREATE POLICY "Authenticated all superstructures" ON superstructures FOR ALL USING (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Public select accessory_catalog" ON accessory_catalog;
    DROP POLICY IF EXISTS "Authenticated all accessory_catalog" ON accessory_catalog;
    CREATE POLICY "Public select accessory_catalog" ON accessory_catalog FOR SELECT USING (true);
    CREATE POLICY "Authenticated all accessory_catalog" ON accessory_catalog FOR ALL USING (auth.role() = 'authenticated');

    DROP POLICY IF EXISTS "Public select project_accessories" ON project_accessories;
    DROP POLICY IF EXISTS "Authenticated all project_accessories" ON project_accessories;
    CREATE POLICY "Public select project_accessories" ON project_accessories FOR SELECT USING (true);
    CREATE POLICY "Authenticated all project_accessories" ON project_accessories FOR ALL USING (auth.role() = 'authenticated');
END $$;
