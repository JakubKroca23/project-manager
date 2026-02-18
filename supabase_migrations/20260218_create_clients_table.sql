-- Create clients table for storing distinct client names
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.clients enable row level security;

-- Policies
create policy "Anyone can read clients"
  on public.clients for select
  to authenticated
  using (true);

create policy "Authenticated can insert clients"
  on public.clients for insert
  to authenticated
  with check (true);
