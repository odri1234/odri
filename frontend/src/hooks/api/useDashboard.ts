// React Query hooks for dashboard data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService, analyticsService, monitoringService } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { subDays, startOfDay, endOfDay } from 'date-fns';

// Dashboard Stats Hook
export const useDashboardStats = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    enabled: isAuthenticated && isInitialized,
    retry: 3,
    retryDelay: 1000,
  });
};

// System Health Hook
export const useSystemHealth = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['system-health'],
    queryFn: dashboardService.getHealthCheck,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    enabled: isAuthenticated,
    retry: 2,
    retryDelay: 2000,
  });
};

// Revenue Analytics Hook
export const useRevenueAnalytics = (timeRange: '7d' | '30d' | '90d' = '30d') => {
  const { user, isAuthenticated } = useAuth();
  
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(new Date(), timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
  
  return useQuery({
    queryKey: ['revenue-analytics', timeRange],
    queryFn: () => analyticsService.getRevenueSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    enabled: isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'].includes(user?.role || ''),
    retry: 2,
    retryDelay: 1000,
  });
};

// Usage Analytics Hook
export const useUsageAnalytics = (timeRange: '7d' | '30d' | '90d' = '30d') => {
  const { user, isAuthenticated } = useAuth();
  
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(new Date(), timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
  
  return useQuery({
    queryKey: ['usage-analytics', timeRange],
    queryFn: () => analyticsService.getUsageSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    enabled: isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'].includes(user?.role || ''),
    retry: 2,
    retryDelay: 1000,
  });
};

// Users List Hook
export const useUsersList = (params?: {
  role?: string;
  ispId?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['users-list', params],
    queryFn: () => usersService.getUsers(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    enabled: isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'].includes(user?.role || ''),
    retry: 2,
    retryDelay: 1000,
  });
};

// Payments History Hook
export const usePaymentsHistory = (params?: {
  userId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['payments-history', params],
    queryFn: () => paymentsService.getPaymentHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
    enabled: isAuthenticated,
    retry: 2,
    retryDelay: 1000,
  });
};

// MikroTik Routers Hook
export const useMikroTikRouters = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['mikrotik-routers'],
    queryFn: mikrotikService.getRouters,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    enabled: isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'].includes(user?.role || ''),
    retry: 2,
    retryDelay: 1000,
  });
};

// Monitoring Alerts Hook
export const useMonitoringAlerts = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['monitoring-alerts'],
    queryFn: monitoringService.getAlerts,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 1 * 60 * 1000, // Refetch every minute
    enabled: isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'].includes(user?.role || ''),
    retry: 2,
    retryDelay: 1000,
  });
};

// System Metrics Hook
export const useSystemMetrics = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: monitoringService.getMetrics,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    enabled: isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'].includes(user?.role || ''),
    retry: 2,
    retryDelay: 1000,
  });
};

// AI Health Hook
export const useAIHealth = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['ai-health'],
    queryFn: aiService.getAIHealth,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    enabled: isAuthenticated && ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'].includes(user?.role || ''),
    retry: 2,
    retryDelay: 1000,
  });
};

// Refresh Dashboard Data Hook
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['system-health'] }),
        queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['usage-analytics'] }),
        queryClient.invalidateQueries({ queryKey: ['users-list'] }),
        queryClient.invalidateQueries({ queryKey: ['payments-history'] }),
        queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] }),
        queryClient.invalidateQueries({ queryKey: ['monitoring-alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['system-metrics'] }),
      ]);
    },
    onSuccess: () => {
      console.log('Dashboard data refreshed successfully');
    },
    onError: (error) => {
      console.error('Failed to refresh dashboard data:', error);
    },
  });
};

// Create Payment Hook
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: paymentsService.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] });
    },
    onError: (error) => {
      console.error('Failed to create payment:', error);
    },
  });
};

// Refund Payment Hook
export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      paymentsService.refundPayment({ paymentId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-analytics'] });
    },
    onError: (error) => {
      console.error('Failed to refund payment:', error);
    },
  });
};

// Create User Hook
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
};

// Update User Hook
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      usersService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};

// Delete User Hook
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });
};

// Add MikroTik Router Hook
export const useAddMikroTikRouter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mikrotikService.addRouter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
    },
    onError: (error) => {
      console.error('Failed to add MikroTik router:', error);
    },
  });
};

// Test Router Connection Hook
export const useTestRouterConnection = () => {
  return useMutation({
    mutationFn: mikrotikService.testRouterConnection,
    onError: (error) => {
      console.error('Failed to test router connection:', error);
    },
  });
};

// Add Hotspot User Hook
export const useAddHotspotUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mikrotikService.addHotspotUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
    },
    onError: (error) => {
      console.error('Failed to add hotspot user:', error);
    },
  });
};

// Disconnect User Hook
export const useDisconnectUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ mac, routerId }: { mac: string; routerId: string }) =>
      mikrotikService.disconnectUser(mac, routerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
    },
    onError: (error) => {
      console.error('Failed to disconnect user:', error);
    },
  });
};

// Generate Vouchers Hook
export const useGenerateVouchers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vouchersService.generateVouchers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to generate vouchers:', error);
    },
  });
};

// Close Session Hook
export const useCloseSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sessionsService.closeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions-list'] });
      queryClient.invalidateQueries({ queryKey: ['sessions-active'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Failed to close session:', error);
    },
  });
};

// Custom hook for real-time data updates
export const useRealTimeData = () => {
  const { data: stats } = useDashboardStats();
  const { data: health } = useSystemHealth();
  const { data: alerts } = useMonitoringAlerts();
  
  return {
    stats,
    health,
    alerts,
    isOnline: health?.status === 'OK',
    uptime: health?.uptime || 0,
    activeAlerts: alerts?.filter((alert: any) => alert.severity === 'high')?.length || 0,
  };
};

// Custom hook for dashboard summary
export const useDashboardSummary = () => {
  const { data: stats } = useDashboardStats();
  const { data: revenue } = useRevenueAnalytics('30d');
  const { data: usage } = useUsageAnalytics('30d');
  
  return {
    totalUsers: stats?.totalUsers || 0,
    activeSessions: stats?.activeSessions || 0,
    totalRevenue: stats?.totalRevenue || 0,
    totalPayments: stats?.totalPayments || 0,
    totalVouchers: stats?.totalVouchers || 0,
    revenueGrowth: revenue?.growthRate || 0,
    usageData: usage?.totalDataUsageMB || 0,
    sessionCount: usage?.sessionCount || 0,
  };
};