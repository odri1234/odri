import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { monitoringService as metricsService } from '@/services/api.service';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Wifi,
  Calendar as CalendarIcon,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface MetricData {
  period: string;
  revenue: number;
  users: number;
  sessions: number;
  dataUsage: number;
}

interface RevenueMetric {
  date: string;
  amount: number;
  transactions: number;
}

interface UsageMetric {
  date: string;
  upload: number;
  download: number;
  totalUsers: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const MetricsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [selectedISP, setSelectedISP] = useState('all');

  // Get current user and ISP
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('auth-storage');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData.state.user);
        if (userData.state.user?.ispId) {
          setSelectedISP(userData.state.user.ispId);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch metrics data
  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['metrics', dateRange, selectedISP],
    queryFn: () => metricsService.getMetrics({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      ispId: selectedISP !== 'all' ? selectedISP : undefined
    }),
    enabled: !!user, // Only run query when user is loaded
  });

  // Fetch revenue metrics
  const { data: revenueMetrics, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-metrics', dateRange, selectedISP],
    queryFn: () => metricsService.getRevenueMetrics({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      ispId: selectedISP !== 'all' ? selectedISP : undefined
    }),
    enabled: !!user, // Only run query when user is loaded
  });

  // Fetch usage metrics
  const { data: usageMetrics, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-metrics', dateRange, selectedISP],
    queryFn: () => metricsService.getUsageMetrics({
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      ispId: selectedISP !== 'all' ? selectedISP : undefined
    }),
    enabled: !!user, // Only run query when user is loaded
  });

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
  };

  const exportMetrics = () => {
    // Implementation for exporting metrics
    console.log('Exporting metrics...');
  };

  const refreshData = () => {
    refetchMetrics();
  };

  // Mock data for demonstration
  const mockOverviewData = [
    { name: 'Jan', revenue: 4000, users: 240, sessions: 1200 },
    { name: 'Feb', revenue: 3000, users: 139, sessions: 980 },
    { name: 'Mar', revenue: 2000, users: 980, sessions: 1100 },
    { name: 'Apr', revenue: 2780, users: 390, sessions: 1300 },
    { name: 'May', revenue: 1890, users: 480, sessions: 1400 },
    { name: 'Jun', revenue: 2390, users: 380, sessions: 1250 },
  ];

  const mockUsageData = [
    { name: 'Mon', upload: 120, download: 480 },
    { name: 'Tue', upload: 150, download: 520 },
    { name: 'Wed', upload: 180, download: 600 },
    { name: 'Thu', upload: 200, download: 650 },
    { name: 'Fri', upload: 250, download: 720 },
    { name: 'Sat', upload: 300, download: 800 },
    { name: 'Sun', upload: 280, download: 750 },
  ];

  const mockPieData = [
    { name: 'Basic Plan', value: 400, color: '#0088FE' },
    { name: 'Premium Plan', value: 300, color: '#00C49F' },
    { name: 'Enterprise Plan', value: 200, color: '#FFBB28' },
    { name: 'Student Plan', value: 100, color: '#FF8042' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metrics & Analytics</h1>
          <p className="text-muted-foreground">
            Monitor system performance and business metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportMetrics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range and ISP Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Date Range:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        handleDateRangeChange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">ISP:</label>
              <Select value={selectedISP} onValueChange={setSelectedISP}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ISPs</SelectItem>
                  <SelectItem value="isp1">ISP 1</SelectItem>
                  <SelectItem value="isp2">ISP 2</SelectItem>
                  <SelectItem value="isp3">ISP 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +20.1% from last month
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +180 from last month
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,234</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -19 from last month
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Usage</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573 GB</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +201 GB from last month
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overview Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Users Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={metricsData || mockOverviewData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="totalRevenue" 
                        name="Revenue" 
                        stackId="1" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalUsers" 
                        name="Users" 
                        stackId="1" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>
                  Track revenue trends and payment patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenueLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={revenueMetrics || mockOverviewData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalRevenue" 
                        name="Revenue" 
                        stroke="#8884d8" 
                        strokeWidth={2} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="transactionCount" 
                        name="Transactions" 
                        stroke="#82ca9d" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,345</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$25.50</div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">Success rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Usage Analytics</CardTitle>
                <CardDescription>
                  Monitor bandwidth usage and traffic patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={mockUsageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="upload" fill="#8884d8" name="Upload (GB)" />
                      <Bar dataKey="download" fill="#82ca9d" name="Download (GB)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Data Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2 TB</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Peak Usage Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8-10 PM</div>
                  <p className="text-xs text-muted-foreground">Daily peak</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average per User</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">520 MB</div>
                  <p className="text-xs text-muted-foreground">Per day</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>
                  Track user growth and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} name="Active Users" />
                    <Line type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} name="Sessions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">New Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">234</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,845</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Retention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">30-day retention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avg Session Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.5h</div>
                  <p className="text-xs text-muted-foreground">Per session</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsPage;