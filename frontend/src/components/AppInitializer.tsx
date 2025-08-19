import { useEffect, useState } from 'react';
import { setupInterceptors } from '@/lib/api-interceptors';
import { checkApiHealth } from '@/lib/api-health';
import { toast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api.config';

export const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Setup API interceptors
        setupInterceptors();
        
        // Check API health
        const isHealthy = await checkApiHealth();
        setIsApiConnected(isHealthy);
        
        if (isHealthy) {
          console.log('✅ Connected to ODRI backend API:', API_CONFIG.BASE_URL);
        } else {
          console.error('❌ Failed to connect to ODRI backend API:', API_CONFIG.BASE_URL);
          toast({
            title: 'API Connection Error',
            description: 'Unable to connect to the ODRI backend. Please check your network connection.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <div className="ml-4 text-lg">Connecting to ODRI backend...</div>
      </div>
    );
  }

  if (isInitialized && !isApiConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-destructive text-4xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">API Connection Error</h1>
        <p className="text-muted-foreground mb-4 text-center">
          Unable to connect to the ODRI backend API at {API_CONFIG.BASE_URL}
        </p>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Please check that the backend server is running and accessible.
        </p>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return <>{children}</>;
};