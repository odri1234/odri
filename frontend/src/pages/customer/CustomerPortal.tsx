import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Wifi, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart,
  Settings, 
  Edit, 
  Eye, 
  Plus, 
  RefreshCw, 
  Download, 
  Upload, 
  Search, 
  Filter,
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Target, 
  Award, 
  Star, 
  Gift, 
  Percent, 
  Receipt, 
  FileText, 
  Folder, 
  Archive, 
  Tag, 
  Hash, 
  AtSign, 
  ExternalLink, 
  Copy, 
  Share, 
  Bookmark, 
  Flag,
  Bell,
  MessageSquare,
  Headphones,
  LifeBuoy,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Banknote,
  QrCode,
  Building,
  Home,
  MapIcon,
  Truck,
  ShoppingCart,
  PiggyBank,
  TrendingUpIcon,
  Layers,
  Grid,
  List,
  Table,
  Columns,
  Rows,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Minus,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Focus,
  Scan,
  Camera,
  Webcam,
  Mic,
  MicOff,
  Volume,
  Volume1,
  Volume2,
  VolumeOff,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  Shuffle,
  Image,
  Video,
  Music,
  File,
  Paperclip,
  Tablet,
  Laptop,
  Monitor,
  Power,
  PowerOff,
  Battery,
  Lock,
  Unlock,
  Key,
  Shield,
  Network,
  Router,
  Server,
  Database,
  HardDrive,
  MemoryStick,
  Cpu,
  Gauge,
  Thermometer,
  Signal,
  Zap,
  Lightbulb,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usersService as userService, paymentsService as paymentService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

// Account Balance Component
const AccountBalance = () => {
  const [balance, setBalance] = useState({
    current: 1250.50,
    lastTopUp: 500,
    lastTopUpDate: new Date(Date.now() - 86400000 * 2),
    expiryDate: new Date(Date.now() + 86400000 * 15),
    autoRenewal: true,
  });

  const daysUntilExpiry = Math.ceil((balance.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Account Balance
        </CardTitle>
        <CardDescription className="text-green-100">
          Your current account status and balance
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-4">
          <div>
            <p className="text-green-100 text-sm">Current Balance</p>
            <p className="text-4xl font-bold">KES {balance.current.toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-green-100">Last Top-up</p>
              <p className="font-semibold">KES {balance.lastTopUp}</p>
              <p className="text-xs text-green-200">{balance.lastTopUpDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-green-100">Expires in</p>
              <p className="font-semibold">{daysUntilExpiry} days</p>
              <p className="text-xs text-green-200">{balance.expiryDate.toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-green-400">
            <div className="flex items-center gap-2">
              <Switch checked={balance.autoRenewal} />
              <span className="text-sm">Auto-renewal</span>
            </div>
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Top Up
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Usage Statistics Component
const UsageStatistics = () => {
  const [usage, setUsage] = useState({
    dataUsed: 45.2, // GB
    dataLimit: 100, // GB
    timeUsed: 156, // hours
    timeLimit: 720, // hours (30 days)
    sessionsToday: 8,
    avgSessionDuration: '2h 15m',
    peakUsageTime: '8:00 PM - 10:00 PM',
    devicesConnected: 3,
  });

  const dataUsagePercent = (usage.dataUsed / usage.dataLimit) * 100;
  const timeUsagePercent = (usage.timeUsed / usage.timeLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-500" />
          Usage Statistics
        </CardTitle>
        <CardDescription>
          Your internet usage and activity overview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Data Usage</span>
              <span className="text-sm text-muted-foreground">
                {usage.dataUsed} GB / {usage.dataLimit} GB
              </span>
            </div>
            <Progress value={dataUsagePercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {(usage.dataLimit - usage.dataUsed).toFixed(1)} GB remaining
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Time Usage</span>
              <span className="text-sm text-muted-foreground">
                {usage.timeUsed}h / {usage.timeLimit}h
              </span>
            </div>
            <Progress value={timeUsagePercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {usage.timeLimit - usage.timeUsed} hours remaining
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{usage.sessionsToday}</p>
              <p className="text-xs text-muted-foreground">Sessions Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{usage.devicesConnected}</p>
              <p className="text-xs text-muted-foreground">Connected Devices</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg. Session Duration</span>
              <span className="font-medium">{usage.avgSessionDuration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Peak Usage Time</span>
              <span className="font-medium">{usage.peakUsageTime}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const { toast } = useToast();

  const actions = [
    {
      title: 'Top Up Account',
      description: 'Add credit to your account',
      icon: Plus,
      color: 'bg-green-500',
      action: () => toast({ title: "Top Up", description: "Redirecting to payment..." }),
    },
    {
      title: 'Change Password',
      description: 'Update your account password',
      icon: Lock,
      color: 'bg-blue-500',
      action: () => toast({ title: "Password", description: "Opening password change form..." }),
    },
    {
      title: 'Download Usage Report',
      description: 'Get detailed usage statistics',
      icon: Download,
      color: 'bg-purple-500',
      action: () => toast({ title: "Report", description: "Generating usage report..." }),
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: Headphones,
      color: 'bg-orange-500',
      action: () => toast({ title: "Support", description: "Opening support chat..." }),
    },
    {
      title: 'Manage Devices',
      description: 'View and manage connected devices',
      icon: Smartphone,
      color: 'bg-indigo-500',
      action: () => toast({ title: "Devices", description: "Opening device management..." }),
    },
    {
      title: 'Refer Friends',
      description: 'Earn rewards by referring friends',
      icon: Gift,
      color: 'bg-pink-500',
      action: () => toast({ title: "Referral", description: "Opening referral program..." }),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Frequently used actions and services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start hover:shadow-md transition-all"
                onClick={action.action}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={cn("p-2 rounded-lg", action.color)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Payment History Component
const PaymentHistory = () => {
  const payments = [
    {
      id: 1,
      amount: 500,
      method: 'M-PESA',
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 2),
      reference: 'MP240315001',
    },
    {
      id: 2,
      amount: 1000,
      method: 'Credit Card',
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 15),
      reference: 'CC240301002',
    },
    {
      id: 3,
      amount: 250,
      method: 'M-PESA',
      status: 'failed',
      date: new Date(Date.now() - 86400000 * 20),
      reference: 'MP240228003',
    },
    {
      id: 4,
      amount: 750,
      method: 'Bank Transfer',
      status: 'completed',
      date: new Date(Date.now() - 86400000 * 30),
      reference: 'BT240215004',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'M-PESA':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'Credit Card':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'Bank Transfer':
        return <Building className="h-4 w-4 text-purple-500" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-green-500" />
          Payment History
        </CardTitle>
        <CardDescription>
          Your recent payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getPaymentIcon(payment.method)}
                  <div>
                    <p className="font-medium">KES {payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{payment.method}</p>
                    <p className="text-xs text-muted-foreground">{payment.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(payment.status)}
                  <p className="text-xs text-muted-foreground mt-1">
                    {payment.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Button className="w-full mt-4" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View All Transactions
        </Button>
      </CardContent>
    </Card>
  );
};

// Connected Devices Component
const ConnectedDevices = () => {
  const devices = [
    {
      id: 1,
      name: 'iPhone 13',
      type: 'smartphone',
      mac: '00:1B:44:11:3A:B7',
      ip: '192.168.1.101',
      connected: true,
      lastSeen: new Date(),
      dataUsed: 2.4, // GB
    },
    {
      id: 2,
      name: 'MacBook Pro',
      type: 'laptop',
      mac: '00:1B:44:11:3A:B8',
      ip: '192.168.1.102',
      connected: true,
      lastSeen: new Date(Date.now() - 300000),
      dataUsed: 15.8,
    },
    {
      id: 3,
      name: 'Samsung TV',
      type: 'tv',
      mac: '00:1B:44:11:3A:B9',
      ip: '192.168.1.103',
      connected: false,
      lastSeen: new Date(Date.now() - 3600000),
      dataUsed: 8.2,
    },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return <Smartphone className="h-5 w-5 text-blue-500" />;
      case 'laptop':
        return <Laptop className="h-5 w-5 text-green-500" />;
      case 'tablet':
        return <Tablet className="h-5 w-5 text-purple-500" />;
      case 'tv':
        return <Monitor className="h-5 w-5 text-orange-500" />;
      default:
        return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-6 w-6 text-blue-500" />
          Connected Devices
        </CardTitle>
        <CardDescription>
          Manage your connected devices and data usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getDeviceIcon(device.type)}
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-muted-foreground">{device.ip}</p>
                  <p className="text-xs text-muted-foreground">{device.mac}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={device.connected ? "bg-green-500" : "bg-gray-500"}>
                  {device.connected ? "Connected" : "Offline"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {device.dataUsed} GB used
                </p>
                <p className="text-xs text-muted-foreground">
                  {device.connected ? "Now" : device.lastSeen.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage Devices
        </Button>
      </CardContent>
    </Card>
  );
};

// Support Tickets Component
const SupportTickets = () => {
  const tickets = [
    {
      id: 1,
      title: 'Slow internet speed',
      status: 'open',
      priority: 'medium',
      created: new Date(Date.now() - 86400000),
      lastUpdate: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      title: 'Payment not reflected',
      status: 'resolved',
      priority: 'high',
      created: new Date(Date.now() - 86400000 * 3),
      lastUpdate: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: 3,
      title: 'WiFi password reset',
      status: 'closed',
      priority: 'low',
      created: new Date(Date.now() - 86400000 * 7),
      lastUpdate: new Date(Date.now() - 86400000 * 6),
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500">Open</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-500">Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 text-orange-500" />
          Support Tickets
        </CardTitle>
        <CardDescription>
          Your support requests and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{ticket.title}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {ticket.created.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last update: {ticket.lastUpdate.toLocaleDateString()}
                </p>
              </div>
              <div className="text-right space-y-1">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Create New Ticket
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Component
export const CustomerPortal = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Customer Portal
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user?.name}! Manage your account and services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download App
          </Button>
        </div>
      </div>

      {/* Account Balance */}
      <AccountBalance />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsageStatistics />
            <QuickActions />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentHistory />
            <ConnectedDevices />
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsageStatistics />
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Detailed usage patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Usage Chart</p>
                    <p className="text-muted-foreground">Detailed usage analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PaymentHistory />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">M-PESA</p>
                      <p className="text-sm text-muted-foreground">+254 7XX XXX XXX</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Primary</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Visa Card</p>
                      <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
                
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <ConnectedDevices />
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SupportTickets />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  Live Chat Support
                </CardTitle>
                <CardDescription>
                  Get instant help from our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    Our support team is available 24/7 to assist you
                  </p>
                  <div className="space-y-2">
                    <Button className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Live Chat
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Support
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-500" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.name}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phone Number</span>
                    <span className="text-sm font-medium">+254 7XX XXX XXX</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Type</span>
                    <Badge variant="secondary">Premium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Since</span>
                    <span className="text-sm font-medium">January 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Two-Factor Auth</span>
                    <Switch checked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-gray-500" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Configure your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Notifications</span>
                    <Switch checked={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-renewal</span>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usage Alerts</span>
                    <Switch checked={true} />
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Data
                  </Button>
                  <Button variant="destructive" className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Close Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerPortal;