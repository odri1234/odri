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
import { sessionsService, Session } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { 
  Activity, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  RefreshCw,
  User,
  Calendar,
  Clock,
  Wifi,
  Download,
  Upload,
  StopCircle,
  PlayCircle,
  Timer,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export const SessionsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    userId: '',
    planId: '',
  });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);

  // Fetch all sessions
  const { data: sessionsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => sessionsService.getSessions(),
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refresh every 30 seconds for live data
  });

  // Fetch active sessions count
  const { data: activeSessions } = useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: () => sessionsService.getActiveSessions(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Terminate session mutation
  const terminateSessionMutation = useMutation({
    mutationFn: sessionsService.closeSession,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Session terminated successfully',
      });
      setIsTerminateDialogOpen(false);
      setSelectedSession(null);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to terminate session',
        variant: 'destructive',
      });
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      userId: '',
      planId: '',
    });
  };

  const handleTerminateSession = () => {
    if (selectedSession) {
      terminateSessionMutation.mutate(selectedSession.id);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getDeviceIcon = (deviceInfo?: string) => {
    if (!deviceInfo) return <Globe className="h-4 w-4" />;
    
    const deviceType = deviceInfo.toLowerCase();
    if (deviceType.includes('mobile') || deviceType.includes('android') || deviceType.includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (deviceType.includes('desktop') || deviceType.includes('windows') || deviceType.includes('mac')) {
      return <Monitor className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  const canTerminateSession = (session: Session) => {
    if (!user) return false;
    
    // Only active sessions can be terminated
    if (!session.isActive) return false;
    
    // Super admin and admin can terminate all sessions
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) return true;
    
    // ISP admin and staff can terminate sessions
    if ([UserRole.ISP_ADMIN, UserRole.ISP_STAFF].includes(user.role)) return true;
    
    return false;
  };

  // Filter sessions based on search criteria
  const filteredSessions = sessionsData?.filter((session: Session) => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const userName = session.user?.fullName?.toLowerCase() || '';
      const userEmail = session.user?.email?.toLowerCase() || '';
      const ipAddress = session.ipAddress?.toLowerCase() || '';
      const macAddress = session.macAddress?.toLowerCase() || '';
      
      if (!userName.includes(searchTerm) && 
          !userEmail.includes(searchTerm) && 
          !ipAddress.includes(searchTerm) && 
          !macAddress.includes(searchTerm)) {
        return false;
      }
    }
    
    if (filters.status) {
      const isActive = filters.status === 'active';
      if (session.isActive !== isActive) return false;
    }
    
    if (filters.userId && session.userId !== filters.userId) {
      return false;
    }
    
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and manage user internet sessions
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
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Timer className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
            <Download className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(sessionsData?.reduce((total, session) => total + (session.dataUsed || 0), 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total usage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionsData?.length ? 
                formatDuration(sessionsData.reduce((total, session) => total + (session.duration || 0), 0) / sessionsData.length) : 
                '0s'
              }
            </div>
            <p className="text-xs text-muted-foreground">Per session</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search sessions..."
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
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Filter by user..."
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan ID</label>
              <Input
                placeholder="Filter by plan..."
                value={filters.planId}
                onChange={(e) => handleFilterChange('planId', e.target.value)}
              />
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

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Sessions</CardTitle>
          <CardDescription>
            {filteredSessions.length ? `${filteredSessions.length} sessions found` : 'No sessions found'}
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
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Data Used</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session: Session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{session.user?.fullName || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.deviceInfo)}
                          <div>
                            <div className="font-medium">{session.ipAddress || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.macAddress || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(session.isActive)}>
                          {session.isActive ? (
                            <>
                              <PlayCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <StopCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {session.duration ? formatDuration(session.duration * 60) : 
                               session.isActive ? formatDistanceToNow(new Date(session.startTime)) : '-'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{formatBytes(session.dataUsed ? session.dataUsed * 1024 * 1024 : 0)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <div>{format(new Date(session.startTime), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(session.startTime), 'HH:mm')}
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canTerminateSession(session) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setIsTerminateDialogOpen(true);
                                  }}
                                >
                                  <StopCircle className="h-4 w-4 mr-2" />
                                  Terminate Session
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

              {filteredSessions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No sessions found matching your criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terminate Session Dialog */}
      <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this session for {selectedSession?.user?.fullName}?
              This will immediately disconnect the user from the internet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTerminateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTerminateSession}
              disabled={terminateSessionMutation.isPending}
            >
              {terminateSessionMutation.isPending ? 'Terminating...' : 'Terminate Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionsPage;