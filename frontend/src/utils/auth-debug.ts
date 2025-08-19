// Debug utilities for authentication issues

export const clearAllAuthData = () => {
  console.log('Clearing all authentication data...');
  
  // Clear all auth-related localStorage items
  const authKeys = [
    'authToken',
    'refreshToken', 
    'tenantId',
    'auth-storage',
    'savedEmail',
    'savedTenantId'
  ];
  
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`Removing ${key}:`, value);
      localStorage.removeItem(key);
    }
  });
  
  console.log('All auth data cleared. Please refresh the page.');
};

export const debugAuthState = () => {
  console.log('=== AUTH DEBUG INFO ===');
  console.log('authToken:', localStorage.getItem('authToken'));
  console.log('refreshToken:', localStorage.getItem('refreshToken'));
  console.log('tenantId:', localStorage.getItem('tenantId'));
  console.log('auth-storage:', localStorage.getItem('auth-storage'));
  console.log('savedEmail:', localStorage.getItem('savedEmail'));
  console.log('savedTenantId:', localStorage.getItem('savedTenantId'));
  console.log('=====================');
};

// Make these available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllAuthData = clearAllAuthData;
  (window as any).debugAuthState = debugAuthState;
}