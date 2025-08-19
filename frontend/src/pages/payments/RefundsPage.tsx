import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { paymentsService as paymentService } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';

export const RefundsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [reasons, setReasons] = useState<Record<string, string>>({});

  // Fetch completed payments
  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ['completedPayments'],
    queryFn: () => paymentService.getHistory({ status: 'COMPLETED' }),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for refund
  const refundMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return paymentService.refund(id, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['completedPayments'] });
      // Clear the reason for this specific payment
      setReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[variables.id];
        return newReasons;
      });
      toast({
        title: "Refund Processed",
        description: "The payment has been successfully refunded.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('Refund failed:', error);
      toast({
        title: "Refund Failed",
        description: error?.message || "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReasonChange = (paymentId: string, reason: string) => {
    setReasons(prev => ({
      ...prev,
      [paymentId]: reason
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load payments</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refunds</h1>
        <p className="text-muted-foreground">Manage payment refunds and reversals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Refund Requests
          </CardTitle>
          <CardDescription>
            Process and manage refund requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments?.length === 0 ? (
            <div className="text-center py-8">
              <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Completed Payments Found</h3>
              <p className="text-muted-foreground">Only completed payments can be refunded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border p-4 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">KES {payment.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      Transaction ID: {payment.transactionId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Refund reason"
                      value={reasons[payment.id] || ''}
                      onChange={(e) => handleReasonChange(payment.id, e.target.value)}
                      className="w-64"
                    />
                    <Button
                      variant="destructive"
                      onClick={() =>
                        refundMutation.mutate({ 
                          id: payment.id, 
                          reason: reasons[payment.id] || '' 
                        })
                      }
                      disabled={!reasons[payment.id] || refundMutation.isPending}
                      loading={refundMutation.isPending}
                    >
                      {refundMutation.isPending ? 'Processing...' : 'Refund'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundsPage;
