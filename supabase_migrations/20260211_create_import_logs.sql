-- Create import_logs table
CREATE TABLE IF NOT EXISTS import_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_type TEXT NOT NULL CHECK (project_type IN ('civil', 'military')),
    performed_by TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    source TEXT NOT NULL,
    changes_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON import_logs
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON import_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
