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
  Building2, 
  Building, 
  Crown, 
  Shield, 
  Star, 
  Award, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
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
  Palette,
  Image,
  Link,
  Database,
  Server,
  Network,
  Wifi,
  Router,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Zap,
  Lightbulb,
  Brain,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  MessageSquare,
  Bell,
  Lock,
  Unlock,
  Key,
  UserPlus,
  UserCheck,
  UserX,
  CreditCard,
  Banknote,
  Receipt,
  Package,
  Gift,
  Percent,
  Calculator,
  PiggyBank,
  Briefcase,
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
  Flag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dashboardService as tenantService, ispsService as ispService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { cn } from '@/lib/utils';

// Tenant Status Badge Component
const TenantStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active', icon: CheckCircle },
    inactive: { color: 'bg-gray-500', text: 'Inactive', icon: Clock },
    suspended: { color: 'bg-red-500', text: 'Suspended', icon: XCircle },
    trial: { color: 'bg-blue-500', text: 'Trial', icon: Star },
    pending: { color: 'bg-yellow-500', text: 'Pending', icon: AlertTriangle },
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

// Tenant Plan Badge Component
const TenantPlanBadge = ({ plan }: { plan: string }) => {
  const planConfig = {
    starter: { color: 'bg-blue-500', text: 'Starter', icon: Star },
    professional: { color: 'bg-purple-500', text: 'Professional', icon: Award },
    enterprise: { color: 'bg-orange-500', text: 'Enterprise', icon: Crown },
    custom: { color: 'bg-gray-500', text: 'Custom', icon: Settings },
  };

  const config = planConfig[plan as keyof typeof planConfig] || planConfig.starter;
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Tenant Card Component
const TenantCard = ({ tenant, onEdit, onDelete, onViewDetails }: { 
  tenant: any; 
  onEdit: (tenant: any) => void; 
  onDelete: (tenant: any) => void; 
  onViewDetails: (tenant: any) => void; 
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={tenant.logo} alt={tenant.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {tenant.name?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{tenant.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Building className="h-3 w-3" />
                {tenant.domain || 'No domain set'}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <TenantStatusBadge status={tenant.status} />
            <TenantPlanBadge plan={tenant.plan} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Users</p>
              <p className="text-xl font-bold">{tenant.userCount || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold">KES {tenant.monthlyRevenue || 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-semibold">{new Date(tenant.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-semibold">{tenant.location || 'N/A'}</p>
            </div>
          </div>
          
          {tenant.features && (
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-1">
                {tenant.features.slice(0, 3).map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {tenant.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tenant.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(tenant)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(tenant)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(tenant)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Tenant Statistics Component
const TenantStatistics = ({ tenants }: { tenants: any[] }) => {
  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    trial: tenants.filter(t => t.status === 'trial').length,
    suspended: tenants.filter(t => t.status === 'suspended').length,
    totalRevenue: tenants.reduce((sum, t) => sum + (t.monthlyRevenue || 0), 0),
    totalUsers: tenants.reduce((sum, t) => sum + (t.userCount || 0), 0),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Tenants</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-200" />
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
              <p className="text-purple-100 text-sm">Trial</p>
              <p className="text-2xl font-bold">{stats.trial}</p>
            </div>
            <Star className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Suspended</p>
              <p className="text-2xl font-bold">{stats.suspended}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">KES {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-teal-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// White-label Branding Component
const WhiteLabelBranding = ({ tenant, onUpdate }: { tenant: any; onUpdate: () => void }) => {
  const [branding, setBranding] = useState({
    logo: tenant.branding?.logo || '',
    primaryColor: tenant.branding?.primaryColor || '#3b82f6',
    secondaryColor: tenant.branding?.secondaryColor || '#8b5cf6',
    accentColor: tenant.branding?.accentColor || '#10b981',
    customDomain: tenant.branding?.customDomain || '',
    favicon: tenant.branding?.favicon || '',
    loginBackground: tenant.branding?.loginBackground || '',
    companyName: tenant.branding?.companyName || '',
    tagline: tenant.branding?.tagline || '',
    footerText: tenant.branding?.footerText || '',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          White-label Branding
        </CardTitle>
        <CardDescription>
          Customize the appearance and branding for {tenant.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={branding.logo}
                onChange={(e) => setBranding(prev => ({ ...prev, logo: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={branding.companyName}
                onChange={(e) => setBranding(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>
            
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={branding.tagline}
                onChange={(e) => setBranding(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="Your company tagline"
              />
            </div>
            
            <div>
              <Label htmlFor="customDomain">Custom Domain</Label>
              <Input
                id="customDomain"
                value={branding.customDomain}
                onChange={(e) => setBranding(prev => ({ ...prev, customDomain: e.target.value }))}
                placeholder="portal.yourcompany.com"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.primaryColor}
                  onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={branding.accentColor}
                  onChange={(e) => setBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={branding.accentColor}
                  onChange={(e) => setBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="footerText">Footer Text</Label>
              <Textarea
                id="footerText"
                value={branding.footerText}
                onChange={(e) => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
                placeholder="© 2024 Your Company. All rights reserved."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">Preview</h4>
          <div className="bg-white rounded-lg p-4 border" style={{ borderColor: branding.primaryColor }}>
            <div className="flex items-center gap-3 mb-4">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="h-8 w-8 object-contain" />
              ) : (
                <div 
                  className="h-8 w-8 rounded flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  {branding.companyName?.charAt(0) || 'C'}
                </div>
              )}
              <div>
                <h3 className="font-semibold" style={{ color: branding.primaryColor }}>
                  {branding.companyName || 'Company Name'}
                </h3>
                <p className="text-sm text-muted-foreground">{branding.tagline || 'Your tagline here'}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {branding.footerText || 'Footer text will appear here'}
            </div>
          </div>
        </div>

        <Button className="w-full">
          Save Branding Settings
        </Button>
      </CardContent>
    </Card>
  );
};

// Tenant Features Configuration Component
const TenantFeaturesConfig = ({ tenant, onUpdate }: { tenant: any; onUpdate: () => void }) => {
  const [features, setFeatures] = useState({
    multiPaymentGateways: tenant.features?.multiPaymentGateways || false,
    aiAnalytics: tenant.features?.aiAnalytics || false,
    advancedReporting: tenant.features?.advancedReporting || false,
    whiteLabeling: tenant.features?.whiteLabeling || false,
    apiAccess: tenant.features?.apiAccess || false,
    customDomain: tenant.features?.customDomain || false,
    smsNotifications: tenant.features?.smsNotifications || false,
    emailMarketing: tenant.features?.emailMarketing || false,
    loyaltyProgram: tenant.features?.loyaltyProgram || false,
    referralSystem: tenant.features?.referralSystem || false,
    fraudDetection: tenant.features?.fraudDetection || false,
    backupRestore: tenant.features?.backupRestore || false,
  });

  const featureList = [
    { key: 'multiPaymentGateways', name: 'Multiple Payment Gateways', description: 'Support for M-PESA, Stripe, PayPal, etc.' },
    { key: 'aiAnalytics', name: 'AI-Powered Analytics', description: 'Advanced AI insights and predictions' },
    { key: 'advancedReporting', name: 'Advanced Reporting', description: 'Detailed reports and analytics' },
    { key: 'whiteLabeling', name: 'White-label Branding', description: 'Custom branding and domain' },
    { key: 'apiAccess', name: 'API Access', description: 'Full API access for integrations' },
    { key: 'customDomain', name: 'Custom Domain', description: 'Use your own domain name' },
    { key: 'smsNotifications', name: 'SMS Notifications', description: 'Send SMS alerts and notifications' },
    { key: 'emailMarketing', name: 'Email Marketing', description: 'Bulk email campaigns and marketing' },
    { key: 'loyaltyProgram', name: 'Loyalty Program', description: 'Customer loyalty and rewards system' },
    { key: 'referralSystem', name: 'Referral System', description: 'Customer referral bonuses' },
    { key: 'fraudDetection', name: 'Fraud Detection', description: 'AI-powered fraud prevention' },
    { key: 'backupRestore', name: 'Backup & Restore', description: 'Automated backup and restore' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Feature Configuration
        </CardTitle>
        <CardDescription>
          Enable or disable features for {tenant.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {featureList.map((feature) => (
          <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{feature.name}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
            <Switch
              checked={features[feature.key as keyof typeof features]}
              onCheckedChange={(checked) => {
                setFeatures(prev => ({ ...prev, [feature.key]: checked }));
              }}
            />
          </div>
        ))}
        
        <Button className="w-full">
          Save Feature Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Component
export const MultiTenantManagement = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock tenants data
  const tenants = [
    {
      id: 1,
      name: 'Nairobi WiFi Solutions',
      domain: 'nairobi-wifi.com',
      status: 'active',
      plan: 'enterprise',
      userCount: 1250,
      monthlyRevenue: 125000,
      location: 'Nairobi, Kenya',
      createdAt: '2024-01-15',
      features: ['Multi-Payment', 'AI Analytics', 'White-label', 'API Access'],
      logo: null,
    },
    {
      id: 2,
      name: 'Mombasa Internet Hub',
      domain: 'mombasa-hub.co.ke',
      status: 'active',
      plan: 'professional',
      userCount: 850,
      monthlyRevenue: 85000,
      location: 'Mombasa, Kenya',
      createdAt: '2024-02-20',
      features: ['Multi-Payment', 'Advanced Reporting', 'SMS Notifications'],
      logo: null,
    },
    {
      id: 3,
      name: 'Kisumu Connect',
      domain: 'kisumu-connect.net',
      status: 'trial',
      plan: 'starter',
      userCount: 320,
      monthlyRevenue: 32000,
      location: 'Kisumu, Kenya',
      createdAt: '2024-03-10',
      features: ['Basic Reporting', 'Email Marketing'],
      logo: null,
    },
    {
      id: 4,
      name: 'Eldoret Networks',
      domain: 'eldoret-net.com',
      status: 'suspended',
      plan: 'professional',
      userCount: 0,
      monthlyRevenue: 0,
      location: 'Eldoret, Kenya',
      createdAt: '2024-01-05',
      features: ['Multi-Payment', 'Advanced Reporting'],
      logo: null,
    },
  ];

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || tenant.status === statusFilter;
    const matchesPlan = !planFilter || tenant.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Multi-Tenant Management</h1>
          <p className="text-muted-foreground">
            Manage multiple ISPs, white-label branding, and tenant configurations
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
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
                <DialogDescription>
                  Add a new ISP or organization to the multi-tenant system
                </DialogDescription>
              </DialogHeader>
              {/* Create tenant form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tenant Statistics */}
      <TenantStatistics tenants={tenants} />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants by name or domain..."
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
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Plans</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tenants">Tenant Directory</TabsTrigger>
          <TabsTrigger value="branding">White-label Branding</TabsTrigger>
          <TabsTrigger value="features">Feature Management</TabsTrigger>
          <TabsTrigger value="analytics">Tenant Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-6">
          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                onEdit={(tenant) => console.log('Edit tenant:', tenant)}
                onDelete={(tenant) => console.log('Delete tenant:', tenant)}
                onViewDetails={(tenant) => setSelectedTenant(tenant)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          {selectedTenant ? (
            <WhiteLabelBranding 
              tenant={selectedTenant} 
              onUpdate={() => console.log('Update branding')} 
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Tenant</h3>
                <p className="text-muted-foreground">
                  Choose a tenant from the directory to configure their white-label branding
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {selectedTenant ? (
            <TenantFeaturesConfig 
              tenant={selectedTenant} 
              onUpdate={() => console.log('Update features')} 
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Tenant</h3>
                <p className="text-muted-foreground">
                  Choose a tenant from the directory to configure their available features
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
                  Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">+24.5%</div>
                <p className="text-sm text-muted-foreground">New tenants this month</p>
                <Progress value={75} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  Revenue per Tenant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">KES 60,500</div>
                <p className="text-sm text-muted-foreground">Average monthly revenue</p>
                <Progress value={85} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  User Adoption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">89.2%</div>
                <p className="text-sm text-muted-foreground">Feature adoption rate</p>
                <Progress value={89} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">4.8/5</div>
                <p className="text-sm text-muted-foreground">Tenant satisfaction score</p>
                <Progress value={96} className="mt-4" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Growth Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Growth Chart</p>
                    <p className="text-muted-foreground">Tenant growth analytics would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-600">Revenue Chart</p>
                    <p className="text-muted-foreground">Revenue distribution by tenant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tenant Details Dialog */}
      {selectedTenant && (
        <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedTenant.logo} alt={selectedTenant.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {selectedTenant.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                {selectedTenant.name}
              </DialogTitle>
              <DialogDescription>
                Detailed tenant information and configuration
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <p className="font-medium">{selectedTenant.name}</p>
                        </div>
                        <div>
                          <Label>Domain</Label>
                          <p className="font-medium">{selectedTenant.domain}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <TenantStatusBadge status={selectedTenant.status} />
                        </div>
                        <div>
                          <Label>Plan</Label>
                          <TenantPlanBadge plan={selectedTenant.plan} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Total Users</span>
                          <span className="font-semibold">{selectedTenant.userCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Monthly Revenue</span>
                          <span className="font-semibold">KES {selectedTenant.monthlyRevenue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Location</span>
                          <span className="font-semibold">{selectedTenant.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Created</span>
                          <span className="font-semibold">{new Date(selectedTenant.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">User management for {selectedTenant.name} coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Billing management for {selectedTenant.name} coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Tenant Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Settings management for {selectedTenant.name} coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MultiTenantManagement;