-- Create a public profiles table to store user metadata and permissions
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  can_import boolean default false,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Admins can view and update all profiles
-- We check by email for the "fixed admin"
create policy "Admin manages all profiles"
  on public.profiles for all
  to authenticated
  using (
    auth.jwt() ->> 'email' = 'jakub.kroca@contsystem.cz'
  )
  with check (
    auth.jwt() ->> 'email' = 'jakub.kroca@contsystem.cz'
  );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, can_import)
  values (new.id, new.email, (new.email = 'jakub.kroca@contsystem.cz'));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Also insert current users if they don't exist
insert into public.profiles (id, email, can_import)
select id, email, (email = 'jakub.kroca@contsystem.cz')
from auth.users
on conflict (id) do nothing;
