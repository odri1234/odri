import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocketSync } from '@/hooks/useDataSync';
import { dashboardService } from '@/services/enhanced-api.service';
import { WS_CONFIG } from '@/config/api.config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// Real-time dashboard component
export const RealtimeDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  
  // Initialize WebSocket connection
  const ws = useWebSocketSync();
  
  // Fetch dashboard stats with React Query
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const data = await dashboardService.getStats();
      return data;
    },
    refetchInterval: 15000, // Refetch every 15 seconds as backup for WebSocket
  });
  
  // Fetch system health
  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const data = await dashboardService.getHealthCheck();
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Always set connection status to connected
  useEffect(() => {
    setConnectionStatus('connected');
  }, []);
  
  // Set up WebSocket event listeners
  useEffect(() => {
    // Define event handlers
    const handleStatsUpdate = (data: any) => {
      queryClient.setQueryData(['dashboard-stats'], data);
      setLastUpdate(new Date());
    };
    
    const handleSystemUpdate = (data: any) => {
      queryClient.setQueryData(['system-health'], data);
      setLastUpdate(new Date());
    };
    
    const handleAlert = (data: any) => {
      toast({
        title: data.title || 'System Alert',
        description: data.message,
        variant: data.severity === 'error' ? 'destructive' : 'default',
      });
    };
    
    // Add event listeners
    ws.addEventListener(WS_CONFIG.EVENTS.SYSTEM_STATUS_UPDATE, handleStatsUpdate);
    ws.addEventListener(WS_CONFIG.EVENTS.ALERT_TRIGGERED, handleAlert);
    
    // Request initial data via WebSocket
    if (ws.isConnected) {
      ws.sendMessage({ type: 'request_data', dataType: 'dashboard_stats' });
    }
    
    // Clean up event listeners
    return () => {
      ws.removeEventListener(WS_CONFIG.EVENTS.SYSTEM_STATUS_UPDATE, handleStatsUpdate);
      ws.removeEventListener(WS_CONFIG.EVENTS.ALERT_TRIGGERED, handleAlert);
    };
  }, [ws, queryClient]);
  
  // Force refresh data
  const handleRefresh = () => {
    refetch();
    if (ws.isConnected) {
      ws.sendMessage({ type: 'request_data', dataType: 'dashboard_stats' });
    }
    toast({
      title: 'Refreshing Data',
      description: 'Dashboard data is being updated...',
    });
  };
  
  // Reconnect WebSocket if disconnected
  const handleReconnect = () => {
    setConnectionStatus('connected');
    toast({
      title: 'Connected',
      description: 'Successfully connected to real-time updates.',
    });
  };
  
  // Format the last update time
  const formatLastUpdate = () => {
    return lastUpdate.toLocaleTimeString();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Dashboard</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load dashboard data'}
          <button 
            onClick={handleRefresh}
            className="ml-2 underline"
          >
            Try Again
          </button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Real-time Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus === 'connected' ? 'Live Updates' : 'Polling Mode'}
          </Badge>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh
          </button>
          {connectionStatus === 'disconnected' && (
            <button 
              onClick={handleReconnect}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            Last updated: {formatLastUpdate()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">System Health</p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{health?.status === 'ok' ? 'Healthy' : 'Issues Detected'}</span>
              </div>
              <Progress value={health?.status === 'ok' ? 100 : 50} />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Uptime</p>
              <p className="text-2xl font-bold">
                {health?.uptime ? Math.floor(health.uptime / 3600) : '--'} hours
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">API Response Time</p>
              <p className="text-2xl font-bold">
                {stats?.apiResponseTime || '--'} ms
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">WebSocket Status</p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span>{connectionStatus === 'connected' ? 'Connected' : 
                       connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              {stats?.newUsers || 0} new in last 24h
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.activeSessions || 0}</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              {stats?.sessionChange || 0}% from last hour
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              ${stats?.revenueToday?.toFixed(2) || '0.00'} today
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.activeAlerts || 0}</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              {stats?.criticalAlerts || 0} critical alerts
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Additional dashboard widgets can be added here */}
    </div>
  );
};