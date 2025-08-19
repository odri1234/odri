import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsService } from '@/services/enhanced-api.service';
import { Session } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const SESSION_QUERY_KEYS = {
  all: ['sessions'] as const,
  lists: () => [...SESSION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...SESSION_QUERY_KEYS.lists(), { filters }] as const,
  active: () => [...SESSION_QUERY_KEYS.all, 'active'] as const,
  details: () => [...SESSION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SESSION_QUERY_KEYS.details(), id] as const,
};

// Get all sessions
export const useSessions = (params?: {
  userId?: string;
  ispId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.list(params || {}),
    queryFn: () => sessionsService.getSessions(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get active sessions with real-time updates
export const useActiveSessions = (params?: { ispId?: string }) => {
  return useQuery({
    queryKey: [...SESSION_QUERY_KEYS.active(), params],
    queryFn: () => sessionsService.getActiveSessions(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Get single session
export const useSession = (id: string) => {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.detail(id),
    queryFn: () => sessionsService.getSession(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

// Create session mutation
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userId: string;
      planId: string;
      ipAddress?: string;
      macAddress?: string;
      deviceInfo?: string;
    }) => sessionsService.createSession(data),
    onSuccess: (newSession) => {
      // Invalidate and refetch sessions list
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.active() });
      
      // Add the new session to the cache
      queryClient.setQueryData(SESSION_QUERY_KEYS.detail(newSession.id), newSession);
      
      toast({
        title: "Success",
        description: "Session created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create session",
        variant: "destructive",
      });
    },
  });
};

// Update session mutation
export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        status?: string;
        endTime?: string;
        bytesIn?: number;
        bytesOut?: number;
      };
    }) => sessionsService.updateSession(id, data),
    onSuccess: (updatedSession, { id }) => {
      // Update the session in the cache
      queryClient.setQueryData(SESSION_QUERY_KEYS.detail(id), updatedSession);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.active() });
      
      toast({
        title: "Success",
        description: "Session updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update session",
        variant: "destructive",
      });
    },
  });
};

// Terminate session mutation
export const useTerminateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionsService.terminateSession(id),
    onSuccess: (_, id) => {
      // Invalidate all session queries
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.active() });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.detail(id) });
      
      toast({
        title: "Success",
        description: "Session terminated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to terminate session",
        variant: "destructive",
      });
    },
  });
};

// Bulk operations
export const useBulkSessionOperations = () => {
  const queryClient = useQueryClient();

  const bulkTerminate = useMutation({
    mutationFn: async (ids: string[]) => {
      const promises = ids.map(id => sessionsService.terminateSession(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      // Invalidate all session queries
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.active() });
      
      // Remove terminated sessions from cache
      ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.detail(id) });
      });
      
      toast({
        title: "Success",
        description: `${ids.length} sessions terminated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to terminate sessions",
        variant: "destructive",
      });
    },
  });

  return {
    bulkTerminate,
  };
};

// Session statistics
export const useSessionStats = (params?: { ispId?: string; userId?: string }) => {
  return useQuery({
    queryKey: [...SESSION_QUERY_KEYS.all, 'stats', params],
    queryFn: async () => {
      const sessions = await sessionsService.getSessions(params);
      const activeSessions = await sessionsService.getActiveSessions(params);
      
      const stats = {
        total: sessions.length,
        active: activeSessions.length,
        completed: sessions.filter(s => s.status === 'EXPIRED' || s.status === 'DISCONNECTED').length,
        totalDataUsage: sessions.reduce((sum, s) => sum + (s.bytesIn || 0) + (s.bytesOut || 0), 0),
        averageSessionDuration: sessions.length > 0 
          ? sessions.reduce((sum, s) => {
              if (s.startTime && s.endTime) {
                return sum + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime());
              }
              return sum;
            }, 0) / sessions.length
          : 0,
      };
      
      return stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Real-time session monitoring
export const useSessionMonitoring = (sessionId: string) => {
  return useQuery({
    queryKey: [...SESSION_QUERY_KEYS.detail(sessionId), 'monitoring'],
    queryFn: () => sessionsService.getSession(sessionId),
    enabled: !!sessionId,
    staleTime: 0, // Always fresh
    refetchInterval: (data) => {
      // Stop monitoring if session is not active
      if (data?.status !== 'ACTIVE') {
        return false;
      }
      return 10000; // Poll every 10 seconds for active sessions
    },
  });
};

// Prefetch utilities
export const usePrefetchSession = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: SESSION_QUERY_KEYS.detail(id),
      queryFn: () => sessionsService.getSession(id),
      staleTime: 1 * 60 * 1000,
    });
  };
};

// Optimistic updates helper
export const useOptimisticSessionUpdate = () => {
  const queryClient = useQueryClient();

  return (id: string, updater: (old: Session) => Session) => {
    queryClient.setQueryData(SESSION_QUERY_KEYS.detail(id), updater);
  };
};