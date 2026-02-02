-- 1. Povolit mazání projektů pro přihlášené uživatele
CREATE POLICY "Authenticated users can delete projects" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Oprava cizího klíče v production_orders (přidání ON DELETE CASCADE)
-- Nejdřív musíme zjistit název constraintu, ale protože ho generuje Postgres, zkusíme ho dropnout odhadem nebo genericky
-- V Supabase/Postgres je to často "production_orders_project_id_fkey"
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'production_orders_project_id_fkey' AND table_name = 'production_orders') THEN
        ALTER TABLE production_orders DROP CONSTRAINT production_orders_project_id_fkey;
    END IF;
END $$;

-- Přidat constraint znovu s CASCADE
ALTER TABLE production_orders
    ADD CONSTRAINT production_orders_project_id_fkey
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE;

-- 3. Povolit mazání (nebo ALL) pro production_orders (aby šly mazat i přímo, pokud je potřeba)
CREATE POLICY "Authenticated users can delete production_orders" ON production_orders FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Povolit mazání (nebo ALL) pro services (pokud např. bude vazba v budoucnu nebo pro úklid)
CREATE POLICY "Authenticated users can delete services" ON services FOR DELETE USING (auth.role() = 'authenticated');
