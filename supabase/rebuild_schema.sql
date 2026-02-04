-- DANGER: Ensure you have already run the clear_data.sql script or manually dropped existing tables.
-- This script creates the new schema for Projects, Production, and Services.

-- 1. CUSTOM TYPES (ENUMS)
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'development', 'production', 'completed', 'stopped');
    CREATE TYPE order_status AS ENUM ('new', 'fabrication', 'assembly', 'testing', 'done', 'planned');
    CREATE TYPE service_status AS ENUM ('scheduled', 'in_progress', 'waiting_parts', 'done', 'cancelled');
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Business Info
    client_name TEXT,
    zakazka_sro TEXT,
    op_crm TEXT,
    
    -- Technical Info
    manufacturer TEXT,
    chassis_type TEXT,
    sector TEXT,
    assembly_company TEXT,
    quantity INTEGER DEFAULT 1,
    
    -- Status & Progress
    status project_status DEFAULT 'planning',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Dates
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Metadata
    manager_id UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCTION ORDERS (Mandatory Project Link)
CREATE TABLE IF NOT EXISTS production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    status order_status DEFAULT 'new',
    priority priority_level DEFAULT 'medium',
    
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ, -- Deadline
    
    assigned_to UUID REFERENCES profiles(id),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    client_name TEXT,
    location TEXT,
    
    status service_status DEFAULT 'scheduled',
    service_date TIMESTAMPTZ,
    duration_hours NUMERIC,
    
    assigned_to UUID REFERENCES profiles(id),
    description TEXT, -- Description only as requested
    is_recurring BOOLEAN DEFAULT false, -- Requested recursive feature
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PROJECT HISTORY
CREATE TABLE IF NOT EXISTS project_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TIMELINE VIEW
CREATE OR REPLACE VIEW timeline_items AS
SELECT
    id,
    title,
    'project' AS type,
    status::text,
    start_date,
    end_date,
    created_by AS owner_id,
    NULL::UUID AS parent_id
FROM projects
UNION ALL
SELECT
    id,
    title,
    'production' AS type,
    status::text,
    start_date,
    end_date,
    assigned_to AS owner_id,
    project_id AS parent_id
FROM production_orders
UNION ALL
SELECT
    id,
    title,
    'service' AS type,
    status::text,
    service_date AS start_date,
    (service_date + (COALESCE(duration_hours, 1) || ' hours')::INTERVAL) AS end_date,
    assigned_to AS owner_id,
    NULL::UUID AS parent_id
FROM services;

-- 7. RLS POLICIES
DO $$ 
BEGIN
    -- Enable RLS
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;

    -- Drop existing to be safe
    DROP POLICY IF EXISTS "Authenticated users can all projects" ON projects;
    DROP POLICY IF EXISTS "Authenticated users can all orders" ON production_orders;
    DROP POLICY IF EXISTS "Authenticated users can all services" ON services;
    DROP POLICY IF EXISTS "Authenticated users can all history" ON project_history;

    -- Create broad policies for team usage
    CREATE POLICY "Authenticated users can all projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can all orders" ON production_orders FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can all services" ON services FOR ALL USING (auth.role() = 'authenticated');
    CREATE POLICY "Authenticated users can all history" ON project_history FOR ALL USING (auth.role() = 'authenticated');
END $$;
