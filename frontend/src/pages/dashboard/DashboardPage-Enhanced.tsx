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
import { useDashboardStats, useRealTimeAnalytics } from '@/hooks/api/useAnalytics';
import { useActiveSessions } from '@/hooks/api/useSessions-enhanced';
import { useISPs } from '@/hooks/api/useISPs';
import { useAuth } from '@/store/auth.store';
import TokenDebugger from '@/components/debug/TokenDebugger';
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
  Database
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

const SimplePieChart = ({ data, title }: { data: any[]; title: string }) => (
  <div className="h-[200px] flex items-center justify-center border rounded-lg bg-muted/20">
    <div className="text-center">
      <PieChart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user: currentUser } = useAuth();
  const [selectedISP, setSelectedISP] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');

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
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats({
    ispId: selectedISP !== 'all' ? selectedISP : undefined,
  });

  const { 
    revenue, 
    usage, 
    dashboard: realtimeStats, 
    isLoading: analyticsLoading 
  } = useRealTimeAnalytics({
    startDate,
    endDate,
    ispId: selectedISP !== 'all' ? selectedISP : undefined,
    refreshInterval: 60000, // 1 minute
  });

  const { data: activeSessions, isLoading: sessionsLoading } = useActiveSessions({
    ispId: selectedISP !== 'all' ? selectedISP : undefined,
  });

  const { data: isps } = useISPs();

  // Filter ISPs based on user role
  const availableISPs = useMemo(() => {
    if (!isps || !currentUser) return [];
    
    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return isps;
      case UserRole.ISP:
        return isps.filter(isp => isp.ownerId === currentUser.id);
      default:
        return [];
    }
  }, [isps, currentUser]);

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
    color?: string
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", color?.includes('red') ? 'bg-red-100' : 
                             color?.includes('green') ? 'bg-green-100' : 
                             color?.includes('blue') ? 'bg-blue-100' : 'bg-gray-100')}>
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
      </CardContent>
    </Card>
  );

  if (statsError) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your internet billing system
          </p>
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
          
          {availableISPs.length > 0 && (
            <Select value={selectedISP} onValueChange={setSelectedISP}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ISPs</SelectItem>
                {availableISPs.map(isp => (
                  <SelectItem key={isp.id} value={isp.id}>
                    {isp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
              "Total Users",
              dashboardStats?.totalUsers || 0,
              <Users className="h-6 w-6 text-blue-600" />,
              calculateGrowth(dashboardStats?.totalUsers || 0, dashboardStats?.previousTotalUsers || 0),
              "Registered users",
              "text-blue-600"
            )}
            
            {renderMetricCard(
              "Active Sessions",
              activeSessions?.length || 0,
              <Activity className="h-6 w-6 text-green-600" />,
              undefined,
              "Currently online",
              "text-green-600"
            )}
            
            {renderMetricCard(
              "Total Revenue",
              revenue ? `$${revenue.totalRevenue.toLocaleString()}` : "$0",
              <DollarSign className="h-6 w-6 text-purple-600" />,
              revenue ? calculateGrowth(revenue.totalRevenue, revenue.previousRevenue || 0) : 0,
              `${dateRange} period`,
              "text-purple-600"
            )}
            
            {renderMetricCard(
              "Data Usage",
              usage ? `${(usage.totalDataUsageMB / 1024).toFixed(1)} GB` : "0 GB",
              <Database className="h-6 w-6 text-orange-600" />,
              usage ? calculateGrowth(usage.totalDataUsageMB, usage.previousDataUsage || 0) : 0,
              `${dateRange} period`,
              "text-orange-600"
            )}
          </>
        )}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Status</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
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
              <span className="text-sm">MikroTik Routers</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                2 Offline
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disk Usage</span>
                <span>38%</span>
              </div>
              <Progress value={38} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Network I/O</span>
                <span>23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link to="/users/create">
                <Plus className="h-4 w-4 mr-2" />
                Add New User
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/plans">
                <Eye className="h-4 w-4 mr-2" />
                View Plans
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/payments">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payments
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/reports">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
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
                <CardTitle>Revenue by ISP</CardTitle>
                <CardDescription>
                  Revenue distribution across ISPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimplePieChart 
                  data={revenue?.revenueByISP || []} 
                  title="Revenue Distribution"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>
                  Users by role and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={dashboardStats?.userDistribution || []} 
                  title="User Distribution"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Usage Trend</CardTitle>
                <CardDescription>
                  Data consumption over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={usage?.dailyUsage || []} 
                  title="Daily Usage Chart"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage by Plan</CardTitle>
                <CardDescription>
                  Data usage distribution by plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={usage?.usageByPlan || []} 
                  title="Usage by Plan"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeSessions?.slice(0, 10).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{session.username}</p>
                          <p className="text-xs text-muted-foreground">{session.ipAddress}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <Activity className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Statistics</CardTitle>
                <CardDescription>
                  Session metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={dashboardStats?.sessionStats || []} 
                  title="Session Statistics"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest system activities and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'user', message: 'New user registered: john@example.com', time: '2 minutes ago' },
              { type: 'payment', message: 'Payment received: $29.99 from user123', time: '5 minutes ago' },
              { type: 'session', message: 'User session started: 192.168.1.100', time: '8 minutes ago' },
              { type: 'system', message: 'Router connection restored: MikroTik-001', time: '15 minutes ago' },
              { type: 'voucher', message: 'Voucher redeemed: VOUCHER123', time: '22 minutes ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className={cn("p-2 rounded-full", 
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'payment' ? 'bg-green-100' :
                  activity.type === 'session' ? 'bg-purple-100' :
                  activity.type === 'system' ? 'bg-orange-100' : 'bg-gray-100'
                )}>
                  {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                  {activity.type === 'session' && <Activity className="h-4 w-4 text-purple-600" />}
                  {activity.type === 'system' && <Server className="h-4 w-4 text-orange-600" />}
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

      {/* Add Token Debugger in Development Mode */}
      {import.meta.env.DEV && (
        <Card className="col-span-full mt-8">
          <CardHeader>
            <CardTitle>Authentication Debugger</CardTitle>
            <CardDescription>
              Troubleshoot authentication issues (only visible in development mode)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TokenDebugger />
          </CardContent>
        </Card>
      )}
    </div>
  );
}