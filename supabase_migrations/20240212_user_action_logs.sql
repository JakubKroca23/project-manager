-- Migration to add user action logs for profiles

-- 1. Create action logs table
create table if not exists public.user_action_logs (
    id uuid default gen_random_uuid() primary key,
    target_user_id uuid references auth.users(id),
    action_type text not null, -- 'role_change', 'permission_change', etc.
    old_value jsonb,
    new_value jsonb,
    performed_by uuid references auth.users(id),
    performed_at timestamptz default now()
);

-- 2. Create is_admin function (if not exists)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 3. RLS Policies
alter table public.user_action_logs enable row level security;

drop policy if exists "Only admins can view action logs" on public.user_action_logs;
create policy "Only admins can view action logs"
  on public.user_action_logs for select
  to authenticated
  using (public.is_admin());

-- 4. Trigger for logging profile changes
create or replace function public.log_profile_changes()
returns trigger as $$
begin
    -- Log role changes
    if (old.role is distinct from new.role) then
        insert into public.user_action_logs (target_user_id, action_type, old_value, new_value, performed_by)
        values (new.id, 'role_change', jsonb_build_object('role', old.role), jsonb_build_object('role', new.role), auth.uid());
    end if;
    
    -- Log permission changes (can_import)
    if (old.can_import is distinct from new.can_import) then
        insert into public.user_action_logs (target_user_id, action_type, old_value, new_value, performed_by)
        values (new.id, 'permission_change', jsonb_build_object('can_import', old.can_import), jsonb_build_object('can_import', new.can_import), auth.uid());
    end if;
    
    -- Log other permission changes
    if (old.permissions is distinct from new.permissions) then
        insert into public.user_action_logs (target_user_id, action_type, old_value, new_value, performed_by)
        values (new.id, 'granular_permissions_change', old.permissions, new.permissions, auth.uid());
    end if;

    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_updated_log on public.profiles;
create trigger on_profile_updated_log
    after update on public.profiles
    for each row
    execute procedure public.log_profile_changes();
