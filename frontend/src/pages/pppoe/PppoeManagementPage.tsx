import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { mikrotikService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { 
  Network, 
  Users, 
  RefreshCw, 
  Settings, 
  Plus, 
  Search,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PppoeManagementPage = () => {
  const { user } = useAuthStore();
  const [selectedRouter, setSelectedRouter] = useState<string>('');
  
  const { data: routers, isLoading: routersLoading } = useQuery({
    queryKey: ['mikrotik-routers'],
    queryFn: async () => {
      return mikrotikService.getRouters();
    },
    enabled: !!user?.ispId,
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['pppoe-profiles'],
    queryFn: async () => {
      return mikrotikService.getPppoeProfiles();
    },
    enabled: !!user?.ispId,
  });

  const { data: pppoeUsers, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['pppoe-users', selectedRouter],
    queryFn: async () => {
      if (!selectedRouter) return [];
      return mikrotikService.getPppoeUsers(selectedRouter);
    },
    enabled: !!selectedRouter,
  });

  const { data: activeConnections, isLoading: connectionsLoading, refetch: refetchConnections } = useQuery({
    queryKey: ['pppoe-connections', selectedRouter],
    queryFn: async () => {
      if (!selectedRouter) return [];
      return mikrotikService.getPppoeConnections(selectedRouter);
    },
    enabled: !!selectedRouter,
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</Badge> :
      <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Inactive</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PPPoE Management</h1>
          <p className="text-muted-foreground">Manage PPPoE profiles, users and connections</p>
        </div>
        <Button onClick={() => {
          refetchUsers();
          refetchConnections();
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {routersLoading ? (
        <LoadingSpinner />
      ) : routers && routers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium py-2">Select Router:</span>
          {routers.map((router: any) => (
            <Button 
              key={router.id}
              variant={selectedRouter === router.id ? "default" : "outline"}
              onClick={() => setSelectedRouter(router.id)}
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4" />
              {router.name}
              {router.status === 'online' ? (
                <Badge variant="success" className="ml-1 h-2 w-2 p-0 rounded-full" />
              ) : (
                <Badge variant="destructive" className="ml-1 h-2 w-2 p-0 rounded-full" />
              )}
            </Button>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No routers found. Add a router to manage PPPoE.</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profiles">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiles">PPPoE Profiles</TabsTrigger>
          <TabsTrigger value="users">PPPoE Users</TabsTrigger>
          <TabsTrigger value="connections">Active Connections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profiles" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>PPPoE Profiles</CardTitle>
                <CardDescription>Manage your PPPoE service profiles</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </CardHeader>
            <CardContent>
              {profilesLoading ? (
                <LoadingSpinner />
              ) : profiles && profiles.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Local Address</TableHead>
                      <TableHead>Remote Address</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile: any) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell>{profile.localAddress}</TableCell>
                        <TableCell>{profile.remoteAddress}</TableCell>
                        <TableCell>{profile.rateLimit}</TableCell>
                        <TableCell>{getStatusBadge(profile.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-6">No PPPoE profiles found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>PPPoE Users</CardTitle>
                <CardDescription>Manage your PPPoE users</CardDescription>
              </div>
              <Button disabled={!selectedRouter}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              {!selectedRouter ? (
                <p className="text-center text-muted-foreground py-6">Please select a router first</p>
              ) : usersLoading ? (
                <LoadingSpinner />
              ) : pppoeUsers && pppoeUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Profile</TableHead>
                      <TableHead>Local Address</TableHead>
                      <TableHead>Remote Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pppoeUsers.map((user: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.profile}</TableCell>
                        <TableCell>{user.localAddress || '-'}</TableCell>
                        <TableCell>{user.remoteAddress || '-'}</TableCell>
                        <TableCell>{getStatusBadge(user.disabled !== 'true')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-6">No PPPoE users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="connections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active PPPoE Connections</CardTitle>
              <CardDescription>Currently active PPPoE sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedRouter ? (
                <p className="text-center text-muted-foreground py-6">Please select a router first</p>
              ) : connectionsLoading ? (
                <LoadingSpinner />
              ) : activeConnections && activeConnections.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Caller ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeConnections.map((conn: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{conn.name}</TableCell>
                        <TableCell>{conn.service}</TableCell>
                        <TableCell>{conn.address}</TableCell>
                        <TableCell>{conn.uptime}</TableCell>
                        <TableCell>{conn.callerId || '-'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Disconnect</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-6">No active connections</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PppoeManagementPage;