import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  User, 
  Building, 
  Calendar, 
  CreditCard, 
  HeadphonesIcon, 
  PartyPopper, 
  LogOut,
  Menu,
  X,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigationItems = [
    { name: 'Dashboard', href: '/user/dashboard', icon: Home },
    { name: 'Profile', href: '/user/profile', icon: User },
    { name: 'Browse Rooms', href: '/user/rooms', icon: Building },
    { name: 'My Bookings', href: '/user/bookings', icon: Calendar },
    { name: 'Payments', href: '/user/payments', icon: CreditCard },
    { name: 'Access History', href: '/user/access-history', icon: Clock },
    { name: 'Support', href: '/user/support', icon: HeadphonesIcon },
    { name: 'Events', href: '/user/events', icon: PartyPopper },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account.',
    });
    navigate('/');
  };

  const getUserTypeColor = () => {
    if (user?.userType === 'student') return 'bg-blue-500';
    if (user?.userType === 'professional') return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CoLiving
            </span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getUserTypeColor()} rounded-full flex items-center justify-center text-white font-semibold`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.userType || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${getUserTypeColor()} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;