-- Migration to add project action logs for tracking everything
-- 1. Create project action logs table
create table if not exists public.project_action_logs (
    id uuid default gen_random_uuid() primary key,
    project_id text not null,
    action_type text not null, -- 'create', 'update', 'delete'
    old_value jsonb,
    new_value jsonb,
    performed_by uuid references auth.users(id),
    performed_at timestamptz default now()
);

-- 2. RLS Policies
alter table public.project_action_logs enable row level security;

drop policy if exists "Only admins can view project logs" on public.project_action_logs;
create policy "Only admins can view project logs"
  on public.project_action_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Trigger for logging project changes
create or replace function public.log_project_changes()
returns trigger as $$
declare
    current_user_id uuid;
begin
    current_user_id := auth.uid();
    
    if (TG_OP = 'INSERT') then
        insert into public.project_action_logs (project_id, action_type, new_value, performed_by)
        values (new.id, 'create', row_to_json(new)::jsonb, current_user_id);
        return new;
    elsif (TG_OP = 'UPDATE') then
        -- Log the whole row change for now (simplest "everything" approach)
        insert into public.project_action_logs (project_id, action_type, old_value, new_value, performed_by)
        values (new.id, 'update', row_to_json(old)::jsonb, row_to_json(new)::jsonb, current_user_id);
        return new;
    elsif (TG_OP = 'DELETE') then
        insert into public.project_action_logs (project_id, action_type, old_value, performed_by)
        values (old.id, 'delete', row_to_json(old)::jsonb, current_user_id);
        return old;
    end if;
    return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_project_updated_log on public.projects;
create trigger on_project_updated_log
    after insert or update or delete on public.projects
    for each row
    execute procedure public.log_project_changes();
