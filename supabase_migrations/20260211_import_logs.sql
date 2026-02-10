-- Create import_logs table
create table if not exists public.import_logs (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    project_type text not null check (project_type in ('civil', 'military')),
    performed_by text default 'Neznámý',
    row_count integer default 0,
    source text default 'unknown',
    changes_summary jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.import_logs enable row level security;

-- Policies
create policy "Enable read access for all users" on public.import_logs for select using (true);
create policy "Enable insert access for authenticated users" on public.import_logs for insert with check (auth.role() = 'authenticated');
