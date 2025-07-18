-- Fix the infinite recursion in admin_users RLS policies
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON admin_users;

-- Create safer RLS policies that don't cause recursion
CREATE POLICY "Admin users can view their own record" 
ON admin_users 
FOR SELECT 
USING (user_id = auth.uid());

-- Create a simple policy for admin checking that doesn't cause recursion
CREATE POLICY "Allow read access for admin check" 
ON admin_users 
FOR SELECT 
USING (true);

-- Create a demo admin user with a special UUID that we'll recognize
INSERT INTO admin_users (user_id, email, full_name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@demo.com',
  'Demo Admin',
  'super_admin',
  true
);