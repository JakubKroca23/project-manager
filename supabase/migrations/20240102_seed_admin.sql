-- Enable pgcrypto for password hashing
create extension if not exists "pgcrypto";

-- Insert admin user if not exists
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@admin.cz') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      new_user_id,
      'admin@admin.cz',
      crypt('admin', gen_salt('bf')), -- Hash the password 'admin'
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"System Admin","is_approved":true}',
      'authenticated',
      'authenticated'
    );
    
    -- Ensure the profile is created and has admin role
    -- The trigger on auth.users should handle profile creation, but we update it here to be sure about the role
    -- We wait a tiny bit or just update if exists (trigger fires synchronously usually)
    
    -- Note: Trigger logic relies on raw_user_meta_data, so handle_new_user() should have picked it up.
    -- But we force update just in case.
    
    UPDATE public.profiles 
    SET role = 'admin', is_approved = true 
    WHERE id = new_user_id;
    
  END IF;
END $$;
