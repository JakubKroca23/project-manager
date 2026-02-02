-- 1. Tabulka Klientů (CRM)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- Název firmy / Jméno
    billing_address TEXT,
    delivery_address TEXT,
    ico TEXT,
    dic TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Katalog Nástaveb (pro našeptávač a správu typů)
CREATE TABLE IF NOT EXISTS superstructure_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL UNIQUE, -- Typ nástavby (např. CAS 20)
    manufacturer TEXT, -- Výrobce nástavby
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Rozšíření tabulky Projects o CRM pole
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS op_crm TEXT,
    ADD COLUMN IF NOT EXISTS sector TEXT, -- Sektor (např. Hasiči, Technické služby...)
    ADD COLUMN IF NOT EXISTS billing_company TEXT, -- Fakturační firma (pokud se liší od klienta nebo jen textová verze)
    ADD COLUMN IF NOT EXISTS delivery_address TEXT,
    ADD COLUMN IF NOT EXISTS requested_action TEXT, -- Požadovaná akci
    ADD COLUMN IF NOT EXISTS assembly_company TEXT, -- Montážní firma
    ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0, -- % Dokončeno
    ADD COLUMN IF NOT EXISTS op_opv_sro TEXT,
    ADD COLUMN IF NOT EXISTS op_group_zakaznik TEXT,
    ADD COLUMN IF NOT EXISTS ov_group_sro TEXT,
    ADD COLUMN IF NOT EXISTS zakazka_sro TEXT;

-- 4. RLS Politiky
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE superstructure_catalog ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Clients
    DROP POLICY IF EXISTS "Authenticated users can select clients" ON clients;
    DROP POLICY IF EXISTS "Authenticated users can insert clients" ON clients;
    DROP POLICY IF EXISTS "Authenticated users can update clients" ON clients;
    
    CREATE POLICY "Authenticated users can select clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can insert clients" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can update clients" ON clients FOR UPDATE USING (auth.role() = 'authenticated');

    -- Superstructure Catalog
    DROP POLICY IF EXISTS "Authenticated users can select superstructure_catalog" ON superstructure_catalog;
    DROP POLICY IF EXISTS "Authenticated users can insert superstructure_catalog" ON superstructure_catalog;
    
    CREATE POLICY "Authenticated users can select superstructure_catalog" ON superstructure_catalog FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can insert superstructure_catalog" ON superstructure_catalog FOR INSERT WITH CHECK (auth.role() = 'authenticated');
END $$;
