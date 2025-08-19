import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  usePlans, 
  useCreatePlan, 
  useUpdatePlan, 
  useDeletePlan, 
  useBulkPlanOperations,
  usePlanAnalytics
} from '@/hooks/api/usePlans';
import { useAuth } from '@/store/auth.store';
import { Plan, CreatePlanFormData, UserRole } from '@/types/common';
import { 
  Wifi, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Settings,
  RefreshCw,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Activity,
  TrendingUp,
  Database,
  Globe,
  Clock,
  DollarSign,
  Users,
  Zap,
  Signal,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Copy,
  Star,
  Package
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  basePrice: z.number().min(0, 'Price must be positive'),
  dataLimit: z.number().min(0, 'Data limit must be positive').optional(),
  speedLimit: z.string().optional(),
  validityDays: z.number().min(1, 'Validity must be at least 1 day'),
  maxUsers: z.number().min(1, 'Max users must be at least 1').optional(),
  isActive: z.boolean().default(true),
  features: z.array(z.string()).optional(),
  planType: z.enum(['hotspot', 'pppoe', 'static']).default('hotspot'),
  priority: z.number().min(1).max(10).default(5),
});

type PlanFormData = z.infer<typeof planSchema>;

// Types
interface PlanFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  planType: 'all' | 'hotspot' | 'pppoe' | 'static';
  priceRange: 'all' | 'low' | 'medium' | 'high';
}

interface SortConfig {
  key: keyof Plan | 'subscribers';
  direction: 'asc' | 'desc';
}

// Helper functions
const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

const getPlanTypeColor = (planType: string) => {
  switch (planType) {
    case 'hotspot':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pppoe':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'static':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatDataLimit = (bytes?: number) => {
  if (!bytes) return 'Unlimited';
  
  const gb = bytes / (1024 * 1024 * 1024);
  const mb = bytes / (1024 * 1024);
  
  if (gb >= 1) {
    return `${gb.toFixed(1)} GB`;
  } else {
    return `${mb.toFixed(0)} MB`;
  }
};

const formatSpeed = (speed?: string) => {
  if (!speed) return 'Unlimited';
  return speed;
};

export default function ISPPlansManagementPage() {
  const { ispId } = useParams<{ ispId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isSuperAdmin, isAdmin, canAccessISP } = useAuth();
  
  // Check access permissions
  if (!canAccessISP(ispId!)) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to manage plans for this ISP.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // State
  const [filters, setFilters] = useState<PlanFilters>({
    search: '',
    status: 'all',
    planType: 'all',
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [planToDuplicate, setPlanToDuplicate] = useState<Plan | null>(null);

  // Form
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      dataLimit: undefined,
      speedLimit: '',
      validityDays: 30,
      maxUsers: undefined,
      isActive: true,
      features: [],
      planType: 'hotspot',
      priority: 5,
    },
  });

  // API Hooks
  const { data: plans, isLoading, error, refetch } = usePlans({
    ispId: ispId,
  });

  const { data: analytics } = usePlanAnalytics({
    ispId: ispId,
  });

  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();
  const { bulkDelete, bulkUpdate } = useBulkPlanOperations();

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

    if (filters.status !== 'all') {
      filtered = filtered.filter(plan => {
        return filters.status === 'active' ? plan.isActive : !plan.isActive;
      });
    }

    if (filters.planType !== 'all') {
      filtered = filtered.filter(plan => plan.planType === filters.planType);
    }

    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(plan => {
        const price = Number(plan.basePrice);
        switch (filters.priceRange) {
          case 'low':
            return price < 1000;
          case 'medium':
            return price >= 1000 && price < 5000;
          case 'high':
            return price >= 5000;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'subscribers') {
        aValue = a.subscriberCount || 0;
        bValue = b.subscriberCount || 0;
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
  const handleSort = (key: keyof Plan | 'subscribers') => {
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
      toast({
        title: "Plan Deleted",
        description: `${planToDelete.name} has been deleted successfully.`,
      });
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
      toast({
        title: "Plans Deleted",
        description: `${selectedPlans.length} plans have been deleted successfully.`,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreatePlan = async (data: PlanFormData) => {
    try {
      await createPlanMutation.mutateAsync({
        ...data,
        ispId: ispId!,
      });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Plan Created",
        description: `${data.name} has been created successfully.`,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setPlanToEdit(plan);
    form.reset({
      name: plan.name,
      description: plan.description || '',
      basePrice: Number(plan.basePrice),
      dataLimit: plan.dataLimit || undefined,
      speedLimit: plan.speedLimit || '',
      validityDays: plan.validityDays || 30,
      maxUsers: plan.maxUsers || undefined,
      isActive: plan.isActive,
      features: plan.features || [],
      planType: plan.planType || 'hotspot',
      priority: plan.priority || 5,
    });
    setEditDialogOpen(true);
  };

  const handleUpdatePlan = async (data: PlanFormData) => {
    if (!planToEdit) return;

    try {
      await updatePlanMutation.mutateAsync({
        id: planToEdit.id,
        ...data,
      });
      setEditDialogOpen(false);
      setPlanToEdit(null);
      form.reset();
      toast({
        title: "Plan Updated",
        description: `${data.name} has been updated successfully.`,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDuplicatePlan = (plan: Plan) => {
    setPlanToDuplicate(plan);
    setDuplicateDialogOpen(true);
  };

  const confirmDuplicatePlan = async () => {
    if (!planToDuplicate) return;

    try {
      await createPlanMutation.mutateAsync({
        name: `${planToDuplicate.name} (Copy)`,
        description: planToDuplicate.description,
        basePrice: Number(planToDuplicate.basePrice),
        dataLimit: planToDuplicate.dataLimit,
        speedLimit: planToDuplicate.speedLimit,
        validityDays: planToDuplicate.validityDays || 30,
        maxUsers: planToDuplicate.maxUsers,
        isActive: false, // Start as inactive
        features: planToDuplicate.features || [],
        planType: planToDuplicate.planType || 'hotspot',
        priority: planToDuplicate.priority || 5,
        ispId: ispId!,
      });
      setDuplicateDialogOpen(false);
      setPlanToDuplicate(null);
      toast({
        title: "Plan Duplicated",
        description: `${planToDuplicate.name} has been duplicated successfully.`,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedPlans.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({
        planIds: selectedPlans,
        updates: { isActive },
      });
      setSelectedPlans([]);
      toast({
        title: "Plans Updated",
        description: `${selectedPlans.length} plans have been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      planType: 'all',
      priceRange: 'all',
    });
  };

  // Render helpers
  const renderSortIcon = (key: keyof Plan | 'subscribers') => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const renderPlanFeatures = (features?: string[]) => {
    if (!features || features.length === 0) return <span className="text-muted-foreground">No features</span>;
    
    return (
      <div className="flex flex-wrap gap-1">
        {features.slice(0, 3).map((feature, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {feature}
          </Badge>
        ))}
        {features.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{features.length - 3} more
          </Badge>
        )}
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
          <h1 className="text-3xl font-bold tracking-tight">Hotspot Plans</h1>
          <p className="text-muted-foreground">
            Manage your internet service plans and packages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{plans?.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics?.totalSubscribers || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${analytics?.monthlyRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
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
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as 'all' | 'active' | 'inactive' }))}
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
              <label className="text-sm font-medium">Plan Type</label>
              <Select
                value={filters.planType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, planType: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hotspot">Hotspot</SelectItem>
                  <SelectItem value="pppoe">PPPoE</SelectItem>
                  <SelectItem value="static">Static IP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <Select
                value={filters.priceRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under $10</SelectItem>
                  <SelectItem value="medium">$10 - $50</SelectItem>
                  <SelectItem value="high">Over $50</SelectItem>
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
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleBulkStatusUpdate(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate Selected
                </Button>
                <Button variant="outline" onClick={() => handleBulkStatusUpdate(false)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deactivate Selected
                </Button>
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedPlans.length})
                </Button>
              </div>
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
          ) : filteredAndSortedPlans.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Plans Found</h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.status !== 'all' || filters.planType !== 'all' || filters.priceRange !== 'all'
                    ? 'No plans match your current filters.'
                    : 'Create your first internet service plan to get started.'
                  }
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
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
                  <TableHead>Type & Features</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('basePrice')}
                  >
                    <div className="flex items-center">
                      Price
                      {renderSortIcon('basePrice')}
                    </div>
                  </TableHead>
                  <TableHead>Data & Speed</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('subscribers')}
                  >
                    <div className="flex items-center">
                      Subscribers
                      {renderSortIcon('subscribers')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
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
                        <div className="font-medium flex items-center">
                          <Wifi className="h-4 w-4 mr-2" />
                          {plan.name}
                        </div>
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
                      <div className="space-y-2">
                        <Badge variant="outline" className={cn("text-xs", getPlanTypeColor(plan.planType || 'hotspot'))}>
                          {(plan.planType || 'hotspot').toUpperCase()}
                        </Badge>
                        {renderPlanFeatures(plan.features)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-lg">
                        ${Number(plan.basePrice).toFixed(2)}
                      </div>
                      {plan.priority && plan.priority > 5 && (
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <strong>Data:</strong> {formatDataLimit(plan.dataLimit)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Speed:</strong> {formatSpeed(plan.speedLimit)}
                        </div>
                        {plan.maxUsers && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Max Users:</strong> {plan.maxUsers}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {plan.validityDays} days
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-medium">
                          {plan.subscriberCount || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          subscribers
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicatePlan(plan)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Plan
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

      {/* Create Plan Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Plan</DialogTitle>
            <DialogDescription>
              Create a new internet service plan for your customers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreatePlan)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="limits">Limits & Speed</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="e.g., Basic WiFi"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Price ($)</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      {...form.register('basePrice', { valueAsNumber: true })}
                      placeholder="29.99"
                    />
                    {form.formState.errors.basePrice && (
                      <p className="text-sm text-red-600">{form.formState.errors.basePrice.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Plan description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planType">Plan Type</Label>
                    <Select
                      value={form.watch('planType')}
                      onValueChange={(value) => form.setValue('planType', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotspot">Hotspot</SelectItem>
                        <SelectItem value="pppoe">PPPoE</SelectItem>
                        <SelectItem value="static">Static IP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validityDays">Validity (Days)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      {...form.register('validityDays', { valueAsNumber: true })}
                      placeholder="30"
                    />
                    {form.formState.errors.validityDays && (
                      <p className="text-sm text-red-600">{form.formState.errors.validityDays.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="limits" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataLimit">Data Limit (MB)</Label>
                    <Input
                      id="dataLimit"
                      type="number"
                      {...form.register('dataLimit', { valueAsNumber: true })}
                      placeholder="Leave empty for unlimited"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for unlimited data
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="speedLimit">Speed Limit</Label>
                    <Input
                      id="speedLimit"
                      {...form.register('speedLimit')}
                      placeholder="e.g., 10M/5M"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: Download/Upload (e.g., 10M/5M)
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Concurrent Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    {...form.register('maxUsers', { valueAsNumber: true })}
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of simultaneous connections
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority (1-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      {...form.register('priority', { valueAsNumber: true })}
                      placeholder="5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher priority = better service quality
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={form.watch('isActive')}
                      onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active Plan</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Plan Features</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'High Speed',
                      'Unlimited Data',
                      '24/7 Support',
                      'Static IP',
                      'Priority Support',
                      'No Fair Usage Policy'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={form.watch('features')?.includes(feature) || false}
                          onCheckedChange={(checked) => {
                            const currentFeatures = form.watch('features') || [];
                            if (checked) {
                              form.setValue('features', [...currentFeatures, feature]);
                            } else {
                              form.setValue('features', currentFeatures.filter(f => f !== feature));
                            }
                          }}
                        />
                        <Label htmlFor={feature} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPlanMutation.isPending}>
                {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update plan configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleUpdatePlan)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="limits">Limits & Speed</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Plan Name</Label>
                    <Input
                      id="edit-name"
                      {...form.register('name')}
                      placeholder="e.g., Basic WiFi"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-basePrice">Price ($)</Label>
                    <Input
                      id="edit-basePrice"
                      type="number"
                      step="0.01"
                      {...form.register('basePrice', { valueAsNumber: true })}
                      placeholder="29.99"
                    />
                    {form.formState.errors.basePrice && (
                      <p className="text-sm text-red-600">{form.formState.errors.basePrice.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    {...form.register('description')}
                    placeholder="Plan description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-planType">Plan Type</Label>
                    <Select
                      value={form.watch('planType')}
                      onValueChange={(value) => form.setValue('planType', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotspot">Hotspot</SelectItem>
                        <SelectItem value="pppoe">PPPoE</SelectItem>
                        <SelectItem value="static">Static IP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-validityDays">Validity (Days)</Label>
                    <Input
                      id="edit-validityDays"
                      type="number"
                      {...form.register('validityDays', { valueAsNumber: true })}
                      placeholder="30"
                    />
                    {form.formState.errors.validityDays && (
                      <p className="text-sm text-red-600">{form.formState.errors.validityDays.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="limits" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-dataLimit">Data Limit (MB)</Label>
                    <Input
                      id="edit-dataLimit"
                      type="number"
                      {...form.register('dataLimit', { valueAsNumber: true })}
                      placeholder="Leave empty for unlimited"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for unlimited data
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-speedLimit">Speed Limit</Label>
                    <Input
                      id="edit-speedLimit"
                      {...form.register('speedLimit')}
                      placeholder="e.g., 10M/5M"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: Download/Upload (e.g., 10M/5M)
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxUsers">Max Concurrent Users</Label>
                  <Input
                    id="edit-maxUsers"
                    type="number"
                    {...form.register('maxUsers', { valueAsNumber: true })}
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of simultaneous connections
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority (1-10)</Label>
                    <Input
                      id="edit-priority"
                      type="number"
                      min="1"
                      max="10"
                      {...form.register('priority', { valueAsNumber: true })}
                      placeholder="5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher priority = better service quality
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-isActive"
                      checked={form.watch('isActive')}
                      onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    />
                    <Label htmlFor="edit-isActive">Active Plan</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Plan Features</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'High Speed',
                      'Unlimited Data',
                      '24/7 Support',
                      'Static IP',
                      'Priority Support',
                      'No Fair Usage Policy'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${feature}`}
                          checked={form.watch('features')?.includes(feature) || false}
                          onCheckedChange={(checked) => {
                            const currentFeatures = form.watch('features') || [];
                            if (checked) {
                              form.setValue('features', [...currentFeatures, feature]);
                            } else {
                              form.setValue('features', currentFeatures.filter(f => f !== feature));
                            }
                          }}
                        />
                        <Label htmlFor={`edit-${feature}`} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePlanMutation.isPending}>
                {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? 
              This will affect all subscribers using this plan. This action cannot be undone.
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
              This will affect all subscribers using these plans. This action cannot be undone.
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

      {/* Duplicate Plan Dialog */}
      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Create a copy of "{planToDuplicate?.name}"? The new plan will be created as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDuplicatePlan}
              disabled={createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? 'Duplicating...' : 'Duplicate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}