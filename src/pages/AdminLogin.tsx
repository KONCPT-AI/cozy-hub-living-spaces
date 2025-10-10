import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth, AdminUser } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  const validateField = (field: string, value: string, data: { email: string; password: string }) => {
    let message = "";

    if (field === "email") {
      if (!value.trim()) {
        message = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Enter a valid email address";
      }
    }

    // if (field === "password") {
    //   if (!value) {
    //     message = "Password is required";
    //   } else if (value.length < 6) {
    //     message = "Password must be at least 6 characters";
    //   }
    // }

    return message;
  };

  const validateForm = (data: { email: string; password: string }) => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(data).forEach((field) => {
      const message = validateField(field, (data as any)[field], data);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    const updatedData = { email, password, [field]: value };
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    const message = validateField(field, value, updatedData);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const login = async (email: string, password: string) => {

    try {
      const response = await axios.post(`${API_BASE_URL}/api/common/login`, { email, password });
      const data = response.data;

      if (!data.success) return false;

      //super Admin
      if (data.account.role === 1) {
        const superAdmin: AdminUser = {
          id: data.account.id,
          token: data.token,
          role: "super-admin",
          userType: ''
        }
        setUser(superAdmin);
        sessionStorage.setItem('user', JSON.stringify(superAdmin));
        return { account: data.account, role: "super-admin" };
      }

      //admin
      if (data.account.role === 3) {
        const adminUser: AdminUser = {
          id: data.account.id,
          token: data.token,
          role: "admin",
          userType: data.account.userType,
          permission: data.permissions || {},
          pages: data.pages || [],
          properties: data.properties || []
        }
        setUser(adminUser);
        sessionStorage.setItem('user', JSON.stringify(adminUser));
        return { account: data.account, pages: data.pages || [], role: "admin" };
      }
      return false
    } catch (err) {
      return false;
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm({ email, password })) {
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      if (success.account.role === 1) {
        toast.success("SuperAdmin Access Granted");
        navigate('/admin/dashboard');
      } else if (success.account.role === 3) {
        toast.success("Admin Access Granted");

        const backendPages = success.pages || [];
        let redirectRoute = "";

        // Helper to extract the page name
        const getPageName = (page: string | { id: number | string; name?: string }) => {
          return typeof page === "object" ? page.name : page;
        };

        // Loop through backendPages to find the first matching route
        for (const page of backendPages) {
          const name = getPageName(page);

          if (!name) continue;

          if (name === "User Management") {
            redirectRoute = "/admin/users";
            break;
          } else if (name === "Booking Management" || name === "Bookings") {
            redirectRoute = "/admin/bookings";
            break;
          } else if (name === "Property Management") {
            redirectRoute = "/admin/properties";
            break;
          } else if (name === "Room Management") {
            redirectRoute = "/admin/rooms";
            break;
          } else if (name === "Payments") {
            redirectRoute = "/admin/payments";
            break;
          } else if (name === "Support Tickets") {
            redirectRoute = "/admin/tickets";
            break;
          } else if (name === "Access Logs") {
            redirectRoute = "/admin/access-logs";
            break;
          } else if (name === "Event Management" || name === "Events") {
            redirectRoute = "/admin/events";
            break;
          } else if (name === "Reports") {
            redirectRoute = "/admin/reports";
            break;
          }
        }

        // Fallback to dashboard if no match
        if (!redirectRoute) redirectRoute = "/admin/dashboard";

        // Redirect
        navigate(redirectRoute);
      }
    } else {
      toast.error("Invalid admin credentials");

    }
    setIsLoading(false);
  };

  // const handleDemoLogin = async () => {
  //   const success = await login('admin@demo.com', 'admin123');

  //   if (success) {
  //     toast({
  //       title: 'Demo Admin Access',
  //       description: 'Welcome to the admin dashboard.',
  //     });
  //     navigate('/admin/dashboard');
  //   }
  // };

  // const handleLogout = async () => {
  //   await logout();
  //   toast({
  //     title: 'Logged Out',
  //     description: 'You can now login with admin credentials.',
  //   });
  // };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 ">
            <img src="/logo.png" alt="Logo" className="w-24 h-15 " />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">Admin Portal</h1>
          <p className="text-primary-foreground/80 mt-2">Secure administrative access</p>
        </div>

        <Card className="border-0 shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center">
              <Shield className="h-6 w-6 mr-2 text-secondary" />
              Admin Login
            </CardTitle>
            <p className="text-muted-foreground">Enter your administrative credentials</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current User Warning */}
            {user && user.role !== 'super-admin' && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Already logged in as regular user</p>
                    <p className="text-muted-foreground mt-1">
                      {/* Currently logged in as: {user.email} */}
                    </p>
                    <p className="text-muted-foreground">
                      You need to logout first to access admin panel.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={handleLogout}
                    className="ml-2"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
            {/* Demo Account */}
            {/* <div className="space-y-3">
              <p className="text-sm font-medium text-center">Try Demo Admin Account:</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                // onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <Badge variant="secondary" className="mr-2">Demo</Badge>
                Admin Access
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Demo Admin: admin@demo.com / admin123
              </div>
            </div> */}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <Input
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />{errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="bg-accent p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Security Notice</p>
                  <p className="text-muted-foreground mt-1">
                    This is a secure admin portal. All access attempts are logged and monitored.
                  </p>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                <Link to="/login" className="text-secondary hover:underline">
                  User Login
                </Link>
              </div>
              <Link to="/admin/forgot-password" className="text-sm text-secondary hover:underline block">
                Forgot admin password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        {/* <div className="text-center mt-6">
          <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            ← Back to Home
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default AdminLogin;