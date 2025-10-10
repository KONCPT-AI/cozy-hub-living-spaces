import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import type { NormalUser } from "@/contexts/AuthContext";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const validateField = (field: string, value: string, data: { email: string; password: string }) => {
    let message = "";

    if (field === "email") {
      if (!value.trim()) {
        message = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Enter a valid email address";
      }
    }

    if (field === "password") {
      if (!value) {
        message = "Password is required";
      } else if (value.length < 6) {
        message = "Password must be at least 6 characters";
      }
    }

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm({ email, password })) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/common/login`, {
        email: email.trim(),
        password
      });

      const data = res.data;

      if (data.success) {
        const accountRole = data.account.role; // e.g., 'user', 'admin', 'super-admin'
        if (accountRole === 'user' || accountRole===2) {
          const normalUser: NormalUser = {
            id: data.account.id,
            token: data.token,
            role: 'user',
            fullName: data.account.fullName,
            userType: data.account.userType,
            profileImage: data.account.profileImage || undefined
          };
          setUser(normalUser);
          sessionStorage.setItem('user', JSON.stringify(normalUser));
          toast.success("Login successful!");
          navigate("/user/dashboard");

        } else if (accountRole === 3 || accountRole === 1) {
          // Show toast and stop login
          toast.error("Please use the admin login page");
          setIsLoading(false);
          return;
        } else {
          toast.error("Invalid role");
          setIsLoading(false);
          return;
        }
      } else {
        toast.error("Invalid user credentials");
        setIsLoading(false);
      }

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      setIsLoading(false);
    }


  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-secondary-foreground" />
            </div>
            <img src="/logo.png" alt="Logo" className="w-20 h-19  rounded-lg object-contain" />
          </Link>
          <p className="text-primary-foreground/80  mt-2">Welcome back to your community</p>
        </div>

        <Card className="border-0 shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
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
                    placeholder="Enter your password"
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-secondary hover:underline">
                  Sign up
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                <Link to="/admin-login" className="text-secondary hover:underline">
                  Admin Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
