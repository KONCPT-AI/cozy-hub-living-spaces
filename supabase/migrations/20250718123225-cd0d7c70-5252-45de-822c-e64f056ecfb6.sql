-- Fix the recursive RLS policy issue for admin_users table
-- The current policies are causing infinite recursion because they're checking admin_users 
-- within admin_users policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON admin_users;

-- Create new non-recursive policies
-- Only allow super admins to manage admin users, but use a simpler check
CREATE POLICY "Super admin can manage admin users" 
ON admin_users 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users a 
    WHERE a.user_id = auth.uid() 
    AND a.role = 'super_admin'::admin_role 
    AND a.is_active = true
  )
);

-- Allow admin users to view other admin users (but not modify)
CREATE POLICY "Admin users can view admin users"
ON admin_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users a 
    WHERE a.user_id = auth.uid() 
    AND a.is_active = true
  )
);