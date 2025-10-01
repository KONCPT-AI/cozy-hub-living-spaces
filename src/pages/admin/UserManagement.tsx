
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Search, Eye, CheckCircle, XCircle, UserPlus, Shield, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    user_type: 'student',
    occupation: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  
  // Admin users state
  const [adminUsers, setAdminUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    email: '',
    full_name: '',
    role_id: '',
    property_id: '',
    sections: [] as string[],
    permissions: {
      view: false,
      edit: false,
      delete: false
    }
  });
  
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const availableSections = [
    'dashboard',
    'users',
    'rooms',
    'bookings',
    'payments',
    'properties',
    'events',
    'tickets',
    'reports',
    'access_logs'
  ];

  useEffect(() => {
    fetchUsers();
    fetchAdminUsers();
    fetchProperties();
    fetchRoles();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const verifyUser = async (userId, verified) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_verified: verified })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${verified ? 'verified' : 'unverified'} successfully`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user verification',
        variant: 'destructive',
      });
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: crypto.randomUUID(), // In production, this should come from auth.users
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          user_type: formData.user_type as "student" | "professional",
          occupation: formData.occupation,
          date_of_birth: formData.date_of_birth || null,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User profile created successfully',
      });
      
      setIsAddDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create user profile',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      user_type: 'student',
      occupation: '',
      date_of_birth: '',
      emergency_contact_name: '',
      emergency_contact_phone: ''
    });
  };

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch roles separately for each admin user
      const adminUsersWithRoles = await Promise.all(
        (data || []).map(async (admin: any) => {
          if (admin.role_id) {
            const { data: roleData } = await (supabase as any)
              .from('admin_roles')
              .select('role_name')
              .eq('id', admin.role_id)
              .maybeSingle();
            return { ...admin, role_name: roleData?.role_name };
          }
          return admin;
        })
      );
      
      setAdminUsers(adminUsersWithRoles);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin users',
        variant: 'destructive',
      });
    }
  };

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .eq('is_active', true);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('admin_roles')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First create the admin user
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: crypto.randomUUID(),
          email: adminFormData.email,
          full_name: adminFormData.full_name,
          role_id: adminFormData.role_id || null,
          is_active: true
        })
        .select()
        .single();

      if (adminError) throw adminError;

      // Then create role permissions for selected sections
      if (adminFormData.sections.length > 0 && adminFormData.role_id) {
        for (const section of adminFormData.sections) {
          const { error: permError } = await (supabase as any)
            .from('role_permissions')
            .insert({
              role_id: adminFormData.role_id,
              section,
              can_view: adminFormData.permissions.view,
              can_edit: adminFormData.permissions.edit,
              can_delete: adminFormData.permissions.delete,
              can_add: false
            });

          if (permError) {
            console.error('Error creating permission:', permError);
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Admin user created successfully',
      });
      
      setIsAddAdminDialogOpen(false);
      resetAdminForm();
      fetchAdminUsers();
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create admin user',
        variant: 'destructive',
      });
    }
  };

  const resetAdminForm = () => {
    setAdminFormData({
      email: '',
      full_name: '',
      role_id: '',
      property_id: '',
      sections: [],
      permissions: {
        view: false,
        edit: false,
        delete: false
      }
    });
  };

  const deleteAdminUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Admin user deleted successfully',
      });
      
      fetchAdminUsers();
    } catch (error) {
      console.error('Error deleting admin user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete admin user',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
        </div>

        <Tabs defaultValue="residents" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="residents">Residents</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Residents Tab */}
          <TabsContent value="residents" className="space-y-4">
            <div className="flex items-center justify-end">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); }}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Resident
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Resident</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="user_type">User Type</Label>
                        <Select value={formData.user_type} onValueChange={(value) => setFormData({...formData, user_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                        <Input
                          id="emergency_contact_name"
                          value={formData.emergency_contact_name}
                          onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                        <Input
                          id="emergency_contact_phone"
                          value={formData.emergency_contact_phone}
                          onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create Resident
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Residents</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Search residents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.user_type || 'student'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.kyc_verified ? 'default' : 'destructive'}>
                            {user.kyc_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Resident Details</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="font-medium">Full Name</p>
                                      <p className="text-muted-foreground">{selectedUser.full_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Email</p>
                                      <p className="text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Phone</p>
                                      <p className="text-muted-foreground">{selectedUser.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Date of Birth</p>
                                      <p className="text-muted-foreground">
                                        {selectedUser.date_of_birth || 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Occupation</p>
                                      <p className="text-muted-foreground">{selectedUser.occupation || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Emergency Contact</p>
                                      <p className="text-muted-foreground">
                                        {selectedUser.emergency_contact_name || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => verifyUser(selectedUser.user_id, true)}
                                      disabled={selectedUser.kyc_verified}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Verify KYC
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => verifyUser(selectedUser.user_id, false)}
                                      disabled={!selectedUser.kyc_verified}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Unverify
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-4">
            <div className="flex items-center justify-end">
              <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetAdminForm(); }}>
                    <Shield className="h-4 w-4 mr-2" />
                    Add Admin User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Admin User</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddAdminUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="admin_email">Email</Label>
                        <Input
                          id="admin_email"
                          type="email"
                          value={adminFormData.email}
                          onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin_full_name">Full Name</Label>
                        <Input
                          id="admin_full_name"
                          value={adminFormData.full_name}
                          onChange={(e) => setAdminFormData({...adminFormData, full_name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={adminFormData.role_id} onValueChange={(value) => setAdminFormData({...adminFormData, role_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.role_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="property">Property</Label>
                        <Select value={adminFormData.property_id} onValueChange={(value) => setAdminFormData({...adminFormData, property_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Sections Access</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSections.map((section) => (
                          <div key={section} className="flex items-center space-x-2">
                            <Checkbox
                              id={section}
                              checked={adminFormData.sections.includes(section)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAdminFormData({
                                    ...adminFormData,
                                    sections: [...adminFormData.sections, section]
                                  });
                                } else {
                                  setAdminFormData({
                                    ...adminFormData,
                                    sections: adminFormData.sections.filter(s => s !== section)
                                  });
                                }
                              }}
                            />
                            <label htmlFor={section} className="text-sm capitalize cursor-pointer">
                              {section.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Permissions</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="perm_view"
                            checked={adminFormData.permissions.view}
                            onCheckedChange={(checked) => 
                              setAdminFormData({
                                ...adminFormData,
                                permissions: {...adminFormData.permissions, view: checked as boolean}
                              })
                            }
                          />
                          <label htmlFor="perm_view" className="text-sm cursor-pointer">
                            View
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="perm_edit"
                            checked={adminFormData.permissions.edit}
                            onCheckedChange={(checked) => 
                              setAdminFormData({
                                ...adminFormData,
                                permissions: {...adminFormData.permissions, edit: checked as boolean}
                              })
                            }
                          />
                          <label htmlFor="perm_edit" className="text-sm cursor-pointer">
                            Edit
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="perm_delete"
                            checked={adminFormData.permissions.delete}
                            onCheckedChange={(checked) => 
                              setAdminFormData({
                                ...adminFormData,
                                permissions: {...adminFormData.permissions, delete: checked as boolean}
                              })
                            }
                          />
                          <label htmlFor="perm_delete" className="text-sm cursor-pointer">
                            Delete
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddAdminDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create Admin User
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((admin: any) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.full_name || 'N/A'}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {admin.role_name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAdminUser(admin.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
