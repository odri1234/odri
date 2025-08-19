import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDashboardStats, useRealTimeAnalytics } from '@/hooks/api/useAnalytics';
import { useActiveSessions } from '@/hooks/api/useSessions-enhanced';
import { useISPs } from '@/hooks/api/useISPs';
import { useMikroTikRouters, useRouterStatus } from '@/hooks/api/useMikroTik';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
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
  WifiOff
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

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

export default function ISPDashboardPage() {
  const { ispId } = useParams<{ ispId: string }>();
  const { user: currentUser } = useAuth();
  const [dateRange, setDateRange] = useState<string>('7d');
  const [selectedRouter, setSelectedRouter] = useState<string>('all');

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const end = endOfDay(new Date());
    let start: Date;

    switch (dateRange) {
      case '1d':
        start = startOfDay(new Date());
        break;
      case '7d':
        start = startOfDay(subDays(new Date(), 7));
        break;
      case '30d':
        start = startOfDay(subDays(new Date(), 30));
        break;
      case '90d':
        start = startOfDay(subDays(new Date(), 90));
        break;
      default:
        start = startOfDay(subDays(new Date(), 7));
    }

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
  }, [dateRange]);

  // API Hooks
  const { data: isps } = useISPs();
  const currentISP = isps?.find(isp => isp.id === ispId);

  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats({
    ispId: ispId,
  });

  const { 
    revenue, 
    usage, 
    dashboard: realtimeStats, 
    isLoading: analyticsLoading 
  } = useRealTimeAnalytics({
    startDate,
    endDate,
    ispId: ispId,
    refreshInterval: 60000, // 1 minute
  });

  const { data: activeSessions, isLoading: sessionsLoading } = useActiveSessions({
    ispId: ispId,
  });

  const { data: routers, isLoading: routersLoading } = useMikroTikRouters({
    ispId: ispId,
  });

  // Get router status for each router
  const routerStatuses = routers?.map(router => {
    const { data: status } = useRouterStatus(router.id);
    return { ...router, status };
  }) || [];

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
    variant?: "default" | "primary" | "secondary" | "accent" | "success" | "gradient"
  ) => (
    <DashboardCard
      variant={variant || "gradient"}
      title={title}
      icon={icon}
      description={description}
      footer={growth !== undefined && (
        <div className="flex items-center">
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
    >
      <p className={cn("text-3xl font-bold", color)}>{value}</p>
    </DashboardCard>
  );

  // Render router status
  const renderRouterStatus = (router: any) => {
    const isOnline = router.status?.isOnline ?? false;
    const lastSeen = router.status?.lastSeen;
    
    return (
      <DashboardCard
        variant={isOnline ? "success" : "default"}
        className="hover:border-primary/30 transition-all duration-300"
        title={router.name}
        icon={isOnline ? (
          <Router className="h-5 w-5 text-green-600" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-600" />
        )}
        description={
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{router.ipAddress}</p>
            {router.location && (
              <p className="text-xs text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {router.location}
              </p>
            )}
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <Badge variant={isOnline ? "success" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {lastSeen && (
            <p className="text-xs text-muted-foreground">
              Last seen: {format(new Date(lastSeen), 'MMM dd, HH:mm')}
            </p>
          )}
        </div>
      </DashboardCard>
    );
  };

  if (statsError) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load ISP dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentISP) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ISP not found or you don't have permission to view this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={currentISP.logo} alt={currentISP.name} />
            <AvatarFallback>
              {currentISP.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{currentISP.name}</h1>
            <p className="text-muted-foreground">
              ISP Dashboard - {currentISP.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          
          <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary hover:border-primary/30">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="gradient" asChild>
            <Link to={`/isps/${ispId}/routers/create`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Router
            </Link>
          </Button>
        </div>
      </div>

      {/* ISP Info Card */}
      <DashboardCard
        variant="gradient"
        title={
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            ISP Information
          </div>
        }
        description="Overview of ISP configuration and status"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
            <Badge variant={currentISP.isActive ? "success" : "destructive"} className="mt-1">
              {currentISP.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Tier</h3>
            <p className="mt-1 capitalize font-medium">{currentISP.tier}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Max Clients</h3>
            <p className="mt-1 font-medium">{currentISP.maxClients?.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Current Clients</h3>
            <p className="mt-1 font-medium">{currentISP.currentClients?.toLocaleString()}</p>
          </div>
        </div>
      </DashboardCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <DashboardCard key={i} variant="gradient">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </DashboardCard>
          ))
        ) : (
          <>
            {renderMetricCard(
              "Total Users",
              dashboardStats?.totalUsers || 0,
              <Users className="h-6 w-6 text-blue-600" />,
              calculateGrowth(dashboardStats?.totalUsers || 0, dashboardStats?.previousTotalUsers || 0),
              "Registered users",
              "text-blue-600",
              "primary"
            )}
            
            {renderMetricCard(
              "Active Sessions",
              activeSessions?.length || 0,
              <Activity className="h-6 w-6 text-green-600" />,
              undefined,
              "Currently online",
              "text-green-600",
              "success"
            )}
            
            {renderMetricCard(
              "Monthly Revenue",
              revenue ? `$${revenue.totalRevenue.toLocaleString()}` : "$0",
              <DollarSign className="h-6 w-6 text-purple-600" />,
              revenue ? calculateGrowth(revenue.totalRevenue, revenue.previousRevenue || 0) : 0,
              `${dateRange} period`,
              "text-purple-600",
              "accent"
            )}
            
            {renderMetricCard(
              "Active Routers",
              routerStatuses.filter(r => r.status?.isOnline).length,
              <Router className="h-6 w-6 text-orange-600" />,
              undefined,
              `${routerStatuses.length} total`,
              "text-orange-600",
              "secondary"
            )}
          </>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routers">Routers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Network Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Router Connectivity</span>
                  <Badge className={cn(
                    routerStatuses.filter(r => r.status?.isOnline).length === routerStatuses.length
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  )}>
                    {routerStatuses.filter(r => r.status?.isOnline).length}/{routerStatuses.length} Online
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
                  <span className="text-sm">Client Capacity</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {((currentISP.currentClients || 0) / (currentISP.maxClients || 1) * 100).toFixed(1)}%
                    </div>
                    <Progress 
                      value={(currentISP.currentClients || 0) / (currentISP.maxClients || 1) * 100} 
                      className="w-20 h-2 mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <Link to={`/isps/${ispId}/users/create`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/isps/${ispId}/routers`}>
                    <Router className="h-4 w-4 mr-2" />
                    Manage Routers
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/isps/${ispId}/plans`}>
                    <Wifi className="h-4 w-4 mr-2" />
                    View Plans
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/isps/${ispId}/payments`}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Payments
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to={`/isps/${ispId}/reports`}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'user', message: 'New user registered: john@example.com', time: '2 minutes ago' },
                  { type: 'payment', message: 'Payment received: $29.99 from user123', time: '5 minutes ago' },
                  { type: 'session', message: 'User session started: 192.168.1.100', time: '8 minutes ago' },
                  { type: 'router', message: 'Router connection restored: MikroTik-001', time: '15 minutes ago' },
                  { type: 'voucher', message: 'Voucher redeemed: VOUCHER123', time: '22 minutes ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={cn("p-2 rounded-full", 
                      activity.type === 'user' ? 'bg-blue-100' :
                      activity.type === 'payment' ? 'bg-green-100' :
                      activity.type === 'session' ? 'bg-purple-100' :
                      activity.type === 'router' ? 'bg-orange-100' : 'bg-gray-100'
                    )}>
                      {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                      {activity.type === 'session' && <Activity className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'router' && <Router className="h-4 w-4 text-orange-600" />}
                      {activity.type === 'voucher' && <Zap className="h-4 w-4 text-gray-600" />}
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

        <TabsContent value="routers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">MikroTik Routers</h3>
            <Button asChild>
              <Link to={`/isps/${ispId}/routers/create`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Router
              </Link>
            </Button>
          </div>

          {routersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : routerStatuses.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Router className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Routers Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first MikroTik router to start managing your network.
                  </p>
                  <Button asChild>
                    <Link to={`/isps/${ispId}/routers/create`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Router
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {routerStatuses.map((router) => renderRouterStatus(router))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Revenue over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={revenue?.dailyRevenue || []} 
                  title="Daily Revenue Chart"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={dashboardStats?.userGrowth || []} 
                  title="User Growth Chart"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Usage</CardTitle>
                <CardDescription>
                  Data consumption by plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={usage?.usageByPlan || []} 
                  title="Usage by Plan"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Router Performance</CardTitle>
                <CardDescription>
                  Router uptime and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={routerStatuses || []} 
                  title="Router Status"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Currently active user sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : activeSessions?.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active sessions</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Router</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Data Usage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions?.slice(0, 10).map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.username}</TableCell>
                        <TableCell>{session.ipAddress}</TableCell>
                        <TableCell>{session.routerName || 'Unknown'}</TableCell>
                        <TableCell>{session.duration || '0m'}</TableCell>
                        <TableCell>{session.dataUsage || '0 MB'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <Activity className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}