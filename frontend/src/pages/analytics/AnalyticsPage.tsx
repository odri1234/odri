import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyticsService } from '@/services/api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Wifi,
  Clock,
  Globe,
  Target
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Calculate date range based on period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
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

  // Fetch analytics data
  const { data: revenueData, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery({
    queryKey: ['analytics', 'revenue', period],
    queryFn: () => analyticsService.getRevenueSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    refetchOnWindowFocus: false,
  });

  const { data: usageData, isLoading: usageLoading, refetch: refetchUsage } = useQuery({
    queryKey: ['analytics', 'usage', period],
    queryFn: () => analyticsService.getUsageSummary({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
    refetchOnWindowFocus: false,
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['analytics', 'reports', period],
    queryFn: () => analyticsService.generateReport({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: 'comprehensive',
    }),
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    refetchRevenue();
    refetchUsage();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
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

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      default:
        return 'Last 30 days';
    }
  };

  const canViewAnalytics = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN].includes(user.role);
  };

  if (!canViewAnalytics()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view analytics data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
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
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueLoading ? '...' : formatCurrency(revenueData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueData?.growthRate ? (
                <span className={revenueData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(revenueData.growthRate)} from last period
                </span>
              ) : (
                'No previous data'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
            <Wifi className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageLoading ? '...' : formatBytes((usageData?.totalDataUsageMB || 0) * 1024 * 1024)}
            </div>
            <p className="text-xs text-muted-foreground">
              {usageData?.sessionCount || 0} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageLoading ? '...' : formatDuration(usageData?.averageSessionDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per session average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Usage Time</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageLoading ? '...' : usageData?.peakUsageTime || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Highest activity period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>
                  Financial performance for {getPeriodLabel(period)}
                </CardDescription>
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
                      <span>Daily Average</span>
                      <span className="font-semibold">
                        {formatCurrency(revenueData?.dailyAverageRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth Rate</span>
                      <span className={`font-semibold ${
                        (revenueData?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(revenueData?.growthRate || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Summary</CardTitle>
                <CardDescription>
                  Network usage statistics for {getPeriodLabel(period)}
                </CardDescription>
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
                      <span>Avg Usage/User</span>
                      <span className="font-semibold">
                        {formatBytes((usageData?.averageUsagePerUserMB || 0) * 1024 * 1024)}
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

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Detailed revenue analysis and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(revenueData?.totalRevenue || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {revenueData?.transactionCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Transactions</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(revenueData?.averageRevenuePerUser || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Revenue/User</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Growth Analysis</h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Growth Rate: {formatPercentage(revenueData?.growthRate || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        Daily Average: {formatCurrency(revenueData?.dailyAverageRevenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Network usage patterns and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatBytes((usageData?.totalDataUsageMB || 0) * 1024 * 1024)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Data Usage</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {usageData?.sessionCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Sessions</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatDuration(usageData?.averageSessionDuration || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Session Duration</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Usage Patterns</h4>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">
                        Peak Usage Time: {usageData?.peakUsageTime || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        Avg Usage/User: {formatBytes((usageData?.averageUsagePerUserMB || 0) * 1024 * 1024)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;