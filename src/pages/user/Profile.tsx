import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State',
    bio: 'Computer Science student passionate about technology and community living.',
    emergencyContact: 'Jane Doe - +1 (555) 987-6543',
    preferences: 'Quiet environment, non-smoking, early riser'
  });

  const handleSave = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been successfully updated.',
    });
    setIsEditing(false);
  };

  const profileStats = [
    { label: 'Member Since', value: 'Dec 2023', icon: Calendar },
    { label: 'Total Bookings', value: '3', icon: Home },
    { label: 'Community Score', value: '4.8/5', icon: Star },
    { label: 'Referrals', value: '2', icon: Users },
  ];

  const documents = [
    { name: 'ID Document', status: 'verified', uploadDate: 'Dec 1, 2023' },
    { name: 'Proof of Income', status: 'verified', uploadDate: 'Dec 1, 2023' },
    { name: 'Background Check', status: 'pending', uploadDate: 'Dec 5, 2023' },
    { name: 'Emergency Contact', status: 'verified', uploadDate: 'Dec 1, 2023' },
  ];

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
                    {formData.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{formData.name}</h3>
                    <Badge className="mb-2">{userTypeInfo.label}</Badge>
                    <p className="text-sm text-muted-foreground">{userTypeInfo.description}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Emergency Contact</label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Living Preferences</label>
                  <Textarea
                    value={formData.preferences}
                    onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                    disabled={!isEditing}
                    rows={2}
                  />
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
              <CardContent>
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
              </CardContent>
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
                <Button variant="outline" className="w-full justify-start">
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
                <Button variant="destructive" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;