import { createBrowserClient } from '@supabase/ssr';

// Add debug logging to help user troubleshoot environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing! Check .env.local');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
