-- Create admin roles table for dynamic role definitions
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create permissions table to store granular permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- e.g., 'properties', 'rooms', 'users', 'bookings', etc.
  can_view BOOLEAN DEFAULT false,
  can_add BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, section)
);

-- Add role_id column to admin_users table
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.admin_roles(id);

-- Create default roles
INSERT INTO public.admin_roles (role_name, description) VALUES
  ('Super Admin', 'Full access to all sections and permissions'),
  ('Booking Manager', 'Manages bookings and room assignments'),
  ('Support Manager', 'Handles support tickets and maintenance'),
  ('Event Manager', 'Manages community events and announcements'),
  ('Finance Executive', 'Handles payments and financial reports')
ON CONFLICT (role_name) DO NOTHING;

-- Create default permissions for Super Admin (all permissions)
INSERT INTO public.role_permissions (role_id, section, can_view, can_add, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.admin_roles WHERE role_name = 'Super Admin'),
  section,
  true, true, true, true
FROM (
  VALUES 
    ('properties'),
    ('rooms'),
    ('users'),
    ('bookings'),
    ('support_tickets'),
    ('events'),
    ('finance'),
    ('reports'),
    ('announcements'),
    ('access_logs')
) AS sections(section)
ON CONFLICT (role_id, section) DO NOTHING;

-- Create default permissions for Booking Manager
INSERT INTO public.role_permissions (role_id, section, can_view, can_add, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.admin_roles WHERE role_name = 'Booking Manager'),
  section,
  can_view, can_add, can_edit, can_delete
FROM (
  VALUES 
    ('rooms', true, true, true, false),
    ('bookings', true, true, true, false),
    ('users', true, false, false, false),
    ('payments', true, false, false, false),
    ('reports', true, false, false, false)
) AS perms(section, can_view, can_add, can_edit, can_delete)
ON CONFLICT (role_id, section) DO NOTHING;

-- Create default permissions for Support Manager
INSERT INTO public.role_permissions (role_id, section, can_view, can_add, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.admin_roles WHERE role_name = 'Support Manager'),
  section,
  can_view, can_add, can_edit, can_delete
FROM (
  VALUES 
    ('support_tickets', true, true, true, false),
    ('users', true, false, false, false),
    ('announcements', true, true, true, false)
) AS perms(section, can_view, can_add, can_edit, can_delete)
ON CONFLICT (role_id, section) DO NOTHING;

-- Create default permissions for Event Manager
INSERT INTO public.role_permissions (role_id, section, can_view, can_add, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.admin_roles WHERE role_name = 'Event Manager'),
  section,
  can_view, can_add, can_edit, can_delete
FROM (
  VALUES 
    ('events', true, true, true, true),
    ('announcements', true, true, true, false),
    ('users', true, false, false, false)
) AS perms(section, can_view, can_add, can_edit, can_delete)
ON CONFLICT (role_id, section) DO NOTHING;

-- Create default permissions for Finance Executive
INSERT INTO public.role_permissions (role_id, section, can_view, can_add, can_edit, can_delete)
SELECT 
  (SELECT id FROM public.admin_roles WHERE role_name = 'Finance Executive'),
  section,
  can_view, can_add, can_edit, can_delete
FROM (
  VALUES 
    ('finance', true, true, true, false),
    ('payments', true, true, true, false),
    ('bookings', true, false, false, false),
    ('reports', true, false, false, false)
) AS perms(section, can_view, can_add, can_edit, can_delete)
ON CONFLICT (role_id, section) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_roles
CREATE POLICY "Admin users can view roles"
  ON public.admin_roles FOR SELECT
  USING (is_admin());

CREATE POLICY "Super admin can manage roles"
  ON public.admin_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      JOIN public.admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid() 
      AND ar.role_name = 'Super Admin'
    )
  );

-- RLS policies for role_permissions
CREATE POLICY "Admin users can view permissions"
  ON public.role_permissions FOR SELECT
  USING (is_admin());

CREATE POLICY "Super admin can manage permissions"
  ON public.role_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au
      JOIN public.admin_roles ar ON au.role_id = ar.id
      WHERE au.user_id = auth.uid() 
      AND ar.role_name = 'Super Admin'
    )
  );

-- Create helper function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(
  _section TEXT,
  _action TEXT -- 'view', 'add', 'edit', 'delete'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  -- Check if user is admin and has the specific permission
  SELECT 
    CASE _action
      WHEN 'view' THEN rp.can_view
      WHEN 'add' THEN rp.can_add
      WHEN 'edit' THEN rp.can_edit
      WHEN 'delete' THEN rp.can_delete
      ELSE false
    END INTO has_perm
  FROM admin_users au
  JOIN role_permissions rp ON au.role_id = rp.role_id
  WHERE au.user_id = auth.uid() 
    AND au.is_active = true
    AND rp.section = _section;
  
  RETURN COALESCE(has_perm, false);
END;
$$;

-- Create trigger for updating updated_at
CREATE TRIGGER update_admin_roles_updated_at
  BEFORE UPDATE ON public.admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing admin users to have Super Admin role
UPDATE public.admin_users 
SET role_id = (SELECT id FROM public.admin_roles WHERE role_name = 'Super Admin')
WHERE role = 'super_admin' AND role_id IS NULL;