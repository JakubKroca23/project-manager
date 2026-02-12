-- Migration to add settings, role-based access and settings audit logs

-- 1. Create app_settings table (if not exists)
create table if not exists public.app_settings (
    id text primary key,
    settings jsonb not null default '{}'::jsonb,
    updated_at timestamptz default now(),
    updated_by uuid references auth.users(id)
);

-- 2. Add role column to profiles
alter table public.profiles add column if not exists role text default 'user';

-- 3. Update the fixed admin
update public.profiles 
set role = 'admin', can_import = true 
where email = 'jakub.kroca@contsystem.cz';

-- 4. Update handle_new_user trigger function to set role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, can_import)
  values (
    new.id, 
    new.email, 
    case when new.email = 'jakub.kroca@contsystem.cz' then 'admin' else 'user' end,
    (new.email = 'jakub.kroca@contsystem.cz')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Create settings logs table
create table if not exists public.app_settings_logs (
    id uuid default gen_random_uuid() primary key,
    settings_id text not null,
    old_settings jsonb,
    new_settings jsonb,
    changed_by uuid references auth.users(id),
    changed_at timestamptz default now()
);

-- 6. Trigger for logging app_settings changes
create or replace function public.log_app_settings_changes()
returns trigger as $$
begin
    insert into public.app_settings_logs (settings_id, old_settings, new_settings, changed_by)
    values (new.id, case when tg_op = 'UPDATE' then old.settings else null end, new.settings, auth.uid());
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_app_settings_updated on public.app_settings;
create trigger on_app_settings_updated
    after insert or update on public.app_settings
    for each row
    execute procedure public.log_app_settings_changes();

-- 7. RLS Policies
alter table public.app_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.app_settings_logs enable row level security;

-- App Settings View
drop policy if exists "Anyone authenticated can view settings" on public.app_settings;
create policy "Anyone authenticated can view settings"
  on public.app_settings for select
  to authenticated
  using (true);

-- App Settings Modify
drop policy if exists "Only admins can modify settings" on public.app_settings;
create policy "Only admins can modify settings"
  on public.app_settings for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Profiles Modify
drop policy if exists "Admin manages all profiles" on public.profiles;
create policy "Admin manages all profiles"
  on public.profiles for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Audit logs access
drop policy if exists "Only admins can view logs" on public.app_settings_logs;
create policy "Only admins can view logs"
  on public.app_settings_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 8. Insert default timeline settings
insert into public.app_settings (id, settings)
values ('timeline_config', '{
    "colors": {
        "phaseInitial": {"color": "#bae6fd", "opacity": 0.4, "label": "Zahájení"},
        "phaseMounting": {"color": "#4ade80", "opacity": 0.35, "label": "Příprava"},
        "phaseBufferYellow": {"color": "#facc15", "opacity": 0.5, "label": "Montáž"},
        "phaseBufferOrange": {"color": "#fb923c", "opacity": 0.55, "label": "Revize"},
        "phaseService": {"color": "#ce93d8", "opacity": 0.35, "label": "Servis"},
        "milestoneChassis": {"color": "#f97316", "opacity": 1, "label": "Podvozek", "icon": "Truck"},
        "milestoneBody": {"color": "#a855f7", "opacity": 1, "label": "Nástavba", "icon": "Hammer"},
        "milestoneHandover": {"color": "#3b82f6", "opacity": 1, "label": "Předání", "icon": "ThumbsUp"},
        "milestoneDeadline": {"color": "#ef4444", "opacity": 1, "label": "Deadline", "icon": "AlertTriangle"},
        "milestoneServiceStart": {"color": "#ef4444", "opacity": 1, "label": "Zahájení servisu", "icon": "Play"},
        "milestoneServiceEnd": {"color": "#b91c1c", "opacity": 1, "label": "Ukončení servisu", "icon": "Check"}
    },
    "outline": {"enabled": true, "width": 1, "color": "#000000", "opacity": 0.2}
}'::jsonb)
on conflict (id) do nothing;
