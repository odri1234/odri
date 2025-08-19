import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { monitoringService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { 
  Network, 
  Router, 
  Wifi, 
  WifiOff, 
  Server, 
  Monitor, 
  Activity, 
  Signal, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart, 
  LineChart,
  Settings, 
  Edit, 
  Trash2, 
  Eye, 
  Plus, 
  RefreshCw, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  MoreHorizontal,
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  Building, 
  Target, 
  Award, 
  Star, 
  Lightbulb, 
  Brain, 
  Cpu, 
  Database, 
  HardDrive, 
  MemoryStick,
  Gauge, 
  Thermometer, 
  Battery, 
  Power, 
  PowerOff,
  Bell,
  Shield,
  RotateCw, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Thermometer, 
  Battery, 
  Power, 
  PowerOff,
  Target,
  Award,
  Star,
  Lightbulb,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { monitoringService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

// Network Status Badge Component
const NetworkStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'Online', icon: CheckCircle },
    offline: { color: 'bg-red-500', text: 'Offline', icon: XCircle },
    warning: { color: 'bg-yellow-500', text: 'Warning', icon: AlertTriangle },
    maintenance: { color: 'bg-blue-500', text: 'Maintenance', icon: Settings },
    degraded: { color: 'bg-orange-500', text: 'Degraded', icon: TrendingDown },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Signal Strength Component
const SignalStrength = ({ strength }: { strength: number }) => {
  const getSignalIcon = (strength: number) => {
    if (strength >= 80) return SignalHigh;
    if (strength >= 50) return SignalMedium;
    return SignalLow;
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return 'text-green-500';
    if (strength >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const Icon = getSignalIcon(strength);

  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("h-4 w-4", getSignalColor(strength))} />
      <span className="text-sm font-medium">{strength}%</span>
    </div>
  );
};

// Real-time Network Metrics Component
const RealTimeNetworkMetrics = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState({
    totalBandwidth: 0,
    usedBandwidth: 0,
    activeConnections: 0,
    packetsPerSecond: 0,
    latency: 0,
    uptime: 99.9,
  });
  
  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ['network-metrics', user?.ispId],
    queryFn: async () => {
      if (!user?.ispId) throw new Error('ISP ID is required');
      return monitoringService.getMetrics(user.ispId);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!user?.ispId,
  });

  useEffect(() => {
    if (metricsData) {
      // Process metrics data from backend
      const bandwidthMetric = metricsData.find((m: any) => m.metricType === 'BANDWIDTH_USAGE');
      const connectionsMetric = metricsData.find((m: any) => m.metricType === 'ACTIVE_CONNECTIONS');
      const packetsMetric = metricsData.find((m: any) => m.metricType === 'PACKETS_PER_SECOND');
      const latencyMetric = metricsData.find((m: any) => m.metricType === 'NETWORK_LATENCY');
      const uptimeMetric = metricsData.find((m: any) => m.metricType === 'SYSTEM_UPTIME');
      
      setMetrics({
        totalBandwidth: bandwidthMetric?.metadata?.totalBandwidth || 1000,
        usedBandwidth: bandwidthMetric?.value || 0,
        activeConnections: connectionsMetric?.value || 0,
        packetsPerSecond: packetsMetric?.value || 0,
        latency: latencyMetric?.value || 0,
        uptime: uptimeMetric?.value || 99.9,
      });
    }
  }, [metricsData]);

  // Fallback to simulation if no data is available
  useEffect(() => {
    if (isLoading || error) {
      const interval = setInterval(() => {
        setMetrics(prev => ({
          totalBandwidth: 1000,
          usedBandwidth: Math.max(0, Math.min(1000, prev.usedBandwidth + Math.floor(Math.random() * 100) - 50)),
          activeConnections: Math.max(0, prev.activeConnections + Math.floor(Math.random() * 10) - 5),
          packetsPerSecond: Math.max(0, prev.packetsPerSecond + Math.floor(Math.random() * 1000) - 500),
          latency: Math.max(1, Math.min(100, prev.latency + Math.floor(Math.random() * 10) - 5)),
          uptime: Math.max(95, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.1)),
        }));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, error]);

  const bandwidthUsage = (metrics.usedBandwidth / metrics.totalBandwidth) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Bandwidth Usage</p>
              <p className="text-2xl font-bold">{bandwidthUsage.toFixed(1)}%</p>
            </div>
            <Activity className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Connections</p>
              <p className="text-2xl font-bold">{metrics.activeConnections}</p>
            </div>
            <Users className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Packets/sec</p>
              <p className="text-2xl font-bold">{metrics.packetsPerSecond.toLocaleString()}</p>
            </div>
            <Network className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Latency</p>
              <p className="text-2xl font-bold">{metrics.latency}ms</p>
            </div>
            <Zap className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Uptime</p>
              <p className="text-2xl font-bold">{metrics.uptime.toFixed(2)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-teal-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Bandwidth</p>
              <p className="text-2xl font-bold">{metrics.totalBandwidth} Mbps</p>
            </div>
            <Globe className="h-8 w-8 text-indigo-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Router Status Card Component
const RouterStatusCard = ({ router }: { router: any }) => {
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'router': return Router;
      case 'switch': return Network;
      case 'access_point': return Wifi;
      default: return Server;
    }
  };

  const Icon = getDeviceIcon(router.type);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", router.status === 'online' ? 'bg-green-500' : 'bg-red-500')}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{router.name}</CardTitle>
              <CardDescription>{router.model} - {router.location}</CardDescription>
            </div>
          </div>
          <NetworkStatusBadge status={router.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">CPU Usage</p>
              <div className="flex items-center gap-2">
                <Progress value={router.cpuUsage} className="flex-1 h-2" />
                <span className="font-semibold">{router.cpuUsage}%</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Memory Usage</p>
              <div className="flex items-center gap-2">
                <Progress value={router.memoryUsage} className="flex-1 h-2" />
                <span className="font-semibold">{router.memoryUsage}%</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Temperature</p>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{router.temperature}°C</span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Connected Users</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{router.connectedUsers}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Signal Strength</span>
              <SignalStrength strength={router.signalStrength} />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Monitor
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Network Topology Component
const NetworkTopology = () => {
  const devices = [
    { id: 1, name: 'Core Router', type: 'router', x: 50, y: 20, status: 'online' },
    { id: 2, name: 'Switch A', type: 'switch', x: 20, y: 60, status: 'online' },
    { id: 3, name: 'Switch B', type: 'switch', x: 80, y: 60, status: 'online' },
    { id: 4, name: 'AP-001', type: 'access_point', x: 10, y: 90, status: 'online' },
    { id: 5, name: 'AP-002', type: 'access_point', x: 30, y: 90, status: 'warning' },
    { id: 6, name: 'AP-003', type: 'access_point', x: 70, y: 90, status: 'online' },
    { id: 7, name: 'AP-004', type: 'access_point', x: 90, y: 90, status: 'offline' },
  ];

  const connections = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 6 },
    { from: 3, to: 7 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Network Topology
        </CardTitle>
        <CardDescription>
          Visual representation of your network infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 bg-gray-50 rounded-lg p-4">
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full">
            {connections.map((conn, index) => {
              const fromDevice = devices.find(d => d.id === conn.from);
              const toDevice = devices.find(d => d.id === conn.to);
              if (!fromDevice || !toDevice) return null;
              
              return (
                <line
                  key={index}
                  x1={`${fromDevice.x}%`}
                  y1={`${fromDevice.y}%`}
                  x2={`${toDevice.x}%`}
                  y2={`${toDevice.y}%`}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray={toDevice.status === 'offline' ? '5,5' : 'none'}
                />
              );
            })}
          </svg>
          
          {/* Devices */}
          {devices.map((device) => {
            const Icon = device.type === 'router' ? Router : 
                        device.type === 'switch' ? Network : Wifi;
            
            return (
              <div
                key={device.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${device.x}%`, top: `${device.y}%` }}
              >
                <div className={cn(
                  "p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform",
                  device.status === 'online' ? 'bg-green-500' :
                  device.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                )}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-xs text-center mt-2 font-medium">
                  {device.name}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Bandwidth Usage Chart Component
const BandwidthUsageChart = () => {
  const [timeRange, setTimeRange] = useState('24h');
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bandwidth Usage
            </CardTitle>
            <CardDescription>
              Real-time bandwidth consumption across the network
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">Bandwidth usage chart would be rendered here</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Active Alerts Component
const ActiveAlerts = () => {
  const alerts = [
    {
      id: 1,
      type: 'critical',
      title: 'Router Offline',
      description: 'Router-007 has been offline for 15 minutes',
      timestamp: new Date(Date.now() - 900000),
      location: 'Branch Office A',
    },
    {
      id: 2,
      type: 'warning',
      title: 'High CPU Usage',
      description: 'Core router CPU usage at 85%',
      timestamp: new Date(Date.now() - 300000),
      location: 'Main Office',
    },
    {
      id: 3,
      type: 'info',
      title: 'Bandwidth Threshold',
      description: 'Bandwidth usage exceeded 80% threshold',
      timestamp: new Date(Date.now() - 600000),
      location: 'Branch Office B',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Active Alerts
        </CardTitle>
        <CardDescription>
          Current network alerts and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={alert.type === 'critical' ? 'destructive' : 
                                  alert.type === 'warning' ? 'secondary' : 'default'}>
                      {alert.type.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="font-semibold mb-1">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {alert.location}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button size="sm">
                    Resolve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export const NetworkMonitoringDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Mock routers data
  const routers = [
    {
      id: 1,
      name: 'Core Router',
      model: 'MikroTik CCR1036',
      location: 'Main Office',
      status: 'online',
      cpuUsage: 45,
      memoryUsage: 62,
      temperature: 42,
      connectedUsers: 156,
      signalStrength: 95,
      type: 'router',
    },
    {
      id: 2,
      name: 'Branch Router A',
      model: 'MikroTik RB4011',
      location: 'Branch Office A',
      status: 'online',
      cpuUsage: 38,
      memoryUsage: 55,
      temperature: 39,
      connectedUsers: 89,
      signalStrength: 88,
      type: 'router',
    },
    {
      id: 3,
      name: 'Branch Router B',
      model: 'MikroTik RB4011',
      location: 'Branch Office B',
      status: 'warning',
      cpuUsage: 78,
      memoryUsage: 82,
      temperature: 58,
      connectedUsers: 124,
      signalStrength: 72,
      type: 'router',
    },
    {
      id: 4,
      name: 'Access Point 001',
      model: 'Ubiquiti UAP-AC-PRO',
      location: 'Floor 1',
      status: 'online',
      cpuUsage: 25,
      memoryUsage: 34,
      temperature: 35,
      connectedUsers: 45,
      signalStrength: 92,
      type: 'access_point',
    },
    {
      id: 5,
      name: 'Access Point 002',
      model: 'Ubiquiti UAP-AC-PRO',
      location: 'Floor 2',
      status: 'offline',
      cpuUsage: 0,
      memoryUsage: 0,
      temperature: 0,
      connectedUsers: 0,
      signalStrength: 0,
      type: 'access_point',
    },
    {
      id: 6,
      name: 'Switch Core',
      model: 'Cisco SG350-28',
      location: 'Server Room',
      status: 'online',
      cpuUsage: 15,
      memoryUsage: 28,
      temperature: 41,
      connectedUsers: 0,
      signalStrength: 100,
      type: 'switch',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and management of your network infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Network Metrics */}
      <RealTimeNetworkMetrics />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="topology">Topology</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BandwidthUsageChart />
            <ActiveAlerts />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Network Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">98.7%</div>
                <p className="text-sm text-muted-foreground">Overall health score</p>
                <Progress value={98.7} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">847 Mbps</div>
                <p className="text-sm text-muted-foreground">Current throughput</p>
                <Progress value={84.7} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">1,247</div>
                <p className="text-sm text-muted-foreground">Currently connected</p>
                <Progress value={62} className="mt-4" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          {/* Device Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search devices by name, model, or location..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Device Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="router">Routers</SelectItem>
                      <SelectItem value="switch">Switches</SelectItem>
                      <SelectItem value="access_point">Access Points</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routers.map((router) => (
              <RouterStatusCard key={router.id} router={router} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topology">
          <NetworkTopology />
        </TabsContent>

        <TabsContent value="alerts">
          <ActiveAlerts />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">99.95%</div>
                <p className="text-sm text-muted-foreground">30-day average</p>
                <Progress value={99.95} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">94.2%</div>
                <p className="text-sm text-muted-foreground">Performance score</p>
                <Progress value={94.2} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Reliability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">97.8%</div>
                <p className="text-sm text-muted-foreground">Reliability index</p>
                <Progress value={97.8} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">8.7/10</div>
                <p className="text-sm text-muted-foreground">Overall quality</p>
                <Progress value={87} className="mt-4" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">Performance trends chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Traffic Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">Traffic analysis chart would be rendered here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkMonitoringDashboard;