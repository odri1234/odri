// C:\Users\ADMN\odri\frontend\src\pages\mikrotik\RoutersPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Router as RouterIcon, Plus, RefreshCcw, Trash2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AddRouterDialog } from './components/AddRouterDialog';

export const RoutersPage = () => {
  const queryClient = useQueryClient();
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Fetch routers
  const { data: routers, isLoading } = useQuery({
    queryKey: ['mikrotik-routers'],
    queryFn: async () => {
      const res = await api.get('/v1/mikrotik/routers');
      return res.data;
    },
  });

  // Delete router
  const deleteRouterMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/mikrotik/routers/${id}`);
    },
    onSuccess: () => {
      toast.success('Router removed successfully');
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
    },
    onError: () => {
      toast.error('Failed to remove router');
    },
  });

  // Test connection
  const testRouterMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.get(`/v1/mikrotik/routers/${id}/test`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`✅ ${data.message}`);
      } else {
        toast.error(`❌ ${data.message}`);
      }
    },
    onError: () => {
      toast.error('Failed to test connection');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MikroTik Routers</h1>
          <p className="text-muted-foreground">Manage MikroTik router configurations</p>
        </div>
        <Button onClick={() => setOpenAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Router
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RouterIcon className="h-5 w-5" />
            Router List
          </CardTitle>
          <CardDescription>All MikroTik routers registered to your ISP</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : routers && routers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routers.map((router: any) => (
                  <TableRow key={router.id}>
                    <TableCell>{router.name}</TableCell>
                    <TableCell>{router.ipAddress}</TableCell>
                    <TableCell>{router.location || '-'}</TableCell>
                    <TableCell>
                      {router.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => testRouterMutation.mutate(router.id)}
                        disabled={testRouterMutation.isPending}
                      >
                        <Activity className="h-4 w-4 mr-1" /> Test
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteRouterMutation.mutate(router.id)}
                        disabled={deleteRouterMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <RouterIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Routers Found</h3>
              <p className="text-muted-foreground">
                Add a router to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Router Dialog */}
      <AddRouterDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />
    </div>
  );
};

export default RoutersPage;
