// C:\Users\ADMN\odri\frontend\src\pages\mikrotik\ConnectedUsersPage.tsx
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ConnectedUsersPage = () => {
  const [selectedRouter, setSelectedRouter] = useState<string | null>(null);

  // Fetch routers
  const { data: routers, isLoading: routersLoading } = useQuery({
    queryKey: ['mikrotik-routers'],
    queryFn: async () => {
      const res = await api.get('/mikrotik/routers');
      return res.data;
    },
  });

  // Fetch connected users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['connected-users', selectedRouter],
    queryFn: async () => {
      if (!selectedRouter) return [];
      const res = await api.get(`/mikrotik/routers/${selectedRouter}/hotspot/active`);
      return res.data;
    },
    enabled: !!selectedRouter,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Connected Users</h1>
        <p className="text-muted-foreground">View currently connected users</p>
      </div>

      {/* Router Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Router</CardTitle>
          <CardDescription>Choose a MikroTik router to see active connections</CardDescription>
        </CardHeader>
        <CardContent>
          {routersLoading ? (
            <LoadingSpinner />
          ) : routers && routers.length > 0 ? (
            <Select onValueChange={(val) => setSelectedRouter(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a router" />
              </SelectTrigger>
              <SelectContent>
                {routers.map((router: any) => (
                  <SelectItem key={router.id} value={router.id}>
                    {router.name} ({router.ipAddress})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-muted-foreground">No routers available</p>
          )}
        </CardContent>
      </Card>

      {/* Connected Users Table */}
      {selectedRouter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connected Users
            </CardTitle>
            <CardDescription>Currently connected hotspot users</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <LoadingSpinner />
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Uptime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{user.user || '-'}</TableCell>
                      <TableCell>{user.address || '-'}</TableCell>
                      <TableCell>{user.macAddress || '-'}</TableCell>
                      <TableCell>{user.uptime || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No connected users found
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConnectedUsersPage;
