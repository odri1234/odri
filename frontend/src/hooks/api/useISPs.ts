import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ispsService } from '@/services/enhanced-api.service';
import { ISP, CreateISPFormData } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const ISP_QUERY_KEYS = {
  all: ['isps'] as const,
  lists: () => [...ISP_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...ISP_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ISP_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ISP_QUERY_KEYS.details(), id] as const,
  stats: (id: string) => [...ISP_QUERY_KEYS.detail(id), 'stats'] as const,
};

// Get all ISPs
export const useISPs = () => {
  return useQuery({
    queryKey: ISP_QUERY_KEYS.lists(),
    queryFn: () => ispsService.getISPs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single ISP
export const useISP = (id: string) => {
  return useQuery({
    queryKey: ISP_QUERY_KEYS.detail(id),
    queryFn: () => ispsService.getISP(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get ISP stats
export const useISPStats = (id: string) => {
  return useQuery({
    queryKey: ISP_QUERY_KEYS.stats(id),
    queryFn: () => ispsService.getISPStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create ISP mutation
export const useCreateISP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateISPFormData) => ispsService.createISP(data),
    onSuccess: (newISP) => {
      // Invalidate and refetch ISPs list
      queryClient.invalidateQueries({ queryKey: ISP_QUERY_KEYS.lists() });
      
      // Add the new ISP to the cache
      queryClient.setQueryData(ISP_QUERY_KEYS.detail(newISP.id), newISP);
      
      toast({
        title: "Success",
        description: "ISP created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create ISP",
        variant: "destructive",
      });
    },
  });
};

// Update ISP mutation
export const useUpdateISP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateISPFormData> }) =>
      ispsService.updateISP(id, data),
    onSuccess: (updatedISP, { id }) => {
      // Update the ISP in the cache
      queryClient.setQueryData(ISP_QUERY_KEYS.detail(id), updatedISP);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: ISP_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: "ISP updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ISP",
        variant: "destructive",
      });
    },
  });
};

// Delete ISP mutation
export const useDeleteISP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ispsService.deleteISP(id),
    onSuccess: (_, id) => {
      // Remove the ISP from the cache
      queryClient.removeQueries({ queryKey: ISP_QUERY_KEYS.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ISP_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: "ISP deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ISP",
        variant: "destructive",
      });
    },
  });
};

// Bulk operations
export const useBulkISPOperations = () => {
  const queryClient = useQueryClient();

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const promises = ids.map(id => ispsService.deleteISP(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      // Remove all deleted ISPs from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: ISP_QUERY_KEYS.detail(id) });
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ISP_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `${ids.length} ISPs deleted successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ISPs",
        variant: "destructive",
      });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<CreateISPFormData> }[]) => {
      const promises = updates.map(({ id, data }) => ispsService.updateISP(id, data));
      return Promise.all(promises);
    },
    onSuccess: (updatedISPs, updates) => {
      // Update all ISPs in cache
      updatedISPs.forEach((isp, index) => {
        queryClient.setQueryData(ISP_QUERY_KEYS.detail(updates[index].id), isp);
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ISP_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `${updates.length} ISPs updated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ISPs",
        variant: "destructive",
      });
    },
  });

  return {
    bulkDelete,
    bulkUpdate,
  };
};

// Prefetch utilities
export const usePrefetchISP = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ISP_QUERY_KEYS.detail(id),
      queryFn: () => ispsService.getISP(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Optimistic updates helper
export const useOptimisticISPUpdate = () => {
  const queryClient = useQueryClient();

  return (id: string, updater: (old: ISP) => ISP) => {
    queryClient.setQueryData(ISP_QUERY_KEYS.detail(id), updater);
  };
};