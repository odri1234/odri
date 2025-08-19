import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/services/enhanced-api.service';
import { Payment, CreatePaymentFormData, PaymentStatus, PaymentMethod } from '@/types/common';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const PAYMENT_QUERY_KEYS = {
  all: ['payments'] as const,
  lists: () => [...PAYMENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...PAYMENT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PAYMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PAYMENT_QUERY_KEYS.details(), id] as const,
  status: (transactionId: string) => [...PAYMENT_QUERY_KEYS.all, 'status', transactionId] as const,
};

// Get all payments
export const usePayments = (params?: {
  userId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.list(params || {}),
    queryFn: () => paymentsService.getPayments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single payment
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.detail(id),
    queryFn: () => paymentsService.getPayment(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Get payment status by transaction ID
export const usePaymentStatus = (transactionId: string) => {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.status(transactionId),
    queryFn: () => paymentsService.getPaymentStatus(transactionId),
    enabled: !!transactionId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });
};

// Create payment mutation
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentFormData) => paymentsService.createPayment(data),
    onSuccess: (newPayment) => {
      // Invalidate and refetch payments list
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.lists() });
      
      // Add the new payment to the cache
      queryClient.setQueryData(PAYMENT_QUERY_KEYS.detail(newPayment.id), newPayment);
      
      toast({
        title: "Success",
        description: `Payment of ${newPayment.amount} ${newPayment.currency} created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    },
  });
};

// Refund payment mutation
export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      paymentsService.refundPayment(paymentId, reason),
    onSuccess: (refundedPayment) => {
      // Update the payment in the cache
      queryClient.setQueryData(PAYMENT_QUERY_KEYS.detail(refundedPayment.id), refundedPayment);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `Payment of ${refundedPayment.amount} ${refundedPayment.currency} refunded successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to refund payment",
        variant: "destructive",
      });
    },
  });
};

// Bulk operations
export const useBulkPaymentOperations = () => {
  const queryClient = useQueryClient();

  const bulkRefund = useMutation({
    mutationFn: async (refunds: { paymentId: string; reason: string }[]) => {
      const promises = refunds.map(({ paymentId, reason }) => 
        paymentsService.refundPayment(paymentId, reason)
      );
      return Promise.all(promises);
    },
    onSuccess: (refundedPayments, refunds) => {
      // Update all payments in cache
      refundedPayments.forEach((payment) => {
        queryClient.setQueryData(PAYMENT_QUERY_KEYS.detail(payment.id), payment);
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.lists() });
      
      toast({
        title: "Success",
        description: `${refunds.length} payments refunded successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to refund payments",
        variant: "destructive",
      });
    },
  });

  return {
    bulkRefund,
  };
};

// Real-time payment status tracking
export const usePaymentStatusTracking = (transactionId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.status(transactionId),
    queryFn: () => paymentsService.getPaymentStatus(transactionId),
    enabled: !!transactionId,
    staleTime: 0, // Always fresh
    refetchInterval: (data) => {
      // Stop polling if payment is completed or failed
      if (data?.status === PaymentStatus.COMPLETED || data?.status === PaymentStatus.FAILED) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    onSuccess: (payment) => {
      // Update payment cache when status changes
      if (payment) {
        queryClient.setQueryData(PAYMENT_QUERY_KEYS.detail(payment.id), payment);
      }
    },
  });
};

// Prefetch utilities
export const usePrefetchPayment = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: PAYMENT_QUERY_KEYS.detail(id),
      queryFn: () => paymentsService.getPayment(id),
      staleTime: 2 * 60 * 1000,
    });
  };
};

// Optimistic updates helper
export const useOptimisticPaymentUpdate = () => {
  const queryClient = useQueryClient();

  return (id: string, updater: (old: Payment) => Payment) => {
    queryClient.setQueryData(PAYMENT_QUERY_KEYS.detail(id), updater);
  };
};