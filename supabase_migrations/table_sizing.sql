-- Add column_sizing to user_table_settings table
alter table public.user_table_settings 
add column if not exists column_sizing jsonb default '{}';
