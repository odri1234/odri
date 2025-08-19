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
  CreateHotspotUserFormData,
  UserRole,
  PaymentStatus,
  PaymentMethod
} from '@/types/common';

// Enhanced API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Create axios instance with enhanced configuration
const api: AxiosInstance = axios.create(getApiConfig());

// Request interceptor to add auth token and handle requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      console.log(`API Request to ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth-storage');
      window.location.href = '/auth/login';
    }
    
    // Enhanced error logging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Generic request helper with enhanced error handling and real-time support
const request = async <T>(endpoint: string, options?: any): Promise<T> => {
  try {
    // Add cache-busting parameter for GET requests to ensure fresh data
    if (options?.method === 'GET' || !options?.method) {
      options = {
        ...options,
        params: {
          ...(options?.params || {}),
          _t: Date.now() // Add timestamp to prevent caching
        }
      };
    }
    
    // Ensure headers are set
    if (!options) options = {};
    if (!options.headers) options.headers = {};
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token && !options.headers['Authorization']) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Ensure tenant ID is set
    const tenantId = localStorage.getItem('tenantId') || '1';
    options.headers['x-tenant-id'] = tenantId;
    
    // Add request metadata for tracking
    options = {
      ...options,
      metadata: {
        startTime: new Date(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };
    
    // Make the request
    const response = await api(endpoint, options);
    
    // Calculate request duration for performance monitoring
    const endTime = new Date();
    const duration = endTime.getTime() - options.metadata.startTime.getTime();
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request to ${endpoint} completed in ${duration}ms`);
    }
    
    // Return normalized data
    return response.data.data || response.data;
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Transform error for better handling
    const apiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error || 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: endpoint,
      method: options?.method || 'GET',
      requestId: options?.metadata?.requestId
    };
    
    throw apiError;
  }
};

// Authentication Services
export const authService = {
  async login(credentials: { email: string; password: string; tenantId?: string; otpCode?: string }): Promise<any> {
    return request('/auth/login', {
      method: 'POST',
      data: credentials,
    });
  },

  async register(userData: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<any> {
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

  async refreshToken(): Promise<any> {
    const refreshToken = localStorage.getItem('refreshToken');
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

// Dashboard Services
export const dashboardService = {
  async getStats(): Promise<any> {
    return request('/stats');
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

// Users Services
export const usersService = {
  async getUsers(params?: {
    role?: UserRole;
    ispId?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedApiResponse<User>> {
    return request<PaginatedApiResponse<User>>('/users', { params });
  },

  async getUser(id: string): Promise<User> {
    return request<User>(`/users/${id}`);
  },

  async createUser(userData: CreateUserFormData): Promise<User> {
    return request<User>('/users', {
      method: 'POST',
      data: userData,
    });
  },

  async updateUser(id: string, userData: Partial<CreateUserFormData>): Promise<User> {
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
};

// ISPs Services
export const ispsService = {
  async getISPs(): Promise<ISP[]> {
    return request<ISP[]>('/isps');
  },

  async getISP(id: string): Promise<ISP> {
    return request<ISP>(`/isps/${id}`);
  },

  async createISP(ispData: CreateISPFormData): Promise<ISP> {
    return request<ISP>('/isps', {
      method: 'POST',
      data: ispData,
    });
  },

  async updateISP(id: string, ispData: Partial<CreateISPFormData>): Promise<ISP> {
    return request<ISP>(`/isps/${id}`, {
      method: 'PATCH',
      data: ispData,
    });
  },

  async deleteISP(id: string): Promise<void> {
    return request(`/isps/${id}`, {
      method: 'DELETE',
    });
  },

  async getISPStats(id: string): Promise<any> {
    return request(`/isps/${id}/stats`);
  },
};

// Plans Services
export const plansService = {
  async getPlans(params?: { ispId?: string; isActive?: boolean }): Promise<Plan[]> {
    return request<Plan[]>('/plans', { params });
  },

  async getPlan(id: string): Promise<Plan> {
    return request<Plan>(`/plans/${id}`);
  },

  async createPlan(planData: CreatePlanFormData): Promise<Plan> {
    return request<Plan>('/plans', {
      method: 'POST',
      data: planData,
    });
  },

  async updatePlan(id: string, planData: Partial<CreatePlanFormData>): Promise<Plan> {
    return request<Plan>(`/plans/${id}`, {
      method: 'PATCH',
      data: planData,
    });
  },

  async deletePlan(id: string): Promise<void> {
    return request(`/plans/${id}`, {
      method: 'DELETE',
    });
  },
};

// Payments Services
export const paymentsService = {
  async getPayments(params?: {
    userId?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedApiResponse<Payment>> {
    return request<PaginatedApiResponse<Payment>>('/payments/history', { params });
  },

  async getPayment(id: string): Promise<Payment> {
    return request<Payment>(`/payments/${id}`);
  },

  async createPayment(paymentData: CreatePaymentFormData): Promise<Payment> {
    return request<Payment>('/payments/create', {
      method: 'POST',
      data: paymentData,
    });
  },

  async refundPayment(paymentId: string, reason: string): Promise<Payment> {
    return request<Payment>('/payments/refund', {
      method: 'POST',
      data: { paymentId, reason },
    });
  },

  async getPaymentStatus(transactionId: string): Promise<Payment> {
    return request<Payment>(`/payments/status/${transactionId}`);
  },
};

// Vouchers Services
export const vouchersService = {
  async getVouchers(params?: {
    ispId?: string;
    isUsed?: boolean;
    planId?: string;
    batchId?: string;
  }): Promise<Voucher[]> {
    return request<Voucher[]>('/vouchers', { params });
  },

  async getVoucher(id: string): Promise<Voucher> {
    return request<Voucher>(`/vouchers/${id}`);
  },

  async createVoucher(voucherData: CreateVoucherFormData): Promise<Voucher> {
    return request<Voucher>('/vouchers', {
      method: 'POST',
      data: voucherData,
    });
  },

  async generateVoucherBatch(batchData: {
    planId: string;
    quantity: number;
    prefix?: string;
    expiresAt?: string;
  }): Promise<Voucher[]> {
    return request<Voucher[]>('/vouchers/batch', {
      method: 'POST',
      data: batchData,
    });
  },

  async redeemVoucher(code: string): Promise<any> {
    return request('/vouchers/redeem', {
      method: 'POST',
      data: { code },
    });
  },
  
  async deleteVoucher(id: string): Promise<void> {
    return request(`/vouchers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sessions Services
export const sessionsService = {
  async getSessions(params?: {
    userId?: string;
    ispId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Session[]> {
    return request<Session[]>('/sessions', { params });
  },

  async getActiveSessions(params?: { ispId?: string }): Promise<Session[]> {
    return request<Session[]>('/sessions/active', { params });
  },

  async getSession(id: string): Promise<Session> {
    return request<Session>(`/sessions/${id}`);
  },

  async createSession(sessionData: {
    userId: string;
    planId: string;
    ipAddress?: string;
    macAddress?: string;
    deviceInfo?: string;
  }): Promise<Session> {
    return request<Session>('/sessions', {
      method: 'POST',
      data: sessionData,
    });
  },

  async updateSession(id: string, sessionData: {
    status?: string;
    endTime?: string;
    bytesIn?: number;
    bytesOut?: number;
  }): Promise<Session> {
    return request<Session>(`/sessions/${id}`, {
      method: 'PATCH',
      data: sessionData,
    });
  },

  async terminateSession(id: string): Promise<void> {
    return request(`/sessions/${id}/terminate`, {
      method: 'POST',
    });
  },
};

// MikroTik Services
export const mikrotikService = {
  async getRouters(): Promise<MikroTikRouter[]> {
    return request<MikroTikRouter[]>('/mikrotik/routers');
  },

  async getRouter(id: string): Promise<MikroTikRouter> {
    return request<MikroTikRouter>(`/mikrotik/routers/${id}`);
  },

  async addRouter(routerData: CreateRouterFormData): Promise<MikroTikRouter> {
    return request<MikroTikRouter>('/mikrotik/routers', {
      method: 'POST',
      data: routerData,
    });
  },

  async updateRouter(id: string, routerData: Partial<CreateRouterFormData>): Promise<MikroTikRouter> {
    return request<MikroTikRouter>(`/mikrotik/routers/${id}`, {
      method: 'PATCH',
      data: routerData,
    });
  },

  async deleteRouter(id: string): Promise<void> {
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

  async addHotspotUser(userData: CreateHotspotUserFormData): Promise<any> {
    return request('/mikrotik/add-hotspot-user', {
      method: 'POST',
      data: userData,
    });
  },

  async removeHotspotUser(username: string, routerId: string): Promise<any> {
    return request('/mikrotik/remove-hotspot-user', {
      method: 'POST',
      data: { username, routerId },
    });
  },

  async getHotspotUsers(routerId: string): Promise<HotspotUser[]> {
    return request<HotspotUser[]>('/mikrotik/hotspot-users', {
      params: { routerId },
    });
  },

  async getConnectedUsers(routerId: string): Promise<ConnectedUser[]> {
    return request<ConnectedUser[]>('/mikrotik/connected-users', {
      params: { routerId },
    });
  },

  async disconnectUser(mac: string, routerId: string): Promise<any> {
    return request(`/mikrotik/disconnect-user/${mac}`, {
      method: 'DELETE',
      params: { routerId },
    });
  },
};

// Analytics Services
export const analyticsService = {
  async getRevenueSummary(params: {
    startDate?: string;
    endDate?: string;
    ispId?: string;
  }): Promise<RevenueSummary> {
    return request<RevenueSummary>('/analytics/revenue-summary', { params });
  },

  async getUsageSummary(params: {
    startDate?: string;
    endDate?: string;
    ispId?: string;
  }): Promise<UsageSummary> {
    return request<UsageSummary>('/analytics/usage-summary', { params });
  },

  async generateReport(params: {
    type: string;
    startDate: string;
    endDate: string;
    format?: 'pdf' | 'excel' | 'csv';
  }): Promise<any> {
    return request('/analytics/reports', {
      method: 'POST',
      data: params,
    });
  },

  async getDashboardStats(params?: { ispId?: string }): Promise<any> {
    return request('/analytics/dashboard-stats', { params });
  },
};

// Monitoring Services
export const monitoringService = {
  async getAlerts(params?: {
    ispId?: string;
    severity?: string;
    isResolved?: boolean;
  }): Promise<Alert[]> {
    return request<Alert[]>('/monitoring/alerts', { params });
  },

  async createAlert(alertData: {
    title: string;
    message: string;
    severity: string;
    type: string;
    ispId?: string;
  }): Promise<Alert> {
    return request<Alert>('/monitoring/alerts', {
      method: 'POST',
      data: alertData,
    });
  },

  async getMetrics(params: { ispId: string }): Promise<Metric[]> {
    return request<Metric[]>('/monitoring/metrics', { params });
  },

  async createMetric(metricData: {
    name: string;
    value: number;
    unit: string;
    ispId?: string;
  }): Promise<Metric> {
    return request<Metric>('/monitoring/metrics', {
      method: 'POST',
      data: metricData,
    });
  },

  async getHealthStatus(params: { ispId: string }): Promise<any> {
    return request('/monitoring/health', { params });
  },

  async reportHealth(healthData: {
    status: string;
    services: Record<string, boolean>;
    metrics: Record<string, number>;
    ispId?: string;
  }): Promise<any> {
    return request('/monitoring/health', {
      method: 'POST',
      data: healthData,
    });
  },
};

// AI Services
export const aiService = {
  async createAnomalyAlert(anomalyData: {
    type: string;
    severity: string;
    description: string;
    affectedUsers?: string[];
    ispId?: string;
  }): Promise<AnomalyDetection> {
    return request<AnomalyDetection>('/ai/anomaly/alert', {
      method: 'POST',
      data: anomalyData,
    });
  },

  async predict(predictionData: {
    type: string;
    data: Record<string, any>;
    ispId?: string;
  }): Promise<any> {
    return request('/ai/predict', {
      method: 'POST',
      data: predictionData,
    });
  },

  async getPricingSuggestion(suggestionData: {
    planId: string;
    marketData: Record<string, any>;
    ispId?: string;
  }): Promise<PricingSuggestion> {
    return request<PricingSuggestion>('/ai/pricing/suggestion', {
      method: 'POST',
      data: suggestionData,
    });
  },

  async getAIHealth(): Promise<any> {
    return request('/ai/health');
  },

  async getAIModels(type: string): Promise<any> {
    return request('/ai/models', {
      params: { type },
    });
  },
};

// Notifications Services
export const notificationsService = {
  async sendNotification(notificationData: {
    title: string;
    message: string;
    type: string;
    userId?: string;
    ispId?: string;
    channels: string[];
  }): Promise<any> {
    return request('/notifications/send', {
      method: 'POST',
      data: notificationData,
    });
  },

  async sendBulkNotification(bulkData: {
    title: string;
    message: string;
    type: string;
    userIds?: string[];
    ispId?: string;
    channels: string[];
    filters?: Record<string, any>;
  }): Promise<any> {
    return request('/notifications/bulk', {
      method: 'POST',
      data: bulkData,
    });
  },

  async getNotificationLogs(params?: {
    userId?: string;
    ispId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    return request('/notifications/logs', { params });
  },
};

// Backup Services
export const backupService = {
  async getAllBackups(): Promise<Backup[]> {
    return request<Backup[]>('/backup/all');
  },

  async createBackup(backupData: {
    name: string;
    description?: string;
    type: string;
    includeUserData?: boolean;
    includeSystemConfig?: boolean;
  }): Promise<Backup> {
    return request<Backup>('/backup/create', {
      method: 'POST',
      data: backupData,
    });
  },

  async restoreBackup(restoreData: {
    backupId: string;
    restoreUserData?: boolean;
    restoreSystemConfig?: boolean;
  }): Promise<any> {
    return request('/backup/restore', {
      method: 'POST',
      data: restoreData,
    });
  },

  async deleteBackup(id: string): Promise<void> {
    return request(`/backup/${id}`, {
      method: 'DELETE',
    });
  },

  async scheduleBackup(scheduleData: {
    name: string;
    cronExpression: string;
    type: string;
    isActive: boolean;
  }): Promise<any> {
    return request('/backup/schedule', {
      method: 'POST',
      data: scheduleData,
    });
  },
};

// Audit Services
export const auditService = {
  async getAuditLogs(params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedApiResponse<AuditLog>> {
    return request<PaginatedApiResponse<AuditLog>>('/audit/logs', { params });
  },
};

export default api;