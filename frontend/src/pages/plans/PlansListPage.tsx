import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { plansService as planService, ispsService as ispService } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { 
  Wifi, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign,
  Clock,
  Download,
  Upload,
  Users,
  Building,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Package,
  Zap
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in hours
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  dataLimit?: number; // in GB, null for unlimited
  status: 'active' | 'inactive';
  ispId: string;
  ispName: string;
  createdAt: string;
  updatedAt: string;
  usersCount: number;
}

export const PlansListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
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

  // Fetch ISPs for filter dropdown
  const { data: ispsData } = useQuery({
    queryKey: ['isps'],
    queryFn: () => ispService.getISPs(),
    enabled: user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN,
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

  // Update plan status mutation
  const updatePlanStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      planService.updatePlan(id, { status }),
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
      status: '',
      ispId: '',
    });
    setPagination({ page: 1, limit: 20 });
  };

  const handleDeletePlan = () => {
    if (selectedPlan) {
      deletePlanMutation.mutate(selectedPlan.id);
    }
  };

  const handleStatusToggle = (planId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updatePlanStatusMutation.mutate({ id: planId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)} Gbps`;
    }
    return `${speed} Mbps`;
  };

  const formatDataLimit = (limit?: number) => {
    if (!limit) return 'Unlimited';
    if (limit >= 1000) {
      return `${(limit / 1000).toFixed(1)} TB`;
    }
    return `${limit} GB`;
  };

  const formatDuration = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const canManagePlan = (plan: Plan) => {
    if (!user) return false;
    
    // Super admin and admin can manage all plans
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) return true;
    
    // ISP admin can manage plans in their ISP
    if (user.role === UserRole.ISP_ADMIN && plan.ispId === user.ispId) return true;
    
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Plans</h1>
          <p className="text-muted-foreground">
            Manage internet service plans and packages
          </p>
        </div>
        <Button asChild>
          <Link to="/plans/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Link>
        </Button>
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
                placeholder="Search plans..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                  {ispsData?.data?.map((isp: any) => (
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

      {/* Plans Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plansData?.data?.map((plan: Plan) => (
                <Card key={plan.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {plan.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigate(`/plans/${plan.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canManagePlan(plan) && (
                            <>
                              <DropdownMenuItem onClick={() => navigate(`/plans/${plan.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleStatusToggle(plan.id, plan.status)}
                              >
                                {plan.status === 'active' ? (
                                  <>
                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
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
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(plan.price, plan.currency)}
                      </div>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Duration
                        </div>
                        <div className="font-medium">{formatDuration(plan.duration)}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Download className="h-4 w-4" />
                          Download
                        </div>
                        <div className="font-medium">{formatSpeed(plan.downloadSpeed)}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="h-4 w-4" />
                          Upload
                        </div>
                        <div className="font-medium">{formatSpeed(plan.uploadSpeed)}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Wifi className="h-4 w-4" />
                          Data Limit
                        </div>
                        <div className="font-medium">{formatDataLimit(plan.dataLimit)}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          Active Users
                        </div>
                        <div className="font-medium">{plan.usersCount}</div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-4 w-4" />
                          ISP
                        </div>
                        <div className="font-medium text-sm">{plan.ispName}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!plansData?.data || plansData.data.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No plans found</h3>
                  <p className="text-muted-foreground mb-4">
                    No service plans match your current filters
                  </p>
                  <Button asChild>
                    <Link to="/plans/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Plan
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {plansData?.total && plansData.total > pagination.limit && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, plansData.total)} of{' '}
                  {plansData.total} results
                </p>
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
                    disabled={pagination.page * pagination.limit >= plansData.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? 
              This action cannot be undone and will affect {selectedPlan?.usersCount} users.
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

export default PlansListPage;