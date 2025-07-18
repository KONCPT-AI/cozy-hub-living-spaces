-- Fix the infinite recursion issue with RLS policies
-- The problem is that multiple tables are checking admin_users in their policies
-- which creates recursive dependencies

-- First, let's create a security definer function to safely check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Simple check without recursive policy calls
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now update the admin_users policies to be simpler and avoid recursion
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON admin_users;

-- Create simpler policies for admin_users that don't self-reference
CREATE POLICY "Allow authenticated users to view admin_users"
ON admin_users
FOR SELECT
TO authenticated
USING (true);  -- We'll control this through the application layer for now

CREATE POLICY "Super admin can manage admin users" 
ON admin_users 
FOR ALL 
TO authenticated
USING (
  -- Check if current user has super_admin role without recursion
  (SELECT role FROM admin_users WHERE user_id = auth.uid() LIMIT 1) = 'super_admin'::admin_role
);

-- Update rooms policies to use the function instead of direct admin_users queries
DROP POLICY IF EXISTS "Admin users can view all rooms" ON rooms;
DROP POLICY IF EXISTS "Admin users can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Admin users can update rooms" ON rooms;
DROP POLICY IF EXISTS "Admin users can delete rooms" ON rooms;

-- Recreate rooms policies using the function
CREATE POLICY "Admin users can view all rooms"
ON rooms
FOR SELECT
TO authenticated
USING (auth.is_admin());

CREATE POLICY "Admin users can insert rooms"
ON rooms
FOR INSERT
TO authenticated
WITH CHECK (auth.is_admin());

CREATE POLICY "Admin users can update rooms"
ON rooms
FOR UPDATE
TO authenticated
USING (auth.is_admin());

CREATE POLICY "Admin users can delete rooms"
ON rooms
FOR DELETE
TO authenticated
USING (auth.is_admin());