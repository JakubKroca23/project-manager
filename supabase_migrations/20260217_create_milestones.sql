-- Create project_milestones table
create table public.project_milestones (
  id uuid default gen_random_uuid() primary key,
  project_id text references public.projects(id) on delete cascade not null,
  name text not null,
  date date not null,
  status text default 'pending',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.project_milestones enable row level security;

-- Create policies
create policy "Allow read access for authenticated users" on public.project_milestones
  for select to authenticated using (true);

create policy "Allow all access for authenticated users" on public.project_milestones
  for all to authenticated using (true) with check (true);

-- Index for performance
create index project_milestones_project_id_idx on public.project_milestones(project_id);
