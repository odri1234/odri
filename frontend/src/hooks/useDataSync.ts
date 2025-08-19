// Data synchronization hook for real-time updates
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

interface SyncConfig {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onSync?: () => void;
  onError?: (error: Error) => void;
}

export const useDataSync = (config: SyncConfig = {}) => {
  const {
    enabled = true,
    interval = 30000, // 30 seconds
    onSync,
    onError,
  } = config;

  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastSyncRef = useRef<Date>(new Date());

  const syncData = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      // Invalidate and refetch critical data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['active-sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['system-health'] }),
      ]);

      lastSyncRef.current = new Date();
      onSync?.();
    } catch (error) {
      console.error('Data sync failed:', error);
      onError?.(error as Error);
    }
  }, [isAuthenticated, user, queryClient, onSync, onError]);

  const startSync = useCallback(() => {
    if (!enabled || intervalRef.current) return;

    intervalRef.current = setInterval(syncData, interval);
  }, [enabled, interval, syncData]);

  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const forceSync = useCallback(() => {
    syncData();
  }, [syncData]);

  useEffect(() => {
    if (enabled && isAuthenticated) {
      startSync();
    } else {
      stopSync();
    }

    return stopSync;
  }, [enabled, isAuthenticated, startSync, stopSync]);

  // Handle visibility change to sync when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        const timeSinceLastSync = Date.now() - lastSyncRef.current.getTime();
        // Sync if more than 1 minute has passed
        if (timeSinceLastSync > 60000) {
          forceSync();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, forceSync]);

  return {
    lastSync: lastSyncRef.current,
    forceSync,
    startSync,
    stopSync,
  };
};

// WebSocket hook for real-time updates
export const useWebSocketSync = (url?: string) => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  
  // Import the WebSocket service
  // Note: These imports should be at the top of the file, but for now we'll comment them out
  // import websocketService, { useWebSocket } from '@/services/websocket.service';
  
  // Use the WebSocket hook
  // const ws = useWebSocket();
  
  // Set up event listeners
  useEffect(() => {
    if (isAuthenticated && user) {
      // TODO: Implement WebSocket connection when service is ready
      // ws.connect();
      
      // Check connection status periodically
      const intervalId = setInterval(() => {
        // setIsConnected(ws.isConnected);
        setIsConnected(false); // Temporarily set to false
      }, 1000);
      
      return () => {
        clearInterval(intervalId);
        // ws.disconnect();
      };
    }
  }, [isAuthenticated, user]);
  
  // Expose the WebSocket API
  const sendMessage = useCallback((message: any) => {
    // ws.send(message);
    console.log('WebSocket message would be sent:', message);
  }, []);
  
  return {
    isConnected: isConnected,
    sendMessage,
    disconnect: () => console.log('WebSocket disconnect called'),
    reconnect: () => console.log('WebSocket reconnect called'),
  };
};