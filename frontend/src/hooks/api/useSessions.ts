// React Query hooks for session management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsService as sessionService } from '@/services/api.service';
import { Session, FilterOptions, PaginationOptions } from '@/types/common';
import { toast } from '@/hooks/use-toast';

export const useSessions = (filters?: FilterOptions, pagination?: PaginationOptions) => {
  return useQuery({
    queryKey: ['sessions', filters, pagination],
    queryFn: () => sessionService.getSessions(filters, pagination),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ['active-sessions'],
    queryFn: sessionService.getActiveSessions,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionService.getSessionById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCloseSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionService.closeSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', data.id] });
      toast({
        title: 'Session Closed',
        description: 'User session has been closed successfully.',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to close session';
      toast({
        title: 'Close Session Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};