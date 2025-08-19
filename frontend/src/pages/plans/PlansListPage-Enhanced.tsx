import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { usePlans, useDeletePlan, useBulkPlanOperations } from '@/hooks/api/usePlans';
import { useISPs } from '@/hooks/api/useISPs';
import { useAuth } from '@/store/auth.store';
import { Plan, UserRole } from '@/types/common';
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
  Users,
  Zap,
  RefreshCw,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Calendar,
  Activity,
  TrendingUp,
  Database,
  Globe
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Types
interface PlanFilters {
  search: string;
  ispId: string | 'all';
  isActive: 'all' | 'active' | 'inactive';
  priceRange: 'all' | 'low' | 'medium' | 'high';
}

interface SortConfig {
  key: keyof Plan | 'subscriberCount';
  direction: 'asc' | 'desc';
}

// Helper functions
const formatDataLimit = (limitMB: number) => {
  if (limitMB >= 1024) {
    return `${(limitMB / 1024).toFixed(1)} GB`;
  }
  return `${limitMB} MB`;
};

const formatSpeed = (speedKbps: number) => {
  if (speedKbps >= 1024) {
    return `${(speedKbps / 1024).toFixed(1)} Mbps`;
  }
  return `${speedKbps} Kbps`;
};

const getPriceRange = (price: number) => {
  if (price < 20) return 'low';
  if (price < 50) return 'medium';
  return 'high';
};

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

export default function PlansListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State
  const [filters, setFilters] = useState<PlanFilters>({
    search: '',
    ispId: 'all',
    isActive: 'all',
    priceRange: 'all',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // API Hooks
  const { data: plans, isLoading, error, refetch } = usePlans({
    ispId: filters.ispId !== 'all' ? filters.ispId : undefined,
    isActive: filters.isActive !== 'all' ? filters.isActive === 'active' : undefined,
  });

  const { data: isps } = useISPs();
  const deletePlanMutation = useDeletePlan();
  const { bulkDelete } = useBulkPlanOperations();

  // Filter ISPs based on user role
  const availableISPs = useMemo(() => {
    if (!isps || !currentUser) return [];
    
    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return isps;
      case UserRole.ISP:
        return isps.filter(isp => isp.ownerId === currentUser.id);
      default:
        return [];
    }
  }, [isps, currentUser]);

  // Filtered and sorted plans
  const filteredAndSortedPlans = useMemo(() => {
    if (!plans) return [];
    
    let filtered = plans;

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(plan => 
        plan.name.toLowerCase().includes(searchLower) ||
        plan.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(plan => getPriceRange(plan.price) === filters.priceRange);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'subscriberCount') {
        aValue = a.stats?.subscriberCount || 0;
        bValue = b.stats?.subscriberCount || 0;
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [plans, filters, sortConfig]);

  // Handlers
  const handleSort = (key: keyof Plan | 'subscriberCount') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectPlan = (planId: string, checked: boolean) => {
    setSelectedPlans(prev => 
      checked 
        ? [...prev, planId]
        : prev.filter(id => id !== planId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedPlans(checked ? filteredAndSortedPlans.map(plan => plan.id) : []);
  };

  const handleDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      await deletePlanMutation.mutateAsync(planToDelete.id);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleBulkDelete = () => {
    if (selectedPlans.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedPlans);
      setBulkDeleteDialogOpen(false);
      setSelectedPlans([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      ispId: 'all',
      isActive: 'all',
      priceRange: 'all',
    });
  };

  // Render helpers
  const renderSortIcon = (key: keyof Plan | 'subscriberCount') => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const renderPlanStatus = (plan: Plan) => (
    <Badge variant="outline" className={cn("text-xs", getStatusColor(plan.isActive))}>
      {plan.isActive ? (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3 mr-1" />
          Inactive
        </>
      )}
    </Badge>
  );

  const renderPlanSpecs = (plan: Plan) => (
    <div className="space-y-1">
      <div className="flex items-center text-sm">
        <Zap className="h-3 w-3 mr-1" />
        {formatSpeed(plan.downloadSpeed)} / {formatSpeed(plan.uploadSpeed)}
      </div>
      {plan.dataLimit && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Database className="h-3 w-3 mr-1" />
          {formatDataLimit(plan.dataLimit)}
        </div>
      )}
      {plan.validityDays && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {plan.validityDays} days
        </div>
      )}
    </div>
  );

  const renderPlanStats = (plan: Plan) => {
    const stats = plan.stats;
    if (!stats) return <span className="text-muted-foreground">No data</span>;

    return (
      <div className="space-y-1">
        <div className="flex items-center text-sm">
          <Users className="h-3 w-3 mr-1" />
          {stats.subscriberCount} subscribers
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <TrendingUp className="h-3 w-3 mr-1" />
          ${stats.totalRevenue?.toFixed(2) || '0.00'} revenue
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Plans</h3>
              <p className="text-muted-foreground mb-4">
                {error.message || 'Failed to load plans'}
              </p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internet Plans</h1>
          <p className="text-muted-foreground">
            Manage internet service plans and pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/plans/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{plans?.length || 0}</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAndSortedPlans.filter(plan => plan.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${plans?.length ? (plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">{selectedPlans.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ISP</label>
              <Select
                value={filters.ispId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, ispId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ISPs</SelectItem>
                  {availableISPs.map(isp => (
                    <SelectItem key={isp.id} value={isp.id}>
                      {isp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.isActive}
                onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value as 'all' | 'active' | 'inactive' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Select
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as 'all' | 'low' | 'medium' | 'high' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Low (&lt; $20)</SelectItem>
                  <SelectItem value="medium">Medium ($20-$50)</SelectItem>
                  <SelectItem value="high">High (&gt; $50)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            {selectedPlans.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedPlans.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPlans.length === filteredAndSortedPlans.length && filteredAndSortedPlans.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Plan Name
                      {renderSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>ISP</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      {renderSortIcon('price')}
                    </div>
                  </TableHead>
                  <TableHead>Specifications</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('subscriberCount')}
                  >
                    <div className="flex items-center">
                      Statistics
                      {renderSortIcon('subscriberCount')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created
                      {renderSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPlans.map((plan) => (
                  <TableRow key={plan.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedPlans.includes(plan.id)}
                        onCheckedChange={(checked) => handleSelectPlan(plan.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        {plan.description && (
                          <div className="text-sm text-muted-foreground">
                            {plan.description.length > 50 
                              ? `${plan.description.substring(0, 50)}...` 
                              : plan.description
                            }
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.isp ? (
                        <div className="flex items-center text-sm">
                          <Building className="h-3 w-3 mr-1" />
                          {plan.isp.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-medium">{plan.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {plan.currency}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderPlanSpecs(plan)}
                    </TableCell>
                    <TableCell>
                      {renderPlanStats(plan)}
                    </TableCell>
                    <TableCell>
                      {renderPlanStatus(plan)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(plan.createdAt!), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(plan.createdAt!), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                          <DropdownMenuItem asChild>
                            <Link to={`/plans/${plan.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Plan
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeletePlan(plan)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Plan Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? 
              This will affect all users subscribed to this plan. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePlan}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePlanMutation.isPending}
            >
              {deletePlanMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Plans</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedPlans.length} plans? 
              This will affect all users subscribed to these plans. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDelete.isPending}
            >
              {bulkDelete.isPending ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}