
-- Create a demo admin user for testing
-- First, we need to insert a user in the admin_users table with the demo credentials
-- Note: This uses a placeholder user_id that should be replaced with an actual auth.user.id in production

INSERT INTO public.admin_users (
  user_id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  gen_random_uuid(), -- Temporary placeholder - in production this should be a real auth.user.id
  'admin@demo.com',
  'Demo Admin',
  'super_admin',
  true
);

-- Also create a profile entry for consistency
INSERT INTO public.profiles (
  user_id,
  email,
  full_name,
  user_type
) VALUES (
  (SELECT user_id FROM admin_users WHERE email = 'admin@demo.com'),
  'admin@demo.com',
  'Demo Admin',
  'professional'
);
