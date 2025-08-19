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
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  useMikroTikRouters, 
  useDeleteRouter, 
  useBulkRouterOperations, 
  useTestRouterConnection,
  useRouterStatus,
  useCreateRouter,
  useUpdateRouter
} from '@/hooks/api/useMikroTik';
import { useAuth } from '@/store/auth.store';
import { MikroTikRouter, CreateRouterFormData } from '@/types/common';
import { 
  Router, 
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
  MapPin,
  Calendar,
  Activity,
  TrendingUp,
  Database,
  Globe,
  Wifi,
  WifiOff,
  Signal,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  TestTube,
  Power,
  PowerOff
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const routerSchema = z.object({
  name: z.string().min(1, 'Router name is required'),
  ipAddress: z.string().ip('Invalid IP address'),
  apiPort: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  location: z.string().optional(),
  description: z.string().optional(),
});

type RouterFormData = z.infer<typeof routerSchema>;

// Types
interface RouterFilters {
  search: string;
  status: 'all' | 'online' | 'offline';
  location: string | 'all';
}

interface SortConfig {
  key: keyof MikroTikRouter | 'status';
  direction: 'asc' | 'desc';
}

// Helper functions
const getStatusColor = (isOnline: boolean) => {
  return isOnline 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

export default function RoutersManagementPage() {
  const { ispId } = useParams<{ ispId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State
  const [filters, setFilters] = useState<RouterFilters>({
    search: '',
    status: 'all',
    location: 'all',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [selectedRouters, setSelectedRouters] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routerToDelete, setRouterToDelete] = useState<MikroTikRouter | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [routerToEdit, setRouterToEdit] = useState<MikroTikRouter | null>(null);

  // Form
  const form = useForm<RouterFormData>({
    resolver: zodResolver(routerSchema),
    defaultValues: {
      name: '',
      ipAddress: '',
      apiPort: 8728,
      username: 'admin',
      password: '',
      location: '',
      description: '',
    },
  });

  // API Hooks
  const { data: routers, isLoading, error, refetch } = useMikroTikRouters({
    ispId: ispId,
  });

  const deleteRouterMutation = useDeleteRouter();
  const { bulkDelete } = useBulkRouterOperations();
  const createRouterMutation = useCreateRouter();
  const updateRouterMutation = useUpdateRouter();
  const testConnectionMutation = useTestRouterConnection();

  // Get router statuses
  const routersWithStatus = useMemo(() => {
    if (!routers) return [];
    
    return routers.map(router => {
      const { data: status } = useRouterStatus(router.id);
      return { ...router, status };
    });
  }, [routers]);

  // Filtered and sorted routers
  const filteredAndSortedRouters = useMemo(() => {
    if (!routersWithStatus) return [];
    
    let filtered = routersWithStatus;

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(router => 
        router.name.toLowerCase().includes(searchLower) ||
        router.ipAddress.toLowerCase().includes(searchLower) ||
        router.location?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(router => {
        const isOnline = router.status?.isOnline ?? false;
        return filters.status === 'online' ? isOnline : !isOnline;
      });
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(router => router.location === filters.location);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'status') {
        aValue = a.status?.isOnline ? 1 : 0;
        bValue = b.status?.isOnline ? 1 : 0;
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
  }, [routersWithStatus, filters, sortConfig]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    if (!routers) return [];
    const uniqueLocations = [...new Set(routers.map(router => router.location).filter(Boolean))];
    return uniqueLocations.sort();
  }, [routers]);

  // Handlers
  const handleSort = (key: keyof MikroTikRouter | 'status') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectRouter = (routerId: string, checked: boolean) => {
    setSelectedRouters(prev => 
      checked 
        ? [...prev, routerId]
        : prev.filter(id => id !== routerId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRouters(checked ? filteredAndSortedRouters.map(router => router.id) : []);
  };

  const handleDeleteRouter = (router: MikroTikRouter) => {
    setRouterToDelete(router);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRouter = async () => {
    if (!routerToDelete) return;

    try {
      await deleteRouterMutation.mutateAsync(routerToDelete.id);
      setDeleteDialogOpen(false);
      setRouterToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleBulkDelete = () => {
    if (selectedRouters.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedRouters);
      setBulkDeleteDialogOpen(false);
      setSelectedRouters([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTestConnection = async (router: MikroTikRouter) => {
    try {
      const result = await testConnectionMutation.mutateAsync(router.id);
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCreateRouter = async (data: RouterFormData) => {
    try {
      await createRouterMutation.mutateAsync({
        ...data,
        ispId: ispId!,
      });
      setCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEditRouter = (router: MikroTikRouter) => {
    setRouterToEdit(router);
    form.reset({
      name: router.name,
      ipAddress: router.ipAddress,
      apiPort: router.apiPort,
      username: router.username,
      password: '', // Don't pre-fill password for security
      location: router.location || '',
      description: router.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdateRouter = async (data: RouterFormData) => {
    if (!routerToEdit) return;

    try {
      await updateRouterMutation.mutateAsync({
        id: routerToEdit.id,
        ...data,
      });
      setEditDialogOpen(false);
      setRouterToEdit(null);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      location: 'all',
    });
  };

  // Render helpers
  const renderSortIcon = (key: keyof MikroTikRouter | 'status') => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const renderRouterStatus = (router: any) => {
    const isOnline = router.status?.isOnline ?? false;
    
    return (
      <Badge variant="outline" className={cn("text-xs", getStatusColor(isOnline))}>
        {isOnline ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Online
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3 mr-1" />
            Offline
          </>
        )}
      </Badge>
    );
  };

  const renderRouterStats = (router: any) => {
    const status = router.status;
    if (!status) return <span className="text-muted-foreground">No data</span>;

    return (
      <div className="space-y-1">
        <div className="flex items-center text-sm">
          <Cpu className="h-3 w-3 mr-1" />
          CPU: {status.cpuUsage || 0}%
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MemoryStick className="h-3 w-3 mr-1" />
          RAM: {status.memoryUsage || 0}%
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Activity className="h-3 w-3 mr-1" />
          Uptime: {status.uptime || 'Unknown'}
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
              <h3 className="text-lg font-semibold mb-2">Error Loading Routers</h3>
              <p className="text-muted-foreground mb-4">
                {error.message || 'Failed to load routers'}
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
          <h1 className="text-3xl font-bold tracking-tight">MikroTik Routers</h1>
          <p className="text-muted-foreground">
            Manage your network infrastructure and monitor router performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Router
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Routers</p>
                <p className="text-2xl font-bold">{routers?.length || 0}</p>
              </div>
              <Router className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAndSortedRouters.filter(router => router.status?.isOnline).length}
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
                <p className="text-sm font-medium text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredAndSortedRouters.filter(router => !router.status?.isOnline).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold">{selectedRouters.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search routers..."
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
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as 'all' | 'online' | 'offline' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select
                value={filters.location}
                onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            {selectedRouters.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedRouters.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Routers Table */}
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
                      checked={selectedRouters.length === filteredAndSortedRouters.length && filteredAndSortedRouters.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Router Name
                      {renderSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {renderSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Added
                      {renderSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRouters.map((router) => (
                  <TableRow key={router.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRouters.includes(router.id)}
                        onCheckedChange={(checked) => handleSelectRouter(router.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center">
                          <Router className="h-4 w-4 mr-2" />
                          {router.name}
                        </div>
                        {router.description && (
                          <div className="text-sm text-muted-foreground">
                            {router.description.length > 50 
                              ? `${router.description.substring(0, 50)}...` 
                              : router.description
                            }
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{router.ipAddress}</div>
                        <div className="text-sm text-muted-foreground">
                          Port: {router.apiPort}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User: {router.username}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {router.location ? (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {router.location}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {renderRouterStats(router)}
                    </TableCell>
                    <TableCell>
                      {renderRouterStatus(router)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(router.createdAt!), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(router.createdAt!), { addSuffix: true })}
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
                          <DropdownMenuItem onClick={() => handleTestConnection(router)}>
                            <TestTube className="h-4 w-4 mr-2" />
                            Test Connection
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/routers/${router.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditRouter(router)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Router
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteRouter(router)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Router
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

      {/* Create Router Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Router</DialogTitle>
            <DialogDescription>
              Add a new MikroTik router to your network infrastructure.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateRouter)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Router Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Main Router"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  {...form.register('ipAddress')}
                  placeholder="192.168.1.1"
                />
                {form.formState.errors.ipAddress && (
                  <p className="text-sm text-red-600">{form.formState.errors.ipAddress.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiPort">API Port</Label>
                <Input
                  id="apiPort"
                  type="number"
                  {...form.register('apiPort', { valueAsNumber: true })}
                  placeholder="8728"
                />
                {form.formState.errors.apiPort && (
                  <p className="text-sm text-red-600">{form.formState.errors.apiPort.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...form.register('username')}
                  placeholder="admin"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                placeholder="Enter password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                {...form.register('location')}
                placeholder="Main Office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Router description..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRouterMutation.isPending}>
                {createRouterMutation.isPending ? 'Adding...' : 'Add Router'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Router Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Router</DialogTitle>
            <DialogDescription>
              Update router configuration and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleUpdateRouter)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Router Name</Label>
                <Input
                  id="edit-name"
                  {...form.register('name')}
                  placeholder="Main Router"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ipAddress">IP Address</Label>
                <Input
                  id="edit-ipAddress"
                  {...form.register('ipAddress')}
                  placeholder="192.168.1.1"
                />
                {form.formState.errors.ipAddress && (
                  <p className="text-sm text-red-600">{form.formState.errors.ipAddress.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-apiPort">API Port</Label>
                <Input
                  id="edit-apiPort"
                  type="number"
                  {...form.register('apiPort', { valueAsNumber: true })}
                  placeholder="8728"
                />
                {form.formState.errors.apiPort && (
                  <p className="text-sm text-red-600">{form.formState.errors.apiPort.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  {...form.register('username')}
                  placeholder="admin"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (Leave empty to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                {...form.register('password')}
                placeholder="Enter new password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location (Optional)</Label>
              <Input
                id="edit-location"
                {...form.register('location')}
                placeholder="Main Office"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                {...form.register('description')}
                placeholder="Router description..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRouterMutation.isPending}>
                {updateRouterMutation.isPending ? 'Updating...' : 'Update Router'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Router Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Router</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{routerToDelete?.name}"? 
              This will remove the router from your network management. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRouter}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteRouterMutation.isPending}
            >
              {deleteRouterMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Routers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRouters.length} routers? 
              This will remove them from your network management. This action cannot be undone.
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