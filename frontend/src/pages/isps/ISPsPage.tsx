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
import { ispsService as ispService } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole, ISP, IspStatus, IspTier } from '@/types/common';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Settings,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

// Using ISP interface from common.ts

export const ISPsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tier: '',
    isActive: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });
  const [selectedISP, setSelectedISP] = useState<ISP | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch ISPs
  const { data: ispsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['isps', filters, pagination],
    queryFn: () => ispService.getISPs(filters, pagination),
    refetchOnWindowFocus: false,
  });

  // Delete ISP mutation
  const deleteISPMutation = useMutation({
    mutationFn: ispService.deleteISP,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'ISP deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedISP(null);
      queryClient.invalidateQueries({ queryKey: ['isps'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete ISP',
        variant: 'destructive',
      });
    },
  });

  // Update ISP mutation
  const updateISPStatusMutation = useMutation({
    mutationFn: ({ id, status, isActive }: { id: string; status?: IspStatus; isActive?: boolean }) => 
      ispService.updateISP(id, { status, isActive }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'ISP updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['isps'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ISP',
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
      tier: '',
      isActive: '',
    });
    setPagination({ page: 1, limit: 20 });
  };

  const handleDeleteISP = () => {
    if (selectedISP) {
      deleteISPMutation.mutate(selectedISP.id);
    }
  };

  const handleStatusChange = (ispId: string, status: IspStatus) => {
    updateISPStatusMutation.mutate({ id: ispId, status });
  };

  const handleActiveChange = (ispId: string, isActive: boolean) => {
    updateISPStatusMutation.mutate({ id: ispId, isActive });
  };

  const getStatusColor = (status: IspStatus) => {
    switch (status) {
      case IspStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case IspStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800';
      case IspStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      case IspStatus.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case IspStatus.TRIAL:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: IspTier) => {
    switch (tier) {
      case IspTier.BASIC:
        return 'bg-gray-100 text-gray-800';
      case IspTier.PROFESSIONAL:
        return 'bg-blue-100 text-blue-800';
      case IspTier.ENTERPRISE:
        return 'bg-purple-100 text-purple-800';
      case IspTier.PREMIUM:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageISP = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ISP Management</h1>
          <p className="text-muted-foreground">
            Manage Internet Service Providers and their configurations
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
          {canManageISP() && (
            <Button asChild>
              <Link to="/isps/create">
                <Plus className="h-4 w-4 mr-2" />
                Add ISP
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ISPs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ispsData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Registered ISPs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active ISPs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ispsData?.data?.filter((isp: ISP) => isp.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial ISPs</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ispsData?.data?.filter((isp: ISP) => isp.subscriptionStatus === 'trial').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">On trial</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ispsData?.data?.filter((isp: ISP) => isp.status === 'suspended').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Suspended ISPs</p>
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
                placeholder="Search ISPs..."
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
                  <SelectItem value={IspStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={IspStatus.INACTIVE}>Inactive</SelectItem>
                  <SelectItem value={IspStatus.SUSPENDED}>Suspended</SelectItem>
                  <SelectItem value={IspStatus.PENDING_APPROVAL}>Pending Approval</SelectItem>
                  <SelectItem value={IspStatus.TRIAL}>Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <Select value={filters.tier} onValueChange={(value) => handleFilterChange('tier', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tiers</SelectItem>
                  <SelectItem value={IspTier.BASIC}>Basic</SelectItem>
                  <SelectItem value={IspTier.PROFESSIONAL}>Professional</SelectItem>
                  <SelectItem value={IspTier.ENTERPRISE}>Enterprise</SelectItem>
                  <SelectItem value={IspTier.PREMIUM}>Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Active Status</label>
              <Select value={filters.isActive} onValueChange={(value) => handleFilterChange('isActive', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
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

      {/* ISPs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Internet Service Providers</CardTitle>
          <CardDescription>
            {ispsData?.total ? `${ispsData.total} total ISPs` : 'Loading ISPs...'}
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
                    <TableHead>ISP Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ispsData?.data?.map((isp: ISP) => (
                    <TableRow key={isp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            {isp.logo ? (
                              <img src={isp.logo} alt={isp.name} className="w-8 h-8 rounded" />
                            ) : (
                              <Building className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-lg">{isp.name}</div>
                            {isp.description && (
                              <div className="text-sm text-muted-foreground">
                                {isp.description}
                              </div>
                            )}
                            {isp.website && (
                              <div className="flex items-center gap-1 text-sm text-blue-600">
                                <Globe className="h-3 w-3" />
                                <a href={isp.website} target="_blank" rel="noopener noreferrer">
                                  {isp.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {isp.email}
                          </div>
                          {isp.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {isp.phone}
                            </div>
                          )}
                          {isp.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {isp.address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(isp.status)}>
                            {isp.status}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            {isp.isActive ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span>{isp.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierColor(isp.tier)}>
                          {isp.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{isp.currentClients} / {isp.maxClients}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span>{new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: isp.currency
                          }).format(isp.monthlyRevenue)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <div>{format(new Date(isp.createdAt), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(isp.createdAt), 'HH:mm')}
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
                              <Link to={`/isps/${isp.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {canManageISP() && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link to={`/isps/${isp.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit ISP
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleActiveChange(isp.id, !isp.isActive)}
                                >
                                  {isp.isActive ? (
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
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(
                                    isp.id, 
                                    isp.status === IspStatus.ACTIVE 
                                      ? IspStatus.INACTIVE 
                                      : IspStatus.ACTIVE
                                  )}
                                >
                                  {isp.status === IspStatus.ACTIVE ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Change Status to Inactive
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Change Status to Active
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedISP(isp);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete ISP
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
              {ispsData?.total && ispsData.total > pagination.limit && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, ispsData.total)} of{' '}
                    {ispsData.total} ISPs
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
                      disabled={pagination.page * pagination.limit >= (ispsData.total || 0)}
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
            <DialogTitle>Delete ISP</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedISP?.name}"? This action cannot be undone.
              All users, plans, and data associated with this ISP will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteISP}
              disabled={deleteISPMutation.isPending}
            >
              {deleteISPMutation.isPending ? 'Deleting...' : 'Delete ISP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ISPsPage;