import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mikrotikService } from '@/services/enhanced-api.service';
import { MikroTikRouter, HotspotUser, ConnectedUser, CreateRouterFormData, CreateHotspotUserFormData } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const MIKROTIK_QUERY_KEYS = {
  all: ['mikrotik'] as const,
  routers: () => [...MIKROTIK_QUERY_KEYS.all, 'routers'] as const,
  router: (id: string) => [...MIKROTIK_QUERY_KEYS.routers(), id] as const,
  routerStatus: (id: string) => [...MIKROTIK_QUERY_KEYS.router(id), 'status'] as const,
  hotspotUsers: (routerId: string) => [...MIKROTIK_QUERY_KEYS.all, 'hotspot-users', routerId] as const,
  connectedUsers: (routerId: string) => [...MIKROTIK_QUERY_KEYS.all, 'connected-users', routerId] as const,
};

// Get all routers
export const useRouters = () => {
  return useQuery({
    queryKey: MIKROTIK_QUERY_KEYS.routers(),
    queryFn: () => mikrotikService.getRouters(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single router
export const useRouter = (id: string) => {
  return useQuery({
    queryKey: MIKROTIK_QUERY_KEYS.router(id),
    queryFn: () => mikrotikService.getRouter(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get router status with real-time updates
export const useRouterStatus = (id: string) => {
  return useQuery({
    queryKey: MIKROTIK_QUERY_KEYS.routerStatus(id),
    queryFn: () => mikrotikService.getRouterStatus(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Get hotspot users for a router
export const useHotspotUsers = (routerId: string) => {
  return useQuery({
    queryKey: MIKROTIK_QUERY_KEYS.hotspotUsers(routerId),
    queryFn: () => mikrotikService.getHotspotUsers(routerId),
    enabled: !!routerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get connected users with real-time updates
export const useConnectedUsers = (routerId: string) => {
  return useQuery({
    queryKey: MIKROTIK_QUERY_KEYS.connectedUsers(routerId),
    queryFn: () => mikrotikService.getConnectedUsers(routerId),
    enabled: !!routerId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Add router mutation
export const useAddRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRouterFormData) => mikrotikService.addRouter(data),
    onSuccess: (newRouter) => {
      // Invalidate and refetch routers list
      queryClient.invalidateQueries({ queryKey: MIKROTIK_QUERY_KEYS.routers() });
      
      // Add the new router to the cache
      queryClient.setQueryData(MIKROTIK_QUERY_KEYS.router(newRouter.id), newRouter);
      
      toast({
        title: "Success",
        description: "Router added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add router",
        variant: "destructive",
      });
    },
  });
};

// Update router mutation
export const useUpdateRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRouterFormData> }) =>
      mikrotikService.updateRouter(id, data),
    onSuccess: (updatedRouter, { id }) => {
      // Update the router in the cache
      queryClient.setQueryData(MIKROTIK_QUERY_KEYS.router(id), updatedRouter);
      
      // Invalidate routers list to ensure consistency
      queryClient.invalidateQueries({ queryKey: MIKROTIK_QUERY_KEYS.routers() });
      
      toast({
        title: "Success",
        description: "Router updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update router",
        variant: "destructive",
      });
    },
  });
};

// Delete router mutation
export const useDeleteRouter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mikrotikService.deleteRouter(id),
    onSuccess: (_, id) => {
      // Remove the router from the cache
      queryClient.removeQueries({ queryKey: MIKROTIK_QUERY_KEYS.router(id) });
      
      // Invalidate routers list
      queryClient.invalidateQueries({ queryKey: MIKROTIK_QUERY_KEYS.routers() });
      
      toast({
        title: "Success",
        description: "Router deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete router",
        variant: "destructive",
      });
    },
  });
};

// Test router connection mutation
export const useTestRouterConnection = () => {
  return useMutation({
    mutationFn: (id: string) => mikrotikService.testRouterConnection(id),
    onSuccess: (result) => {
      toast({
        title: "Connection Test",
        description: result.success ? "Connection successful" : "Connection failed",
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to test connection",
        variant: "destructive",
      });
    },
  });
};

// Add hotspot user mutation
export const useAddHotspotUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHotspotUserFormData) => mikrotikService.addHotspotUser(data),
    onSuccess: (result, variables) => {
      // Invalidate hotspot users for the specific router
      queryClient.invalidateQueries({ 
        queryKey: MIKROTIK_QUERY_KEYS.hotspotUsers(variables.routerId) 
      });
      
      toast({
        title: "Success",
        description: "Hotspot user added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add hotspot user",
        variant: "destructive",
      });
    },
  });
};

// Remove hotspot user mutation
export const useRemoveHotspotUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, routerId }: { username: string; routerId: string }) =>
      mikrotikService.removeHotspotUser(username, routerId),
    onSuccess: (result, variables) => {
      // Invalidate hotspot users for the specific router
      queryClient.invalidateQueries({ 
        queryKey: MIKROTIK_QUERY_KEYS.hotspotUsers(variables.routerId) 
      });
      
      toast({
        title: "Success",
        description: "Hotspot user removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove hotspot user",
        variant: "destructive",
      });
    },
  });
};

// Disconnect user mutation
export const useDisconnectUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mac, routerId }: { mac: string; routerId: string }) =>
      mikrotikService.disconnectUser(mac, routerId),
    onSuccess: (result, variables) => {
      // Invalidate connected users for the specific router
      queryClient.invalidateQueries({ 
        queryKey: MIKROTIK_QUERY_KEYS.connectedUsers(variables.routerId) 
      });
      
      toast({
        title: "Success",
        description: "User disconnected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect user",
        variant: "destructive",
      });
    },
  });
};

// Bulk operations
export const useBulkMikroTikOperations = () => {
  const queryClient = useQueryClient();

  const bulkAddHotspotUsers = useMutation({
    mutationFn: async (users: CreateHotspotUserFormData[]) => {
      const promises = users.map(user => mikrotikService.addHotspotUser(user));
      return Promise.all(promises);
    },
    onSuccess: (results, users) => {
      // Invalidate hotspot users for all affected routers
      const routerIds = [...new Set(users.map(u => u.routerId))];
      routerIds.forEach(routerId => {
        queryClient.invalidateQueries({ 
          queryKey: MIKROTIK_QUERY_KEYS.hotspotUsers(routerId) 
        });
      });
      
      toast({
        title: "Success",
        description: `${users.length} hotspot users added successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add hotspot users",
        variant: "destructive",
      });
    },
  });

  const bulkRemoveHotspotUsers = useMutation({
    mutationFn: async (users: { username: string; routerId: string }[]) => {
      const promises = users.map(({ username, routerId }) => 
        mikrotikService.removeHotspotUser(username, routerId)
      );
      return Promise.all(promises);
    },
    onSuccess: (results, users) => {
      // Invalidate hotspot users for all affected routers
      const routerIds = [...new Set(users.map(u => u.routerId))];
      routerIds.forEach(routerId => {
        queryClient.invalidateQueries({ 
          queryKey: MIKROTIK_QUERY_KEYS.hotspotUsers(routerId) 
        });
      });
      
      toast({
        title: "Success",
        description: `${users.length} hotspot users removed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove hotspot users",
        variant: "destructive",
      });
    },
  });

  const bulkDisconnectUsers = useMutation({
    mutationFn: async (users: { mac: string; routerId: string }[]) => {
      const promises = users.map(({ mac, routerId }) => 
        mikrotikService.disconnectUser(mac, routerId)
      );
      return Promise.all(promises);
    },
    onSuccess: (results, users) => {
      // Invalidate connected users for all affected routers
      const routerIds = [...new Set(users.map(u => u.routerId))];
      routerIds.forEach(routerId => {
        queryClient.invalidateQueries({ 
          queryKey: MIKROTIK_QUERY_KEYS.connectedUsers(routerId) 
        });
      });
      
      toast({
        title: "Success",
        description: `${users.length} users disconnected successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect users",
        variant: "destructive",
      });
    },
  });

  return {
    bulkAddHotspotUsers,
    bulkRemoveHotspotUsers,
    bulkDisconnectUsers,
  };
};

// Router statistics
export const useRouterStats = () => {
  return useQuery({
    queryKey: [...MIKROTIK_QUERY_KEYS.all, 'stats'],
    queryFn: async () => {
      const routers = await mikrotikService.getRouters();
      
      const stats = {
        total: routers.length,
        online: routers.filter(r => r.status === 'online').length,
        offline: routers.filter(r => r.status === 'offline').length,
        totalConnectedUsers: routers.reduce((sum, r) => sum + r.connectedUsers, 0),
        totalUsers: routers.reduce((sum, r) => sum + r.totalUsers, 0),
      };
      
      return stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Prefetch utilities
export const usePrefetchRouter = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: MIKROTIK_QUERY_KEYS.router(id),
      queryFn: () => mikrotikService.getRouter(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Optimistic updates helper
export const useOptimisticRouterUpdate = () => {
  const queryClient = useQueryClient();

  return (id: string, updater: (old: MikroTikRouter) => MikroTikRouter) => {
    queryClient.setQueryData(MIKROTIK_QUERY_KEYS.router(id), updater);
  };
};