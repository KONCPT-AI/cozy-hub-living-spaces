import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: 'Admin Access Granted',
        description: 'Welcome to the admin dashboard.',
      });
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid admin credentials. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDemoLogin = async () => {
    const success = await login('admin@demo.com', 'admin123');
    
    if (success) {
      toast({
        title: 'Demo Admin Access',
        description: 'Welcome to the admin dashboard.',
      });
      navigate('/admin/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logged Out',
      description: 'You can now login with admin credentials.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-secondary-foreground" />
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
            {user && user.userType !== 'admin' && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Already logged in as regular user</p>
                    <p className="text-muted-foreground mt-1">
                      Currently logged in as: {user.email}
                    </p>
                    <p className="text-muted-foreground">
                      You need to logout first to access admin panel.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="ml-2"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
            {/* Demo Account */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">Try Demo Admin Account:</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <Badge variant="secondary" className="mr-2">Demo</Badge>
                Admin Access
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Demo Admin: admin@demo.com / admin123
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <Input
                  type="email"
                  placeholder="Enter admin email"
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
                    placeholder="Enter admin password"
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
        <div className="text-center mt-6">
          <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;