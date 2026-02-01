-- Create a table for public profiles using Supabase Auth
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('admin', 'user')),
  is_approved boolean default false,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create workspaces table
create table workspaces (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  logo_url text
);

alter table workspaces enable row level security;

-- Create workspace members
create table workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, user_id)
);

alter table workspace_members enable row level security;

-- Create Projects table
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  workspace_id uuid references workspaces on delete cascade not null,
  name text not null,
  description text,
  status text default 'planning' check (status in ('planning', 'active', 'completed', 'on_hold')),
  start_date date,
  end_date date,
  color text default '#ef4444' -- Industrial Red
);

alter table projects enable row level security;

-- Create Tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  start_date timestamp with time zone,
  due_date timestamp with time zone,
  assignee_id uuid references profiles(id) on delete set null,
  position integer
);

alter table tasks enable row level security;

-- Triggers for Profile Handling
-- This triggers when a new user signs up via Supabase Auth
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, is_approved)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'user',
    (new.raw_user_meta_data->>'is_approved')::boolean
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Basic RLS Policies (simplified for MVP)
-- In production, these should check workspace_members table

create policy "Authenticated users can view workspaces they belong to" on workspaces
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspaces.id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Admins can create workspaces" on workspaces
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Projects policies
create policy "Users can view projects in their workspaces" on projects
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Members can create projects" on projects
  for insert with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = projects.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );
