-- Create user_table_settings table for persisting per-user table preferences
create table public.user_table_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  table_id text not null,
  column_order text[] default '{}',
  column_visibility jsonb default '{}',
  sorting jsonb default '[]',
  updated_at timestamptz default now(),
  unique(user_id, table_id)
);

-- Enable RLS
alter table public.user_table_settings enable row level security;

-- Users can only read/write their own settings
create policy "Users manage own settings"
  on public.user_table_settings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
