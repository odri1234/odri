import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS, getApiConfig } from '@/config/api.config';
import { ApiError } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Axios instance
const config = getApiConfig();
const apiClient: AxiosInstance = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: config.headers,
});

// Token & tenant state
let authToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setAuthToken = (token: string) => {
  if (!token) {
    console.error('Attempted to set empty auth token');
    return;
  }
  
  console.log(`Setting auth token: ${token.substring(0, 10)}...`);
  authToken = token;
  
  // Ensure token has Bearer prefix for Authorization header
  const tokenWithPrefix = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  apiClient.defaults.headers.common['Authorization'] = tokenWithPrefix;
  
  // Store the token without Bearer prefix in localStorage
  const tokenForStorage = token.startsWith('Bearer ') ? token.substring(7) : token;
  localStorage.setItem('authToken', tokenForStorage);
  
  console.log('Auth token set successfully');
};

export const clearAuthToken = () => {
  authToken = null;
  delete apiClient.defaults.headers.common['Authorization'];
  localStorage.removeItem('authToken');
};

export const setTenantId = (tenantId: string) => {
  apiClient.defaults.headers.common['x-tenant-id'] = tenantId;
  localStorage.setItem('tenantId', tenantId);
};

export const clearTenantId = () => {
  delete apiClient.defaults.headers.common['x-tenant-id'];
  localStorage.removeItem('tenantId');
};

// Intercept requests
apiClient.interceptors.request.use(
  (config) => {
    // Always ensure tenant ID is set
    const tenantId = localStorage.getItem('tenantId') || '1'; // Default tenantId = 1
    config.headers['x-tenant-id'] = tenantId;
    
    // Always check localStorage for the latest token
    const token = authToken || localStorage.getItem('authToken');
    if (token) {
      // Ensure token has Bearer prefix
      const tokenWithPrefix = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers['Authorization'] = tokenWithPrefix;
      
      // Update the module variable if it's different
      if (authToken !== token) {
        authToken = token;
      }
      
      console.log(`Request: ${config.method?.toUpperCase()} ${config.url} with auth token`);
    } else {
      console.log(`Request: ${config.method?.toUpperCase()} ${config.url} WITHOUT auth token`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshToken();
        }

        const newToken = await refreshPromise;
        refreshPromise = null;

        if (newToken) {
          setAuthToken(newToken);
          return apiClient(originalRequest);
        }
      } catch (err) {
        clearAuthToken();
        clearTenantId();
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(err);
      }
    }

    handleApiError(error);
    return Promise.reject(error);
  }
);

// Refresh token logic
const refreshToken = async (): Promise<string> => {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (!storedRefreshToken) throw new Error('No refresh token found');

  try {
    const tenantId = localStorage.getItem('tenantId') || '1';
    const apiConfig = getApiConfig();
    
    // Use the correct endpoint without /v1 prefix
    const refreshEndpoint = API_ENDPOINTS.AUTH.REFRESH;
    
    // Use the correct URL format - don't add baseURL as it's already included in the axios instance
    console.log(`Refresh token request to: ${refreshEndpoint}`);
    
    const response = await axios.post(
      '/api/v1/auth/refresh',
      { refreshToken: storedRefreshToken },
      { 
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      }
    );

    const { accessToken, refreshToken: newRefresh, user, tenant } = response.data.data;

    setAuthToken(accessToken);
    localStorage.setItem('refreshToken', newRefresh);

    // Update auth store with new user data if available
    if (user) {
      const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      if (authStore.state) {
        authStore.state.user = user;
        authStore.state.tenant = tenant;
        localStorage.setItem('auth-storage', JSON.stringify(authStore));
      }
    }

    return accessToken;
  } catch (error) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Error handler
const handleApiError = (error: any) => {
  let message = 'Unexpected error occurred';
  if (error.response?.data) {
    const apiError: ApiError = error.response.data;
    message = apiError.message || message;
  } else if (error.message) {
    message = error.message;
  }

  if (error.response?.status !== 401) {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }
};

// Utility HTTP methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
};

export default apiClient;
