import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'student' | 'professional'>('student');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password, 'user');
    
    if (success) {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/user/dashboard');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDemoLogin = async (type: 'student' | 'professional') => {
    const demoCredentials = {
      student: { email: 'student@demo.com', password: 'demo123' },
      professional: { email: 'professional@demo.com', password: 'demo123' }
    };

    const { email: demoEmail, password: demoPassword } = demoCredentials[type];
    
    const success = await login(demoEmail, demoPassword, 'user');
    
    if (success) {
      toast({
        title: `Welcome, ${type}!`,
        description: 'You have successfully logged in with demo account.',
      });
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-secondary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">CoLiving</span>
          </Link>
          <p className="text-primary-foreground/80 mt-2">Welcome back to your community</p>
        </div>

        <Card className="border-0 shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">I am a:</label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={userType === 'student' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setUserType('student')}
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={userType === 'professional' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setUserType('professional')}
                >
                  Professional
                </Button>
              </div>
            </div>

            {/* Demo Accounts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">Try Demo Accounts:</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDemoLogin('student')}
                  disabled={isLoading}
                >
                  <Badge variant="secondary" className="mr-2">Demo</Badge>
                  Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDemoLogin('professional')}
                  disabled={isLoading}
                >
                  <Badge variant="secondary" className="mr-2">Demo</Badge>
                  Professional
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Student: student@demo.com / demo123<br />
                Professional: professional@demo.com / demo123
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              <Link to="/forgot-password" className="text-sm text-secondary hover:underline">
                Forgot your password?
              </Link>
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