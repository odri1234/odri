// API Configuration for ODRI WiFi Management System
// IMPORTANT: The baseURL already includes /api/v1, so we should NOT include /v1 in the endpoints
export const API_ENDPOINTS = {
  // Authentication Endpoints - Updated to remove duplicate v1 prefix
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', 
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ENABLE_2FA: '/auth/enable-2fa',
    VERIFY_2FA: '/auth/verify-2fa',
  },

  // Dashboard Endpoints - Root level endpoints without v1 prefix
  DASHBOARD: {
    STATS: '/stats',
    HEALTH: '/health',
    VERSION: '/version',
    PING: '/ping',
  },

  // Analytics Endpoints without v1 prefix
  ANALYTICS: {
    REVENUE_SUMMARY: '/analytics/revenue-summary',
    USAGE_SUMMARY: '/analytics/usage-summary',
    REPORTS: '/analytics/reports',
    DASHBOARD_STATS: '/analytics/dashboard-stats',
  },

  // Users Endpoints without v1 prefix
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    STATS: '/users/stats',
  },

  // ISPs Endpoints without v1 prefix
  ISPS: {
    LIST: '/isps',
    CREATE: '/isps',
    GET_BY_ID: (id: string) => `/isps/${id}`,
    UPDATE: (id: string) => `/isps/${id}`,
    DELETE: (id: string) => `/isps/${id}`,
    STATS: (id: string) => `/isps/${id}/stats`,
  },

  // Plans Endpoints without v1 prefix
  PLANS: {
    LIST: '/plans',
    CREATE: '/plans',
    GET_BY_ID: (id: string) => `/plans/${id}`,
    UPDATE: (id: string) => `/plans/${id}`,
    DELETE: (id: string) => `/plans/${id}`,
  },

  // Payments Endpoints without v1 prefix
  PAYMENTS: {
    HISTORY: '/payments/history',
    CREATE: '/payments/create',
    REFUND: '/payments/refund',
    STATUS: (id: string) => `/payments/status/${id}`,
    MPESA_CALLBACK: '/payments/mpesa/callback',
  },

  // Vouchers Endpoints without v1 prefix
  VOUCHERS: {
    LIST: '/vouchers',
    CREATE: '/vouchers',
    GET_BY_ID: (id: string) => `/vouchers/${id}`,
    BATCH_GENERATE: '/vouchers/batch',
    REDEEM: '/vouchers/redeem',
  },

  // Sessions Endpoints without v1 prefix
  SESSIONS: {
    LIST: '/sessions',
    ACTIVE: '/sessions/active',
    GET_BY_ID: (id: string) => `/sessions/${id}`,
    CLOSE: (id: string) => `/sessions/${id}/close`,
    UPDATE: (id: string) => `/sessions/${id}`,
    DELETE: (id: string) => `/sessions/${id}`,
    STATS: (id: string) => `/sessions/${id}/stats`,
  },

  // MikroTik Endpoints without v1 prefix
  MIKROTIK: {
    ROUTERS: '/mikrotik/routers',
    ROUTER_BY_ID: (id: string) => `/mikrotik/routers/${id}`,
    TEST_CONNECTION: (id: string) => `/mikrotik/routers/${id}/test-connection`,
    ROUTER_STATUS: (id: string) => `/mikrotik/routers/${id}/status`,
    ADD_HOTSPOT_USER: '/mikrotik/add-hotspot-user',
    REMOVE_HOTSPOT_USER: '/mikrotik/remove-hotspot-user',
    HOTSPOT_USERS: '/mikrotik/hotspot-users',
    CONNECTED_USERS: '/mikrotik/connected-users',
    DISCONNECT_USER: (mac: string) => `/mikrotik/disconnect-user/${mac}`,
  },

  // Monitoring Endpoints without v1 prefix
  MONITORING: {
    ALERTS: '/monitoring/alerts',
    METRICS: '/monitoring/metrics',
    SYSTEM_STATUS: '/monitoring/system-status',
    HEALTH: '/monitoring/health',
  },

  // AI Endpoints without v1 prefix
  AI: {
    ANOMALY_ALERT: '/ai/anomaly/alert',
    PREDICT: '/ai/predict',
    PRICING_SUGGESTION: '/ai/pricing/suggestion',
    HEALTH: '/ai/health',
    MODELS: '/ai/models',
  },

  // Notifications Endpoints without v1 prefix
  NOTIFICATIONS: {
    SEND: '/notifications/send',
    SEND_BULK: '/notifications/send-bulk',
    LOGS: '/notifications/logs',
    TEMPLATES: '/notifications/templates',
    TEMPLATE_BY_ID: (id: string) => `/notifications/template/${id}`,
  },

  // Backup Endpoints without v1 prefix
  BACKUP: {
    ALL: '/backup/all',
    CREATE: '/backup/create',
    RESTORE: '/backup/restore',
    DELETE: (id: string) => `/backup/${id}`,
    SCHEDULE: '/backup/schedule',
  },

  // Audit Endpoints without v1 prefix
  AUDIT: {
    LOGS: '/audit/logs',
  },
};

// Check if we're in production mode
// In Vite, we need to use import.meta.env instead of process.env
const IS_PRODUCTION = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL;

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests - Updated to match backend exactly with /api/v1 prefix
  BASE_URL: IS_PRODUCTION 
    ? API_URL || 'https://api.odri.com/api/v1'
    : '/api/v1', // Use relative URL to avoid CORS issues
    
  // Request timeout in milliseconds - Increased to prevent timeouts
  TIMEOUT: 60000,

  // Retry configuration
  RETRY: {
    MAX_RETRIES: 0, // Disable retries to prevent connection issues
    RETRY_DELAY: 1000,
  },

  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 120, // Increased limit
    BURST_LIMIT: 20,
  },

  // Cache configuration
  CACHE: {
    ENABLED: true,
    TTL: 10 * 60 * 1000, // 10 minutes
  },

  // Error handling
  ERROR_HANDLING: {
    SHOW_TOASTS: false, // Disable toasts for API errors
    LOG_TO_CONSOLE: !IS_PRODUCTION,
  },
};

// Environment-specific configurations
export const getApiConfig = () => {
  return {
    // Updated to match backend exactly with /api/v1 prefix
    baseURL: IS_PRODUCTION 
      ? API_URL || 'https://api.odri.com/api/v1'
      : '/api/v1', // Use relative URL to avoid CORS issues
    
    timeout: API_CONFIG.TIMEOUT,
    
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
    },

    // Common settings for all environments
    withCredentials: false,
    validateStatus: (status: number) => status >= 200 && status < 500, // Accept all responses except server errors
  };
};

// WebSocket configuration for real-time features
export const WS_CONFIG = {
  URL: IS_PRODUCTION
    ? 'wss://api.odri.com/api/v1/ws'
    : `ws://${window.location.host}/api/v1/ws`, // Use dynamic host with v1 prefix
  
  // Disable reconnection attempts to prevent connection issues
  RECONNECT_INTERVAL: 0,
  MAX_RECONNECT_ATTEMPTS: 0,
  
  EVENTS: {
    USER_CONNECTED: 'user_connected',
    USER_DISCONNECTED: 'user_disconnected',
    PAYMENT_RECEIVED: 'payment_received',
    ALERT_TRIGGERED: 'alert_triggered',
    SYSTEM_STATUS_UPDATE: 'system_status_update',
  },
};

export default API_ENDPOINTS;