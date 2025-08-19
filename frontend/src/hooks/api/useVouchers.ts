import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vouchersService } from '@/services/enhanced-api.service';
import { Voucher, CreateVoucherFormData } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const VOUCHER_QUERY_KEYS = {
  all: ['vouchers'] as const,
  lists: () => [...VOUCHER_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...VOUCHER_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...VOUCHER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VOUCHER_QUERY_KEYS.details(), id] as const,
  batches: () => [...VOUCHER_QUERY_KEYS.all, 'batch'] as const,
  batch: (batchId: string) => [...VOUCHER_QUERY_KEYS.batches(), batchId] as const,
};

// Get all vouchers
export const useVouchers = (params?: {
  ispId?: string;
  isUsed?: boolean;
  planId?: string;
  batchId?: string;
}) => {
  return useQuery({
    queryKey: VOUCHER_QUERY_KEYS.list(params || {}),
    queryFn: () => vouchersService.getVouchers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single voucher
export const useVoucher = (id: string) => {
  return useQuery({
    queryKey: VOUCHER_QUERY_KEYS.detail(id),
    queryFn: () => vouchersService.getVoucher(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Create single voucher mutation
export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVoucherFormData) => vouchersService.createVoucher(data),
    onSuccess: (newVoucher) => {
      // Invalidate and refetch vouchers list
      queryClient.invalidateQueries({ queryKey: VOUCHER_QUERY_KEYS.lists() });
      
      // Add the new voucher to the cache
      queryClient.setQueryData(VOUCHER_QUERY_KEYS.detail(newVoucher.id), newVoucher);
      
      toast({
        title: "Success",
        description: "Voucher created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create voucher",
        variant: "destructive",
      });
    },
  });
};

// Generate voucher batch mutation
export const useGenerateVoucherBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      planId: string;
      quantity: number;
      prefix?: string;
      expiresAt?: string;
    }) => vouchersService.generateVoucherBatch(data),
    onSuccess: (newVouchers, variables) => {
      // Invalidate and refetch vouchers list
      queryClient.invalidateQueries({ queryKey: VOUCHER_QUERY_KEYS.lists() });
      
      // Add all new vouchers to the cache
      newVouchers.forEach(voucher => {
        queryClient.setQueryData(VOUCHER_QUERY_KEYS.detail(voucher.id), voucher);
      });
      
      toast({
        title: "Success",
        description: `${variables.quantity} vouchers generated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate vouchers",
        variant: "destructive",
      });
    },
  });
};

// Redeem voucher mutation
export const useRedeemVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => vouchersService.redeemVoucher(code),
    onSuccess: (result, code) => {
      // Invalidate vouchers list to reflect the redeemed voucher
      queryClient.invalidateQueries({ queryKey: VOUCHER_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `Voucher ${code} redeemed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem voucher",
        variant: "destructive",
      });
    },
  });
};

// Bulk operations
export const useBulkVoucherOperations = () => {
  const queryClient = useQueryClient();

  const bulkGenerate = useMutation({
    mutationFn: async (batches: {
      planId: string;
      quantity: number;
      prefix?: string;
      expiresAt?: string;
    }[]) => {
      const promises = batches.map(batch => vouchersService.generateVoucherBatch(batch));
      return Promise.all(promises);
    },
    onSuccess: (results, batches) => {
      const totalGenerated = results.reduce((sum, batch) => sum + batch.length, 0);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: VOUCHER_QUERY_KEYS.lists() });
      
      // Add all new vouchers to cache
      results.flat().forEach(voucher => {
        queryClient.setQueryData(VOUCHER_QUERY_KEYS.detail(voucher.id), voucher);
      });
      
      toast({
        title: "Success",
        description: `${totalGenerated} vouchers generated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate voucher batches",
        variant: "destructive",
      });
    },
  });

  const bulkRedeem = useMutation({
    mutationFn: async (codes: string[]) => {
      const promises = codes.map(code => vouchersService.redeemVoucher(code));
      return Promise.all(promises);
    },
    onSuccess: (results, codes) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: VOUCHER_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `${codes.length} vouchers redeemed successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem vouchers",
        variant: "destructive",
      });
    },
  });

  return {
    bulkGenerate,
    bulkRedeem,
  };
};

// Voucher statistics
export const useVoucherStats = (params?: { ispId?: string; planId?: string }) => {
  return useQuery({
    queryKey: [...VOUCHER_QUERY_KEYS.all, 'stats', params],
    queryFn: async () => {
      const vouchers = await vouchersService.getVouchers(params);
      
      const stats = {
        total: vouchers.length,
        used: vouchers.filter(v => v.isUsed).length,
        unused: vouchers.filter(v => !v.isUsed).length,
        expired: vouchers.filter(v => new Date(v.expiresAt) < new Date()).length,
        byPlan: vouchers.reduce((acc, voucher) => {
          acc[voucher.planId] = (acc[voucher.planId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      
      return stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Prefetch utilities
export const usePrefetchVoucher = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: VOUCHER_QUERY_KEYS.detail(id),
      queryFn: () => vouchersService.getVoucher(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Optimistic updates helper
export const useOptimisticVoucherUpdate = () => {
  const queryClient = useQueryClient();

  return (id: string, updater: (old: Voucher) => Voucher) => {
    queryClient.setQueryData(VOUCHER_QUERY_KEYS.detail(id), updater);
  };
};

// Voucher validation
export const useValidateVoucher = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      // This would typically call a validation endpoint
      // For now, we'll simulate validation
      const vouchers = await vouchersService.getVouchers();
      const voucher = vouchers.find(v => v.code === code);
      
      if (!voucher) {
        throw new Error('Voucher not found');
      }
      
      if (voucher.isUsed) {
        throw new Error('Voucher has already been used');
      }
      
      if (new Date(voucher.expiresAt) < new Date()) {
        throw new Error('Voucher has expired');
      }
      
      return voucher;
    },
    onError: (error: any) => {
      toast({
        title: "Invalid Voucher",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};