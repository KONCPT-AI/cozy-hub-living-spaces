import AdminLayout from '@/components/AdminLayout';
import UserRolesDocs from '@/components/admin/UserRolesDocs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserRolesDocumentation = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User Management
        </Button>
        <UserRolesDocs />
      </div>
    </AdminLayout>
  );
};

export default UserRolesDocumentation;