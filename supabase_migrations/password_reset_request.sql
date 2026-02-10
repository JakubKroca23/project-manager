-- Add password reset request tracking to profiles table
alter table public.profiles 
add column if not exists password_reset_requested boolean default false;
