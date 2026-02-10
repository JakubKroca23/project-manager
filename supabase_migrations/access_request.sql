-- Add access request tracking to profiles table
alter table public.profiles 
add column if not exists access_requested boolean default false,
add column if not exists last_request_at timestamptz;

-- Policy to allow users to update their own access_requested status
create policy "Users can request access for themselves"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
