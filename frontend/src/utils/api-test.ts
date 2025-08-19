// API Test Utility
import { api } from '@/lib/axios';
import { API_ENDPOINTS, getApiConfig } from '@/config/api.config';
import { usersService, dashboardService } from '@/services/api.service';

// Test function to verify API calls
export const testApiCalls = async () => {
  console.log('=== API TEST UTILITY ===');
  console.log('Testing API configuration and requests');
  
  // Log configuration
  const config = getApiConfig();
  console.log('API Config:', {
    baseURL: config.baseURL,
    timeout: config.timeout,
  });
  
  // Test direct axios call
  try {
    console.log('Testing direct axios call to /health...');
    const response = await api.get('/health');
    console.log('Health check response:', response.data);
  } catch (error) {
    console.error('Health check failed:', error);
  }
  
  // Test service call
  try {
    console.log('Testing service call to get dashboard stats...');
    const stats = await dashboardService.getStats();
    console.log('Dashboard stats:', stats);
  } catch (error) {
    console.error('Dashboard stats failed:', error);
  }
  
  // Test users service
  try {
    console.log('Testing users service...');
    const users = await usersService.getUsers();
    console.log('Users response:', users);
  } catch (error) {
    console.error('Users service failed:', error);
  }
  
  console.log('=== API TEST COMPLETE ===');
};

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('API test utility loaded. Call testApiCalls() to run tests.');
}