import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { paymentsService, Payment } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { 
  CreditCard, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Smartphone,
  Building,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat
} from 'lucide-react';
import { format } from 'date-fns';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState('all');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    clientId: '',
    ispId: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Fetch payments
  const { data: paymentsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['payments', filters, pagination],
    queryFn: () => paymentsService.getPaymentHistory({
      status: filters.status || undefined,
      paymentMethod: filters.paymentMethod || undefined,
      clientId: filters.clientId || undefined,
      ispId: filters.ispId || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      page: pagination.page,
      limit: pagination.limit,
    }),
    refetchOnWindowFocus: false,
  });

  // Refund payment mutation
  const refundPaymentMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) => 
      paymentsService.refundPayment({ paymentId, reason }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Payment refunded successfully',
      });
      setIsRefundDialogOpen(false);
      setSelectedPayment(null);
      setRefundReason('');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to refund payment',
        variant: 'destructive',
      });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      clientId: '',
      ispId: '',
    });
    setPagination({ page: 1, limit: 20 });
  };

  const handleRefundPayment = () => {
    if (selectedPayment && refundReason.trim()) {
      refundPaymentMutation.mutate({
        paymentId: selectedPayment.id,
        reason: refundReason.trim(),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'mpesa':
        return 'bg-green-100 text-green-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'bank_transfer':
        return 'bg-purple-100 text-purple-800';
      case 'cash':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const canRefundPayment = (payment: Payment) => {
    if (!user) return false;
    
    // Only completed payments can be refunded
    if (payment.status !== 'completed') return false;
    
    // Super admin and admin can refund all payments
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) return true;
    
    // ISP admin can refund payments
    if (user.role === UserRole.ISP_ADMIN) return true;
    
    return false;
  };

  const getFilteredPayments = () => {
    if (!paymentsData?.data) return [];
    
    let filtered = paymentsData.data;
    
    if (selectedTab !== 'all') {
      filtered = filtered.filter(payment => payment.status === selectedTab);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.transactionId?.toLowerCase().includes(searchTerm) ||
        payment.user?.fullName?.toLowerCase().includes(searchTerm) ||
        payment.user?.email?.toLowerCase().includes(searchTerm) ||
        payment.phoneNumber?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.paymentMethod) {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.paymentMethod);
    }
    
    return filtered;
  };

  const getTotalAmount = (payments: Payment[]) => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const filteredPayments = getFilteredPayments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Monitor and manage payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getTotalAmount(paymentsData?.data?.filter(p => p.status === 'completed') || []))}
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentsData?.data?.filter(p => p.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentsData?.data?.filter(p => p.status === 'failed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Failed transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <Repeat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(getTotalAmount(paymentsData?.data?.filter(p => p.status === 'refunded') || []))}
            </div>
            <p className="text-xs text-muted-foreground">Total refunded</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={filters.paymentMethod} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All methods</SelectItem>
                  <SelectItem value="mpesa">M-PESA</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
          
          {/* Additional Filters for Client and ISP */}
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select value={filters.clientId} onValueChange={(value) => handleFilterChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All clients</SelectItem>
                  {paymentsData?.clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.fullName || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ISP</label>
              <Select value={filters.ispId} onValueChange={(value) => handleFilterChange('ispId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All ISPs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All ISPs</SelectItem>
                  {paymentsData?.isps?.map((isp) => (
                    <SelectItem key={isp.id} value={isp.id}>
                      {isp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} disabled={isFetching}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            {filteredPayments.length ? `${filteredPayments.length} payments found` : 'No payments found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: Payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{payment.transactionId}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.reference || 'No reference'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Receipt className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{payment.user?.fullName || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{formatCurrency(payment.amount, payment.currency)}</div>
                            {payment.description && (
                              <div className="text-sm text-muted-foreground">
                                {payment.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getMethodColor(payment.paymentMethod)}>
                            {getMethodIcon(payment.paymentMethod)}
                            <span className="ml-1">{payment.paymentMethod.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {payment.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {payment.status === 'refunded' && <Repeat className="h-3 w-3 mr-1" />}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <div>{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(payment.createdAt), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canRefundPayment(payment) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setIsRefundDialogOpen(true);
                                  }}
                                >
                                  <Repeat className="h-4 w-4 mr-2" />
                                  Refund Payment
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredPayments.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No payments found matching your criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about the payment transaction
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Payment Reference</label>
                  <p className="text-sm text-muted-foreground">{selectedPayment.paymentReference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Transaction ID</label>
                  <p className="text-sm text-muted-foreground">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Badge className={getMethodColor(selectedPayment.paymentMethod || '')}>
                    {selectedPayment.paymentMethod?.replace('_', ' ') || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.user?.fullName || 'N/A'} {selectedPayment.user?.email ? `(${selectedPayment.user.email})` : ''}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Client</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.client?.fullName || 'N/A'} {selectedPayment.client?.email ? `(${selectedPayment.client.email})` : ''}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">ISP</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.isp?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.phoneNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created At</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedPayment.createdAt), 'PPP p')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Updated At</label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedPayment.updatedAt), 'PPP p')}
                  </p>
                </div>
              </div>
              {selectedPayment.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">{selectedPayment.description}</p>
                </div>
              )}
              {selectedPayment.failureReason && (
                <div>
                  <label className="text-sm font-medium">Failure Reason</label>
                  <p className="text-sm text-red-600">{selectedPayment.failureReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Payment Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to refund this payment for {selectedPayment?.user?.fullName}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Refund Reason</label>
              <Input
                placeholder="Enter refund reason..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefundPayment}
              disabled={refundPaymentMutation.isPending || !refundReason.trim()}
            >
              {refundPaymentMutation.isPending ? 'Processing...' : 'Refund Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
