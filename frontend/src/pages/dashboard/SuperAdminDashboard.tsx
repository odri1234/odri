import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { 
  dashboardService, 
  ispsService, 
  usersService, 
  mikrotikService, 
  sessionsService 
} from '@/services/api.service';
import { 
  Users, 
  Building, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Server,
  Database,
  Router,
  Signal,
  MapPin,
  Settings,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  WifiOff,
  Crown,
  UserCheck,
  Building2,
  Package,
  CreditCard,
  AlertCircle,
  TrendingUpIcon,
  BarChart,
  PieChartIcon
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

// Create a combined API service for dashboard
const apiService = {
  getDashboardStats: () => dashboardService.getStats(),
  getISPs: () => ispsService.getISPs(),
  getUsers: () => usersService.getUsers(),
  getMikroTikRouters: () => mikrotikService.getRouters(),
  getActiveSessions: (ispId?: string) => sessionsService.getActiveSessions(ispId),
  getSystemHealth: () => dashboardService.getHealthCheck(),
};

// Chart components (simplified for demo)
const SimpleLineChart = ({ data, title }: { data: any[]; title: string }) => (
  <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/20">
    <div className="text-center">
      <LineChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);

const SimpleBarChart = ({ data, title }: { data: any[]; title: string }) => (
  <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/20">
    <div className="text-center">
      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);

const SimplePieChart = ({ data, title }: { data: any[]; title: string }) => (
  <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/20">
    <div className="text-center">
      <PieChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [dateRange, setDateRange] = useState<string>('7d');
  const [selectedISP, setSelectedISP] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect if not super admin
  if (!isSuperAdmin()) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Super Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // API Queries
  const { data: systemStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['system-stats', refreshKey],
    queryFn: () => apiService.getDashboardStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: isps, isLoading: ispsLoading } = useQuery({
    queryKey: ['isps', refreshKey],
    queryFn: () => apiService.getISPs(),
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users', refreshKey],
    queryFn: () => apiService.getUsers(),
    refetchInterval: 60000,
  });

  const { data: routers, isLoading: routersLoading } = useQuery({
    queryKey: ['routers', refreshKey],
    queryFn: () => apiService.getMikroTikRouters(),
    refetchInterval: 30000,
  });

  const { data: activeSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['active-sessions', selectedISP, refreshKey],
    queryFn: () => apiService.getActiveSessions(selectedISP === 'all' ? undefined : selectedISP),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health', refreshKey],
    queryFn: () => apiService.getSystemHealth(),
    refetchInterval: 30000,
  });

  // Calculate system metrics
  const systemMetrics = useMemo(() => {
    const totalISPs = isps?.data?.length || 0;
    const activeISPs = isps?.data?.filter((isp: any) => isp.isActive).length || 0;
    const totalUsers = users?.data?.length || 0;
    const activeUsers = users?.data?.filter((user: any) => user.isActive).length || 0;
    const totalRouters = routers?.data?.length || 0;
    const onlineRouters = routers?.data?.filter((router: any) => router.status?.isOnline).length || 0;
    const totalSessions = activeSessions?.data?.length || 0;
    const totalRevenue = systemStats?.data?.totalRevenue || 0;
    const monthlyRevenue = systemStats?.data?.monthlyRevenue || 0;

    return {
      totalISPs,
      activeISPs,
      totalUsers,
      activeUsers,
      totalRouters,
      onlineRouters,
      totalSessions,
      totalRevenue,
      monthlyRevenue,
    };
  }, [isps, users, routers, activeSessions, systemStats]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchStats();
  };

  // Calculate growth percentages
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Render metric card
  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    growth?: number,
    description?: string,
    color?: string,
    link?: string
  ) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", 
            color?.includes('red') ? 'bg-red-100' : 
            color?.includes('green') ? 'bg-green-100' : 
            color?.includes('blue') ? 'bg-blue-100' : 
            color?.includes('purple') ? 'bg-purple-100' :
            color?.includes('orange') ? 'bg-orange-100' : 'bg-gray-100'
          )}>
            {icon}
          </div>
        </div>
        {growth !== undefined && (
          <div className="flex items-center mt-4">
            {growth >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={cn("text-sm font-medium", 
              growth >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {Math.abs(growth).toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              vs last period
            </span>
          </div>
        )}
        {link && (
          <div className="mt-4">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={link}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render ISP status
  const renderISPStatus = (isp: any) => {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={isp.logo} alt={isp.name} />
            <AvatarFallback>
              {isp.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{isp.name}</h4>
            <p className="text-sm text-muted-foreground">{isp.code}</p>
            {isp.location && (
              <p className="text-xs text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {isp.location}
              </p>
            )}
          </div>
        </div>
        <div className="text-right space-y-1">
          <Badge variant="outline" className={cn(
            isp.isActive 
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-red-100 text-red-800 border-red-200'
          )}>
            {isp.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <div className="text-sm text-muted-foreground">
            {isp.currentClients || 0} / {isp.maxClients || 0} clients
          </div>
          <div className="text-sm font-medium text-green-600">
            ${(isp.monthlyRevenue || 0).toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Complete system overview and management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedISP} onValueChange={setSelectedISP}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ISPs</SelectItem>
              {isps?.map(isp => (
                <SelectItem key={isp.id} value={isp.id}>
                  {isp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth?.data?.status !== 'healthy' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System health check detected issues. Please review the monitoring dashboard.
          </AlertDescription>
        </Alert>
      )}

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {renderMetricCard(
              "Total ISPs",
              systemMetrics.totalISPs,
              <Building2 className="h-6 w-6 text-blue-600" />,
              undefined,
              `${systemMetrics.activeISPs} active`,
              "text-blue-600",
              "/isps"
            )}
            
            {renderMetricCard(
              "Total Users",
              systemMetrics.totalUsers.toLocaleString(),
              <Users className="h-6 w-6 text-green-600" />,
              calculateGrowth(systemMetrics.totalUsers, dashboardStats?.previousTotalUsers || 0),
              `${systemMetrics.activeUsers} active`,
              "text-green-600",
              "/users"
            )}
            
            {renderMetricCard(
              "Active Sessions",
              systemMetrics.totalSessions,
              <Activity className="h-6 w-6 text-purple-600" />,
              undefined,
              "Currently online",
              "text-purple-600",
              "/sessions"
            )}
            
            {renderMetricCard(
              "Total Revenue",
              `$${systemMetrics.totalRevenue.toLocaleString()}`,
              <DollarSign className="h-6 w-6 text-green-600" />,
              calculateGrowth(systemMetrics.totalRevenue, systemStats?.data?.previousTotalRevenue || 0),
              "All time",
              "text-green-600",
              "/payments"
            )}

            {renderMetricCard(
              "Monthly Revenue",
              `$${systemMetrics.monthlyRevenue.toLocaleString()}`,
              <TrendingUp className="h-6 w-6 text-orange-600" />,
              calculateGrowth(systemMetrics.monthlyRevenue, systemStats?.data?.previousMonthlyRevenue || 0),
              "This month",
              "text-orange-600",
              "/analytics"
            )}
            
            {renderMetricCard(
              "MikroTik Routers",
              systemMetrics.totalRouters,
              <Router className="h-6 w-6 text-indigo-600" />,
              undefined,
              `${systemMetrics.onlineRouters} online`,
              "text-indigo-600",
              "/mikrotik/routers"
            )}
            
            {renderMetricCard(
              "System Health",
              systemHealth?.data?.status === 'healthy' ? 'Healthy' : 'Issues',
              systemHealth?.data?.status === 'healthy' ? 
                <CheckCircle className="h-6 w-6 text-green-600" /> : 
                <AlertCircle className="h-6 w-6 text-red-600" />,
              undefined,
              systemHealth?.data?.uptime || 'Unknown',
              systemHealth?.data?.status === 'healthy' ? "text-green-600" : "text-red-600",
              "/monitoring"
            )}
            
            {renderMetricCard(
              "Data Usage",
              usage ? `${(usage.totalUsage / 1024 / 1024 / 1024).toFixed(1)} GB` : "0 GB",
              <Database className="h-6 w-6 text-cyan-600" />,
              undefined,
              `${dateRange} period`,
              "text-cyan-600",
              "/analytics"
            )}
            
            {renderMetricCard(
              "Alerts",
              realtimeStats?.activeAlerts || 0,
              <AlertCircle className="h-6 w-6 text-red-600" />,
              undefined,
              "Active alerts",
              "text-red-600",
              "/alerts"
            )}
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="isps">ISP Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link to="/isps/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New ISP
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/users/create">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Add System User
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/system/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/system/backup">
                    <Database className="h-4 w-4 mr-2" />
                    System Backup
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/reports/generate">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Running
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Gateway</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Jobs</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Processing
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">78% Used</div>
                    <Progress value={78} className="w-20 h-2 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'isp', message: 'New ISP registered: TechNet Solutions', time: '2 minutes ago', icon: Building2 },
                  { type: 'user', message: 'Super admin created user: admin@newcorp.com', time: '5 minutes ago', icon: Users },
                  { type: 'payment', message: 'Payment processed: $1,299.99 from ISP-001', time: '8 minutes ago', icon: DollarSign },
                  { type: 'router', message: 'Router added to ISP network: MikroTik-RB4011', time: '15 minutes ago', icon: Router },
                  { type: 'system', message: 'System backup completed successfully', time: '1 hour ago', icon: Database },
                  { type: 'alert', message: 'High CPU usage alert resolved', time: '2 hours ago', icon: AlertTriangle },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={cn("p-2 rounded-full", 
                      activity.type === 'isp' ? 'bg-blue-100' :
                      activity.type === 'user' ? 'bg-green-100' :
                      activity.type === 'payment' ? 'bg-purple-100' :
                      activity.type === 'router' ? 'bg-orange-100' :
                      activity.type === 'system' ? 'bg-cyan-100' : 'bg-red-100'
                    )}>
                      <activity.icon className={cn("h-4 w-4",
                        activity.type === 'isp' ? 'text-blue-600' :
                        activity.type === 'user' ? 'text-green-600' :
                        activity.type === 'payment' ? 'text-purple-600' :
                        activity.type === 'router' ? 'text-orange-600' :
                        activity.type === 'system' ? 'text-cyan-600' : 'text-red-600'
                      )} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isps" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">ISP Management</h3>
            <Button asChild>
              <Link to="/isps/create">
                <Plus className="h-4 w-4 mr-2" />
                Add ISP
              </Link>
            </Button>
          </div>

          {ispsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : isps?.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No ISPs Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first ISP to start managing the system.
                  </p>
                  <Button asChild>
                    <Link to="/isps/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add ISP
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isps?.map((isp) => (
                <div key={isp.id}>
                  {renderISPStatus(isp)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  System-wide revenue over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={revenue?.dailyRevenue || []} 
                  title="Revenue Analytics"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ISP Growth</CardTitle>
                <CardDescription>
                  New ISP registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={dashboardStats?.ispGrowth || []} 
                  title="ISP Growth Chart"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>
                  Users by ISP and role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimplePieChart 
                  data={dashboardStats?.userDistribution || []} 
                  title="User Distribution"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Key performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={realtimeStats?.performanceMetrics || []} 
                  title="Performance Metrics"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Cpu className="h-4 w-4 mr-2" />
                      CPU Usage
                    </span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <MemoryStick className="h-4 w-4 mr-2" />
                      Memory
                    </span>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <HardDrive className="h-4 w-4 mr-2" />
                      Storage
                    </span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center">
                      <Network className="h-4 w-4 mr-2" />
                      Network
                    </span>
                    <span className="text-sm font-medium">23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { level: 'warning', message: 'High memory usage on server-01', time: '5m ago' },
                    { level: 'info', message: 'Scheduled maintenance in 2 hours', time: '1h ago' },
                    { level: 'error', message: 'Router offline: MikroTik-003', time: '2h ago' },
                  ].map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={cn("p-1 rounded-full mt-0.5",
                        alert.level === 'error' ? 'bg-red-100' :
                        alert.level === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      )}>
                        <AlertTriangle className={cn("h-3 w-3",
                          alert.level === 'error' ? 'text-red-600' :
                          alert.level === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Recent Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 bg-muted rounded">
                    <span className="text-green-600">[INFO]</span> User login: admin@system.com
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-blue-600">[DEBUG]</span> Database connection pool: 45/100
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-yellow-600">[WARN]</span> High CPU usage detected
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-green-600">[INFO]</span> Backup completed successfully
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-red-600">[ERROR]</span> Router connection timeout
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}