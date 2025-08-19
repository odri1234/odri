import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallback 
}: RoleGuardProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // SuperAdmin always has access to all routes
  if (user.role === UserRole.SUPER_ADMIN) {
    return <>{children}</>;
  }
  
  // For other roles, check if they have permission
  if (!allowedRoles.includes(user.role)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;