/**
 * Utility functions for debugging API issues
 */

/**
 * Validates a JWT token format
 * @param {string} token - The JWT token to validate
 * @returns {boolean} Whether the token is valid format
 */
export function isValidJwtFormat(token: string): boolean {
  if (!token) return false;
  
  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') 
    ? token.substring(7) 
    : token;
  
  // JWT tokens should have 3 parts separated by dots
  const parts = tokenValue.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64UrlRegex.test(part));
}

/**
 * Checks if a token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} Whether the token is expired
 */
export function isTokenExpired(token: string): boolean {
  if (!isValidJwtFormat(token)) return true;
  
  try {
    // Remove Bearer prefix if present
    const tokenValue = token.startsWith('Bearer ') 
      ? token.substring(7) 
      : token;
    
    // Get the payload part (second part)
    const payload = tokenValue.split('.')[1];
    
    // Decode the base64url encoded payload
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if the token has an expiration time
    if (!decodedPayload.exp) return false;
    
    // Check if the token is expired
    const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if there's an error
  }
}

/**
 * Gets information about the current authentication state
 * @returns {Object} Authentication information
 */
export function getAuthInfo(): {
  isAuthenticated: boolean;
  token: string | null;
  isValidFormat: boolean;
  isExpired: boolean | null;
  tokenData: any | null;
} {
  const token = localStorage.getItem('authToken');
  const isValidFormat = token ? isValidJwtFormat(token) : false;
  const isExpired = token ? isTokenExpired(token) : null;
  
  let tokenData = null;
  if (token && isValidFormat) {
    try {
      // Remove Bearer prefix if present
      const tokenValue = token.startsWith('Bearer ') 
        ? token.substring(7) 
        : token;
      
      // Get the payload part (second part)
      const payload = tokenValue.split('.')[1];
      
      // Decode the base64url encoded payload
      tokenData = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  
  return {
    isAuthenticated: !!token && isValidFormat && !isExpired,
    token,
    isValidFormat,
    isExpired,
    tokenData,
  };
}

/**
 * Logs API debugging information to the console
 */
export function logApiDebugInfo(): void {
  const authInfo = getAuthInfo();
  
  console.group('🔍 API Debug Information');
  
  console.log('🔐 Authentication:');
  console.log(`  Authenticated: ${authInfo.isAuthenticated}`);
  console.log(`  Token Present: ${!!authInfo.token}`);
  console.log(`  Valid Format: ${authInfo.isValidFormat}`);
  console.log(`  Token Expired: ${authInfo.isExpired}`);
  
  if (authInfo.tokenData) {
    console.log('📝 Token Data:');
    console.log(`  Subject: ${authInfo.tokenData.sub}`);
    console.log(`  Issued At: ${new Date(authInfo.tokenData.iat * 1000).toLocaleString()}`);
    console.log(`  Expires At: ${new Date(authInfo.tokenData.exp * 1000).toLocaleString()}`);
    console.log(`  Issuer: ${authInfo.tokenData.iss || 'Not specified'}`);
    
    // Log other token data
    const otherData = { ...authInfo.tokenData };
    delete otherData.sub;
    delete otherData.iat;
    delete otherData.exp;
    delete otherData.iss;
    
    if (Object.keys(otherData).length > 0) {
      console.log('  Other Token Data:', otherData);
    }
  }
  
  console.log('🌐 API Configuration:');
  console.log(`  API URL: ${import.meta.env.VITE_API_URL || 'Not specified (using default)'}`);
  console.log(`  Tenant ID: ${localStorage.getItem('tenantId') || 'Not specified (using default)'}`);
  
  console.groupEnd();
}

/**
 * Fixes common authentication issues
 * @returns {boolean} Whether any fixes were applied
 */
export function fixCommonAuthIssues(): boolean {
  let fixesApplied = false;
  
  // Check if token exists but is missing Bearer prefix
  const token = localStorage.getItem('authToken');
  if (token && !token.startsWith('Bearer ') && isValidJwtFormat(token)) {
    localStorage.setItem('authToken', `Bearer ${token}`);
    console.log('🔧 Fixed: Added missing Bearer prefix to token');
    fixesApplied = true;
  }
  
  // Check if token is expired
  if (token && isTokenExpired(token)) {
    console.log('⚠️ Token is expired. Clearing authentication data.');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    fixesApplied = true;
  }
  
  return fixesApplied;
}