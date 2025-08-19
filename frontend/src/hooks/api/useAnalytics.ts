import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '@/services/enhanced-api.service';
import { RevenueSummary, UsageSummary } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  revenue: () => [...ANALYTICS_QUERY_KEYS.all, 'revenue'] as const,
  revenueSummary: (params: Record<string, any>) => [...ANALYTICS_QUERY_KEYS.revenue(), 'summary', params] as const,
  usage: () => [...ANALYTICS_QUERY_KEYS.all, 'usage'] as const,
  usageSummary: (params: Record<string, any>) => [...ANALYTICS_QUERY_KEYS.usage(), 'summary', params] as const,
  reports: () => [...ANALYTICS_QUERY_KEYS.all, 'reports'] as const,
  report: (params: Record<string, any>) => [...ANALYTICS_QUERY_KEYS.reports(), params] as const,
  dashboardStats: (params: Record<string, any>) => [...ANALYTICS_QUERY_KEYS.all, 'dashboard-stats', params] as const,
};

// Get revenue summary
export const useRevenueSummary = (params: {
  startDate?: string;
  endDate?: string;
  ispId?: string;
}) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.revenueSummary(params),
    queryFn: () => analyticsService.getRevenueSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(params.startDate && params.endDate), // Only run if date range is provided
  });
};

// Get usage summary
export const useUsageSummary = (params: {
  startDate?: string;
  endDate?: string;
  ispId?: string;
}) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.usageSummary(params),
    queryFn: () => analyticsService.getUsageSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!(params.startDate && params.endDate), // Only run if date range is provided
  });
};

// Get dashboard stats
export const useDashboardStats = (params?: { ispId?: string }) => {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboardStats(params || {}),
    queryFn: () => analyticsService.getDashboardStats(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Generate report mutation
export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      type: string;
      startDate: string;
      endDate: string;
      format?: 'pdf' | 'excel' | 'csv';
    }) => analyticsService.generateReport(params),
    onSuccess: (report, params) => {
      // Cache the generated report
      queryClient.setQueryData(ANALYTICS_QUERY_KEYS.report(params), report);
      
      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });
};

// Combined analytics data hook
export const useAnalyticsData = (params: {
  startDate: string;
  endDate: string;
  ispId?: string;
}) => {
  const revenueQuery = useRevenueSummary(params);
  const usageQuery = useUsageSummary(params);
  const dashboardQuery = useDashboardStats({ ispId: params.ispId });

  return {
    revenue: revenueQuery.data,
    usage: usageQuery.data,
    dashboard: dashboardQuery.data,
    isLoading: revenueQuery.isLoading || usageQuery.isLoading || dashboardQuery.isLoading,
    isError: revenueQuery.isError || usageQuery.isError || dashboardQuery.isError,
    error: revenueQuery.error || usageQuery.error || dashboardQuery.error,
    refetch: () => {
      revenueQuery.refetch();
      usageQuery.refetch();
      dashboardQuery.refetch();
    },
  };
};

// Real-time analytics hook with auto-refresh
export const useRealTimeAnalytics = (params: {
  startDate: string;
  endDate: string;
  ispId?: string;
  refreshInterval?: number;
}) => {
  const { refreshInterval = 60000 } = params; // Default 1 minute

  const revenueQuery = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.revenueSummary(params),
    queryFn: () => analyticsService.getRevenueSummary(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: refreshInterval,
    enabled: !!(params.startDate && params.endDate),
  });

  const usageQuery = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.usageSummary(params),
    queryFn: () => analyticsService.getUsageSummary(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: refreshInterval,
    enabled: !!(params.startDate && params.endDate),
  });

  const dashboardQuery = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboardStats({ ispId: params.ispId }),
    queryFn: () => analyticsService.getDashboardStats({ ispId: params.ispId }),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: refreshInterval,
  });

  return {
    revenue: revenueQuery.data,
    usage: usageQuery.data,
    dashboard: dashboardQuery.data,
    isLoading: revenueQuery.isLoading || usageQuery.isLoading || dashboardQuery.isLoading,
    isError: revenueQuery.isError || usageQuery.isError || dashboardQuery.isError,
    error: revenueQuery.error || usageQuery.error || dashboardQuery.error,
    lastUpdated: Math.max(
      revenueQuery.dataUpdatedAt || 0,
      usageQuery.dataUpdatedAt || 0,
      dashboardQuery.dataUpdatedAt || 0
    ),
  };
};

// Analytics comparison hook (compare two periods)
export const useAnalyticsComparison = (params: {
  currentPeriod: { startDate: string; endDate: string };
  previousPeriod: { startDate: string; endDate: string };
  ispId?: string;
}) => {
  const currentRevenue = useRevenueSummary({
    ...params.currentPeriod,
    ispId: params.ispId,
  });

  const previousRevenue = useRevenueSummary({
    ...params.previousPeriod,
    ispId: params.ispId,
  });

  const currentUsage = useUsageSummary({
    ...params.currentPeriod,
    ispId: params.ispId,
  });

  const previousUsage = useUsageSummary({
    ...params.previousPeriod,
    ispId: params.ispId,
  });

  const comparison = {
    revenue: {
      current: currentRevenue.data,
      previous: previousRevenue.data,
      growth: currentRevenue.data && previousRevenue.data
        ? ((currentRevenue.data.totalRevenue - previousRevenue.data.totalRevenue) / previousRevenue.data.totalRevenue) * 100
        : 0,
    },
    usage: {
      current: currentUsage.data,
      previous: previousUsage.data,
      growth: currentUsage.data && previousUsage.data
        ? ((currentUsage.data.totalDataUsageMB - previousUsage.data.totalDataUsageMB) / previousUsage.data.totalDataUsageMB) * 100
        : 0,
    },
  };

  return {
    comparison,
    isLoading: currentRevenue.isLoading || previousRevenue.isLoading || currentUsage.isLoading || previousUsage.isLoading,
    isError: currentRevenue.isError || previousRevenue.isError || currentUsage.isError || previousUsage.isError,
    error: currentRevenue.error || previousRevenue.error || currentUsage.error || previousUsage.error,
  };
};

// Prefetch analytics data
export const usePrefetchAnalytics = () => {
  const queryClient = useQueryClient();

  return {
    prefetchRevenue: (params: { startDate: string; endDate: string; ispId?: string }) => {
      queryClient.prefetchQuery({
        queryKey: ANALYTICS_QUERY_KEYS.revenueSummary(params),
        queryFn: () => analyticsService.getRevenueSummary(params),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchUsage: (params: { startDate: string; endDate: string; ispId?: string }) => {
      queryClient.prefetchQuery({
        queryKey: ANALYTICS_QUERY_KEYS.usageSummary(params),
        queryFn: () => analyticsService.getUsageSummary(params),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchDashboard: (params?: { ispId?: string }) => {
      queryClient.prefetchQuery({
        queryKey: ANALYTICS_QUERY_KEYS.dashboardStats(params || {}),
        queryFn: () => analyticsService.getDashboardStats(params),
        staleTime: 2 * 60 * 1000,
      });
    },
  };
};

// Analytics cache management
export const useAnalyticsCache = () => {
  const queryClient = useQueryClient();

  return {
    clearCache: () => {
      queryClient.removeQueries({ queryKey: ANALYTICS_QUERY_KEYS.all });
    },
    invalidateRevenue: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.revenue() });
    },
    invalidateUsage: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.usage() });
    },
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.dashboardStats({}) });
    },
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEYS.all });
    },
  };
};