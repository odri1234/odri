import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth.store';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: AuthGuardProps) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not authenticated
    console.log('User not authenticated, redirecting to login page');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Redirect to dashboard if user is already authenticated and trying to access auth pages
    return <Navigate to={redirectTo || "/dashboard"} replace />;
  }

  return <>{children}</>;
};