import React, { useState, useEffect } from 'react';
import { performApiDiagnostics } from '../utils/api-health-check';
import { logApiDebugInfo, fixCommonAuthIssues, getAuthInfo } from '../utils/api-debug';

interface ApiDiagnosticResult {
  isHealthy: boolean;
  isVersioningCorrect: boolean;
  message: string;
  details?: any;
}

const ApiDiagnosticTool: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ApiDiagnosticResult | null>(null);
  const [authInfo, setAuthInfo] = useState(getAuthInfo());
  const [fixesApplied, setFixesApplied] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const diagnosticResult = await performApiDiagnostics();
      setResult(diagnosticResult);
      logApiDebugInfo();
    } catch (error) {
      console.error('Error running API diagnostics:', error);
      setResult({
        isHealthy: false,
        isVersioningCorrect: false,
        message: `Error running diagnostics: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const applyFixes = () => {
    const fixed = fixCommonAuthIssues();
    setFixesApplied(fixed);
    setAuthInfo(getAuthInfo());
    
    if (fixed) {
      setTimeout(() => {
        runDiagnostics();
      }, 500);
    }
  };

  useEffect(() => {
    // Run diagnostics on mount
    runDiagnostics();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">API Diagnostic Tool</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Authentication Status</h3>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
          <p className="mb-1">
            <span className="font-medium">Status:</span> 
            <span className={`ml-2 ${authInfo.isAuthenticated ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {authInfo.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </p>
          <p className="mb-1">
            <span className="font-medium">Token Present:</span> 
            <span className={`ml-2 ${authInfo.token ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {authInfo.token ? 'Yes' : 'No'}
            </span>
          </p>
          <p className="mb-1">
            <span className="font-medium">Valid Format:</span> 
            <span className={`ml-2 ${authInfo.isValidFormat ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {authInfo.isValidFormat ? 'Yes' : 'No'}
            </span>
          </p>
          <p className="mb-1">
            <span className="font-medium">Token Expired:</span> 
            <span className={`ml-2 ${authInfo.isExpired === null ? 'text-gray-500' : authInfo.isExpired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {authInfo.isExpired === null ? 'Unknown' : authInfo.isExpired ? 'Yes' : 'No'}
            </span>
          </p>
          {authInfo.tokenData && (
            <div className="mt-2">
              <p className="font-medium">Token Information:</p>
              <ul className="list-disc list-inside ml-4 text-sm">
                <li>User ID: {authInfo.tokenData.sub}</li>
                <li>Expires: {new Date(authInfo.tokenData.exp * 1000).toLocaleString()}</li>
                {authInfo.tokenData.role && <li>Role: {authInfo.tokenData.role}</li>}
                {authInfo.tokenData.email && <li>Email: {authInfo.tokenData.email}</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {result && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">API Health Check</h3>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
            <p className="mb-1">
              <span className="font-medium">API Health:</span> 
              <span className={`ml-2 ${result.isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.isHealthy ? 'Healthy' : 'Unhealthy'}
              </span>
            </p>
            <p className="mb-1">
              <span className="font-medium">API Versioning:</span> 
              <span className={`ml-2 ${result.isVersioningCorrect ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {result.isVersioningCorrect ? 'Correct' : 'Issues Detected'}
              </span>
            </p>
            <p className="mb-1">
              <span className="font-medium">Message:</span> 
              <span className="ml-2">{result.message}</span>
            </p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
        
        <button
          onClick={applyFixes}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Apply Common Fixes
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('auth-storage');
            setAuthInfo(getAuthInfo());
            window.location.href = '/auth/login';
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Clear Auth & Logout
        </button>
      </div>
      
      {fixesApplied && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
          Fixes applied successfully! Authentication data has been updated.
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">Common API Issues:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Missing API version in URL (use /api/v1/endpoint instead of /api/endpoint)</li>
          <li>Invalid or expired authentication token</li>
          <li>Missing Bearer prefix in Authorization header</li>
          <li>Incorrect API URL configuration</li>
          <li>Server-side issues (check server logs)</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiDiagnosticTool;