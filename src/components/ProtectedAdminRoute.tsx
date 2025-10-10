
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requiredRole?: ('super-admin' | 'admin' )[];
  requirePermission?: string;
}

const ProtectedAdminRoute = ({ children, requiredRole=['super-admin','admin'],requirePermission }: ProtectedAdminRouteProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/admin-login');
        return;
      }
      if (!requiredRole.includes(user.role as 'super-admin' | 'admin')) {
        navigate('/admin-login');
        return;
      }
      //admin permission
      if (requirePermission && user.role === 'admin') {
        const adminUser = user as any; // or AdminUser

        if (!adminUser.permission || !adminUser.permission.includes(requirePermission)) {
          navigate('/admin-login');
          return;
        }

        if (requirePermission && adminUser.pages && !adminUser.pages.includes(requirePermission)) {
        navigate('/admin-login');
        return;
      }

      }

    }
  }, [user, isLoading,requiredRole,requirePermission, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

 
  return <>{children}</>;
};

export default ProtectedAdminRoute;
