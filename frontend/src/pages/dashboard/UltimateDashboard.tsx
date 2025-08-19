import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wifi, 
  WifiOff, 
  Server, 
  Router, 
  Network, 
  Globe, 
  Signal, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  PieChart, 
  Gauge, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Eye, 
  Settings, 
  RefreshCw, 
  Download, 
  Upload, 
  MapPin, 
  Calendar, 
  Bell, 
  Shield, 
  Lock, 
  Unlock, 
  Database, 
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
  Search,
  Brain,
  Crown,
  Briefcase,
  UserCheck,
  UserX,
  UserPlus,
  Receipt,
  CreditCard,
  Banknote,
  Bitcoin,
  QrCode,
  Wallet,
  Building,
  Building2,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  Eye as EyeIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Wifi as WifiIcon,
  Signal as SignalIcon,
  Zap as ZapIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Circle,
  Square,
  Triangle
} from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { cn } from '@/lib/utils';
import { 
  dashboardService, 
  analyticsService, 
  usersService, 
  paymentsService, 
  mikrotikService,
  monitoringService,
  sessionsService,
  auditService
} from '@/services/api.service';

export const UltimateDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Calculate date range based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case '7d':
        startDate = subDays(endDate, 7);
        break;
      case '30d':
        startDate = subDays(endDate, 30);
        break;
      case '90d':
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 30);
    }
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading, refetch: refetchStats, error: statsError } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds if auto-refresh is enabled
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch system health
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['dashboard', 'health'],
    queryFn: () => dashboardService.getHealthCheck(),
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    retry: 1,
    retryDelay: 1000
  });

  // Fetch revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics', 'revenue', selectedPeriod],
    queryFn: () => analyticsService.getRevenueSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000
  });

  // Fetch usage analytics
  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['analytics', 'usage', selectedPeriod],
    queryFn: () => analyticsService.getUsageSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000
  });

  // Fetch recent users
  const { data: recentUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'recent'],
    queryFn: () => usersService.getUsers({ limit: 5 }),
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
    // Ensure we always have an array even if the API fails
    select: (data) => data?.data ? data.data : []
  });

  // Fetch recent payments
  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', 'recent'],
    queryFn: () => paymentsService.getPaymentHistory({ limit: 5 }),
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 1000,
    // Ensure we always have an array even if the API fails
    select: (data) => data?.data ? data.data : []
  });

  // Fetch MikroTik routers
  const { data: routers, isLoading: routersLoading, error: routersError } = useQuery({
    queryKey: ['mikrotik', 'routers'],
    queryFn: () => mikrotikService.getRouters(),
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 15000 : false, // Refresh every 15 seconds
    retry: 1,
    retryDelay: 1000,
    // Ensure we always have an array even if the API fails
    select: (data) => Array.isArray(data) ? data : []
  });

  // Fetch active sessions
  const { data: activeSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: () => sessionsService.getActiveSessions(),
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds
    retry: 1,
    retryDelay: 1000,
    // Ensure we always have an array even if the API fails
    select: (data) => Array.isArray(data) ? data : []
  });

  // Fetch monitoring alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['monitoring', 'alerts'],
    queryFn: () => monitoringService.getAlerts(),
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 20000 : false, // Refresh every 20 seconds
    retry: 1,
    retryDelay: 1000,
    // Ensure we always have an array even if the API fails
    select: (data) => Array.isArray(data) ? data : []
  });
  
  // Fetch recent activity (audit logs)
  const { data: auditLogs, isLoading: auditLogsLoading } = useQuery({
    queryKey: ['audit', 'logs'],
    queryFn: () => auditService.getAuditLogs({ limit: 5 }),
    refetchOnWindowFocus: false,
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    retry: 1,
    retryDelay: 1000,
    // Ensure we always have an array even if the API fails
    select: (data) => data?.data ? data.data : []
  });

  const handleRefresh = () => {
    refetchStats();
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['mikrotik'] });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    queryClient.invalidateQueries({ queryKey: ['audit'] });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
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
      case 'healthy':
      case 'completed':
        return 'text-green-600';
      case 'offline':
      case 'unhealthy':
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
      case 'unhealthy':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const canViewDashboard = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF].includes(user.role);
  };

  if (!canViewDashboard()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}. Here's what's happening with your system.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {/* API Test Button */}
          <Button variant="outline" className="bg-yellow-50" onClick={() => import('@/utils/api-test').then(module => module.testApiCalls())}>
            <Activity className="h-4 w-4 mr-2" />
            Test API
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status && systemHealth.status !== 'healthy' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            System health check failed. Status: {systemHealth.status}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={dashboardStats?.totalUsers || 0}
          change={revenueData?.growthRate || 0}
          changeType={(revenueData?.growthRate || 0) >= 0 ? 'increase' : 'decrease'}
          icon={Users}
          color="blue"
          loading={statsLoading}
        />
        <MetricCard
          title="Active Sessions"
          value={dashboardStats?.activeSessions || 0}
          change={0}
          changeType="increase"
          icon={Activity}
          color="green"
          loading={statsLoading}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(dashboardStats?.totalRevenue || 0)}
          change={revenueData?.growthRate || 0}
          changeType={(revenueData?.growthRate || 0) >= 0 ? 'increase' : 'decrease'}
          icon={DollarSign}
          color="purple"
          loading={statsLoading}
        />
        <MetricCard
          title="System Uptime"
          value={systemHealth ? formatUptime(systemHealth.uptime || 0) : 'N/A'}
          change={0}
          changeType="increase"
          icon={Server}
          color="orange"
          loading={healthLoading}
        />
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auditLogs && auditLogs.length > 0 ? (
                      auditLogs.map((log: any, index: number) => {
                        // Determine color based on action type
                        let dotColor = "bg-gray-500";
                        if (log.action?.includes('create') || log.action?.includes('add')) {
                          dotColor = "bg-green-500";
                        } else if (log.action?.includes('update') || log.action?.includes('edit')) {
                          dotColor = "bg-blue-500";
                        } else if (log.action?.includes('delete') || log.action?.includes('remove')) {
                          dotColor = "bg-red-500";
                        } else if (log.action?.includes('login') || log.action?.includes('auth')) {
                          dotColor = "bg-purple-500";
                        }
                        
                        // Format the timestamp
                        const timestamp = new Date(log.timestamp || log.createdAt);
                        const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
                        
                        return (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{log.action || 'System activity'}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.user?.fullName || log.userId || 'System'} • {timeAgo}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No recent activity found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Usage</span>
                    <span className="text-sm font-medium">
                      {usageLoading ? '...' : formatBytes((usageData?.totalDataUsageMB || 0) * 1024 * 1024)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Session</span>
                    <span className="text-sm font-medium">
                      {usageLoading ? '...' : formatDuration(usageData?.averageSessionDuration || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Online Routers</span>
                    <span className="text-sm font-medium">
                      {routersLoading ? '...' : (Array.isArray(routers) ? routers.filter(r => r.status === 'online').length : 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Alerts</span>
                    <span className="text-sm font-medium">
                      {alertsLoading ? '...' : (Array.isArray(alerts) ? alerts.length : 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Financial performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-semibold">
                        {formatCurrency(revenueData?.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transactions</span>
                      <span className="font-semibold">
                        {revenueData?.transactionCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Revenue/User</span>
                      <span className="font-semibold">
                        {formatCurrency(revenueData?.averageRevenuePerUser || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate</span>
                      <span className={`font-semibold ${
                        (revenueData?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(revenueData?.growthRate || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Network usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Data Usage</span>
                      <span className="font-semibold">
                        {formatBytes((usageData?.totalDataUsageMB || 0) * 1024 * 1024)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Count</span>
                      <span className="font-semibold">
                        {usageData?.sessionCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Session Duration</span>
                      <span className="font-semibold">
                        {formatDuration(usageData?.averageSessionDuration || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Usage Time</span>
                      <span className="font-semibold">
                        {usageData?.peakUsageTime || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {routersLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !Array.isArray(routers) ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <p>No routers data available</p>
              </div>
            ) : (
              routers.map((router) => (
                <Card key={router.id || Math.random().toString()}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Router className="h-4 w-4" />
                      {router.name || 'Unknown Router'}
                    </CardTitle>
                    <CardDescription>{router.ipAddress || 'No IP Address'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(router.status || 'unknown')}
                          <span className={`text-sm font-medium ${getStatusColor(router.status || 'unknown')}`}>
                            {router.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Connected Users</span>
                        <span className="text-sm font-medium">{router.connectedUsers || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Users</span>
                        <span className="text-sm font-medium">{router.totalUsers || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!recentUsers?.data || recentUsers.data.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No users found
                      </div>
                    ) : (
                      recentUsers.data.slice(0, 5).map((user) => (
                        <div key={user.id || Math.random().toString()} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{(user.fullName || 'U').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{user.fullName || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                          </div>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>Latest payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!recentPayments?.data || recentPayments.data.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No payments found
                      </div>
                    ) : (
                      recentPayments.data.slice(0, 5).map((payment) => (
                        <div key={payment.id || Math.random().toString()} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Receipt className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {payment.user?.fullName || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, HH:mm') : 'Unknown date'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{payment.amount ? formatCurrency(payment.amount) : '$0.00'}</p>
                            <Badge variant={payment.status === 'completed' ? "default" : "secondary"}>
                              {payment.status || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent>
                {healthLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(systemHealth?.status || 'unknown')}
                        <span className={`text-sm font-medium ${getStatusColor(systemHealth?.status || 'unknown')}`}>
                          {systemHealth?.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">
                        {systemHealth ? formatUptime(systemHealth.uptime) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Check</span>
                      <span className="text-sm font-medium">
                        {systemHealth ? format(new Date(systemHealth.timestamp), 'HH:mm:ss') : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Currently connected users</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-2xl font-bold">{activeSessions?.length || 0}</div>
                    <p className="text-sm text-muted-foreground">Active connections</p>
                    {!activeSessions || activeSessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground mt-2">No active sessions</p>
                    ) : (
                      <div className="space-y-2">
                        {activeSessions.slice(0, 3).map((session) => (
                          <div key={session.id || Math.random().toString()} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{session.user?.fullName || 'Unknown User'}</span>
                            <span className="text-muted-foreground">
                              {session.ipAddress || 'N/A'}
                            </span>
                          </div>
                        ))}
                        {activeSessions.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{activeSessions.length - 3} more sessions
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !Array.isArray(alerts) || alerts.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No alerts found
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.title || 'System Alert'}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.message || 'No description available'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp ? format(new Date(alert.timestamp), 'HH:mm') : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  loading = false
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== 0 && (
              <div className="flex items-center gap-1 mt-1">
                {changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UltimateDashboard;


