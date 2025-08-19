// C:\Users\ADMN\odri\frontend\src\pages\monitoring\SystemHealthPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { monitoringService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';

export const SystemHealthPage = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { user } = useAuthStore();
  const { data: healthChecks, isLoading } = useQuery({
    queryKey: ['system-health', user?.ispId, user?.role],
    queryFn: async () => {
      // For SUPER_ADMIN, we don't need an ISP ID
      if (user?.role === 'SUPER_ADMIN') {
        // Pass 'all' as ispId to indicate all ISPs should be included
        const data = await monitoringService.getHealthStatus('all');
        setLastUpdated(new Date());
        return data;
      }
      
      // For other roles, we still need an ISP ID
      if (!user?.ispId) throw new Error('ISP ID is required');
      const data = await monitoringService.getHealthStatus(user.ispId);
      setLastUpdated(new Date());
      return data;
    },
    refetchInterval: 30000, // auto-refresh every 30 seconds
    refetchOnWindowFocus: true, // refresh when tab is focused
    enabled: !!user && (!!user.ispId || user.role === 'SUPER_ADMIN'),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return <Badge variant="success">Healthy</Badge>;
      case 'WARNING':
        return <Badge variant="warning">Warning</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor system health and performance</p>
        </div>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Latest health checks from all systems (auto-refreshes every 30s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : healthChecks && healthChecks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Checked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthChecks.map((check: any) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-semibold">{check.serviceName || 'Unknown'}</TableCell>
                    <TableCell>{getStatusBadge(check.status)}</TableCell>
                    <TableCell>{check.message || '—'}</TableCell>
                    <TableCell>{new Date(check.checkedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-6">No health data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthPage;
