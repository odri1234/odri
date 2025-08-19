import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, getApiConfig } from '@/config/api.config';
import { Plan, CreatePlanFormData, UpdatePlanFormData } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// API functions that connect to your backend
const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const config = getApiConfig();
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${config.baseURL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...config.headers,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || result;
};

// Plans service functions
const plansService = {
  async getPlans(params?: { ispId?: string; isActive?: boolean }): Promise<Plan[]> {
    const searchParams = new URLSearchParams();
    if (params?.ispId) searchParams.append('ispId', params.ispId);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `${API_ENDPOINTS.PLANS.LIST}${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest<Plan[]>(endpoint);
  },

  async getPlan(id: string): Promise<Plan> {
    return makeRequest<Plan>(API_ENDPOINTS.PLANS.GET_BY_ID(id));
  },

  async createPlan(data: CreatePlanFormData): Promise<Plan> {
    return makeRequest<Plan>(API_ENDPOINTS.PLANS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePlan(id: string, data: Partial<CreatePlanFormData>): Promise<Plan> {
    return makeRequest<Plan>(API_ENDPOINTS.PLANS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePlan(id: string): Promise<void> {
    return makeRequest<void>(API_ENDPOINTS.PLANS.DELETE(id), {
      method: 'DELETE',
    });
  },
};

// Query Keys
export const PLAN_QUERY_KEYS = {
  all: ['plans'] as const,
  lists: () => [...PLAN_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...PLAN_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PLAN_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PLAN_QUERY_KEYS.details(), id] as const,
};

// Get all plans
export const usePlans = (params?: { ispId?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: PLAN_QUERY_KEYS.list(params || {}),
    queryFn: () => plansService.getPlans(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single plan
export const usePlan = (id: string) => {
  return useQuery({
    queryKey: PLAN_QUERY_KEYS.detail(id),
    queryFn: () => plansService.getPlan(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create plan mutation
export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanFormData) => plansService.createPlan(data),
    onSuccess: (newPlan) => {
      // Invalidate and refetch plans list
      queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.lists() });
      
      // Add the new plan to the cache
      queryClient.setQueryData(PLAN_QUERY_KEYS.detail(newPlan.id), newPlan);
      
      toast({
        title: "Success",
        description: "Plan created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create plan",
        variant: "destructive",
      });
    },
  });
};

// Update plan mutation
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlanFormData> }) =>
      plansService.updatePlan(id, data),
    onSuccess: (updatedPlan, { id }) => {
      // Update the plan in the cache
      queryClient.setQueryData(PLAN_QUERY_KEYS.detail(id), updatedPlan);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: "Plan updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    },
  });
};

// Delete plan mutation
export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => plansService.deletePlan(id),
    onSuccess: (_, id) => {
      // Remove the plan from the cache
      queryClient.removeQueries({ queryKey: PLAN_QUERY_KEYS.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
    },
  });
};

// Bulk operations
export const useBulkPlanOperations = () => {
  const queryClient = useQueryClient();

  const bulkDelete = useMutation({
    mutationFn: async (ids: string[]) => {
      const promises = ids.map(id => plansService.deletePlan(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      // Remove all deleted plans from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: PLAN_QUERY_KEYS.detail(id) });
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `${ids.length} plans deleted successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plans",
        variant: "destructive",
      });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<CreatePlanFormData> }[]) => {
      const promises = updates.map(({ id, data }) => plansService.updatePlan(id, data));
      return Promise.all(promises);
    },
    onSuccess: (updatedPlans, updates) => {
      // Update all plans in cache
      updatedPlans.forEach((plan, index) => {
        queryClient.setQueryData(PLAN_QUERY_KEYS.detail(updates[index].id), plan);
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: PLAN_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `${updates.length} plans updated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plans",
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
export const usePrefetchPlan = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: PLAN_QUERY_KEYS.detail(id),
      queryFn: () => plansService.getPlan(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Optimistic updates helper
export const useOptimisticPlanUpdate = () => {
  const queryClient = useQueryClient();

  return (id: string, updater: (old: Plan) => Plan) => {
    queryClient.setQueryData(PLAN_QUERY_KEYS.detail(id), updater);
  };
};