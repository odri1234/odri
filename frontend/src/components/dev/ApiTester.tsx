import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkBackendConnection } from '@/lib/api-health';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';

export const ApiTester = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [...prev, {
      test,
      success,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await checkBackendConnection();
      addResult('Backend Connection', result.isConnected, result);
    } catch (error) {
      addResult('Backend Connection', false, error);
    }
    setIsLoading(false);
  };

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: 'vickyodri@gmail.com',
        password: '@Vicky17049381',
        tenantId: '1'
      });
      addResult('Login Test', true, response.data);
    } catch (error) {
      addResult('Login Test', false, error);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Development Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={isLoading}>
            Test Connection
          </Button>
          <Button onClick={testLogin} disabled={isLoading}>
            Test Login
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{result.test}</span>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTester;