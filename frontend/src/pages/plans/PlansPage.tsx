import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { plansService as planService } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole, Plan, PlanPricing } from '@/types/common';
import { 
  Wifi, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Clock,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  Zap,
  Globe,
  Timer,
  HardDrive,
  Signal,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

// Using the Plan interface from common.ts

export const PlansPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    ispId: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch plans
  const { data: plansData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['plans', filters, pagination],
    queryFn: () => planService.getPlans(filters, pagination),
    refetchOnWindowFocus: false,
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: planService.deletePlan,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    },
  });

  // Update plan active status mutation
  const updatePlanStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      planService.updatePlan(id, { isActive }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Plan status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan status',
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
      isActive: '',
      ispId: '',
    });
    setPagination({ page: 1, limit: 20 });
  };

  const handleDeletePlan = () => {
    if (selectedPlan) {
      deletePlanMutation.mutate(selectedPlan.id);
    }
  };

  const handleStatusChange = (planId: string, isActive: boolean) => {
    updatePlanStatusMutation.mutate({ id: planId, isActive });
  };

  // These functions are no longer used with the new plan structure
  // but kept for reference in case they're needed in the future
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'standard':
        return 'bg-green-100 text-green-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // These functions are no longer used with the new plan structure
  // but kept for reference in case they're needed in the future
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prepaid':
        return 'bg-cyan-100 text-cyan-800';
      case 'postpaid':
        return 'bg-indigo-100 text-indigo-800';
      case 'unlimited':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'Unlimited';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return 'No limit';
    if (speed >= 1000000) {
      return `${(speed / 1000000).toFixed(1)} Mbps`;
    } else if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} Kbps`;
    }
    return `${speed} bps`;
  };

  // This function is no longer used with the new plan structure
  const formatDuration = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
    }
    return `${hours} hours`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const canManagePlan = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF].includes(user.role);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans Management</h1>
          <p className="text-muted-foreground">
            Manage internet service plans, pricing, and features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          {canManagePlan() && (
            <Button asChild>
              <Link to="/plans/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plansData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All service plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plansData?.data?.filter((p: Plan) => p.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Plans</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plansData?.data?.filter((p: Plan) => p.isPopular).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Featured plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                plansData?.data?.reduce((sum: number, plan: Plan) => 
                  sum + (plan.stats?.revenue || 0), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">From all plans</p>
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search plans..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
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
                  {plansData?.isps?.map((isp) => (
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
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Plans</CardTitle>
          <CardDescription>
            {plansData?.total ? `${plansData.total} total plans` : 'Loading plans...'}
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
                    <TableHead>Plan Details</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Pricing Options</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ISP</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plansData?.data?.map((plan: Plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Wifi className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-lg">{plan.name}</span>
                            </div>
                            {plan.description && (
                              <div className="text-sm text-muted-foreground">
                                {plan.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-lg font-bold">
                            {formatCurrency(plan.basePrice)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {plan.pricings && plan.pricings.length > 0 ? (
                            plan.pricings.map((pricing) => (
                              <div key={pricing.id} className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                <span>{pricing.priceType}: {formatCurrency(pricing.price)}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No pricing options</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {plan.isActive ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Inactive</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <span>{plan.ispId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <div>{format(new Date(plan.createdAt), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(plan.createdAt), 'HH:mm')}
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
                            <DropdownMenuItem asChild>
                              <Link to={`/plans/${plan.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canManagePlan() && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link to={`/plans/${plan.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Plan
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(plan.id, !plan.isActive)}
                                >
                                  {plan.isActive ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Plan
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

              {/* Pagination */}
              {plansData?.total && plansData.total > pagination.limit && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, plansData.total)} of{' '}
                    {plansData.total} plans
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page * pagination.limit >= (plansData.total || 0)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
              All subscribers will lose access to this plan and associated vouchers will be invalidated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
              disabled={deletePlanMutation.isPending}
            >
              {deletePlanMutation.isPending ? 'Deleting...' : 'Delete Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansPage;