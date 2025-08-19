import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_ENDPOINTS, getApiConfig } from '@/config/api.config';
import { 
  User, 
  ISP, 
  Plan, 
  Payment, 
  Voucher, 
  Session, 
  MikroTikRouter,
  HotspotUser,
  ConnectedUser,
  RevenueSummary,
  UsageSummary,
  SystemHealth,
  Alert,
  Metric,
  AnomalyDetection,
  PricingSuggestion,
  Backup,
  AuditLog,
  BackendApiResponse,
  BackendPaginatedResponse,
  CreateUserFormData,
  CreateISPFormData,
  CreatePlanFormData,
  CreatePaymentFormData,
  CreateVoucherFormData,
  CreateRouterFormData,
  CreateHotspotUserFormData
} from '@/types/common';

// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  totalPayments: number;
  totalVouchers: number;
  totalRevenue: number;
  requestedBy: string;
  timestamp: string;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  timestamp: string;
  services?: {
    database: boolean;
    redis: boolean;
    external: boolean;
  };
}

// Analytics Types
export interface RevenueSummary {
  totalRevenue: number;
  currency: string;
  transactionCount: number;
  averageRevenuePerUser: number;
  growthRate: number;
  dailyAverageRevenue: number;
  period: { startDate: string; endDate: string };
}

export interface UsageSummary {
  totalDataUsageMB: number;
  sessionCount: number;
  averageSessionDuration: number;
  peakUsageTime: string;
  averageUsagePerUserMB: number;
  period: { startDate: string; endDate: string };
}

// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  isp?: {
    id: string;
    name: string;
  };
}

export interface CreateUserDto {
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password: string;
  role: string;
  ispId?: string;
  isActive?: boolean;
  expiryDate?: string;
  enableHotspot?: boolean;
  enablePPPoE?: boolean;
  require2FA?: boolean;
  autoSuspendAfterDays?: number;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  notificationEmail?: string;
  defaultBandwidthPackageId?: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  ispId?: string;
  isActive?: boolean;
  expiryDate?: string;
}

// Payment Types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  refundReason?: string;
  refundDate?: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export interface CreatePaymentDto {
  amount: number;
  currency: string;
  paymentMethod: string;
  userId: string;
  description?: string;
  webhookUrl?: string;
}

export interface RefundDto {
  paymentId: string;
  reason: string;
}

// MikroTik Types
export interface MikroTikRouter {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  username: string;
  status: 'online' | 'offline';
  connectedUsers: number;
  totalUsers: number;
  lastSeen?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotspotUserDto {
  username: string;
  password: string;
  profile: string;
  routerId: string;
  comment?: string;
  limitUptime?: string;
  limitBytesIn?: number;
  limitBytesOut?: number;
  limitBytesTotal?: number;
}

export interface RemoveHotspotUserDto {
  username: string;
  routerId: string;
}

export interface RouterConfigDto {
  name: string;
  ipAddress: string;
  port: number;
  username: string;
  password: string;
  description?: string;
}

// ISP Types
export interface ISP {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  settings?: {
    enableHotspot: boolean;
    enablePPPoE: boolean;
    require2FA: boolean;
    maxConcurrentSessions: number;
    sessionTimeout: number;
    enableUsageLogging: boolean;
    autoSuspendAfterDays?: number;
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    defaultPackageId?: string;
    customPortalUrl?: string;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
  branding?: {
    companyName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    enableDarkMode: boolean;
    showLogoOnLogin: boolean;
    contactEmail: string;
  };
}

// Plan Types
export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number; // in days
  dataLimit?: number; // in MB
  speedLimit?: number; // in Mbps
  isActive: boolean;
  ispId?: string;
  createdAt: string;
  updatedAt: string;
}

// Voucher Types
export interface Voucher {
  id: string;
  code: string;
  type: 'time' | 'data' | 'unlimited';
  value: number; // time in minutes or data in MB
  isActive: boolean;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
  expiresAt?: string;
  ispId?: string;
  createdAt: string;
  updatedAt: string;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  isActive: boolean;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  dataUsed?: number; // in MB
  ipAddress?: string;
  macAddress?: string;
  deviceInfo?: string;
  ispId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    fullName: string;
    email: string;
  };
}

// Create axios instance with interceptors
const api: AxiosInstance = axios.create(getApiConfig());

// Request interceptor to add auth token and tenant ID
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    let token = localStorage.getItem('authToken'); // Match your auth store
    
    // Validate token format
    if (token) {
      // Check for obviously malformed tokens (too short, missing parts)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('JWT token appears to be malformed. Token should have 3 parts separated by dots.');
        // Don't add the token if it's obviously malformed
      } else {
        // Ensure token is properly formatted with Bearer prefix
        if (!token.startsWith('Bearer ')) {
          token = `Bearer ${token}`;
        }
        config.headers.Authorization = token;
      }
    }
    
    // Add tenant ID header
    const tenantId = localStorage.getItem('tenantId') || '1'; // Default to tenant ID 1
    config.headers['x-tenant-id'] = tenantId;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorMessage = error.response?.data?.message || '';
      console.warn(`Authentication error: ${errorMessage}`);
      
      // Try to refresh the token if we have a refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          console.log('Attempting to refresh token...');
          const response = await axios.post('/api/v1/auth/refresh', {
            refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': localStorage.getItem('tenantId') || '1'
            }
          });
          
          if (response.data && response.data.tokens) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
            
            // Update tokens in localStorage
            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            
            console.log('Token refreshed successfully, retrying original request');
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          
          // Clear all auth tokens
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-storage');
          
          // Redirect to login
          window.location.href = '/auth/login';
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      } else {
        // No refresh token or already tried refreshing
        // Clear all auth tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        
        // Show a more helpful message to the user
        const message = errorMessage.includes('malformed') 
          ? 'Your session has expired or is invalid. Please log in again.'
          : 'Authentication failed. Please log in again.';
        
        // Use toast notification if available
        if (window.hasOwnProperty('toast') && typeof window['toast'] === 'function') {
          window['toast']({
            title: 'Session Expired',
            description: message,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        } else {
          console.warn(message);
        }
        
        // Redirect to login
        window.location.href = '/auth/login';
        return Promise.reject(new Error(message));
      }
    }
    
    // Handle API versioning errors (404 with suggestedUrl)
    if (error.response?.status === 404 && 
        error.response?.data?.suggestedUrl && 
        !error.config._isRetry) {
      
      console.warn(`API versioning issue detected. Retrying with correct URL: ${error.response.data.suggestedUrl}`);
      
      // Extract the correct URL and retry the request
      const correctUrl = error.response.data.suggestedUrl;
      const newConfig = { ...error.config, _isRetry: true };
      newConfig.url = correctUrl;
      
      return api.request(newConfig);
    }
    
    return Promise.reject(error);
  }
);

// Generic request helper
const request = async <T>(endpoint: string, options?: any): Promise<T> => {
  try {
    // Ensure tenant ID is set
    const tenantId = localStorage.getItem('tenantId') || '1';
    if (!options) options = {};
    if (!options.headers) options.headers = {};
    options.headers['x-tenant-id'] = tenantId;
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token && !options.headers['Authorization']) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Fix the double /v1 prefix issue
    // Remove the /v1 prefix from the endpoint since it's already in the baseURL
    const fixedEndpoint = endpoint.startsWith('/v1') ? endpoint.substring(3) : endpoint;
    
    console.log(`API Request: Using fixed endpoint ${fixedEndpoint} (original: ${endpoint})`);
    const response = await api(fixedEndpoint, options);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Return appropriate fallback data for different endpoints to prevent UI crashes
    if (endpoint.includes('/mikrotik/routers')) {
      console.log('Returning empty array for routers to prevent UI crash');
      return [] as unknown as T;
    }
    
    if (endpoint.includes('/users')) {
      console.log('Returning empty array for users to prevent UI crash');
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 } as unknown as T;
    }
    
    if (endpoint.includes('/payments/history')) {
      console.log('Returning empty array for payments to prevent UI crash');
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 } as unknown as T;
    }
    
    if (endpoint.includes('/sessions/active')) {
      console.log('Returning empty array for sessions to prevent UI crash');
      return [] as unknown as T;
    }
    
    if (endpoint.includes('/monitoring/alerts')) {
      console.log('Returning empty array for alerts to prevent UI crash');
      return [] as unknown as T;
    }
    
    if (endpoint.includes('/analytics/')) {
      console.log('Returning empty analytics data to prevent UI crash');
      return {} as unknown as T;
    }
    
    if (endpoint.includes('/stats')) {
      console.log('Returning empty stats data to prevent UI crash');
      return {
        totalUsers: 0,
        activeSessions: 0,
        totalPayments: 0,
        totalVouchers: 0,
        totalRevenue: 0,
        requestedBy: 'system',
        timestamp: new Date().toISOString()
      } as unknown as T;
    }
    
    throw error;
  }
};

// Dashboard Services
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/stats');
  },

  async getHealthCheck(): Promise<SystemHealth> {
    return request<SystemHealth>('/health');
  },

  async getVersion(): Promise<any> {
    return request('/version');
  },

  async ping(): Promise<{ message: string; time: string }> {
    return request('/ping');
  },
};

// Analytics Services
export const analyticsService = {
  async getRevenueSummary(params: { startDate: string; endDate: string }): Promise<RevenueSummary> {
    return request<RevenueSummary>('/analytics/revenue-summary', {
      params,
    });
  },

  async getUsageSummary(params: { startDate: string; endDate: string }): Promise<UsageSummary> {
    return request<UsageSummary>('/analytics/usage-summary', {
      params,
    });
  },

  async generateReport(params: { startDate: string; endDate: string; type?: string }): Promise<any> {
    return request('/analytics/reports', {
      params,
    });
  },
};

// Users Services
export const usersService = {
  async getUsers(params?: {
    role?: string;
    ispId?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<User>> {
    return request<PaginatedResponse<User>>('/users', { params });
  },

  async getUser(id: string): Promise<User> {
    return request<User>(`/users/${id}`);
  },

  async createUser(userData: CreateUserDto): Promise<User> {
    return request<User>('/users', {
      method: 'POST',
      data: userData,
    });
  },

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    return request<User>(`/users/${id}`, {
      method: 'PATCH',
      data: userData,
    });
  },

  async deleteUser(id: string): Promise<void> {
    return request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getUserStats(): Promise<any> {
    return request('/users/stats');
  },
};

// Payments Services
export const paymentsService = {
  async getPaymentHistory(params?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>> {
    return request<PaginatedResponse<Payment>>('/payments/history', { params });
  },

  async createPayment(paymentData: CreatePaymentDto): Promise<Payment> {
    return request<Payment>('/payments/create', {
      method: 'POST',
      data: paymentData,
    });
  },

  async refundPayment(refundData: RefundDto): Promise<Payment> {
    return request<Payment>('/payments/refund', {
      method: 'POST',
      data: refundData,
    });
  },

  async getPaymentStatus(transactionId: string): Promise<Payment> {
    return request<Payment>(`/payments/status/${transactionId}`);
  },

  async getPaymentById(id: string): Promise<Payment> {
    return request<Payment>(`/payments/${id}`);
  },
};

// MikroTik Services
export const mikrotikService = {
  async getRouters(): Promise<MikroTikRouter[]> {
    return request<MikroTikRouter[]>('/mikrotik/routers');
  },

  async getRouterById(id: string): Promise<MikroTikRouter> {
    return request<MikroTikRouter>(`/mikrotik/routers/${id}`);
  },

  async addRouter(routerData: RouterConfigDto): Promise<MikroTikRouter> {
    return request<MikroTikRouter>('/mikrotik/routers', {
      method: 'POST',
      data: routerData,
    });
  },

  async updateRouter(id: string, routerData: Partial<RouterConfigDto>): Promise<MikroTikRouter> {
    return request<MikroTikRouter>(`/mikrotik/routers/${id}`, {
      method: 'PUT',
      data: routerData,
    });
  },

  async removeRouter(id: string): Promise<void> {
    return request(`/mikrotik/routers/${id}`, {
      method: 'DELETE',
    });
  },

  async testRouterConnection(id: string): Promise<any> {
    return request(`/mikrotik/routers/${id}/test-connection`, {
      method: 'POST',
    });
  },

  async getRouterStatus(id: string): Promise<any> {
    return request(`/mikrotik/routers/${id}/status`);
  },

  async addHotspotUser(userData: CreateHotspotUserDto): Promise<any> {
    return request('/mikrotik/add-hotspot-user', {
      method: 'POST',
      data: userData,
    });
  },

  async removeHotspotUser(userData: RemoveHotspotUserDto): Promise<any> {
    return request('/mikrotik/remove-hotspot-user', {
      method: 'POST',
      data: userData,
    });
  },

  async listHotspotUsers(routerId: string): Promise<any[]> {
    return request('/mikrotik/hotspot-users', {
      params: { routerId },
    });
  },

  async getConnectedUsers(routerId: string): Promise<any[]> {
    return request('/mikrotik/connected-users', {
      params: { routerId },
    });
  },

  async disconnectUser(mac: string, routerId: string): Promise<any> {
    return request(`/mikrotik/disconnect-user/${mac}`, {
      method: 'DELETE',
      params: { routerId },
    });
  },
  
  // PPPoE Services
  async getPppoeProfiles(): Promise<any[]> {
    return request('/mikrotik/pppoe/profiles');
  },
  
  async getPppoeProfileById(id: string): Promise<any> {
    return request(`/mikrotik/pppoe/profiles/${id}`);
  },
  
  async createPppoeProfile(profileData: {
    name: string;
    localAddress: string;
    remoteAddress: string;
    rateLimit: string;
    comment?: string;
  }): Promise<any> {
    return request('/mikrotik/pppoe/profiles', {
      method: 'POST',
      data: profileData,
    });
  },
  
  async updatePppoeProfile(id: string, profileData: Partial<{
    name: string;
    localAddress: string;
    remoteAddress: string;
    rateLimit: string;
    isActive: boolean;
    comment?: string;
  }>): Promise<any> {
    return request(`/mikrotik/pppoe/profiles/${id}`, {
      method: 'PUT',
      data: profileData,
    });
  },
  
  async deletePppoeProfile(id: string): Promise<void> {
    return request(`/mikrotik/pppoe/profiles/${id}`, {
      method: 'DELETE',
    });
  },
  
  async getPppoeUsers(routerId: string): Promise<any[]> {
    return request('/mikrotik/pppoe/users', {
      params: { routerId },
    });
  },
  
  async createPppoeUser(userData: {
    username: string;
    password: string;
    profileId: string;
    routerId: string;
    comment?: string;
  }): Promise<any> {
    return request('/mikrotik/pppoe/users', {
      method: 'POST',
      data: userData,
    });
  },
  
  async removePppoeUser(userData: {
    username: string;
    routerId: string;
  }): Promise<any> {
    return request('/mikrotik/pppoe/users', {
      method: 'DELETE',
      data: userData,
    });
  },
  
  async getPppoeConnections(routerId: string): Promise<any[]> {
    return request('/mikrotik/pppoe/connections', {
      params: { routerId },
    });
  },
  
  async disconnectPppoeUser(username: string, routerId: string): Promise<any> {
    return request(`/mikrotik/pppoe/disconnect/${username}`, {
      method: 'POST',
      params: { routerId },
    });
  },
};

// ISPs Services
export const ispsService = {
  async getISPs(): Promise<ISP[]> {
    return request<ISP[]>('/isps');
  },

  async getISPById(id: string): Promise<ISP> {
    return request<ISP>(`/isps/${id}`);
  },

  async createISP(ispData: any): Promise<ISP> {
    return request<ISP>('/isps', {
      method: 'POST',
      data: ispData,
    });
  },

  async updateISP(id: string, ispData: any): Promise<ISP> {
    return request<ISP>(`/isps/${id}`, {
      method: 'PUT',
      data: ispData,
    });
  },

  async deleteISP(id: string): Promise<void> {
    return request(`/isps/${id}`, {
      method: 'DELETE',
    });
  },
};

// Plans Services
export const plansService = {
  async getPlans(): Promise<Plan[]> {
    return request<Plan[]>('/plans');
  },

  async getPlanById(id: string): Promise<Plan> {
    return request<Plan>(`/plans/${id}`);
  },

  async createPlan(planData: any): Promise<Plan> {
    return request<Plan>('/plans', {
      method: 'POST',
      data: planData,
    });
  },

  async updatePlan(id: string, planData: any): Promise<Plan> {
    return request<Plan>(`/plans/${id}`, {
      method: 'PUT',
      data: planData,
    });
  },

  async deletePlan(id: string): Promise<void> {
    return request(`/plans/${id}`, {
      method: 'DELETE',
    });
  },
};

// Vouchers Services
export const vouchersService = {
  async getVouchers(): Promise<Voucher[]> {
    return request<Voucher[]>('/vouchers');
  },

  async getVoucherById(id: string): Promise<Voucher> {
    return request<Voucher>(`/vouchers/${id}`);
  },

  async generateVouchers(voucherData: any): Promise<Voucher[]> {
    return request<Voucher[]>('/vouchers/batch', {
      method: 'POST',
      data: voucherData,
    });
  },

  async redeemVoucher(code: string): Promise<any> {
    return request('/vouchers/redeem', {
      method: 'POST',
      data: { code },
    });
  },
};

// Sessions Services
export const sessionsService = {
  async getSessions(): Promise<Session[]> {
    return request<Session[]>('/sessions');
  },

  async getActiveSessions(): Promise<Session[]> {
    return request<Session[]>('/sessions/active');
  },

  async getSessionById(id: string): Promise<Session> {
    return request<Session>(`/sessions/${id}`);
  },

  async closeSession(id: string): Promise<Session> {
    return request<Session>(`/sessions/${id}/close`, {
      method: 'POST',
    });
  },
};

// Auth Services
export const authService = {
  async login(credentials: { email: string; password: string; tenantId?: string; otpCode?: string }): Promise<any> {
    return request('/auth/login', {
      method: 'POST',
      data: credentials,
    });
  },

  async register(userData: any): Promise<any> {
    return request('/auth/register', {
      method: 'POST',
      data: userData,
    });
  },

  async getProfile(): Promise<User> {
    return request<User>('/auth/profile');
  },

  async logout(): Promise<any> {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  async refreshToken(refreshToken: string): Promise<any> {
    return request('/auth/refresh', {
      method: 'POST',
      data: { refreshToken },
    });
  },

  async forgotPassword(email: string): Promise<any> {
    return request('/auth/forgot-password', {
      method: 'POST',
      data: { email },
    });
  },

  async resetPassword(token: string, password: string): Promise<any> {
    return request('/auth/reset-password', {
      method: 'POST',
      data: { token, password },
    });
  },

  async enable2FA(): Promise<any> {
    return request('/auth/enable-2fa', {
      method: 'POST',
    });
  },

  async verify2FA(token: string): Promise<any> {
    return request('/auth/verify-2fa', {
      method: 'POST',
      data: { token },
    });
  },
};

// TR-069 Services
export const tr069Service = {
  // Device Management
  async getDevices(params?: {
    status?: string;
    type?: string;
    isOnline?: boolean;
    isProvisioned?: boolean;
    search?: string;
  }): Promise<any[]> {
    return request('/tr069/devices', { params });
  },
  
  // Alias for getDevices for backward compatibility
  async getAllDevices(params?: {
    status?: string;
    type?: string;
    isOnline?: boolean;
    isProvisioned?: boolean;
    search?: string;
  }): Promise<any[]> {
    return this.getDevices(params);
  },

  async getDeviceById(id: string): Promise<any> {
    return request(`/tr069/devices/${id}`);
  },

  async createDevice(deviceData: {
    name: string;
    serialNumber: string;
    macAddress?: string;
    type?: string;
    manufacturer?: string;
    model?: string;
    description?: string;
    profileId?: string;
    clientId?: string;
    locationId?: string;
  }): Promise<any> {
    return request('/tr069/devices', {
      method: 'POST',
      data: deviceData,
    });
  },

  async updateDevice(id: string, deviceData: any): Promise<any> {
    return request(`/tr069/devices/${id}`, {
      method: 'PUT',
      data: deviceData,
    });
  },

  async deleteDevice(id: string): Promise<void> {
    return request(`/tr069/devices/${id}`, {
      method: 'DELETE',
    });
  },

  // Device Provisioning
  async provisionDevice(id: string, data: {
    parameters?: Record<string, any>;
    notes?: string;
  }): Promise<any> {
    return request(`/tr069/devices/${id}/provision`, {
      method: 'POST',
      data,
    });
  },

  async rebootDevice(id: string, data?: {
    notes?: string;
  }): Promise<any> {
    return request(`/tr069/devices/${id}/reboot`, {
      method: 'POST',
      data: data || {},
    });
  },

  async factoryResetDevice(id: string, data?: {
    notes?: string;
  }): Promise<any> {
    return request(`/tr069/devices/${id}/factory-reset`, {
      method: 'POST',
      data: data || {},
    });
  },

  async upgradeFirmware(id: string, data: {
    firmwareVersion: string;
    firmwareUrl: string;
    notes?: string;
  }): Promise<any> {
    return request(`/tr069/devices/${id}/upgrade`, {
      method: 'POST',
      data,
    });
  },

  // Device Parameters
  async getDeviceParameters(id: string): Promise<any[]> {
    return request(`/tr069/devices/${id}/parameters`);
  },

  async updateDeviceParameter(id: string, name: string, value: string): Promise<any> {
    return request(`/tr069/devices/${id}/parameters/${name}`, {
      method: 'PUT',
      data: { value },
    });
  },

  // Device Profiles
  async getProfiles(): Promise<any[]> {
    return request('/tr069/profiles');
  },
  
  // Alias for getProfiles for backward compatibility
  async getAllProfiles(): Promise<any[]> {
    return this.getProfiles();
  },

  async getProfileById(id: string): Promise<any> {
    return request(`/tr069/profiles/${id}`);
  },

  async createProfile(profileData: {
    name: string;
    description?: string;
    parameters: Record<string, any>;
    deviceType?: string;
    manufacturer?: string;
    model?: string;
  }): Promise<any> {
    return request('/tr069/profiles', {
      method: 'POST',
      data: profileData,
    });
  },

  async updateProfile(id: string, profileData: any): Promise<any> {
    return request(`/tr069/profiles/${id}`, {
      method: 'PUT',
      data: profileData,
    });
  },

  async deleteProfile(id: string): Promise<void> {
    return request(`/tr069/profiles/${id}`, {
      method: 'DELETE',
    });
  },

  // Device Jobs and Status
  async getDeviceJobs(id: string, status?: string): Promise<any[]> {
    return request(`/tr069/devices/${id}/jobs`, {
      params: { status },
    });
  },

  async getDeviceUpgrades(id: string, status?: string): Promise<any[]> {
    return request(`/tr069/devices/${id}/upgrades`, {
      params: { status },
    });
  },

  async getDeviceStatus(id: string): Promise<any> {
    return request(`/tr069/devices/${id}/status`);
  },

  async checkDeviceStatus(id: string): Promise<{ online: boolean }> {
    return request(`/tr069/devices/${id}/check`);
  },

  // ACS Configuration
  async getAcsConfig(): Promise<any> {
    return request('/tr069/acs/config');
  },

  async updateAcsConfig(config: Record<string, any>): Promise<any> {
    return request('/tr069/acs/config', {
      method: 'PUT',
      data: config,
    });
  },

  async getAcsStats(): Promise<any> {
    return request('/tr069/acs/stats');
  },

  async getSupportedModels(): Promise<any[]> {
    return request('/tr069/acs/models');
  },
};

// Monitoring Services
export const monitoringService = {
  async getAlerts(ispId: string): Promise<any[]> {
    return request(`/monitoring/alerts?ispId=${ispId}`);
  },

  async getSystemMetrics(ispId: string): Promise<any> {
    return request(`/monitoring/metrics?ispId=${ispId}`);
  },

  async getHealthStatus(ispId: string): Promise<any> {
    return request(`/monitoring/health?ispId=${ispId}`);
  },

  async recordMetric(metricData: {
    metricType: string;
    value: number;
    ispId: string;
    deviceId?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return request('/monitoring/metrics', {
      method: 'POST',
      data: metricData,
    });
  },

  async createAlert(alertData: {
    title: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    ispId: string;
    deviceId?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return request('/monitoring/alerts', {
      method: 'POST',
      data: alertData,
    });
  },
  
  // Enhanced metrics methods for MetricsPage
  async getMetrics(params: { dateFrom: Date; dateTo: Date; ispId?: string }): Promise<any> {
    return request('/metrics/summary', {
      params: {
        start: params.dateFrom.toISOString(),
        end: params.dateTo.toISOString(),
        ispId: params.ispId || 'all',
      },
    });
  },
  
  async getRevenueMetrics(params: { dateFrom: Date; dateTo: Date; ispId?: string }): Promise<any> {
    return request('/metrics/summary', {
      params: {
        type: 'REVENUE',
        start: params.dateFrom.toISOString(),
        end: params.dateTo.toISOString(),
        ispId: params.ispId || 'all',
      },
    });
  },
  
  async getUsageMetrics(params: { dateFrom: Date; dateTo: Date; ispId?: string }): Promise<any> {
    return request('/metrics/summary', {
      params: {
        type: 'USAGE',
        start: params.dateFrom.toISOString(),
        end: params.dateTo.toISOString(),
        ispId: params.ispId || 'all',
      },
    });
  },

  async logHealthStatus(healthData: {
    serviceName: string;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    message?: string;
    ispId: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    return request('/monitoring/health', {
      method: 'POST',
      data: healthData,
    });
  },
};

// AI Services
export const aiService = {
  async getAnomalyDetection(): Promise<any> {
    return request('/ai/anomaly-detection');
  },

  async getDynamicPricing(): Promise<any> {
    return request('/ai/dynamic-pricing');
  },

  async getPredictions(type: string): Promise<any> {
    return request('/ai/predict', {
      method: 'POST',
      data: { type },
    });
  },

  async getAIHealth(): Promise<any> {
    return request('/ai/health');
  },
};

// No duplicate TR-069 service needed - already defined above

// PPPoE Services
export const pppoeService = {
  async getProfiles(): Promise<any[]> {
    return request('/mikrotik/pppoe/profiles');
  },

  async getProfileById(id: string): Promise<any> {
    return request(`/mikrotik/pppoe/profiles/${id}`);
  },

  async createProfile(profileData: {
    name: string;
    localAddress: string;
    remoteAddress: string;
    rateLimit: string;
    comment?: string;
  }): Promise<any> {
    return request('/mikrotik/pppoe/profiles', {
      method: 'POST',
      data: profileData,
    });
  },

  async updateProfile(id: string, profileData: Partial<{
    name: string;
    localAddress: string;
    remoteAddress: string;
    rateLimit: string;
    isActive: boolean;
    comment?: string;
  }>): Promise<any> {
    return request(`/mikrotik/pppoe/profiles/${id}`, {
      method: 'PUT',
      data: profileData,
    });
  },

  async deleteProfile(id: string): Promise<void> {
    return request(`/mikrotik/pppoe/profiles/${id}`, {
      method: 'DELETE',
    });
  },

  async getPppoeUsers(routerId: string): Promise<any[]> {
    return request('/mikrotik/pppoe/users', {
      params: { routerId },
    });
  },

  async addPppoeUser(userData: {
    username: string;
    password: string;
    profile: string;
    routerId: string;
    localAddress?: string;
    remoteAddress?: string;
    comment?: string;
  }): Promise<any> {
    return request('/mikrotik/pppoe/users', {
      method: 'POST',
      data: userData,
    });
  },

  async removePppoeUser(userData: {
    username: string;
    routerId: string;
  }): Promise<any> {
    return request('/mikrotik/pppoe/users', {
      method: 'DELETE',
      data: userData,
    });
  },

  async getPppoeConnections(routerId: string): Promise<any[]> {
    return request('/mikrotik/pppoe/connections', {
      params: { routerId },
    });
  },

  async disconnectPppoeUser(userData: {
    username: string;
    routerId: string;
  }): Promise<any> {
    return request('/mikrotik/pppoe/disconnect', {
      method: 'POST',
      data: userData,
    });
  },
};

// Notifications Services
export const notificationsService = {
  async sendNotification(notificationData: any): Promise<any> {
    return request('/notifications/send', {
      method: 'POST',
      data: notificationData,
    });
  },

  async getNotificationLogs(): Promise<any[]> {
    return request('/notifications/logs');
  },
};

// Backup Services
export const backupService = {
  async getAllBackups(): Promise<any[]> {
    return request('/backup/all');
  },

  async createBackup(): Promise<any> {
    return request('/backup/create', {
      method: 'POST',
    });
  },

  async restoreBackup(id: string): Promise<any> {
    return request(`/backup/restore/${id}`, {
      method: 'POST',
    });
  },

  async deleteBackup(id: string): Promise<void> {
    return request(`/backup/${id}`, {
      method: 'DELETE',
    });
  },
};

// Audit Services
export const auditService = {
  async getAuditLogs(params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    return request<PaginatedResponse<any>>('/audit/logs', { params });
  },
};

export default api;

