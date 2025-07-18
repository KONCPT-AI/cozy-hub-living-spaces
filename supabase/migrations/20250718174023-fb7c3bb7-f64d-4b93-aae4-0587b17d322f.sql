-- Fix the infinite recursion in admin_users RLS policies by dropping problematic policies
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON admin_users;

-- Create safer RLS policies that don't cause recursion
CREATE POLICY "Admin users can view their own record" 
ON admin_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Allow read access for admin check" 
ON admin_users 
FOR SELECT 
USING (true);

-- Insert the demo admin user
INSERT INTO admin_users (user_id, email, full_name, role, is_active)
VALUES (
  gen_random_uuid(),
  'admin@demo.com',
  'Demo Admin',
  'super_admin',
  true
) ON CONFLICT (email) DO NOTHING;