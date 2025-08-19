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
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Zap,
  Shield,
  Globe,
  Wallet,
  Bitcoin,
  Banknote,
  QrCode,
  Receipt,
  BarChart3,
  PieChart,
  Target,
  Award,
  Users,
  Calendar,
  Filter,
  Download,
  Upload,
  Bell,
  Lock,
  Key,
  Server,
  Database,
  Cloud,
  Network,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsService as paymentService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

// Payment Gateway Status Component
const PaymentGatewayStatus = ({ gateway }: { gateway: any }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active', icon: CheckCircle },
    inactive: { color: 'bg-gray-500', text: 'Inactive', icon: Clock },
    error: { color: 'bg-red-500', text: 'Error', icon: AlertTriangle },
    testing: { color: 'bg-yellow-500', text: 'Testing', icon: Settings },
  };

  const config = statusConfig[gateway.status as keyof typeof statusConfig] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ method, stats }: { method: any; stats: any }) => {
  const methodIcons = {
    mpesa: Smartphone,
    card: CreditCard,
    paypal: Globe,
    stripe: CreditCard,
    flutterwave: Wallet,
    crypto: Bitcoin,
    bank: Banknote,
    voucher: QrCode,
  };

  const Icon = methodIcons[method.type as keyof typeof methodIcons] || CreditCard;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", method.color || "bg-blue-500")}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{method.name}</CardTitle>
              <CardDescription>{method.description}</CardDescription>
            </div>
          </div>
          <PaymentGatewayStatus gateway={method} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Transactions</p>
              <p className="text-xl font-bold">{stats?.transactions || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Success Rate</p>
              <p className="text-xl font-bold text-green-500">{stats?.successRate || 0}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Volume</p>
              <p className="text-xl font-bold">KES {stats?.volume || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fees</p>
              <p className="text-xl font-bold">KES {stats?.fees || 0}</p>
            </div>
          </div>
          
          <Progress value={stats?.successRate || 0} className="h-2" />
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Config
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Real-time Payment Stats Component
const RealTimePaymentStats = () => {
  const [stats, setStats] = useState({
    todayTransactions: 0,
    todayVolume: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        todayTransactions: prev.todayTransactions + Math.floor(Math.random() * 5),
        todayVolume: prev.todayVolume + Math.floor(Math.random() * 1000),
        pendingPayments: Math.max(0, prev.pendingPayments + Math.floor(Math.random() * 3) - 1),
        failedPayments: Math.max(0, prev.failedPayments + Math.floor(Math.random() * 2) - 1),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Transactions</p>
              <p className="text-2xl font-bold">{stats.todayTransactions.toLocaleString()}</p>
            </div>
            <Receipt className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Volume</p>
              <p className="text-2xl font-bold">KES {stats.todayVolume.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingPayments}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Failed</p>
              <p className="text-2xl font-bold">{stats.failedPayments}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Payment Gateway Configuration Component
const PaymentGatewayConfig = ({ gateway, onUpdate }: { gateway: any; onUpdate: () => void }) => {
  const [config, setConfig] = useState({
    apiKey: gateway.config?.apiKey || '',
    secretKey: gateway.config?.secretKey || '',
    webhookUrl: gateway.config?.webhookUrl || '',
    testMode: gateway.config?.testMode || false,
    autoRetry: gateway.config?.autoRetry || true,
    maxRetries: gateway.config?.maxRetries || 3,
    timeout: gateway.config?.timeout || 30,
    feePercentage: gateway.config?.feePercentage || 0,
    fixedFee: gateway.config?.fixedFee || 0,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {gateway.name} Configuration
        </CardTitle>
        <CardDescription>
          Configure settings for {gateway.name} payment gateway
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter API key"
            />
          </div>
          <div>
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={config.secretKey}
              onChange={(e) => setConfig(prev => ({ ...prev, secretKey: e.target.value }))}
              placeholder="Enter secret key"
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
          <div>
            <Label htmlFor="timeout">Timeout (seconds)</Label>
            <Input
              id="timeout"
              type="number"
              value={config.timeout}
              onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="feePercentage">Fee Percentage (%)</Label>
            <Input
              id="feePercentage"
              type="number"
              step="0.01"
              value={config.feePercentage}
              onChange={(e) => setConfig(prev => ({ ...prev, feePercentage: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="fixedFee">Fixed Fee (KES)</Label>
            <Input
              id="fixedFee"
              type="number"
              value={config.fixedFee}
              onChange={(e) => setConfig(prev => ({ ...prev, fixedFee: parseFloat(e.target.value) }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="testMode">Test Mode</Label>
              <p className="text-sm text-muted-foreground">Enable test mode for development</p>
            </div>
            <Switch
              id="testMode"
              checked={config.testMode}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, testMode: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoRetry">Auto Retry</Label>
              <p className="text-sm text-muted-foreground">Automatically retry failed payments</p>
            </div>
            <Switch
              id="autoRetry"
              checked={config.autoRetry}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoRetry: checked }))}
            />
          </div>

          {config.autoRetry && (
            <div>
              <Label htmlFor="maxRetries">Max Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                value={config.maxRetries}
                onChange={(e) => setConfig(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
                min="1"
                max="10"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button className="flex-1">
            Save Configuration
          </Button>
          <Button variant="outline">
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Split Payment Configuration Component
const SplitPaymentConfig = () => {
  const [splitRules, setSplitRules] = useState([
    { id: 1, name: 'Platform Fee', percentage: 5, type: 'platform' },
    { id: 2, name: 'ISP Revenue', percentage: 90, type: 'isp' },
    { id: 3, name: 'Reseller Commission', percentage: 5, type: 'reseller' },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Split Payment Rules
        </CardTitle>
        <CardDescription>
          Configure how payments are split between different parties
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {splitRules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium">{rule.name}</p>
                <p className="text-sm text-muted-foreground">{rule.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={rule.percentage}
                onChange={(e) => {
                  const newRules = splitRules.map(r => 
                    r.id === rule.id ? { ...r, percentage: parseInt(e.target.value) } : r
                  );
                  setSplitRules(newRules);
                }}
                className="w-20"
                min="0"
                max="100"
              />
              <span className="text-sm">%</span>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">
              Total: {splitRules.reduce((sum, rule) => sum + rule.percentage, 0)}%
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
            <Button size="sm">
              Save Rules
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export const AdvancedPaymentGateway = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedGateway, setSelectedGateway] = useState<any>(null);

  // Mock payment gateways data
  const paymentGateways = [
    {
      id: 1,
      name: 'M-PESA',
      type: 'mpesa',
      description: 'Mobile money payments',
      status: 'active',
      color: 'bg-green-500',
      stats: { transactions: 1250, successRate: 98.5, volume: 125000, fees: 2500 }
    },
    {
      id: 2,
      name: 'Stripe',
      type: 'card',
      description: 'Credit/Debit card payments',
      status: 'active',
      color: 'bg-purple-500',
      stats: { transactions: 850, successRate: 96.2, volume: 85000, fees: 2125 }
    },
    {
      id: 3,
      name: 'PayPal',
      type: 'paypal',
      description: 'PayPal payments',
      status: 'active',
      color: 'bg-blue-500',
      stats: { transactions: 420, successRate: 94.8, volume: 42000, fees: 1260 }
    },
    {
      id: 4,
      name: 'Flutterwave',
      type: 'flutterwave',
      description: 'African payment gateway',
      status: 'testing',
      color: 'bg-orange-500',
      stats: { transactions: 180, successRate: 92.1, volume: 18000, fees: 540 }
    },
    {
      id: 5,
      name: 'Crypto Payments',
      type: 'crypto',
      description: 'Bitcoin, Ethereum, etc.',
      status: 'inactive',
      color: 'bg-yellow-500',
      stats: { transactions: 25, successRate: 100, volume: 15000, fees: 150 }
    },
    {
      id: 6,
      name: 'Bank Transfer',
      type: 'bank',
      description: 'Direct bank transfers',
      status: 'active',
      color: 'bg-indigo-500',
      stats: { transactions: 320, successRate: 99.1, volume: 64000, fees: 320 }
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Payment Gateway</h1>
          <p className="text-muted-foreground">
            Manage multiple payment gateways with advanced features and analytics
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Gateway
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <RealTimePaymentStats />

      {/* Payment Gateways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentGateways.map((gateway) => (
          <PaymentMethodCard
            key={gateway.id}
            method={gateway}
            stats={gateway.stats}
          />
        ))}
      </div>

      {/* Advanced Features */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="split">Split Payments</TabsTrigger>
          <TabsTrigger value="retry">Auto Retry</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">KES 349,680</div>
                <p className="text-sm text-muted-foreground">+12.5% from last month</p>
                <Progress value={75} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">96.8%</div>
                <p className="text-sm text-muted-foreground">+2.1% from last month</p>
                <Progress value={97} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Gateways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5/6</div>
                <p className="text-sm text-muted-foreground">1 gateway in testing</p>
                <Progress value={83} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">KES 6,895</div>
                <p className="text-sm text-muted-foreground">1.97% of volume</p>
                <Progress value={20} className="mt-4" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentGateways.filter(g => g.status === 'active').map((gateway) => (
                    <div key={gateway.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", gateway.color)} />
                        <span className="font-medium">{gateway.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{gateway.stats.transactions}</div>
                        <div className="text-xs text-muted-foreground">
                          {((gateway.stats.transactions / 3045) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 'TXN001', amount: 1500, method: 'M-PESA', status: 'success', time: '2 min ago' },
                    { id: 'TXN002', amount: 2500, method: 'Stripe', status: 'success', time: '5 min ago' },
                    { id: 'TXN003', amount: 800, method: 'PayPal', status: 'pending', time: '8 min ago' },
                    { id: 'TXN004', amount: 1200, method: 'Bank', status: 'success', time: '12 min ago' },
                    { id: 'TXN005', amount: 3000, method: 'M-PESA', status: 'failed', time: '15 min ago' },
                  ].map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{txn.id}</p>
                        <p className="text-sm text-muted-foreground">{txn.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KES {txn.amount}</p>
                        <Badge variant={txn.status === 'success' ? 'default' : txn.status === 'pending' ? 'secondary' : 'destructive'}>
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="split">
          <SplitPaymentConfig />
        </TabsContent>

        <TabsContent value="retry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Auto Retry Configuration
              </CardTitle>
              <CardDescription>
                Configure automatic retry settings for failed payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxRetries">Maximum Retries</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 retry</SelectItem>
                      <SelectItem value="2">2 retries</SelectItem>
                      <SelectItem value="3">3 retries</SelectItem>
                      <SelectItem value="5">5 retries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retryDelay">Retry Delay</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Smart Retry Logic</Label>
                    <p className="text-sm text-muted-foreground">Use AI to determine optimal retry timing</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exponential Backoff</Label>
                    <p className="text-sm text-muted-foreground">Increase delay between retries</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notify on Final Failure</Label>
                    <p className="text-sm text-muted-foreground">Send notification when all retries fail</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="w-full">
                Save Retry Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                AI-Powered Fraud Detection
              </CardTitle>
              <CardDescription>
                Advanced fraud detection and prevention settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Real-time Monitoring</Label>
                      <p className="text-sm text-muted-foreground">Monitor transactions in real-time</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Velocity Checks</Label>
                      <p className="text-sm text-muted-foreground">Detect unusual transaction patterns</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Geo-location Validation</Label>
                      <p className="text-sm text-muted-foreground">Validate payment location</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Device Fingerprinting</Label>
                      <p className="text-sm text-muted-foreground">Track device characteristics</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="riskThreshold">Risk Threshold</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (90%+)</SelectItem>
                        <SelectItem value="medium">Medium (70-90%)</SelectItem>
                        <SelectItem value="high">High (50-70%)</SelectItem>
                        <SelectItem value="strict">Strict (30-50%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxAmount">Max Transaction Amount</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      placeholder="50000"
                      defaultValue="50000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dailyLimit">Daily Transaction Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      placeholder="100000"
                      defaultValue="100000"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Update Fraud Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Automated Reconciliation
              </CardTitle>
              <CardDescription>
                Automatically reconcile payments with gateway reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reconcileFreq">Reconciliation Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-resolve Matches</Label>
                      <p className="text-sm text-muted-foreground">Automatically resolve matching transactions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Reports</Label>
                      <p className="text-sm text-muted-foreground">Send reconciliation reports via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Last Reconciliation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Matched:</span>
                        <span className="text-green-500">2,847 transactions</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unmatched:</span>
                        <span className="text-yellow-500">12 transactions</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discrepancies:</span>
                        <span className="text-red-500">3 transactions</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  Run Reconciliation Now
                </Button>
                <Button variant="outline">
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPaymentGateway;