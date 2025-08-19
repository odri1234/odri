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
import { mikrotikService } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { 
  Router, 
  Wifi, 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  Activity,
  Signal,
  Globe,
  Monitor,
  Smartphone,
  Laptop,
  Download,
  Upload,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface MikroTikRouter {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'error';
  model: string;
  version: string;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  location?: string;
  lastSeen: string;
}

interface HotspotUser {
  id: string;
  username: string;
  password: string;
  profile: string;
  status: 'active' | 'disabled';
  macAddress?: string;
  ipAddress?: string;
  bytesIn: number;
  bytesOut: number;
  timeUsed: number;
  timeLimit?: number;
  dataLimit?: number;
  createdAt: string;
  lastSeen?: string;
}

interface ConnectedUser {
  id: string;
  username: string;
  macAddress: string;
  ipAddress: string;
  sessionTime: number;
  bytesIn: number;
  bytesOut: number;
  profile: string;
  location?: string;
  deviceType?: string;
  connectedAt: string;
}

export const MikroTikPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState('routers');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    profile: '',
  });
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    profile: '',
    timeLimit: '',
    dataLimit: '',
  });

  // Fetch routers
  const { data: routersData, isLoading: routersLoading, refetch: refetchRouters } = useQuery({
    queryKey: ['mikrotik', 'routers'],
    queryFn: () => mikrotikService.getRouters(),
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch hotspot users
  const { data: hotspotUsersData, isLoading: hotspotLoading, refetch: refetchHotspot } = useQuery({
    queryKey: ['mikrotik', 'hotspot-users', filters],
    queryFn: () => mikrotikService.getHotspotUsers(),
    refetchOnWindowFocus: false,
  });

  // Fetch connected users
  const { data: connectedUsersData, isLoading: connectedLoading, refetch: refetchConnected } = useQuery({
    queryKey: ['mikrotik', 'connected-users'],
    queryFn: () => mikrotikService.getConnectedUsers(),
    refetchOnWindowFocus: false,
    refetchInterval: 10000, // Refresh every 10 seconds for live data
  });

  // Fetch profiles
  const { data: profilesData } = useQuery({
    queryKey: ['mikrotik', 'profiles'],
    queryFn: () => mikrotikService.getProfiles(),
  });

  // Add hotspot user mutation
  const addHotspotUserMutation = useMutation({
    mutationFn: mikrotikService.addHotspotUser,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Hotspot user added successfully',
      });
      setIsAddUserDialogOpen(false);
      setNewUserForm({
        username: '',
        password: '',
        profile: '',
        timeLimit: '',
        dataLimit: '',
      });
      queryClient.invalidateQueries({ queryKey: ['mikrotik', 'hotspot-users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add hotspot user',
        variant: 'destructive',
      });
    },
  });

  // Remove hotspot user mutation
  const removeHotspotUserMutation = useMutation({
    mutationFn: mikrotikService.removeHotspotUser,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Hotspot user removed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mikrotik', 'hotspot-users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove hotspot user',
        variant: 'destructive',
      });
    },
  });

  // Disconnect user mutation
  const disconnectUserMutation = useMutation({
    mutationFn: mikrotikService.disconnectUser,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User disconnected successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mikrotik', 'connected-users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect user',
        variant: 'destructive',
      });
    },
  });

  const handleAddHotspotUser = () => {
    if (!newUserForm.username || !newUserForm.password || !newUserForm.profile) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    addHotspotUserMutation.mutate({
      username: newUserForm.username,
      password: newUserForm.password,
      profile: newUserForm.profile,
      timeLimit: newUserForm.timeLimit || undefined,
      dataLimit: newUserForm.dataLimit || undefined,
    });
  };

  const handleRefreshAll = () => {
    refetchRouters();
    refetchHotspot();
    refetchConnected();
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'offline':
      case 'disabled':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'laptop':
        return <Laptop className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const canManageMikroTik = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF].includes(user.role);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MikroTik Management</h1>
          <p className="text-muted-foreground">
            Manage MikroTik routers, hotspot users, and network connections
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routers</CardTitle>
            <Router className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routersData?.filter((r: MikroTikRouter) => r.status === 'online').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {routersData?.length || 0} total routers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hotspot Users</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotspotUsersData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {hotspotUsersData?.filter((u: HotspotUser) => u.status === 'active').length || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedUsersData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 TB</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* MikroTik Management Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="routers">Routers</TabsTrigger>
          <TabsTrigger value="hotspot">Hotspot Users</TabsTrigger>
          <TabsTrigger value="connected">Connected Users</TabsTrigger>
        </TabsList>

        <TabsContent value="routers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MikroTik Routers</CardTitle>
              <CardDescription>
                {routersData?.length ? `${routersData.length} routers configured` : 'Loading routers...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {routersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Router</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>System Info</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routersData?.map((router: MikroTikRouter) => (
                      <TableRow key={router.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Router className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{router.name}</div>
                              <div className="text-sm text-muted-foreground">{router.ipAddress}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(router.status)}>
                            {router.status === 'online' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {router.status === 'offline' && <XCircle className="h-3 w-3 mr-1" />}
                            {router.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {router.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{router.model}</div>
                            <div className="text-sm text-muted-foreground">v{router.version}</div>
                            <div className="text-xs text-muted-foreground">
                              Uptime: {formatUptime(router.uptime)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">CPU: {router.cpuUsage}%</div>
                            <div className="text-sm">RAM: {router.memoryUsage}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {router.location ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {router.location}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(router.lastSeen), 'MMM dd, HH:mm')}
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
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="h-4 w-4 mr-2" />
                                View Stats
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
        </TabsContent>

        <TabsContent value="hotspot" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hotspot Users</CardTitle>
                <CardDescription>
                  {hotspotUsersData?.length ? `${hotspotUsersData.length} hotspot users` : 'Loading users...'}
                </CardDescription>
              </div>
              {canManageMikroTik() && (
                <Button onClick={() => setIsAddUserDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {hotspotLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Limits</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hotspotUsersData?.map((user: HotspotUser) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              {user.macAddress && (
                                <div className="text-sm text-muted-foreground">{user.macAddress}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.profile}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Download className="h-3 w-3" />
                              {formatBytes(user.bytesIn)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Upload className="h-3 w-3" />
                              {formatBytes(user.bytesOut)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3" />
                              {formatUptime(user.timeUsed)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.timeLimit && (
                              <div className="text-sm">Time: {formatUptime(user.timeLimit)}</div>
                            )}
                            {user.dataLimit && (
                              <div className="text-sm">Data: {formatBytes(user.dataLimit)}</div>
                            )}
                            {!user.timeLimit && !user.dataLimit && (
                              <span className="text-muted-foreground text-sm">Unlimited</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(user.createdAt), 'MMM dd, yyyy')}
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
                                <Settings className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              {canManageMikroTik() && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => removeHotspotUserMutation.mutate(user.username)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove User
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Users</CardTitle>
              <CardDescription>
                {connectedUsersData?.length ? `${connectedUsersData.length} users currently online` : 'Loading connected users...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Session Time</TableHead>
                      <TableHead>Data Usage</TableHead>
                      <TableHead>Connected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectedUsersData?.map((user: ConnectedUser) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Signal className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-muted-foreground">{user.ipAddress}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(user.deviceType)}
                            <div>
                              <div className="text-sm">{user.macAddress}</div>
                              {user.deviceType && (
                                <div className="text-xs text-muted-foreground capitalize">
                                  {user.deviceType}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.profile}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatUptime(user.sessionTime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Download className="h-3 w-3 text-blue-500" />
                              {formatBytes(user.bytesIn)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Upload className="h-3 w-3 text-green-500" />
                              {formatBytes(user.bytesOut)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(user.connectedAt), 'MMM dd, HH:mm')}
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
                                <Activity className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {canManageMikroTik() && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => disconnectUserMutation.mutate(user.macAddress)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Disconnect
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Hotspot User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Hotspot User</DialogTitle>
            <DialogDescription>
              Create a new hotspot user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Enter username"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile</label>
              <Select 
                value={newUserForm.profile} 
                onValueChange={(value) => setNewUserForm(prev => ({ ...prev, profile: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {profilesData?.map((profile: any) => (
                    <SelectItem key={profile.name} value={profile.name}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Limit (optional)</label>
                <Input
                  placeholder="e.g., 1h, 30m"
                  value={newUserForm.timeLimit}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, timeLimit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Limit (optional)</label>
                <Input
                  placeholder="e.g., 1G, 500M"
                  value={newUserForm.dataLimit}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, dataLimit: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddHotspotUser}
              disabled={addHotspotUserMutation.isPending}
            >
              {addHotspotUserMutation.isPending ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MikroTikPage;