import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface Role {
  id: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
}

interface Permission {
  id?: string;
  role_id: string;
  section: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

const SECTIONS = [
  'properties',
  'rooms',
  'users',
  'bookings',
  'support_tickets',
  'events',
  'finance',
  'reports',
  'announcements',
  'access_logs'
];

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ role_name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoles(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch roles',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleId);

      if (error) throw error;
      
      // Create a full list of permissions with defaults
      const fullPermissions = SECTIONS.map(section => {
        const existing = data?.find(p => p.section === section);
        return existing || {
          role_id: roleId,
          section,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
        };
      });
      
      setRolePermissions(fullPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch permissions',
        variant: 'destructive',
      });
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('admin_roles')
        .insert({
          role_name: formData.role_name,
          description: formData.description,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
      
      setIsAddDialogOpen(false);
      setFormData({ role_name: '', description: '' });
      fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermission = async (permission: Permission, field: keyof Permission, value: boolean) => {
    try {
      const updatedPermission = { ...permission, [field]: value };
      
      if (permission.id) {
        // Update existing permission
        const { error } = await supabase
          .from('role_permissions')
          .update({ [field]: value })
          .eq('id', permission.id);

        if (error) throw error;
      } else {
        // Insert new permission
        const { data, error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: permission.role_id,
            section: permission.section,
            can_view: updatedPermission.can_view,
            can_add: updatedPermission.can_add,
            can_edit: updatedPermission.can_edit,
            can_delete: updatedPermission.can_delete,
          })
          .select()
          .single();

        if (error) throw error;
        
        // Update local state with the new id
        setRolePermissions(prev => 
          prev.map(p => p.section === permission.section ? { ...data } : p)
        );
      }

      toast({
        title: 'Success',
        description: 'Permission updated successfully',
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
      
      fetchRoles();
      setSelectedRole(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive',
      });
    }
  };

  if (!isSuperAdmin()) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You don't have permission to access this page. Only Super Admins can manage roles.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Role Management
          </h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddRole} className="space-y-4">
                <div>
                  <Label htmlFor="role_name">Role Name</Label>
                  <Input
                    id="role_name"
                    value={formData.role_name}
                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Role</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      fetchRolePermissions(role.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRole?.id === role.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{role.role_name}</span>
                      <Badge variant={role.is_active ? 'default' : 'secondary'}>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="text-sm opacity-90 mt-1">{role.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedRole ? `Permissions for ${selectedRole.role_name}` : 'Select a role'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRole ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead className="text-center">View</TableHead>
                        <TableHead className="text-center">Add</TableHead>
                        <TableHead className="text-center">Edit</TableHead>
                        <TableHead className="text-center">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rolePermissions.map((permission) => (
                        <TableRow key={permission.section}>
                          <TableCell className="font-medium capitalize">
                            {permission.section.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.can_view}
                              onCheckedChange={(checked) =>
                                handleUpdatePermission(permission, 'can_view', checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.can_add}
                              onCheckedChange={(checked) =>
                                handleUpdatePermission(permission, 'can_add', checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.can_edit}
                              onCheckedChange={(checked) =>
                                handleUpdatePermission(permission, 'can_edit', checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.can_delete}
                              onCheckedChange={(checked) =>
                                handleUpdatePermission(permission, 'can_delete', checked)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {selectedRole.role_name !== 'Super Admin' && (
                    <div className="flex justify-end pt-4">
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteRole(selectedRole.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Role
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Select a role to view and edit its permissions
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoleManagement;
