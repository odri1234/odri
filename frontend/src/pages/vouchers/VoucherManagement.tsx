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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  QrCode, 
  Ticket, 
  Gift, 
  Users, 
  DollarSign, 
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
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Target, 
  Award, 
  Star, 
  Lightbulb, 
  Brain, 
  Cpu, 
  Database, 
  Server, 
  Router, 
  Wifi, 
  Signal, 
  Zap, 
  Gauge, 
  Thermometer, 
  HardDrive, 
  MemoryStick,
  Package, 
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
  CreditCard,
  Banknote,
  Wallet,
  Building2,
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
  Smartphone,
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
  Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { vouchersService as voucherService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { cn } from '@/lib/utils';

// Voucher Status Badge
const VoucherStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    UNUSED: { color: 'bg-green-500', text: 'Unused', icon: CheckCircle },
    USED: { color: 'bg-blue-500', text: 'Used', icon: CheckCircle },
    expired: { color: 'bg-red-500', text: 'Expired', icon: XCircle },
    suspended: { color: 'bg-yellow-500', text: 'Suspended', icon: AlertTriangle },
    pending: { color: 'bg-gray-500', text: 'Pending', icon: Clock },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Voucher Type Badge
const VoucherTypeBadge = ({ type }: { type: string }) => {
  const typeConfig = {
    time_based: { color: 'bg-blue-500', text: 'Time-based', icon: Clock },
    data_based: { color: 'bg-green-500', text: 'Data-based', icon: Database },
    hybrid: { color: 'bg-purple-500', text: 'Hybrid', icon: Zap },
    unlimited: { color: 'bg-orange-500', text: 'Unlimited', icon: Wifi },
    day_pass: { color: 'bg-indigo-500', text: 'Day Pass', icon: Calendar },
  };

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.time_based;
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Voucher Statistics Component
const VoucherStatistics = ({ vouchers }: { vouchers: any[] }) => {
  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.status === 'UNUSED').length,
    used: vouchers.filter(v => v.status === 'USED').length,
    expired: vouchers.filter(v => v.expiresAt && new Date(v.expiresAt) < new Date()).length,
    totalValue: vouchers.reduce((sum, v) => sum + (v.amount || 0), 0),
    usedValue: vouchers.filter(v => v.status === 'USED').reduce((sum, v) => sum + (v.amount || 0), 0),
  };

  const usageRate = stats.total > 0 ? (stats.used / stats.total) * 100 : 0;
  const revenueRate = stats.totalValue > 0 ? (stats.usedValue / stats.totalValue) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Vouchers</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
            <Ticket className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active</p>
              <p className="text-2xl font-bold">{stats.active.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Used</p>
              <p className="text-2xl font-bold">{stats.used.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Expired</p>
              <p className="text-2xl font-bold">{stats.expired.toLocaleString()}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Usage Rate</p>
              <p className="text-2xl font-bold">{usageRate.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total Value</p>
              <p className="text-2xl font-bold">KES {stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-teal-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Voucher Card Component
const VoucherCard = ({ voucher, onEdit, onDelete, onViewDetails, onPrint }: { 
  voucher: any; 
  onEdit: (voucher: any) => void; 
  onDelete: (voucher: any) => void; 
  onViewDetails: (voucher: any) => void; 
  onPrint: (voucher: any) => void;
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{voucher.code}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Tag className="h-3 w-3" />
                {voucher.batch || 'Individual'}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <VoucherStatusBadge status={voucher.status} />
            <VoucherTypeBadge type={voucher.type} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="text-xl font-bold text-green-500">{voucher.amount} MB</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-semibold">{voucher.duration} {voucher.validityUnit.toLowerCase()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-semibold">{new Date(voucher.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expires</p>
              <p className="font-semibold">{voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
          
          {voucher.reseller && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assigned to</span>
                <Badge variant="outline">{voucher.reseller}</Badge>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(voucher)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onPrint(voucher)}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(voucher)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(voucher)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Batch Generation Component
const BatchGeneration = ({ onGenerate }: { onGenerate: (config: any) => void }) => {
  const [config, setConfig] = useState({
    batchName: '',
    quantity: 100,
    amount: 5000, // 5GB in MB
    validityUnit: 'DAYS',
    duration: 30,
    prefix: 'VCH',
    includeQR: true,
    includeScratch: true,
    ispId: '',
    planId: '',
    metadata: '',
  });

  const validityUnits = [
    { value: 'HOURS', label: 'Hours' },
    { value: 'DAYS', label: 'Days' },
    { value: 'WEEKS', label: 'Weeks' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Batch Voucher Generation
        </CardTitle>
        <CardDescription>
          Generate multiple vouchers with consistent settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                value={config.batchName}
                onChange={(e) => setConfig(prev => ({ ...prev, batchName: e.target.value }))}
                placeholder="e.g., March 2024 Batch"
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={config.quantity}
                onChange={(e) => setConfig(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                min="1"
                max="10000"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Voucher Type</Label>
              <Select value={config.type} onValueChange={(value) => setConfig(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voucherTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="value">Value (KES)</Label>
              <Input
                id="value"
                type="number"
                value={config.value}
                onChange={(e) => setConfig(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                min="1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select value={config.duration} onValueChange={(value) => setConfig(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="3h">3 Hours</SelectItem>
                  <SelectItem value="6h">6 Hours</SelectItem>
                  <SelectItem value="12h">12 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dataLimit">Data Limit (GB)</Label>
              <Input
                id="dataLimit"
                type="number"
                step="0.1"
                value={config.dataLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, dataLimit: parseFloat(e.target.value) }))}
                min="0.1"
              />
            </div>
            
            <div>
              <Label htmlFor="expiryDays">Expires After (Days)</Label>
              <Input
                id="expiryDays"
                type="number"
                value={config.expiryDays}
                onChange={(e) => setConfig(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
            
            <div>
              <Label htmlFor="prefix">Code Prefix</Label>
              <Input
                id="prefix"
                value={config.prefix}
                onChange={(e) => setConfig(prev => ({ ...prev, prefix: e.target.value }))}
                placeholder="VCH"
                maxLength={5}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Print Options</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeQR"
                checked={config.includeQR}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeQR: !!checked }))}
              />
              <Label htmlFor="includeQR">Include QR Codes</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeScratch"
                checked={config.includeScratch}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeScratch: !!checked }))}
              />
              <Label htmlFor="includeScratch">Scratch-off Security</Label>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Reseller Assignment</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignToReseller">Assign to Reseller</Label>
              <Select value={config.assignToReseller} onValueChange={(value) => setConfig(prev => ({ ...prev, assignToReseller: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reseller (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reseller1">John's Electronics</SelectItem>
                  <SelectItem value="reseller2">Tech Solutions Ltd</SelectItem>
                  <SelectItem value="reseller3">Digital Hub Kenya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="commission">Commission (%)</Label>
              <Input
                id="commission"
                type="number"
                value={config.commission}
                onChange={(e) => setConfig(prev => ({ ...prev, commission: parseFloat(e.target.value) }))}
                min="0"
                max="50"
                step="0.5"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">Generation Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Vouchers</p>
              <p className="font-semibold">{config.quantity.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Value</p>
              <p className="font-semibold">KES {(config.quantity * config.value).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimated Print Time</p>
              <p className="font-semibold">{Math.ceil(config.quantity / 100)} minutes</p>
            </div>
            <div>
              <p className="text-muted-foreground">Commission Total</p>
              <p className="font-semibold">KES {((config.quantity * config.value * config.commission) / 100).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Button className="w-full" onClick={() => onGenerate(config)}>
          <Package className="h-4 w-4 mr-2" />
          Generate {config.quantity} Vouchers
        </Button>
      </CardContent>
    </Card>
  );
};

// Reseller Management Component
const ResellerManagement = () => {
  const resellers = [
    {
      id: 1,
      name: "John's Electronics",
      contact: 'John Doe',
      phone: '+254 712 345 678',
      email: 'john@electronics.co.ke',
      commission: 15,
      totalVouchers: 2500,
      soldVouchers: 2100,
      totalEarnings: 157500,
      status: 'active',
      joinDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Tech Solutions Ltd',
      contact: 'Mary Smith',
      phone: '+254 723 456 789',
      email: 'mary@techsolutions.co.ke',
      commission: 12,
      totalVouchers: 1800,
      soldVouchers: 1650,
      totalEarnings: 118800,
      status: 'active',
      joinDate: '2024-02-01',
    },
    {
      id: 3,
      name: 'Digital Hub Kenya',
      contact: 'Peter Kamau',
      phone: '+254 734 567 890',
      email: 'peter@digitalhub.co.ke',
      commission: 10,
      totalVouchers: 1200,
      soldVouchers: 980,
      totalEarnings: 49000,
      status: 'suspended',
      joinDate: '2024-01-20',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          Reseller Management
        </CardTitle>
        <CardDescription>
          Manage voucher resellers and their performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resellers.map((reseller) => (
            <div key={reseller.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{reseller.name}</h4>
                  <p className="text-sm text-muted-foreground">{reseller.contact}</p>
                  <p className="text-xs text-muted-foreground">{reseller.email}</p>
                </div>
                <div className="text-right">
                  <Badge className={reseller.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                    {reseller.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reseller.commission}% commission
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Vouchers</p>
                  <p className="font-semibold">{reseller.totalVouchers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sold</p>
                  <p className="font-semibold">{reseller.soldVouchers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sales Rate</p>
                  <p className="font-semibold">{((reseller.soldVouchers / reseller.totalVouchers) * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Earnings</p>
                  <p className="font-semibold text-green-500">KES {reseller.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-xs text-muted-foreground">
                  Joined: {new Date(reseller.joinDate).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Assign Vouchers
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button className="w-full mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Add New Reseller
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Component
export const VoucherManagement = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  // Mock vouchers data
  const vouchers = [
    {
      id: 1,
      code: 'VCH001234567',
      type: 'time_based',
      status: 'active',
      value: 500,
      duration: '24h',
      batch: 'March 2024 Batch',
      reseller: "John's Electronics",
      createdAt: '2024-03-01',
      expiresAt: '2024-04-01',
    },
    {
      id: 2,
      code: 'VCH001234568',
      type: 'data_based',
      status: 'used',
      value: 1000,
      duration: '1GB',
      batch: 'March 2024 Batch',
      reseller: 'Tech Solutions Ltd',
      createdAt: '2024-03-01',
      expiresAt: '2024-04-01',
      usedAt: '2024-03-15',
    },
    {
      id: 3,
      code: 'VCH001234569',
      type: 'hybrid',
      status: 'expired',
      value: 750,
      duration: '12h + 500MB',
      batch: 'February 2024 Batch',
      reseller: 'Digital Hub Kenya',
      createdAt: '2024-02-01',
      expiresAt: '2024-03-01',
    },
    {
      id: 4,
      code: 'VCH001234570',
      type: 'unlimited',
      status: 'active',
      value: 2000,
      duration: '7 days unlimited',
      batch: 'Premium Batch',
      reseller: null,
      createdAt: '2024-03-10',
      expiresAt: '2024-06-10',
    },
  ];

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (voucher.batch && voucher.batch.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || voucher.status === statusFilter;
    const matchesType = !typeFilter || voucher.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleBatchGeneration = (config: any) => {
    toast({
      title: "Batch Generation Started",
      description: `Generating ${config.quantity} vouchers. This may take a few minutes.`,
    });
    setShowBatchDialog(false);
    // Implement batch generation logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voucher Management</h1>
          <p className="text-muted-foreground">
            Generate, manage, and track vouchers with QR codes and batch printing
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
          <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
            <DialogTrigger asChild>
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Generate Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Voucher Batch</DialogTitle>
                <DialogDescription>
                  Create multiple vouchers with consistent settings and print options
                </DialogDescription>
              </DialogHeader>
              <BatchGeneration onGenerate={handleBatchGeneration} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Voucher Statistics */}
      <VoucherStatistics vouchers={vouchers} />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vouchers by code or batch..."
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
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="time_based">Time-based</SelectItem>
                  <SelectItem value="data_based">Data-based</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                  <SelectItem value="day_pass">Day Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="vouchers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vouchers">Voucher Directory</TabsTrigger>
          <TabsTrigger value="batch">Batch Generation</TabsTrigger>
          <TabsTrigger value="resellers">Reseller Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-6">
          {/* Vouchers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                onEdit={(voucher) => console.log('Edit voucher:', voucher)}
                onDelete={(voucher) => console.log('Delete voucher:', voucher)}
                onViewDetails={(voucher) => setSelectedVoucher(voucher)}
                onPrint={(voucher) => {
                  toast({
                    title: "Print Voucher",
                    description: `Printing voucher ${voucher.code}...`,
                  });
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <BatchGeneration onGenerate={handleBatchGeneration} />
        </TabsContent>

        <TabsContent value="resellers" className="space-y-6">
          <ResellerManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Usage Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">+24.5%</div>
                <p className="text-sm text-muted-foreground">Voucher usage this month</p>
                <Progress value={75} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  Revenue Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">KES 2.4M</div>
                <p className="text-sm text-muted-foreground">Total voucher revenue</p>
                <Progress value={85} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Reseller Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">89.2%</div>
                <p className="text-sm text-muted-foreground">Average sales rate</p>
                <Progress value={89} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">76.8%</div>
                <p className="text-sm text-muted-foreground">Voucher to usage conversion</p>
                <Progress value={77} className="mt-4" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Usage Trends Chart</p>
                    <p className="text-muted-foreground">Voucher usage analytics over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Distribution Chart</p>
                    <p className="text-muted-foreground">Voucher type popularity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VoucherManagement;