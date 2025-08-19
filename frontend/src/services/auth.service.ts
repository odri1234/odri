import { API_ENDPOINTS, getApiConfig } from '@/config/api.config';
import { User, UserRole } from '@/types/common';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  tenant?: any;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  ispId?: string;
}

export interface TwoFactorRequest {
  tempToken: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

class AuthService {
  private baseURL: string;

  constructor() {
    const config = getApiConfig();
    this.baseURL = config.baseURL;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const config = getApiConfig();
    
    // Always ensure tenant ID is set
    const tenantId = localStorage.getItem('tenantId') || '1';
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-tenant-id': tenantId,
      ...config.headers,
      ...options.headers as Record<string, string>,
    };
    
    if (token && !endpoint.includes('/login')) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log the request details
    console.log(`Auth service request to ${this.baseURL}${endpoint}`, {
      method: options.method || 'GET',
      tenantId,
      hasToken: !!token && !endpoint.includes('/login')
    });
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle both wrapped and unwrapped responses
    return result.data || result;
  }

  async login(credentials: LoginRequest & { tenantId?: string }): Promise<LoginResponse> {
    // Set tenant ID in localStorage if provided
    if (credentials.tenantId) {
      localStorage.setItem('tenantId', credentials.tenantId);
    }
    
    console.log('Login request with credentials:', {
      email: credentials.email,
      tenantId: credentials.tenantId || localStorage.getItem('tenantId') || '1'
    });
    
    // Remove tenantId from credentials before sending to API
    const { tenantId, ...loginCredentials } = credentials;
    
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginCredentials),
    });
    
    console.log('Login response received:', {
      hasUser: !!response.user,
      hasTokens: !!response.tokens,
      tokenLength: response.tokens?.accessToken?.length || 0
    });
    
    return response;
  }

  async register(userData: RegisterRequest): Promise<{ user: User; message: string }> {
    return this.makeRequest<{ user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyTwoFactor(data: TwoFactorRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(token: string): Promise<User> {
    return this.makeRequest<User>('/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async logout(token: string): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Ignore logout errors - we'll clear local state anyway
      console.warn('Logout request failed:', error);
    }
  }

  async enableTwoFactor(token: string): Promise<{ secret: string; qrCode: string }> {
    return this.makeRequest<{ secret: string; qrCode: string }>('/auth/enable-2fa', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Helper methods for role checking
  static hasRole(user: User | null, role: UserRole): boolean {
    return user?.role === role;
  }

  static hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    return user ? roles.includes(user.role) : false;
  }

  static isSuperAdmin(user: User | null): boolean {
    return user?.role === UserRole.SUPER_ADMIN;
  }

  static isAdmin(user: User | null): boolean {
    return user?.role === UserRole.ADMIN;
  }

  static isISPAdmin(user: User | null): boolean {
    return user?.role === UserRole.ISP_ADMIN;
  }

  static isISPStaff(user: User | null): boolean {
    return user?.role === UserRole.ISP_STAFF;
  }

  static canAccessISP(user: User | null, ispId: string): boolean {
    if (!user) return false;
    
    // Super admin and admin can access all ISPs
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return true;
    }
    
    // ISP users can only access their own ISP
    return user.ispId === ispId;
  }

  static canManageUsers(user: User | null): boolean {
    return AuthService.hasAnyRole(user, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ISP_ADMIN
    ]);
  }

  static canManageISPs(user: User | null): boolean {
    return AuthService.hasAnyRole(user, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN
    ]);
  }

  static canManagePlans(user: User | null): boolean {
    return AuthService.hasAnyRole(user, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ISP_ADMIN
    ]);
  }

  static canViewReports(user: User | null): boolean {
    return AuthService.hasAnyRole(user, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ISP_ADMIN,
      UserRole.FINANCE,
      UserRole.AUDITOR
    ]);
  }

  static canManageSystem(user: User | null): boolean {
    return AuthService.hasAnyRole(user, [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN
    ]);
  }

  // Token management helpers
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  }

  static getTokenExpiry(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  static shouldRefreshToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // Refresh if token expires in less than 5 minutes
      return timeUntilExpiry < 300;
    } catch (error) {
      return true;
    }
  }
}

export const authService = new AuthService();
export default authService;