
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, Search, Eye, CheckCircle, XCircle, EyeOff, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const isAdminUser = (user: any): user is { properties: number[]; role: string } => {
  return user && (user.role === 'admin' || user.role === 'super-admin');
};

const UserManagement = () => {
  const { user } = useAuth(); cancelAnimationFrame;
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState<any>({});
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    gender: '',
    userType: 'student',
    occupation: '',
    dateOfBirth: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const token = user?.token;
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const accessiblePropertyIds = isAdminUser(user) ? user.properties || [] : []; //accessible property i
  //for pagination
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const [adminsPage, setAdminsPage] = useState(1);
  const [adminsTotalPages, setAdminsTotalPages] = useState(1);


  const [pages, setPages] = useState<any[]>([]);
  const [admins, setAdmins] = useState([]);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [permissions, setPermissions] = useState<Record<string, { read: boolean; write: boolean }>>({});
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    password: '',
    roleName: '',
    pages: [],
    permissions: {} as Record<string, { read: boolean; write: boolean }>,
    properties: []
  });
  const [adminErrors, setAdminErrors] = useState<any>({});



  useEffect(() => {
    fetchUsers();
    fetchPages();
    fetchAdminUsers();
    fetchProperties();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/user-by-superadmin/getAllUsers?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(Array.isArray(data.users) ? data.users : [])
      setUsersTotalPages(data.totalPages || 1); // from backend response
      setUsersPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const fetchAdminUsers = async (page = 1, limit = 10) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/user-by-superadmin/getAlladminUsers?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(Array.isArray(data.adminUsers) ? data.adminUsers : []);      
      setAdminsTotalPages(data.totalPages || 1);
      setAdminsPage(page);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/pages/getAll`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPages(data.pages || []);
      // initialize permissions
      const perms: Record<string, { read: boolean; write: boolean }> = {};
      data.pages.forEach((page: any) => {
        perms[page.id] = { read: false, write: false };
      });
      setPermissions(perms);
    } catch (err) {
      console.error('Error fetching pages', err);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/property/getAll`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPropertiesList(data || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
      toast({ title: "Error", description: "Failed to fetch properties", variant: "destructive" });
    }
  };


  const verifyUser = async (userId, verified) => {
    try {
      await axios.patch(`/api/users/${userId}/verify`, { verified });
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

  const validateField = (field: string, value: any) => {
    let message = "";

    if (field === "fullName") {
      if (!value.trim()) {
        message = "Full Name is required.";
      } else if (!/^[A-Za-z\s]{2,50}$/.test(value)) {
        message = "Full Name must contain only letters and spaces (2-50 characters).";
      }
    }

    if (field === "email") {
      if (!value) {
        message = "Email is required.";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          message = "Invalid email format.";
        }
      }
    }

    if (field === "phone") {
      if (!value) {
        message = "phone is required.";
      }
      else if (!/^\d{10}$/.test(value)) message = "Phone must be 10 digits.";
    }

    if (field === "dateOfBirth") {
      if (!value) {
        message = "Date of Birth is required.";
      } else {
        const dob = new Date(value);
        const today = new Date();

        if (dob >= today) {
          message = "Date of Birth must be in the past.";
        }
      }
    }

    return message;
  };

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    const message = validateField(field, value);
    setErrors((prev: any) => ({
      ...prev,
      [field]: message
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    Object.keys(formData).forEach((field) => {
      const value = (formData as any)[field];
      const message = validateField(field, value);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/user-by-superadmin/add`, {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        userType: formData.userType,
        occupation: formData.occupation,
        dateOfBirth: formData.dateOfBirth || null,

      }, {
        headers: {
          Authorization: `Bearer ${user.token}`, // make sure you have user.token available
        },
      });
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
      fullName: '',
      phone: '',
      gender: '',
      userType: 'student',
      occupation: '',
      dateOfBirth: '',
    });
    setErrors({});
  };

  //admin permission handlers
  const togglePermission = (pageId: string | number, type: 'read' | 'write') => {
    setPermissions(prev => {
      const updated = {
        ...prev,
        [pageId]: {
          ...prev[pageId],
          [type]: !prev[pageId][type]
        }
      };
      const selectedPages = Object.keys(updated)
        .filter(pid => updated[pid].read || updated[pid].write);

      setAdminForm(prevForm => ({
        ...prevForm,
        pages: selectedPages,
        permissions: updated
      }));

      return updated;
    });
  };

  const validateAdminField = (field: string, value: any) => {
    let message = '';

    if (field === 'fullName') {
      if (!value.trim()) {
        message = 'Full Name is required.';
      } else if (!/^[A-Za-z\s]{2,50}$/.test(value)) {
        message = 'Full Name must contain only letters and spaces (2-50 characters).';
      }
    }

    if (field === 'email') {
      if (!value) {
        message = 'Email is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) message = 'Invalid email format.';
      }
    }

    if (field === 'phone') {
      if (!value) {
        message = 'Phone is required.';
      } else if (!/^\d{10}$/.test(value)) message = 'Phone must be 10 digits.';
    }

    if (field === 'password') {
      if (!value) message = 'Password is required.';
      else if (value.length < 6) message = 'Password must be at least 6 characters.';
    }

    if (field === 'roleName') {
      if (!value.trim()) message = 'Role Name is required.';
    }

    return message;
  };

  const handleAdminInputChange = (field: string, value: any) => {
    setAdminForm(prev => ({ ...prev, [field]: value }));

    const message = validateAdminField(field, value);
    setAdminErrors(prev => ({ ...prev, [field]: message }));
  };

  const validateAdminForm = () => {
    const newErrors: any = {};

    // Validate basic fields
    Object.keys(adminForm).forEach(field => {
      const value = (adminForm as any)[field];
      const message = validateAdminField(field, value);
      if (message) newErrors[field] = message;
    });

    // Validate properties
    if (!adminForm.properties || adminForm.properties.length === 0) {
      newErrors.properties = 'Please select at least one property.';
    }

    // Validate page permissions
    const hasPermission = Object.values(adminForm.permissions || {}).some(
      (perm) => perm.read || perm.write
    );
    if (!hasPermission) {
      newErrors.permissions = 'Please assign at least one page permission.';
    }

    setAdminErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdminForm()) return;
    const payload = {
      email: adminForm.email,
      fullName: adminForm.fullName,
      phone: adminForm.phone,
      password: adminForm.password,
      userType: "admin",
      roleName: adminForm.roleName,
      pages: adminForm.pages || [],
      permissions: adminForm.permissions,
      properties: adminForm.properties
    };

    try {
      await axios.post(`${API_BASE_URL}/api/user-by-superadmin/create-admin-user`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast({ title: 'Success', description: 'Admin created successfully' });
      setIsAddAdminDialogOpen(false);
      resetAdminForm();
      fetchAdminUsers(); // refresh user/admin list
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({ title: 'Error', description: 'Failed to create admin', variant: 'destructive' });
    }
  };


  const resetAdminForm = () => {
    setAdminForm({
      email: '',
      fullName: '',
      phone: '',
      password: '',
      roleName: '',
      pages: [],
      permissions: {},
      properties: []
    });
  };

  const usersList = filteredUsers.filter(u => u.userType !== 'admin');
  const adminsList = admins;
  //for admin view property wise
  // const adminsList = admins.filter(admin => {
  //   if (user.role === 'super-admin') return true;
  //   // admin sees only admins linked to properties they manage
  //   return admin.permission?.properties?.some((pid: number) => accessiblePropertyIds.includes(pid));
  // });

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>

          <div className="flex items-center gap-5">

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                {hasPermission('User Management', 'write') && (
                  <Button onClick={() => { resetForm(); }} >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                )}
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 overflow-y-auto max-h-[90vh] scrollbar-hide">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                      />
                      {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                      {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                    </div>
                    {/* Gender */}
                    <div className="space-y-2">
                      <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                      <Select
                        onValueChange={(value) => handleInputChange('gender', value)}
                        value={formData.gender}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="--Select Gender--" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="user_type">User Type</Label>
                      <Select value={formData.userType} onValueChange={(value) => setFormData({ ...formData, userType: value })}>
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
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                      {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
                    </div>

                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create User
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add this next to your existing "Add Admin" DialogTrigger */}
            <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
              <DialogTrigger asChild>
                {hasPermission('User Management', 'write') && (
                  <Button onClick={resetAdminForm}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>)}

              </DialogTrigger>

              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create New Admin</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleAddAdmin} className="pace-y-4 overflow-y-auto max-h-[90vh] scrollbar-hide">
                  {/* Admin Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email <span className="text-black-500">*</span></Label>
                      <Input
                        value={adminForm.email}
                        onChange={(e) => handleAdminInputChange('email', e.target.value)}
                      />
                      {adminErrors.email && <p className="text-red-500 text-sm">{adminErrors.email}</p>}
                    </div>
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={adminForm.fullName}
                        onChange={(e) => handleAdminInputChange('fullName', e.target.value)}
                      />
                      {adminErrors.fullName && <p className="text-red-500 text-sm">{adminErrors.fullName}</p>}
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={adminForm.phone}
                        onChange={(e) => handleAdminInputChange('phone', e.target.value)}
                      />
                      {adminErrors.phone && <p className="text-red-500 text-sm">{adminErrors.phone}</p>}
                    </div>
                    <div>
                      <Label>Role Name</Label>
                      <Input
                        value={adminForm.roleName}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, roleName: e.target.value }))}
                      />
                      {adminErrors.roleName && <p className="text-red-500 text-sm">{adminErrors.roleName}</p>}
                    </div>
                    <div>
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={adminForm.password}
                          onChange={(e) => handleAdminInputChange('password', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>

                      {adminErrors.password && <p className="text-red-500 text-sm">{adminErrors.password}</p>}
                    </div>
                  </div>

                  {/* Properties Selection */}
                  <div>
                    <Label>Link Properties</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                      {propertiesList.map(prop => (
                        <label key={prop.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedProperties.includes(prop.id)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...selectedProperties, prop.id]
                                : selectedProperties.filter(id => id !== prop.id);
                              setSelectedProperties(updated);
                              setAdminForm(prev => ({ ...prev, properties: updated }));
                            }}
                            className="accent-blue-500"
                          />
                          {prop.name}
                        </label>
                      ))}
                    </div>
                    {adminErrors.properties && <p className="text-red-500 text-sm">{adminErrors.properties}</p>}
                  </div>


                  {/* Page Permissions */}
                  <div>
                    <p className="text-lg font-semibold mb-3">Assign Page Permissions</p>
                    <div className="grid  sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {pages.map((page) => (
                        <Card
                          key={page.id}
                          className="border border-border bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between">
                          <span className="font-medium text-base mb-2">{page.page_name}</span>
                          <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={permissions[page.id]?.read || false}
                                onChange={() => togglePermission(page.id, 'read')}
                                className="accent-blue-500"
                              />
                              Read
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={permissions[page.id]?.write || false}
                                onChange={() => togglePermission(page.id, 'write')}
                                className="accent-blue-500"
                              />
                              Write
                            </label>
                          </div>
                        </Card>
                      ))}
                    </div>
                    {adminErrors.properties && <p className="text-red-500 text-sm">{adminErrors.properties}</p>}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={() => { setIsAddAdminDialogOpen(false); resetAdminForm(); setSelectedProperties([]); setPermissions({}); }}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Admin</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        {/* tab bar */}
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            {hasPermission('User Management', 'read') && <TabsTrigger value="users">Users</TabsTrigger>}
            {hasPermission('User Management', 'read') && <TabsTrigger value="admins">Admins</TabsTrigger>}
          </TabsList>

          {/* Users Tab */}
          {hasPermission('User Management', 'read') && (
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Search users..."
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
                        <TableHead>Gender</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersList.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.fullName || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.gender}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.userType || 'student'}</Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString('IN-en')}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${user.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end items-center mt-4 gap-2">
                    <Button
                      size="sm"
                      disabled={usersPage === 1}
                      onClick={() => fetchUsers(usersPage - 1)}
                    >
                      Previous
                    </Button>

                    <span>Page {usersPage} of {usersTotalPages}</span>

                    <Button
                      size="sm"
                      disabled={usersPage === usersTotalPages}
                      onClick={() => fetchUsers(usersPage + 1)}
                    >
                      Next
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Admins Tab */}
          {hasPermission('User Management', 'read') && (
            <TabsContent value="admins">
              <Card>
                <CardHeader>
                  <CardTitle>All Admins</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Search admins..."
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
                        <TableHead>Phone</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminsList.map((admin) => {
                        const adminPages = Array.isArray(admin.permission?.pages)
                          ? admin.permission.pages : admin.pages ? admin.pages.split(",") : [];

                        const pageNames = adminPages.map((pageId) => {
                          const page = pages.find((p) => p.id.toString() === pageId.toString());
                          return page?.page_name || '-';
                        });

                        const pagePermissions = adminPages.map((pageId) => {
                          const perms = admin.permission?.permissions?.[pageId];
                          if (!perms) return '-';
                          const permList = [];
                          if (perms.read) permList.push('Read');
                          if (perms.write) permList.push('Write');
                          return permList.join(', ') || '-';
                        });

                        return (
                          <TableRow key={admin.id}>
                            <TableCell>{admin.fullName || 'N/A'}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>{admin.phone}</TableCell>
                            <TableCell>
                              {admin.permission?.properties?.length
                                ? admin.permission.properties.map((propId: number) => {
                                  const prop = propertiesList.find(p => p.id === propId);
                                  return prop ? prop.name : `ID:${propId}`;
                                }).join(', ') : '-'}
                            </TableCell>
                            <TableCell>
                              {pageNames.map((name, idx) => (
                                <div key={idx}>{name}</div>
                              ))}
                            </TableCell>
                            <TableCell>
                              {pagePermissions.map((perm, idx) => (
                                <div key={idx}>{perm}</div>
                              ))}
                            </TableCell>
                            <TableCell>{new Date(admin.createdAt).toLocaleDateString('IN-en')}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${admin.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end items-center mt-4 gap-2">
                    <Button
                      size="sm"
                      disabled={adminsPage === 1}
                      onClick={() => fetchAdminUsers(adminsPage - 1)}
                    >
                      Previous
                    </Button>

                    <span>Page {adminsPage} of {adminsTotalPages}</span>

                    <Button
                      size="sm"
                      disabled={adminsPage === adminsTotalPages}
                      onClick={() => fetchAdminUsers(adminsPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;

