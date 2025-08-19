/**
 * Token Debug Utility
 * 
 * This utility helps debug token-related issues by providing functions to:
 * 1. Verify token format and structure
 * 2. Check token storage in localStorage
 * 3. Test token headers in API requests
 */

import axios from 'axios';

/**
 * Verifies if a token is properly formatted
 */
export const verifyTokenFormat = (token: string | null): { 
  isValid: boolean; 
  issues: string[];
  tokenInfo?: {
    format: string;
    length: number;
    parts: number;
  }
} => {
  const issues: string[] = [];
  
  if (!token) {
    return { isValid: false, issues: ['Token is null or undefined'] };
  }
  
  // Check if token is empty
  if (token.trim() === '') {
    return { isValid: false, issues: ['Token is empty'] };
  }
  
  // Check token format (with or without Bearer prefix)
  const tokenFormat = token.startsWith('Bearer ') ? 'Bearer prefix' : 'No prefix';
  
  // Extract the actual token (remove Bearer prefix if present)
  const actualToken = token.startsWith('Bearer ') ? token.substring(7).trim() : token.trim();
  
  // Check token length
  if (actualToken.length < 20) {
    issues.push(`Token is too short (${actualToken.length} chars)`);
  }
  
  // Check JWT structure (should have 3 parts separated by dots)
  const parts = actualToken.split('.');
  if (parts.length !== 3) {
    issues.push(`Token does not have 3 parts (has ${parts.length})`);
  }
  
  // Try to decode the token parts
  try {
    // First part (header) and second part (payload) should be valid base64 JSON
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // Check for required fields in payload
    if (!payload.sub && !payload.userId) {
      issues.push('Token payload missing subject/user identifier');
    }
    
    if (!payload.exp) {
      issues.push('Token payload missing expiration time');
    } else {
      // Check if token is expired
      const expTime = payload.exp * 1000; // Convert to milliseconds
      if (expTime < Date.now()) {
        issues.push(`Token expired at ${new Date(expTime).toISOString()}`);
      }
    }
  } catch (error) {
    issues.push('Failed to decode token parts');
  }
  
  return { 
    isValid: issues.length === 0,
    issues,
    tokenInfo: {
      format: tokenFormat,
      length: actualToken.length,
      parts: parts.length
    }
  };
};

/**
 * Checks token storage in localStorage
 */
export const checkTokenStorage = (): {
  authToken: {
    exists: boolean;
    value: string | null;
    verification?: ReturnType<typeof verifyTokenFormat>;
  };
  refreshToken: {
    exists: boolean;
    value: string | null;
  };
} => {
  const authToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  return {
    authToken: {
      exists: !!authToken,
      value: authToken ? `${authToken.substring(0, 10)}...` : null,
      verification: authToken ? verifyTokenFormat(authToken) : undefined
    },
    refreshToken: {
      exists: !!refreshToken,
      value: refreshToken ? `${refreshToken.substring(0, 10)}...` : null
    }
  };
};

/**
 * Tests token headers in API requests
 */
export const testTokenInRequest = async (): Promise<{
  success: boolean;
  message: string;
  requestHeaders?: any;
  responseStatus?: number;
}> => {
  try {
    // Create a test request that will be intercepted by axios
    const response = await axios.get('/api/v1/health', {
      validateStatus: () => true // Accept any status code
    });
    
    return {
      success: response.status < 400,
      message: `Request completed with status ${response.status}`,
      requestHeaders: response.config.headers,
      responseStatus: response.status
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Request failed: ${error.message}`,
      requestHeaders: error.config?.headers
    };
  }
};

/**
 * Run all token debug checks and log results
 */
export const runTokenDebugChecks = async (): Promise<void> => {
  console.group('🔍 TOKEN DEBUG CHECKS');
  
  // Check localStorage
  console.group('1. Token Storage Check');
  const storageCheck = checkTokenStorage();
  console.log('Auth Token:', storageCheck.authToken);
  console.log('Refresh Token:', storageCheck.refreshToken);
  console.groupEnd();
  
  // Test request with token
  console.group('2. API Request Test');
  const requestTest = await testTokenInRequest();
  console.log('Request Result:', requestTest);
  console.groupEnd();
  
  console.groupEnd();
};

// Export a function to fix common token issues
export const fixCommonTokenIssues = (): boolean => {
  const authToken = localStorage.getItem('authToken');
  
  if (!authToken) {
    console.warn('No auth token found to fix');
    return false;
  }
  
  // Fix 1: Remove Bearer prefix if stored in localStorage
  if (authToken.startsWith('Bearer ')) {
    const fixedToken = authToken.substring(7).trim();
    localStorage.setItem('authToken', fixedToken);
    console.log('Fixed: Removed Bearer prefix from stored token');
    return true;
  }
  
  return false;
};