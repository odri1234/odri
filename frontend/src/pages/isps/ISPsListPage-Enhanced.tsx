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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useISPs, useDeleteISP, useBulkISPOperations, useISPStats } from '@/hooks/api/useISPs';
import { useAuth } from '@/store/auth.store';
import { ISP } from '@/types/common';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Wifi,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Types
interface ISPFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  country: string | 'all';
}

interface SortConfig {
  key: keyof ISP | 'totalUsers' | 'totalRevenue';
  direction: 'asc' | 'desc';
}

// Status color mapping
const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

export default function ISPsListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State
  const [filters, setFilters] = useState<ISPFilters>({
    search: '',
    status: 'all',
    country: 'all',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [selectedISPs, setSelectedISPs] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ispToDelete, setISPToDelete] = useState<ISP | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // API Hooks
  const { data: isps, isLoading, error, refetch } = useISPs();
  const deleteISPMutation = useDeleteISP();
  const { bulkDelete } = useBulkISPOperations();

  // Computed values
  const totalISPs = isps?.length || 0;

  // Filtered and sorted ISPs
  const filteredAndSortedISPs = useMemo(() => {
    if (!isps) return [];
    
    let filtered = isps;

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(isp => 
        isp.name.toLowerCase().includes(searchLower) ||
        isp.email?.toLowerCase().includes(searchLower) ||
        isp.contactPerson?.toLowerCase().includes(searchLower) ||
        isp.country?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(isp => 
        filters.status === 'active' ? isp.isActive : !isp.isActive
      );
    }

    if (filters.country !== 'all') {
      filtered = filtered.filter(isp => isp.country === filters.country);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'totalUsers') {
        aValue = a.stats?.totalUsers || 0;
        bValue = b.stats?.totalUsers || 0;
      } else if (sortConfig.key === 'totalRevenue') {
        aValue = a.stats?.totalRevenue || 0;
        bValue = b.stats?.totalRevenue || 0;
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
  }, [isps, filters, sortConfig]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    if (!isps) return [];
    const uniqueCountries = [...new Set(isps.map(isp => isp.country).filter(Boolean))];
    return uniqueCountries.sort();
  }, [isps]);

  // Handlers
  const handleSort = (key: keyof ISP | 'totalUsers' | 'totalRevenue') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectISP = (ispId: string, checked: boolean) => {
    setSelectedISPs(prev => 
      checked 
        ? [...prev, ispId]
        : prev.filter(id => id !== ispId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedISPs(checked ? filteredAndSortedISPs.map(isp => isp.id) : []);
  };

  const handleDeleteISP = (isp: ISP) => {
    setISPToDelete(isp);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteISP = async () => {
    if (!ispToDelete) return;

    try {
      await deleteISPMutation.mutateAsync(ispToDelete.id);
      setDeleteDialogOpen(false);
      setISPToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleBulkDelete = () => {
    if (selectedISPs.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedISPs);
      setBulkDeleteDialogOpen(false);
      setSelectedISPs([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      country: 'all',
    });
    setPage(1);
  };

  // Render helpers
  const renderSortIcon = (key: keyof ISP | 'totalUsers' | 'totalRevenue') => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const renderISPAvatar = (isp: ISP) => (
    <Avatar className="h-10 w-10">
      <AvatarImage src={isp.logo} alt={isp.name} />
      <AvatarFallback>
        {isp.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  const renderISPStatus = (isp: ISP) => (
    <Badge variant="outline" className={cn("text-xs", getStatusColor(isp.isActive))}>
      {isp.isActive ? (
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

  const renderISPStats = (isp: ISP) => {
    const stats = isp.stats;
    if (!stats) return <span className="text-muted-foreground">No data</span>;

    return (
      <div className="space-y-1">
        <div className="flex items-center text-sm">
          <Users className="h-3 w-3 mr-1" />
          {stats.totalUsers} users
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Activity className="h-3 w-3 mr-1" />
          {stats.activeUsers} active
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
              <h3 className="text-lg font-semibold mb-2">Error Loading ISPs</h3>
              <p className="text-muted-foreground mb-4">
                {error.message || 'Failed to load ISPs'}
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
          <h1 className="text-3xl font-bold tracking-tight">Internet Service Providers</h1>
          <p className="text-muted-foreground">
            Manage ISP accounts and monitor their performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <Button asChild>
              <Link to="/isps/create">
                <Plus className="h-4 w-4 mr-2" />
                Add ISP
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total ISPs</p>
                <p className="text-2xl font-bold">{totalISPs}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active ISPs</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAndSortedISPs.filter(isp => isp.isActive).length}
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
                <p className="text-sm font-medium text-muted-foreground">Inactive ISPs</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredAndSortedISPs.filter(isp => !isp.isActive).length}
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
                <p className="text-2xl font-bold">{selectedISPs.length}</p>
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
                  placeholder="Search ISPs..."
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
              <label className="text-sm font-medium">Country</label>
              <Select
                value={filters.country}
                onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
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
            {selectedISPs.length > 0 && currentUser?.role === 'SUPER_ADMIN' && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedISPs.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ISPs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
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
                      checked={selectedISPs.length === filteredAndSortedISPs.length && filteredAndSortedISPs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ISP</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {renderSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totalUsers')}
                  >
                    <div className="flex items-center">
                      Users
                      {renderSortIcon('totalUsers')}
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
                {filteredAndSortedISPs.map((isp) => (
                  <TableRow key={isp.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedISPs.includes(isp.id)}
                        onCheckedChange={(checked) => handleSelectISP(isp.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      {renderISPAvatar(isp)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{isp.name}</div>
                        {isp.website && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            <a 
                              href={isp.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {isp.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {isp.contactPerson && (
                          <div className="text-sm">{isp.contactPerson}</div>
                        )}
                        {isp.email && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {isp.email}
                          </div>
                        )}
                        {isp.phone && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {isp.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {isp.country && (
                          <div className="text-sm flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {isp.country}
                          </div>
                        )}
                        {isp.city && (
                          <div className="text-sm text-muted-foreground">
                            {isp.city}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderISPStats(isp)}
                    </TableCell>
                    <TableCell>
                      {renderISPStatus(isp)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(isp.createdAt!), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">
                          {formatDistanceToNow(new Date(isp.createdAt!), { addSuffix: true })}
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
                            <Link to={`/isps/${isp.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.id === isp.ownerId) && (
                            <DropdownMenuItem asChild>
                              <Link to={`/isps/${isp.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit ISP
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {currentUser?.role === 'SUPER_ADMIN' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteISP(isp)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete ISP
                            </DropdownMenuItem>
                          )}
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

      {/* Delete ISP Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ISP</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {ispToDelete?.name}? 
              This will also delete all associated users, plans, and data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteISP}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteISPMutation.isPending}
            >
              {deleteISPMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple ISPs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedISPs.length} ISPs? 
              This will also delete all associated users, plans, and data. This action cannot be undone.
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