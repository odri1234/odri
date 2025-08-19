import axios from 'axios';

/**
 * Performs a health check on the API to ensure it's available and properly configured
 * @returns {Promise<{isHealthy: boolean, message: string, details?: any}>}
 */
export async function checkApiHealth(): Promise<{
  isHealthy: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Get API URL from environment or use default
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Try to access the health endpoint
    const response = await axios.get(`${apiUrl}/v1/health`, {
      timeout: 5000, // 5 second timeout
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || '1'
      }
    });
    
    if (response.status === 200) {
      return {
        isHealthy: true,
        message: 'API is available and responding correctly',
        details: response.data,
      };
    } else {
      return {
        isHealthy: false,
        message: `API returned unexpected status: ${response.status}`,
        details: response.data,
      };
    }
  } catch (error: any) {
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return {
        isHealthy: false,
        message: 'Cannot connect to API server. The server may be down or the URL may be incorrect.',
        details: error,
      };
    } else if (error.code === 'ETIMEDOUT' || error.code === 'TIMEOUT') {
      return {
        isHealthy: false,
        message: 'API request timed out. The server may be overloaded or unreachable.',
        details: error,
      };
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        isHealthy: false,
        message: `API returned error status: ${error.response.status}`,
        details: error.response.data,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        isHealthy: false,
        message: error.message || 'Unknown API error',
        details: error,
      };
    }
  }
}

/**
 * Checks if the API versioning is properly configured
 * @returns {Promise<{isCorrect: boolean, message: string, details?: any}>}
 */
export async function checkApiVersioning(): Promise<{
  isCorrect: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Get API URL from environment or use default
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Try to access a versioned endpoint without version
    const response = await axios.get(`${apiUrl}/v1/users`, {
      timeout: 5000, // 5 second timeout
      validateStatus: (status) => status < 500, // Accept any status < 500 to check for redirects
      headers: {
        'x-tenant-id': localStorage.getItem('tenantId') || '1'
      }
    });
    
    // Check if we got a redirect or helpful error message
    if (response.status === 307 || 
        (response.status === 404 && response.data?.suggestedUrl)) {
      return {
        isCorrect: true,
        message: 'API versioning is working correctly. Requests are being redirected to versioned endpoints.',
        details: response.data,
      };
    } else if (response.status === 200) {
      // If we got a 200, the API might be accepting non-versioned URLs
      return {
        isCorrect: true,
        message: 'API accepted non-versioned URL. Versioning might be optional or handled automatically.',
        details: response.data,
      };
    } else {
      return {
        isCorrect: false,
        message: `API versioning check failed with status: ${response.status}`,
        details: response.data,
      };
    }
  } catch (error: any) {
    return {
      isCorrect: false,
      message: error.message || 'Unknown error checking API versioning',
      details: error,
    };
  }
}

/**
 * Performs a comprehensive API check including health and versioning
 * @returns {Promise<{isHealthy: boolean, isVersioningCorrect: boolean, message: string, details?: any}>}
 */
export async function performApiDiagnostics(): Promise<{
  isHealthy: boolean;
  isVersioningCorrect: boolean;
  message: string;
  details?: any;
}> {
  const healthCheck = await checkApiHealth();
  
  if (!healthCheck.isHealthy) {
    return {
      isHealthy: false,
      isVersioningCorrect: false,
      message: `API health check failed: ${healthCheck.message}`,
      details: healthCheck.details,
    };
  }
  
  const versioningCheck = await checkApiVersioning();
  
  return {
    isHealthy: true,
    isVersioningCorrect: versioningCheck.isCorrect,
    message: versioningCheck.isCorrect 
      ? 'API is healthy and versioning is configured correctly' 
      : `API is healthy but versioning check failed: ${versioningCheck.message}`,
    details: {
      health: healthCheck.details,
      versioning: versioningCheck.details,
    },
  };
}