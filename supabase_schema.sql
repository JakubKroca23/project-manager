-- Create projects table
create table public.projects (
  id text primary key, -- Raynet ID (Kód)
  name text not null, -- Předmět
  customer text, -- Klient
  manager text, -- Vlastník
  status text default 'Aktivní',
  deadline text,
  
  -- Date fields (stored as text or date, Raynet sends specific format)
  closed_at date,
  category text, 
  abra_order text,
  abra_project text,
  
  -- Delivery dates
  body_delivery date,
  customer_handover date,
  chassis_delivery date,
  
  production_status text,
  mounting_company text,
  body_setup text,
  serial_number text,
  
  quantity integer default 1,
  action_needed_by text default 'internal',
  note text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- Create policy to allow read access for authenticated users
create policy "Allow read access for authenticated users"
on public.projects
for select
to authenticated
using (true);

-- Create policy to allow all access for authenticated users (for now)
create policy "Allow all access for authenticated users"
on public.projects
for all
to authenticated
using (true)
with check (true);
