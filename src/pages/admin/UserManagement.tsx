
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
import { Users, Search, Eye, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const UserManagement = () => {
  const { user } = useAuth();
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
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const token = user?.token;
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/user-by-admin/getAllUsers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data || []);
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

    if (field === "emergencyContactName" && value.trim()) {
      if (!/^[A-Za-z\s]{2,50}$/.test(value)) {
        message = "Emergency Contact Name must contain only letters and spaces (2-50 characters).";
      }
    }
    if (field === "emergencyContactPhone" && value.trim()) {
      if (!/^\d{10}$/.test(value)) {
        message = "Emergency Contact Phone must be 10 digits.";
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
      await axios.post(`${API_BASE_URL}/api/user-by-admin/add`, {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        userType: formData.userType,
        occupation: formData.occupation,
        dateOfBirth: formData.dateOfBirth || null,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
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
      emergencyContactName: '',
      emergencyContactPhone: ''
    });
    setErrors({});
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
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
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    />
                    {errors.emergencyContactName && <p className="text-red-500 text-sm">{errors.emergencyContactName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    />
                    {errors.emergencyContactPhone && <p className="text-red-500 text-sm">{errors.emergencyContactPhone}</p>}
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
        </div>

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
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.userType || 'student'}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-1">
                      <Switch
                        // checked={event.is_active}
                        // onClick={() => handleToggleStatus(event.id, "event")}
                      >
                      </Switch>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant={user.kyc_verified ? 'default' : 'destructive'}>
                        {user.kyc_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('IN-en')}
                    </TableCell>
                    {/* <TableCell className="space-x-2">
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
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium">Full Name</p>
                                  <p className="text-muted-foreground">{selectedUser.fullName || 'N/A'}</p>
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

                                    {new Date(selectedUser.dateOfBirth).toLocaleDateString('IN-en') || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-medium">Occupation</p>
                                  <p className="text-muted-foreground">{selectedUser.occupation || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Emergency Contact</p>
                                  <p className="text-muted-foreground">
                                    {selectedUser.emergencyContactName || 'N/A'}
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
                    </TableCell> */}

                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;

