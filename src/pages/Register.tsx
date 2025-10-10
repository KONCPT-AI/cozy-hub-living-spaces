import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',
    userType: 'student' as 'student' | 'professional',
    otp: "",
    dateOfBirth: ""
  });

  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isVerified, setIsVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateField = (field: string, value: string, data: typeof formData) => {
    let message = "";

    if (field === "fullName") {
      if (!value.trim()) {
        message = "Full Name is required";
      } else if (!/^[a-zA-Z ]{2,50}$/.test(value.trim())) {
        message = "Full Name must be 2 to 50 alphabetic characters";
      }
    }

    if (field === "email") {
      if (!value.trim()) {
        message = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Enter a valid email address";
      }
    }

    if (field === "phone") {
      if (value && value.trim() !== "") {
        if (!/^[0-9]{10}$/.test(value.trim())) {
          message = "Enter a valid 10-digit phone number";
        }
      }
    }

    if (field === "dateOfBirth") {
      if (!value) {
        message = "Date of Birth is required";
      } else {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          message = "You must be at least 18 years old to register";
        }
      }
    }

    if (field === "password") {
      if (!value) {
        message = "Password is required";
      } else if (value.length < 6) {
        message = "Password must be at least 6 characters";
      }
    }

    if (field === "confirmPassword") {
      if (!value) {
        message = "Please confirm your password";
      } else if (value !== data.password) {
        message = "Passwords do not match";
      }
    }

    if (field === "userType") {
      if (!value) {
        message = "User type is required";
      }
    }

    return message;
  };

  useEffect(() => {
    let timer: any;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/user/send-otp`, { email: formData.email });
      toast({ title: "OTP Sent", description: "Check your email for verification code" });
      setOtpSent(true);
      setTimeLeft(300); // 5 minutes
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to send OTP", variant: "destructive" });
    }
  };

  //validate all fields
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach((field) => {
      const message = validateField(field, (formData as any)[field], formData);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/user/register`, formData);

      if (response.data.success) {
        toast({
          title: 'Registration successful!',
          description: 'Please check your email to verify your account.',
        });
        navigate('/login');
      } else {
        toast({
          title: 'Registration failed',
          description: response.data.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.response && error.response.data) {
        const data = error.response.data;

        // agar backend ne errors array bheji hai
        if (data.errors && Array.isArray(data.errors)) {
          const formattedErrors: { [key: string]: string } = {};
          data.errors.forEach((err: any) => {
            if (err.path) {
              formattedErrors[err.path] = err.msg;
            }
          });
          setErrors(formattedErrors);

        } else if (data.message) {
          // ek hi message mila hai
          const formattedErrors: { [key: string]: string } = {};

          if (data.message.toLowerCase().includes("exists")) {
            // specific case: email already exists
            formattedErrors["email"] = data.message;
          } else if (data.message.toLowerCase().includes("name")) {
            formattedErrors["fullName"] = data.message;
          } else {
            // agar kisi field se match nahi hota → global error
            formattedErrors["general"] = data.message;
          }
          setErrors(formattedErrors);
        }
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }

  };

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    const message = validateField(field, value, updatedData);
    setErrors((prev) => ({
      ...prev,
      [field]: message
    }));
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
          <p className="text-primary-foreground/80 mt-2">Join our co-living community</p>
        </div>

        <Card className="border-0 shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <p className="text-muted-foreground">Sign up to get started with CoLiving</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  max={new Date().toISOString().split("T")[0]} // prevents future dates
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  type="text"
                  placeholder="Enter your 10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              {/* User Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">I am a:</label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={formData.userType === 'student' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleInputChange('userType', 'student')}
                  >
                    Student
                  </Button>
                  <Button
                    type="button"
                    variant={formData.userType === 'professional' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleInputChange('userType', 'professional')}
                  >
                    Professional
                  </Button>
                </div>
                {errors.userType && <p className="text-red-500 text-sm">{errors.userType}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>

              {/* OTP */}
              <div className="flex gap-2 items-center mb-2">
                <Input
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={(e) => handleInputChange("otp", e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={timeLeft > 0}
                >
                  {otpSent ? "Resend OTP" : "Send OTP"}
                </Button>
              </div>

              {/* otp timer and expiry msg */}
              {otpSent && (
                <p className="text-xs mt-1">
                  {timeLeft > 0 ? (
                    <span className="text-gray-500">
                      OTP expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                  ) : (
                    <span className="text-red-500">OTP expired, please resend</span>
                  )}
                </p>
              )}

              {/* Submit Button */}
              <Button type="submit" onClick={handleSubmit} disabled={isLoading || !formData.otp || timeLeft === 0} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

            </form>

            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;


