import UserLayout from '@/components/UserLayout';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
import React, { useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Shield,
  Edit,
  Save,
  Upload,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Home,
  Star,
  Users,
  Bell
} from 'lucide-react';
import { ToastProvider } from '@radix-ui/react-toast';
// import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  //   const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    profileImage: "",
    emergencyContact: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchUserProfile = async () => {
    try {
      if (!user?.id || !user?.token) return;
      const res = await axios.get(`${baseURL}/api/user/getUser/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFormData(res.data.user);
    } catch (error) {
      toast.error("Failed to load profile data.");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const validateField = (name: string, value: string) => {
    let message = "";
    if (name === "fullName" && !value.trim()) {
      message = "Full Name is required.";
    }
    if (name === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) message = "Invalid email format.";
    }
    if (name === "phone" && value) {
      if (!/^\d{10}$/.test(value)) message = "Phone must be 10 digits.";
    }
    return message;
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // validate immediately
    const errorMessage = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
  };

  const handleSave = async () => {
    try {

      let newErrors: { [key: string]: string } = {};
      Object.keys(formData).forEach((key) => {
        const msg = validateField(key, (formData as any)[key]);
        if (msg) newErrors[key] = msg;
      });
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please fix validation errors.");
        return;
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = (formData as any)[key];
        if (value !== null && value !== undefined && String(value).trim() !== "") {
          data.append(key, value);
        }
      });
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      await axios.put(`${baseURL}/api/user/update-profile/${user.id}`, data,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }

      );
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchUserProfile(); // refresh with latest
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Update failed");
      }
    }
  };


  const getUserTypeInfo = () => {
    if (user?.userType === 'student') {
      return {
        label: 'Student',
        color: 'bg-blue-500',
        description: 'Verified student account with special rates'
      };
    }
    if (user?.userType === 'professional') {
      return {
        label: 'Professional',
        color: 'bg-green-500',
        description: 'Working professional account'
      };
    }
    return {
      label: 'User',
      color: 'bg-gray-500',
      description: 'Standard user account'
    };
  };

  const userTypeInfo = getUserTypeInfo();

  // const handleDeleteAccount = async () => {
  //   if (!user.id || !user.token) {
  //     toast.error("User not authenticated");
  //     return;
  //   }
  //   if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
  //     return;
  //   }

  //   try {
  //     await axios.delete(`${baseURL}/api/user/delete-account/${user.id}`, {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //     });

  //     toast.success("Account deleted successfully!");
  //     logout();
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || "Failed to delete account.");
  //   }

  // }

  const handleChangePassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${baseURL}/api/common/change-password`,
        { oldPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <UserLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-secondary" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-20 h-20 ${userTypeInfo.color} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                    { formData.profileImage ? (
                      <img
                        src={`${baseURL}${formData.profileImage}`}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border"
                      />
                    ) : (
                      formData?.fullName?.charAt(0) || 'U'
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">{formData.fullName}</h3>
                    <Badge className="mb-2">{userTypeInfo.label}</Badge>
                    <p className="text-sm text-muted-foreground">{userTypeInfo.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className={`ml-auto ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                    onClick={() => { if (isEditing) fileInputRef.current?.click() }} disabled={!isEditing}>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    placeholder='Upload a new profile picture'
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      disabled={!isEditing}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={!isEditing}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      disabled={!isEditing}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      disabled={!isEditing}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Textarea
                    value={formData.bio ?? " "}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                  {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emergency Contact</label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => handleChange("emergencyContact", e.target.value)}
                    disabled={!isEditing}
                  />
                  {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
                </div>

              </CardContent>
            </Card>

            {/* Document Verification */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-secondary" />
                  Document Verification
                </CardTitle>
              </CardHeader>
              {/* <CardContent>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          doc.status === 'verified' ? 'bg-green-500' : 
                          doc.status === 'pending' ? 'bg-orange-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">Uploaded: {doc.uploadDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={doc.status === 'verified' ? 'default' : 'secondary'}
                          className={doc.status === 'verified' ? 'bg-green-500' : ''}
                        >
                          {doc.status === 'verified' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent> */}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">92%</div>
                  <p className="text-sm text-muted-foreground">Profile Complete</p>
                </div>
                <div className="w-full bg-accent rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-secondary" />
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ID Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Check</span>
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => setShowPasswordForm(true)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Data
                </Button>
                {/* <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteAccount}>
                  <User className="h-4 w-4 mr-2" />
                  Delete Account
                </Button> */}

                {/* Change Password Form */}
                {showPasswordForm && (
                  <Card className="border mt-4 p-4">
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    <div className="space-y-3">
                      <Input
                        type="password"
                        placeholder="Current Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button type="button" onClick={handleChangePassword}>Save</Button>
                        <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </UserLayout>
  );


};

export default Profile;