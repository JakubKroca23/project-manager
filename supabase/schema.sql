-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS
create table projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text default 'planning', -- planning, in_progress, completed, paused
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  client_name text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTION ORDERS (Výroba)
create table production_orders (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id), -- Vazba na projekt
  title text not null, -- Název zakázky (např. "Vozidlo 1")
  quantity integer default 1,
  status text default 'new', -- new, fabrication, assembly, testing, done
  priority text default 'medium',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  assigned_to uuid references profiles(id),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SERVICES (Servis)
create table services (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  client_name text,
  location text,
  status text default 'scheduled', -- scheduled, in_progress, waiting_parts, done
  service_date timestamp with time zone,
  duration_hours numeric,
  assigned_to uuid references profiles(id),
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Simple: Authenticated users can do everything for now)
alter table profiles enable row level security;
alter table projects enable row level security;
alter table production_orders enable row level security;
alter table services enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

create policy "Authenticated users can view all projects" on projects for select using ( auth.role() = 'authenticated' );
create policy "Authenticated users can insert projects" on projects for insert with check ( auth.role() = 'authenticated' );
create policy "Authenticated users can update projects" on projects for update using ( auth.role() = 'authenticated' );

create policy "Authenticated users can view all orders" on production_orders for select using ( auth.role() = 'authenticated' );
create policy "Authenticated users can insert orders" on production_orders for insert with check ( auth.role() = 'authenticated' );
create policy "Authenticated users can update orders" on production_orders for update using ( auth.role() = 'authenticated' );

create policy "Authenticated users can view all services" on services for select using ( auth.role() = 'authenticated' );
create policy "Authenticated users can insert services" on services for insert with check ( auth.role() = 'authenticated' );
create policy "Authenticated users can update services" on services for update using ( auth.role() = 'authenticated' );

-- TIMELINE VIEW (Polymorphic view for the Gantt Chart)
create or replace view timeline_items as
select
  id,
  title,
  'project' as type,
  status,
  start_date,
  end_date,
  created_by as owner_id,
  null as parent_id
from projects
union all
select
  id,
  title,
  'production' as type,
  status,
  start_date,
  end_date,
  assigned_to as owner_id,
  project_id as parent_id
from production_orders
union all
select
  id,
  title,
  'service' as type,
  status,
  service_date as start_date,
  (service_date + (duration_hours || ' hours')::interval) as end_date,
  assigned_to as owner_id,
  null as parent_id
from services;

-- Trigger to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
