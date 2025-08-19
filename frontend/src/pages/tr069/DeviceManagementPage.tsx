import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { tr069Service } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { 
  Router, 
  Wifi, 
  Server, 
  RefreshCw, 
  Settings, 
  Plus, 
  Search,
  RotateCw,
  Power,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const DeviceManagementPage = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: devices, isLoading, refetch } = useQuery({
    queryKey: ['tr069-devices', statusFilter, searchTerm],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      return tr069Service.getDevices(params);
    },
    enabled: !!user?.ispId,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Online</Badge>;
      case 'OFFLINE':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Offline</Badge>;
      case 'WARNING':
        return <Badge variant="warning" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Warning</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'ROUTER':
        return <Router className="h-5 w-5" />;
      case 'ACCESS_POINT':
        return <Wifi className="h-5 w-5" />;
      default:
        return <Server className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TR-069 Device Management</h1>
          <p className="text-muted-foreground">Manage and monitor your TR-069 enabled devices</p>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Devices
          </CardTitle>
          <CardDescription>
            All TR-069 enabled devices in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : devices && devices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device: any) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.type)}
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-xs text-muted-foreground">{device.manufacturer}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{device.serialNumber}</TableCell>
                    <TableCell>{device.model}</TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell>{new Date(device.lastSeen).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="Reboot">
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Factory Reset">
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Firmware Upgrade">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Configure">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-6">No devices found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceManagementPage;