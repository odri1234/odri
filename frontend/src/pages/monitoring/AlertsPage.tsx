// C:\Users\ADMN\odri\frontend\src\pages\monitoring\AlertsPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { monitoringService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';

export const AlertsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Fetch active alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['system-alerts', user?.ispId, user?.role],
    queryFn: async () => {
      // For SUPER_ADMIN, we don't need an ISP ID
      if (user?.role === 'SUPER_ADMIN') {
        // Pass 'all' as ispId to indicate all ISPs should be included
        return monitoringService.getAlerts('all');
      }
      
      // For other roles, we still need an ISP ID
      if (!user?.ispId) throw new Error('ISP ID is required');
      return monitoringService.getAlerts(user.ispId);
    },
    enabled: !!user && (!!user.ispId || user.role === 'SUPER_ADMIN'),
  });

  // Resolve alert mutation
  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      // Use the API instance to make the request
      const response = await fetch(`/api/v1/monitoring/alerts/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to resolve alert');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Alert resolved', description: 'The alert was marked as resolved.' });
      queryClient.invalidateQueries({ queryKey: ['system-alerts', user?.ispId] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to resolve alert.', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">System Alerts</h1>
        <p className="text-muted-foreground">View and manage system alerts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </CardTitle>
          <CardDescription>Active system alerts that require attention</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : alerts && alerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert: any) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-semibold">{alert.title}</TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          alert.severity === 'CRITICAL'
                            ? 'destructive'
                            : alert.severity === 'WARNING'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(alert.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-6">No active alerts</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;
