// React Query hooks for payment management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService as paymentService } from '@/services/api.service';
import { Payment, FilterOptions, PaginationOptions } from '@/types/common';
import { toast } from '@/hooks/use-toast';

export const usePayments = (filters?: FilterOptions, pagination?: PaginationOptions) => {
  return useQuery({
    queryKey: ['payments', filters, pagination],
    queryFn: () => paymentService.getPayments(filters, pagination),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePaymentStatus = (transactionId: string) => {
  return useQuery({
    queryKey: ['payment-status', transactionId],
    queryFn: () => paymentService.getPaymentStatus(transactionId),
    enabled: !!transactionId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds for pending payments
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentService.createPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Initiated',
        description: `Payment of ${data.currency} ${data.amount} has been initiated.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create payment';
      toast({
        title: 'Payment Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason?: string }) =>
      paymentService.refundPayment(paymentId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-status', data.transactionId] });
      toast({
        title: 'Refund Processed',
        description: `Refund of ${data.currency} ${data.amount} has been processed.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to process refund';
      toast({
        title: 'Refund Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};