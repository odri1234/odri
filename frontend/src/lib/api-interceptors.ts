// Enhanced API interceptors for consistent response handling
import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from './axios'; // your configured instance
import { toast } from '@/hooks/use-toast';

const api = axios; // ✅ define `api` from imported `axios`

// Request interceptor
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }

  // Always ensure tenant ID is set, default to '1' if not found
  const tenantId = localStorage.getItem('tenantId') || '1';
  config.headers['x-tenant-id'] = tenantId;
  console.log(`Setting tenant ID header: ${tenantId} for ${config.url}`);

  config.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  if (!import.meta.env.PROD) {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      headers: config.headers,
    });
  }

  return config;
};

// Response interceptor
const responseInterceptor = (response: AxiosResponse) => {
  if (!import.meta.env.PROD) {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
  }

  const data = response.data;

  if (data && typeof data === 'object') {
    if (data.success !== undefined) {
      response.data = {
        ...data,
        data: data.data || data.result || data.payload,
      };
    }

    if (data.items && data.pagination) {
      response.data = {
        success: true,
        data: data.items,
        pagination: data.pagination,
      };
    }
  }

  return response;
};

// Error interceptor
const errorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if (!import.meta.env.PROD) {
    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }

  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await api.post('/v1/auth/refresh', { refreshToken });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              localStorage.setItem('authToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }

              return api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.clear();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        } else {
          localStorage.clear();
          window.location.href = '/auth/login';
        }
        break;

      case 403:
        toast({
          title: 'Access Denied',
          description: data?.message || 'You do not have permission to perform this action.',
          variant: 'destructive',
        });
        break;

      case 404:
        if (!originalRequest.url?.includes('/health') && !originalRequest.url?.includes('/ping')) {
          toast({
            title: 'Not Found',
            description: data?.message || 'The requested resource was not found.',
            variant: 'destructive',
          });
        }
        break;

      case 422: {
        const validationErrors = data?.errors || data?.details;
        if (validationErrors && Array.isArray(validationErrors)) {
          validationErrors.forEach((err: any) => {
            toast({
              title: 'Validation Error',
              description: err.message || err,
              variant: 'destructive',
            });
          });
        } else {
          toast({
            title: 'Validation Error',
            description: data?.message || 'Please check your input and try again.',
            variant: 'destructive',
          });
        }
        break;
      }

      case 429:
        toast({
          title: 'Too Many Requests',
          description: 'Please wait a moment before trying again.',
          variant: 'destructive',
        });
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        toast({
          title: 'Server Error',
          description: data?.message || 'Something went wrong on our end. Please try again later.',
          variant: 'destructive',
        });
        break;

      default:
        toast({
          title: 'Error',
          description: data?.message || error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
    }
  } else if (error.request) {
    toast({
      title: 'Network Error',
      description: 'Unable to connect to the server. Please check your internet connection.',
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'Error',
      description: error.message || 'An unexpected error occurred.',
      variant: 'destructive',
    });
  }

  return Promise.reject(error);
};

// Setup interceptors
export const setupInterceptors = () => {
  api.interceptors.request.use(requestInterceptor, (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  });

  api.interceptors.response.use(responseInterceptor, errorInterceptor);
};

// Utility functions
export const handleApiResponse = <T = any>(response: AxiosResponse): T => {
  const data = response.data;
  if (data?.data !== undefined) return data.data;
  if (data?.result !== undefined) return data.result;
  if (data?.payload !== undefined) return data.payload;
  return data;
};

export const handlePaginatedResponse = <T = any>(response: AxiosResponse) => {
  const data = response.data;
  return {
    data: data?.data || data?.items || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
};

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => !error.response && error.request;

export const isServerError = (error: any): boolean => error?.response?.status >= 500;

export const isClientError = (error: any): boolean =>
  error?.response?.status >= 400 && error?.response?.status < 500;
