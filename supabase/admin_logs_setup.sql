-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    admin_id UUID REFERENCES auth.users(id),
    admin_email TEXT,
    action TEXT NOT NULL,
    target_user_id TEXT,
    target_user_email TEXT,
    details TEXT
);
-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
-- Policies for admin_logs
-- First, drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Admins can view all logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_logs;
-- Only admins can view logs
CREATE POLICY "Admins can view all logs" ON public.admin_logs FOR
SELECT USING (
        auth.jwt()->>'email' = 'jakub.kroca@contsystem.cz'
    );
-- Only admins can insert logs
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR
INSERT WITH CHECK (
        auth.jwt()->>'email' = 'jakub.kroca@contsystem.cz'
    );
-- Enable Realtime for admin_logs (Idempotent way)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'admin_logs'
) THEN ALTER PUBLICATION supabase_realtime
ADD TABLE public.admin_logs;
END IF;
END $$;
-- Archive/Cleanup: Delete logs older than 30 days
CREATE OR REPLACE FUNCTION public.delete_old_admin_logs() RETURNS void AS $$ BEGIN
DELETE FROM public.admin_logs
WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Comment: To automate this, schedule it in Supabase dashboard (SQL Editor) or via pg_cron:
-- SELECT cron.schedule('cleanup-admin-logs', '0 0 * * *', 'SELECT public.delete_old_admin_logs()');