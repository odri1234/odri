// C:\Users\ADMN\odri\frontend\src\pages\mikrotik\HotspotUsersPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wifi, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AddHotspotUserDialog } from './components/AddHotspotUserDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const HotspotUsersPage = () => {
  const queryClient = useQueryClient();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<string | null>(null);
  const [showActive, setShowActive] = useState(false);

  // Fetch routers
  const { data: routers, isLoading: routersLoading } = useQuery({
    queryKey: ['mikrotik-routers'],
    queryFn: async () => {
      const res = await api.get('/v1/mikrotik/routers');
      return res.data;
    },
  });

  // Fetch hotspot users or active users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['hotspot-users', selectedRouter, showActive],
    queryFn: async () => {
      if (!selectedRouter) return [];
      const endpoint = showActive
        ? `/v1/mikrotik/routers/${selectedRouter}/hotspot/active`
        : `/v1/mikrotik/routers/${selectedRouter}/hotspot/users`;
      const res = await api.get(endpoint);
      return res.data;
    },
    enabled: !!selectedRouter,
  });

  // Remove user
  const removeUserMutation = useMutation({
    mutationFn: async (username: string) => {
      await api.post(`/v1/mikrotik/routers/${selectedRouter}/hotspot/remove`, { username });
    },
    onSuccess: () => {
      toast.success('User removed successfully');
      queryClient.invalidateQueries({ queryKey: ['hotspot-users', selectedRouter, showActive] });
    },
    onError: () => {
      toast.error('Failed to remove user');
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotspot Users</h1>
          <p className="text-muted-foreground">Manage hotspot user accounts</p>
        </div>
        <Button onClick={() => setOpenAddDialog(true)} disabled={!selectedRouter}>
          <Plus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      {/* Router Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Router</CardTitle>
          <CardDescription>Choose a MikroTik router to manage users</CardDescription>
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

      {/* Users Table */}
      {selectedRouter && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  {showActive ? 'Active Hotspot Users' : 'Hotspot Users'}
                </CardTitle>
                <CardDescription>
                  {showActive
                    ? 'Currently connected hotspot users'
                    : 'All configured hotspot user accounts'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowActive((prev) => !prev)}
              >
                <Users className="h-4 w-4 mr-1" />
                {showActive ? 'Show All' : 'Show Active'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <LoadingSpinner />
            ) : users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>{user.profile || '-'}</TableCell>
                      <TableCell>{user.uptime || '-'}</TableCell>
                      <TableCell>
                        {!showActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeUserMutation.mutate(user.name)}
                            disabled={removeUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No {showActive ? 'active' : ''} users found
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add User Dialog */}
      <AddHotspotUserDialog
        open={openAddDialog}
        onOpenChange={setOpenAddDialog}
        routerId={selectedRouter}
      />
    </div>
  );
};

export default HotspotUsersPage;
