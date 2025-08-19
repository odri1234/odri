// Authentication store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, TenantInfo, UserRole } from '@/types/common';
import { setAuthToken, clearAuthToken, setTenantId, clearTenantId } from '@/lib/axios';

interface AuthState {
  user: User | null;
  tenant: TenantInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  login: (user: User, token: string, refreshToken: string, tenant?: TenantInfo) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTenant: (tenant: TenantInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => void;
  // Role-based access methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessISP: (ispId: string) => boolean;
  canAccessResource: (resourceId: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  isISPAdmin: () => boolean;
  isISPStaff: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Actions
      login: (user, token, refreshToken, tenant) => {
        console.log('Auth store login called:', { 
          user: user.email, 
          hasToken: !!token, 
          tokenLength: token?.length || 0,
          hasTenant: !!tenant 
        });
        
        // Validate token
        if (!token) {
          console.error('Invalid token provided to auth store login');
          return;
        }
        
        // Store tokens
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Set axios headers
        setAuthToken(token);
        
        // Set tenant ID - use tenant.id if available, otherwise default to '1'
        const tenantId = tenant ? tenant.id : '1';
        localStorage.setItem('tenantId', tenantId);
        setTenantId(tenantId);
        console.log('Setting tenant ID:', tenantId);

        set({
          user,
          tenant,
          isAuthenticated: true,
          error: null,
        });
        
        console.log('Auth store login completed, user authenticated');
      },

      logout: () => {
        // Clear tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tenantId');
        
        // Clear axios headers
        clearAuthToken();
        clearTenantId();

        set({
          user: null,
          tenant: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setTenant: (tenant) => {
        localStorage.setItem('tenantId', tenant.id);
        setTenantId(tenant.id);
        set({ tenant });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        const token = localStorage.getItem('authToken');
        const tenantId = localStorage.getItem('tenantId');
        const storedUser = localStorage.getItem('auth-storage');
        
        console.log('Initializing auth store...', { hasToken: !!token, hasTenantId: !!tenantId, hasStoredUser: !!storedUser });
        
        if (token) {
          setAuthToken(token);
        }
        
        // Always set a tenant ID, default to '1' if none is found
        const effectiveTenantId = tenantId || '1';
        setTenantId(effectiveTenantId);
        localStorage.setItem('tenantId', effectiveTenantId);
        console.log('Ensuring tenant ID is set:', effectiveTenantId);

        // If we have stored auth data, restore the authentication state
        if (storedUser && token) {
          try {
            const parsedData = JSON.parse(storedUser);
            if (parsedData.state?.user && parsedData.state?.isAuthenticated) {
              console.log('Restoring auth state for user:', parsedData.state.user.email);
              set({
                user: parsedData.state.user,
                tenant: parsedData.state.tenant,
                isAuthenticated: true,
                error: null,
              });
            }
          } catch (error) {
            console.error('Failed to parse stored auth data:', error);
            // Clear invalid data
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tenantId');
            clearAuthToken();
            clearTenantId();
          }
        } else if (!token) {
          // No token found, ensure we're in a clean unauthenticated state
          console.log('No auth token found, clearing auth state');
          set({
            user: null,
            tenant: null,
            isAuthenticated: false,
            error: null,
          });
        }
        
        // Mark initialization as complete
        set({ isInitialized: true });
      },

      // Role-based access methods
      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.role === role;
      },

      hasAnyRole: (roles: UserRole[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      canAccessISP: (ispId: string) => {
        const { user } = get();
        if (!user) return false;
        
        // Super admin can access all ISPs
        if (user.role === UserRole.SUPER_ADMIN) return true;
        
        // Admin can access all ISPs
        if (user.role === UserRole.ADMIN) return true;
        
        // ISP users can only access their own ISP
        return user.ispId === ispId;
      },
      
      // Check if user can access any resource
      canAccessResource: (resourceId: string) => {
        const { user } = get();
        if (!user) return false;
        
        // Super admin can access all resources
        if (user.role === UserRole.SUPER_ADMIN) return true;
        
        // For other roles, implement specific access logic
        return false;
      },

      isSuperAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.SUPER_ADMIN;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.ADMIN;
      },

      isISPAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.ISP_ADMIN;
      },

      isISPStaff: () => {
        const { user } = get();
        return user?.role === UserRole.ISP_STAFF;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useAuth = () => {
  const state = useAuthStore();
  return {
    user: state.user,
    tenant: state.tenant,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    // Role-based access methods
    hasRole: state.hasRole,
    hasAnyRole: state.hasAnyRole,
    canAccessISP: state.canAccessISP,
    canAccessResource: state.canAccessResource,
    isSuperAdmin: state.isSuperAdmin,
    isAdmin: state.isAdmin,
    isISPAdmin: state.isISPAdmin,
    isISPStaff: state.isISPStaff,
  };
};

export const useAuthActions = () => {
  const actions = useAuthStore();
  return {
    login: actions.login,
    logout: actions.logout,
    setUser: actions.setUser,
    setTenant: actions.setTenant,
    setLoading: actions.setLoading,
    setError: actions.setError,
    clearError: actions.clearError,
    initialize: actions.initialize,
  };
};