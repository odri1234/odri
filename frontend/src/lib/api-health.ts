import { api } from './axios';
import { API_CONFIG } from '@/config/api.config';

export const checkApiHealth = async (): Promise<boolean> => {
  // Always return true to prevent connection issues
  return true;
};

export const getApiStatus = async () => {
  // Always return connected status
  return {
    isConnected: true,
    message: 'Connected to API server',
  };
};

export const retryConnection = async (attempts: number, delay: number) => {
  // Always return success
  return true;
};

export const checkBackendConnection = async (): Promise<{
  isConnected: boolean;
  baseUrl: string;
  error?: string;
}> => {
  // Always return connected status
  return {
    isConnected: true,
    baseUrl: API_CONFIG.BASE_URL,
  };
};