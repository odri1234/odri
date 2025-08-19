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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  Banknote, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Yen, 
  IndianRupee,
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity, 
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
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  Building, 
  Network, 
  Zap, 
  Target, 
  Award, 
  Star, 
  Lightbulb, 
  Brain, 
  Cpu, 
  Database, 
  Server, 
  Monitor, 
  Router, 
  Wifi, 
  Signal, 
  Battery, 
  Power, 
  Gauge, 
  Thermometer, 
  HardDrive, 
  MemoryStick,
  Package, 
  Gift, 
  Percent, 
  Calculator, 
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
  Crown,
  Briefcase,
  UserCheck,
  UserX,
  UserPlus,
  QrCode,
  Wallet,
  Building2,
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
  Shuffle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsService as paymentService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { cn } from '@/lib/utils';

// Payment Gateway Status Badge
const GatewayStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active', icon: CheckCircle },
    inactive: { color: 'bg-gray-500', text: 'Inactive', icon: Clock },
    maintenance: { color: 'bg-yellow-500', text: 'Maintenance', icon: AlertTriangle },
    error: { color: 'bg-red-500', text: 'Error', icon: XCircle },
    testing: { color: 'bg-blue-500', text: 'Testing', icon: Settings },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Gateway Type Badge
const GatewayTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    mobile_money: { color: 'bg-green-500', text: 'Mobile Money', icon: Smartphone },
    credit_card: { color: 'bg-blue-500', text: 'Credit Card', icon: CreditCard },
    bank_transfer: { color: 'bg-purple-500', text: 'Bank Transfer', icon: Building },
    cryptocurrency: { color: 'bg-orange-500', text: 'Cryptocurrency', icon: Bitcoin },
    digital_wallet: { color: 'bg-indigo-500', text: 'Digital Wallet', icon: Wallet },
    cash: { color: 'bg-gray-500', text: 'Cash', icon: Banknote },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.credit_card;
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Gateway Card Component
const GatewayCard = ({ gateway, onEdit, onDelete, onToggle, onViewDetails }: { 
  gateway: any; 
  onEdit: (gateway: any) => void; 
  onDelete: (gateway: any) => void; 
  onToggle: (gateway: any) => void;
  onViewDetails: (gateway: any) => void; 
}) => {
  const getGatewayIcon = (name: string) => {
    const iconMap: { [key: string]: any } = {
      'M-PESA': Smartphone,
      'Stripe': CreditCard,
      'PayPal': Wallet,
      'Flutterwave': CreditCard,
      'Razorpay': CreditCard,
      'Square': CreditCard,
      'Bitcoin': Bitcoin,
      'Ethereum': Bitcoin,
      'Bank Transfer': Building,
      'Cash': Banknote,
    };
    return iconMap[name] || CreditCard;
  };

  const Icon = getGatewayIcon(gateway.name);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{gateway.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                {gateway.region || 'Global'}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <GatewayStatusBadge status={gateway.status} />
            <GatewayTypeBadge type={gateway.type} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Success Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-green-500">{gateway.successRate}%</p>
                <Progress value={gateway.successRate} className="flex-1 h-2" />
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Transaction Fee</p>
              <p className="text-xl font-bold">{gateway.transactionFee}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Volume</p>
              <p className="font-semibold">KES {gateway.monthlyVolume?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg. Processing</p>
              <p className="font-semibold">{gateway.avgProcessingTime || 'N/A'}</p>
            </div>
          </div>
          
          {gateway.supportedCurrencies && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-2">Supported Currencies</p>
              <div className="flex flex-wrap gap-1">
                {gateway.supportedCurrencies.slice(0, 4).map((currency: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {currency}
                  </Badge>
                ))}
                {gateway.supportedCurrencies.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{gateway.supportedCurrencies.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Switch
                checked={gateway.status === 'active'}
                onCheckedChange={() => onToggle(gateway)}
              />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(gateway)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(gateway)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(gateway)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Gateway Statistics Component
const GatewayStatistics = ({ gateways }: { gateways: any[] }) => {
  const stats = {
    total: gateways.length,
    active: gateways.filter(g => g.status === 'active').length,
    totalVolume: gateways.reduce((sum, g) => sum + (g.monthlyVolume || 0), 0),
    avgSuccessRate: gateways.reduce((sum, g) => sum + (g.successRate || 0), 0) / gateways.length,
    totalTransactions: gateways.reduce((sum, g) => sum + (g.totalTransactions || 0), 0),
    avgFee: gateways.reduce((sum, g) => sum + (g.transactionFee || 0), 0) / gateways.length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Gateways</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Monthly Volume</p>
              <p className="text-2xl font-bold">KES {stats.totalVolume.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg Success Rate</p>
              <p className="text-2xl font-bold">{stats.avgSuccessRate.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-teal-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Avg Fee</p>
              <p className="text-2xl font-bold">{stats.avgFee.toFixed(2)}%</p>
            </div>
            <Percent className="h-8 w-8 text-indigo-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Gateway Configuration Component
const GatewayConfiguration = ({ gateway, onSave }: { gateway: any; onSave: (config: any) => void }) => {
  const [config, setConfig] = useState({
    name: gateway?.name || '',
    type: gateway?.type || 'credit_card',
    apiKey: gateway?.config?.apiKey || '',
    secretKey: gateway?.config?.secretKey || '',
    webhookUrl: gateway?.config?.webhookUrl || '',
    testMode: gateway?.config?.testMode || false,
    supportedCurrencies: gateway?.supportedCurrencies || ['KES', 'USD'],
    transactionFee: gateway?.transactionFee || 0,
    minimumAmount: gateway?.config?.minimumAmount || 0,
    maximumAmount: gateway?.config?.maximumAmount || 1000000,
    region: gateway?.region || 'Kenya',
    description: gateway?.description || '',
    retryAttempts: gateway?.config?.retryAttempts || 3,
    timeout: gateway?.config?.timeout || 30,
    enableLogging: gateway?.config?.enableLogging || true,
    enableNotifications: gateway?.config?.enableNotifications || true,
  });

  const gatewayTypes = [
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cryptocurrency', label: 'Cryptocurrency' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'cash', label: 'Cash' },
  ];

  const currencies = ['KES', 'USD', 'EUR', 'GBP', 'JPY', 'INR', 'ZAR', 'NGN', 'GHS', 'UGX', 'TZS'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Gateway Configuration
        </CardTitle>
        <CardDescription>
          Configure payment gateway settings and parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Gateway Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., M-PESA, Stripe"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Gateway Type</Label>
              <Select value={config.type} onValueChange={(value) => setConfig(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gatewayTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={config.region}
                onChange={(e) => setConfig(prev => ({ ...prev, region: e.target.value }))}
                placeholder="e.g., Kenya, Global"
              />
            </div>
            
            <div>
              <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
              <Input
                id="transactionFee"
                type="number"
                step="0.01"
                value={config.transactionFee}
                onChange={(e) => setConfig(prev => ({ ...prev, transactionFee: parseFloat(e.target.value) }))}
                placeholder="2.5"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Your API key"
              />
            </div>
            
            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={config.secretKey}
                onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                placeholder="Your secret key"
              />
            </div>
            
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={config.webhookUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://your-domain.com/webhook"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimumAmount">Minimum Amount</Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  value={config.minimumAmount}
                  onChange={(e) => setConfig(prev => ({ ...prev, minimumAmount: parseFloat(e.target.value) }))}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="maximumAmount">Maximum Amount</Label>
                <Input
                  id="maximumAmount"
                  type="number"
                  value={config.maximumAmount}
                  onChange={(e) => setConfig(prev => ({ ...prev, maximumAmount: parseFloat(e.target.value) }))}
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label>Supported Currencies</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {currencies.map((currency) => (
              <div key={currency} className="flex items-center space-x-2">
                <Checkbox
                  id={currency}
                  checked={config.supportedCurrencies.includes(currency)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig(prev => ({
                        ...prev,
                        supportedCurrencies: [...prev.supportedCurrencies, currency]
                      }));
                    } else {
                      setConfig(prev => ({
                        ...prev,
                        supportedCurrencies: prev.supportedCurrencies.filter(c => c !== currency)
                      }));
                    }
                  }}
                />
                <Label htmlFor={currency} className="text-sm">{currency}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description}
            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Gateway description and notes"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="testMode"
              checked={config.testMode}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, testMode: checked }))}
            />
            <Label htmlFor="testMode">Test Mode</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="enableLogging"
              checked={config.enableLogging}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableLogging: checked }))}
            />
            <Label htmlFor="enableLogging">Enable Logging</Label>
          </div>
        </div>

        <Button className="w-full" onClick={() => onSave(config)}>
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Component
export const PaymentGatewayManagement = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock gateways data
  const gateways = [
    {
      id: 1,
      name: 'M-PESA',
      type: 'mobile_money',
      status: 'active',
      region: 'Kenya',
      successRate: 98.5,
      transactionFee: 1.5,
      monthlyVolume: 2500000,
      totalTransactions: 15420,
      avgProcessingTime: '2-5 seconds',
      supportedCurrencies: ['KES'],
      config: {
        apiKey: '***hidden***',
        secretKey: '***hidden***',
        webhookUrl: 'https://api.example.com/mpesa/webhook',
        testMode: false,
        minimumAmount: 10,
        maximumAmount: 300000,
        retryAttempts: 3,
        timeout: 30,
        enableLogging: true,
        enableNotifications: true,
      },
    },
    {
      id: 2,
      name: 'Stripe',
      type: 'credit_card',
      status: 'active',
      region: 'Global',
      successRate: 97.2,
      transactionFee: 2.9,
      monthlyVolume: 1800000,
      totalTransactions: 8950,
      avgProcessingTime: '1-3 seconds',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'KES'],
      config: {
        apiKey: '***hidden***',
        secretKey: '***hidden***',
        webhookUrl: 'https://api.example.com/stripe/webhook',
        testMode: false,
        minimumAmount: 1,
        maximumAmount: 999999,
        retryAttempts: 3,
        timeout: 30,
        enableLogging: true,
        enableNotifications: true,
      },
    },
    {
      id: 3,
      name: 'PayPal',
      type: 'digital_wallet',
      status: 'active',
      region: 'Global',
      successRate: 96.8,
      transactionFee: 3.4,
      monthlyVolume: 950000,
      totalTransactions: 4230,
      avgProcessingTime: '3-7 seconds',
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      config: {
        apiKey: '***hidden***',
        secretKey: '***hidden***',
        webhookUrl: 'https://api.example.com/paypal/webhook',
        testMode: false,
        minimumAmount: 1,
        maximumAmount: 10000,
        retryAttempts: 2,
        timeout: 45,
        enableLogging: true,
        enableNotifications: true,
      },
    },
    {
      id: 4,
      name: 'Flutterwave',
      type: 'credit_card',
      status: 'maintenance',
      region: 'Africa',
      successRate: 95.1,
      transactionFee: 2.8,
      monthlyVolume: 650000,
      totalTransactions: 3120,
      avgProcessingTime: '2-6 seconds',
      supportedCurrencies: ['KES', 'NGN', 'GHS', 'UGX'],
      config: {
        apiKey: '***hidden***',
        secretKey: '***hidden***',
        webhookUrl: 'https://api.example.com/flutterwave/webhook',
        testMode: true,
        minimumAmount: 10,
        maximumAmount: 500000,
        retryAttempts: 3,
        timeout: 30,
        enableLogging: true,
        enableNotifications: true,
      },
    },
    {
      id: 5,
      name: 'Bitcoin',
      type: 'cryptocurrency',
      status: 'testing',
      region: 'Global',
      successRate: 99.1,
      transactionFee: 0.5,
      monthlyVolume: 120000,
      totalTransactions: 89,
      avgProcessingTime: '10-60 minutes',
      supportedCurrencies: ['BTC', 'USD'],
      config: {
        apiKey: '***hidden***',
        secretKey: '***hidden***',
        webhookUrl: 'https://api.example.com/bitcoin/webhook',
        testMode: true,
        minimumAmount: 0.0001,
        maximumAmount: 10,
        retryAttempts: 1,
        timeout: 3600,
        enableLogging: true,
        enableNotifications: true,
      },
    },
  ];

  const filteredGateways = gateways.filter(gateway => {
    const matchesSearch = gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gateway.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || gateway.status === statusFilter;
    const matchesType = !typeFilter || gateway.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateway Management</h1>
          <p className="text-muted-foreground">
            Manage multiple payment gateways, configurations, and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Gateway
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Payment Gateway</DialogTitle>
                <DialogDescription>
                  Configure a new payment gateway for your system
                </DialogDescription>
              </DialogHeader>
              <GatewayConfiguration 
                gateway={null} 
                onSave={(config) => {
                  console.log('Save new gateway:', config);
                  setShowCreateDialog(false);
                  toast({
                    title: "Gateway Added",
                    description: "New payment gateway has been configured successfully.",
                  });
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gateway Statistics */}
      <GatewayStatistics gateways={gateways} />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gateways by name or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                  <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="gateways" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gateways">Gateway Directory</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-6">
          {/* Gateways Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGateways.map((gateway) => (
              <GatewayCard
                key={gateway.id}
                gateway={gateway}
                onEdit={(gateway) => setSelectedGateway(gateway)}
                onDelete={(gateway) => console.log('Delete gateway:', gateway)}
                onToggle={(gateway) => console.log('Toggle gateway:', gateway)}
                onViewDetails={(gateway) => setSelectedGateway(gateway)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {selectedGateway ? (
            <GatewayConfiguration 
              gateway={selectedGateway} 
              onSave={(config) => {
                console.log('Update gateway config:', config);
                toast({
                  title: "Configuration Updated",
                  description: "Gateway configuration has been saved successfully.",
                });
              }} 
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Gateway</h3>
                <p className="text-muted-foreground">
                  Choose a gateway from the directory to configure its settings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Success Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">+2.3%</div>
                <p className="text-sm text-muted-foreground">Improvement this month</p>
                <Progress value={85} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  Volume Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">+18.7%</div>
                <p className="text-sm text-muted-foreground">Monthly volume increase</p>
                <Progress value={75} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Processing Speed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">-15%</div>
                <p className="text-sm text-muted-foreground">Faster processing time</p>
                <Progress value={90} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">98.5%</div>
                <p className="text-sm text-muted-foreground">Overall security rating</p>
                <Progress value={98} className="mt-4" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gateway Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Performance Chart</p>
                    <p className="text-muted-foreground">Gateway performance analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Distribution Chart</p>
                    <p className="text-muted-foreground">Transaction volume by gateway</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest payment transactions across all gateways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-center py-8">
                  Transaction monitoring interface would be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentGatewayManagement;