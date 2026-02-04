-- Obnova View pro Timeline
-- Spusťte tento script v Supabase Dashboard -> SQL Editor

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
