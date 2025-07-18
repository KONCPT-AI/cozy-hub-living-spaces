-- First fix the RLS policies to prevent infinite recursion
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON admin_users;

-- Create safer RLS policies
CREATE POLICY "Admin users can view their own record" 
ON admin_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Allow read access for admin check" 
ON admin_users 
FOR SELECT 
USING (true);

-- Remove the foreign key constraint that's preventing demo admin creation
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_user_id_fkey;

-- Now insert the demo admin
INSERT INTO admin_users (user_id, email, full_name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@demo.com',
  'Demo Admin',
  'super_admin',
  true
);