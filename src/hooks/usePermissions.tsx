import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Permission {
  section: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface Role {
  id: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.userType === 'admin') {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPermissions = async () => {
    try {
      // Fetch admin user with role
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          role_id,
          admin_roles (
            id,
            role_name,
            description,
            is_active
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (adminError) throw adminError;

      if (adminUser?.admin_roles) {
        setRole(adminUser.admin_roles as Role);

        // Fetch permissions for this role
        const { data: perms, error: permsError } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role_id', adminUser.role_id);

        if (permsError) throw permsError;
        setPermissions(perms || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setLoading(false);
    }
  };

  const hasPermission = (section: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
    const perm = permissions.find(p => p.section === section);
    if (!perm) return false;

    switch (action) {
      case 'view':
        return perm.can_view;
      case 'add':
        return perm.can_add;
      case 'edit':
        return perm.can_edit;
      case 'delete':
        return perm.can_delete;
      default:
        return false;
    }
  };

  const isSuperAdmin = (): boolean => {
    return role?.role_name === 'Super Admin';
  };

  return {
    permissions,
    role,
    loading,
    hasPermission,
    isSuperAdmin,
  };
};
