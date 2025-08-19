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
import { toast } from '@/hooks/use-toast';
import { vouchersService, plansService, ispsService } from '@/services/enhanced-api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole, Voucher, VoucherStatus, VoucherValidityUnit } from '@/types/common';
import { CreateVoucherDialog } from './CreateVoucherDialog';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  RefreshCw,
  Copy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Download,
  Upload,
  QrCode,
  Printer,
  Gift
} from 'lucide-react';
import { format } from 'date-fns';

// Using Voucher interface from common.ts
interface VoucherWithDetails extends Voucher {
  planName?: string;
  prefix?: string;
  userName?: string;
  userEmail?: string;
}

export const VouchersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    planId: '',
    ispId: '',
    isRedeemed: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    planId: '',
    quantity: 10,
    prefix: '',
    amount: 1000,
    validityUnit: VoucherValidityUnit.DAYS,
    duration: 30,
    ispId: user?.ispId || '',
  });

  // Fetch vouchers
  const { data: vouchersData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['vouchers', filters, pagination],
    queryFn: () => vouchersService.getVouchers(filters, pagination),
    refetchOnWindowFocus: false,
  });

  // Fetch plans for dropdown
  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansService.getPlans({ isActive: 'true' }),
  });

  // Fetch ISPs for dropdown
  const { data: ispsData } = useQuery({
    queryKey: ['isps'],
    queryFn: () => ispsService.getIsps(),
  });

  // Generate vouchers mutation
  const generateVouchersMutation = useMutation({
    mutationFn: vouchersService.generateVouchers,
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Generated ${data.length} vouchers successfully`,
      });
      setIsGenerateDialogOpen(false);
      setGenerateForm({
        planId: '',
        quantity: 10,
        prefix: '',
        amount: 1000,
        validityUnit: VoucherValidityUnit.DAYS,
        duration: 30,
        ispId: user?.ispId || '',
      });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate vouchers',
        variant: 'destructive',
      });
    },
  });
  
  // Delete voucher mutation
  const deleteVoucherMutation = useMutation({
    mutationFn: (id: string) => vouchersService.deleteVoucher(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Voucher deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete voucher',
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
      planId: '',
      ispId: '',
      isRedeemed: '',
    });
    setPagination({ page: 1, limit: 20 });
  };

  const handleGenerateVouchers = () => {
    if (!generateForm.planId || generateForm.quantity < 1 || generateForm.amount < 1 || generateForm.duration < 1) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields with valid values',
        variant: 'destructive',
      });
      return;
    }

    generateVouchersMutation.mutate({
      planId: generateForm.planId,
      quantity: generateForm.quantity,
      prefix: generateForm.prefix || undefined,
      amount: generateForm.amount,
      validityUnit: generateForm.validityUnit,
      duration: generateForm.duration,
      ispId: generateForm.ispId,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied',
        description: 'Voucher code copied to clipboard',
      });
    });
  };

  const getStatusColor = (status: VoucherStatus) => {
    switch (status) {
      case VoucherStatus.UNUSED:
        return 'bg-green-100 text-green-800';
      case VoucherStatus.USED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadge = (voucher: Voucher) => {
    const isExpired = voucher.expiresAt && new Date(voucher.expiresAt) < new Date();
    
    if (isExpired) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    }
    
    switch (voucher.status) {
      case VoucherStatus.UNUSED:
        return <Badge className="bg-green-100 text-green-800">Unused</Badge>;
      case VoucherStatus.USED:
        return <Badge className="bg-blue-100 text-blue-800">Used</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{voucher.status}</Badge>;
    }
  };

  const canGenerateVouchers = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN].includes(user.role);
  };

  return (
    <div className="space-y-6">
      {/* Create Voucher Dialog */}
      <CreateVoucherDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        plans={plansData?.data || []}
        isps={ispsData?.data || []}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground">
            Manage internet access vouchers and codes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canGenerateVouchers() && (
            <>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Single Voucher
              </Button>
              <Button onClick={() => setIsGenerateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Batch
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchersData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All vouchers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchersData?.data?.filter((v: Voucher) => v.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
            <Gift className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchersData?.data?.filter((v: Voucher) => v.status === 'used').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Redeemed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchersData?.data?.filter((v: Voucher) => v.status === 'expired').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Past expiry</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search vouchers..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value={VoucherStatus.UNUSED}>Unused</SelectItem>
                  <SelectItem value={VoucherStatus.USED}>Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Redeemed</label>
              <Select value={filters.isRedeemed} onValueChange={(value) => handleFilterChange('isRedeemed', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Redeemed</SelectItem>
                  <SelectItem value="false">Not Redeemed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={filters.planId} onValueChange={(value) => handleFilterChange('planId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All plans</SelectItem>
                  {plansData?.data?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
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
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Codes</CardTitle>
          <CardDescription>
            {vouchersData?.total ? `${vouchersData.total} total vouchers` : 'Loading vouchers...'}
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
                    <TableHead>Voucher Code</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Redeemed</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchersData?.data?.map((voucher: Voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-mono font-medium text-lg">{voucher.code}</div>
                            {voucher.batchId && (
                              <div className="text-sm text-muted-foreground">
                                Batch: {voucher.batchId}
                              </div>
                            )}
                          </div>
                          <div className="ml-auto">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => copyToClipboard(voucher.code)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteVoucherMutation.mutate(voucher.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{voucher.amount} MB</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {plansData?.data?.find((p: any) => p.id === voucher.planId)?.name || 'Unknown Plan'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(voucher)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>{voucher.duration} {voucher.validityUnit.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {voucher.isRedeemed ? (
                          <div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="font-medium">Yes</span>
                            </div>
                            {voucher.redeemedAt && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(voucher.redeemedAt), 'MMM dd, yyyy HH:mm')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span className="text-muted-foreground">Not redeemed</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <div>{format(new Date(voucher.createdAt), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(voucher.createdAt), 'HH:mm')}
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
                            <DropdownMenuItem onClick={() => copyToClipboard(voucher.code)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <QrCode className="h-4 w-4 mr-2" />
                              Generate QR
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Vouchers Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Vouchers</DialogTitle>
            <DialogDescription>
              Create new voucher codes for internet access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select 
                value={generateForm.planId} 
                onValueChange={(value) => setGenerateForm(prev => ({ ...prev, planId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plansData?.data?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} {plan.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={generateForm.quantity}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  min="1"
                  value={generateForm.amount}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 100 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input
                  type="number"
                  min="1"
                  value={generateForm.duration}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Validity Unit</label>
                <Select 
                  value={generateForm.validityUnit} 
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, validityUnit: value as VoucherValidityUnit }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VoucherValidityUnit.HOURS}>Hours</SelectItem>
                    <SelectItem value={VoucherValidityUnit.DAYS}>Days</SelectItem>
                    <SelectItem value={VoucherValidityUnit.WEEKS}>Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prefix (Optional)</label>
              <Input
                placeholder="e.g., WIFI, NET, etc."
                value={generateForm.prefix}
                onChange={(e) => setGenerateForm(prev => ({ ...prev, prefix: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateVouchers}
              disabled={generateVouchersMutation.isPending || !generateForm.planId}
            >
              {generateVouchersMutation.isPending ? 'Generating...' : 'Generate Vouchers'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VouchersPage;