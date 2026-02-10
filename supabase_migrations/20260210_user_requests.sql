-- Create a table for public requests (access and password reset)
-- This allows unauthenticated users to send requests without needing a profile/session
CREATE TABLE IF NOT EXISTS public.user_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    request_type text NOT NULL CHECK (request_type IN ('access', 'password_reset')),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.user_requests ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (including anonymous) to insert requests
-- We don't allow select/update for anonymous for security (email harvesting etc.)
CREATE POLICY "Anyone can submit requests" ON public.user_requests
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Only admins (Jakub) can see and manage requests
CREATE POLICY "Admins can manage requests" ON public.user_requests
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'jakub.kroca@contsystem.cz')
    WITH CHECK (auth.jwt() ->> 'email' = 'jakub.kroca@contsystem.cz');

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_requests_email ON public.user_requests(email);
CREATE INDEX IF NOT EXISTS idx_user_requests_status ON public.user_requests(status);
