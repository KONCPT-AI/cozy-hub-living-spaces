-- Insert a demo admin user
-- First we need to create a user in the auth.users table, but since we can't access that directly,
-- we'll create the admin record for an existing user ID that we know about
-- You'll need to replace this with an actual user ID from your auth.users table

-- For now, let's create a simple function to help with admin user creation
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_name TEXT DEFAULT NULL,
  admin_role public.admin_role DEFAULT 'staff'
)
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  INSERT INTO public.admin_users (user_id, email, full_name, role, is_active)
  VALUES (
    gen_random_uuid(), -- This should be replaced with actual auth.user.id
    user_email,
    user_name,
    admin_role,
    true
  )
  RETURNING id INTO admin_id;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a demo admin user (you can call this function with real data)
-- Example: SELECT public.create_admin_user('admin@demo.com', 'Demo Admin', 'super_admin');