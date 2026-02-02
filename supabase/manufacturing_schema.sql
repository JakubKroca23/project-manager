-- 1. Katalog Příslušenství (Accessories)
CREATE TABLE IF NOT EXISTS accessories_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT, -- např. "Hydraulika", "Elektro", "Osvětlení", "Kabina"
    part_number TEXT, -- Číslo dílu
    price NUMERIC, -- Cena
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Výrobní Úkoly (Manufacturing Tasks)
-- Jednotlivé úkony na výrobní zakázce (např. "Montáž ruky", "Zapojení hydrauliky")
CREATE TABLE IF NOT EXISTS manufacturing_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES production_orders(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- Název úkolu
    description TEXT,
    status TEXT DEFAULT 'queue', -- queue (fronta), in_progress (v řešení), done (hotovo), check (kontrola)
    assigned_to UUID REFERENCES profiles(id), -- Kdo na tom dělá
    estimated_hours NUMERIC, -- Odhad času
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Materiál / Kusovník (Bill of Materials - BOM)
-- Seznam materiálu potřebného pro Projekt (nákupní seznam)
CREATE TABLE IF NOT EXISTS bom_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Název položky
    quantity NUMERIC DEFAULT 1,
    unit TEXT DEFAULT 'ks',
    status TEXT DEFAULT 'to_order', -- to_order (objednat), ordered (objednáno), in_stock (skladem/dodáno)
    supplier TEXT, -- Dodavatel
    order_reference TEXT, -- Číslo objednávky / odkaz
    is_custom BOOLEAN DEFAULT false, -- Vlastní položka vs katalogová
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies

DO $$ 
BEGIN
    -- Accessories Catalog
    ALTER TABLE accessories_catalog ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated users can all accessories_catalog" ON accessories_catalog;
    CREATE POLICY "Authenticated users can all accessories_catalog" ON accessories_catalog FOR ALL USING (auth.role() = 'authenticated');

    -- Manufacturing Tasks
    ALTER TABLE manufacturing_tasks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated users can all manufacturing_tasks" ON manufacturing_tasks;
    CREATE POLICY "Authenticated users can all manufacturing_tasks" ON manufacturing_tasks FOR ALL USING (auth.role() = 'authenticated');

    -- BOM Items
    ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated users can all bom_items" ON bom_items;
    CREATE POLICY "Authenticated users can all bom_items" ON bom_items FOR ALL USING (auth.role() = 'authenticated');
END $$;
