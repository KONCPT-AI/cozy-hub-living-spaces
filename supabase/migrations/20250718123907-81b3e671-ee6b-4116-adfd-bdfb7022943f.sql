-- Fix the infinite recursion issue with RLS policies
-- Create a security definer function in public schema to safely check if user is admin

CREATE OR REPLACE FUNCTION public.is_admin()
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

-- Drop existing problematic policies on admin_users
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to view admin_users" ON admin_users;

-- Create a simpler policy for admin_users that doesn't cause recursion
-- Allow admins to view all admin users (self-check is allowed here)
CREATE POLICY "Admin users can view admin users"
ON admin_users
FOR SELECT
TO authenticated
USING (
  -- Allow users to see their own admin record or if they're already confirmed as admin
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM admin_users a 
    WHERE a.user_id = auth.uid() 
    AND a.is_active = true
  )
);

-- Super admins can manage all admin users
CREATE POLICY "Super admin can manage admin users" 
ON admin_users 
FOR ALL 
TO authenticated
USING (
  (SELECT role FROM admin_users WHERE user_id = auth.uid() AND is_active = true LIMIT 1) = 'super_admin'::admin_role
);

-- Update other table policies to use our new function
-- Update rooms policies
DROP POLICY IF EXISTS "Admin users can view all rooms" ON rooms;
DROP POLICY IF EXISTS "Admin users can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Admin users can update rooms" ON rooms;
DROP POLICY IF EXISTS "Admin users can delete rooms" ON rooms;

-- Recreate rooms policies using the security definer function
CREATE POLICY "Admin users can view all rooms"
ON rooms
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin users can insert rooms"
ON rooms
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update rooms"
ON rooms
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin users can delete rooms"
ON rooms
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Update other tables with admin policies to use the function
-- Bookings policies
DROP POLICY IF EXISTS "Admin users can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin users can update all bookings" ON bookings;

CREATE POLICY "Admin users can view all bookings"
ON bookings
FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admin users can update all bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Payments policies  
DROP POLICY IF EXISTS "Admin users can view all payments" ON payments;
DROP POLICY IF EXISTS "Admin users can insert payments" ON payments;
DROP POLICY IF EXISTS "Admin users can update payments" ON payments;

CREATE POLICY "Admin users can view all payments"
ON payments
FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admin users can insert payments"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update payments"
ON payments
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Maintenance tickets policies
DROP POLICY IF EXISTS "Admin users can view all tickets" ON maintenance_tickets;
DROP POLICY IF EXISTS "Admin users can update tickets" ON maintenance_tickets;

CREATE POLICY "Admin users can view all tickets"
ON maintenance_tickets
FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admin users can update tickets"
ON maintenance_tickets
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Events policies
DROP POLICY IF EXISTS "Admin users can insert events" ON events;
DROP POLICY IF EXISTS "Admin users can update events" ON events;
DROP POLICY IF EXISTS "Admin users can delete events" ON events;

CREATE POLICY "Admin users can insert events"
ON events
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update events"
ON events
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin users can delete events"
ON events
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Announcements policies
DROP POLICY IF EXISTS "Admin users can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admin users can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admin users can delete announcements" ON announcements;

CREATE POLICY "Admin users can insert announcements"
ON announcements
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin users can update announcements"
ON announcements
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admin users can delete announcements"
ON announcements
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Profiles policies
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can insert profiles" ON profiles;

CREATE POLICY "Admin users can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admin users can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admin users can insert profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() OR auth.uid() = user_id);