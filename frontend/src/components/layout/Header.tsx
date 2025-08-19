import { useAuth, useAuthActions } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User } from 'lucide-react';

export const Header = () => {
  const { user } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            ODRI WiFi System
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};