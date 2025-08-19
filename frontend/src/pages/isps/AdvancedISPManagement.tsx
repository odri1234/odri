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
import { 
  Building2, 
  Users, 
  DollarSign, 
  Wifi, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Globe, 
  Palette, 
  Shield, 
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  Briefcase,
  Network,
  Server,
  Database,
  Cloud,
  Lock,
  Key,
  UserCheck,
  FileText,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ispsService as ispService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { cn } from '@/lib/utils';

// ISP Status Badge Component
const ISPStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active', icon: CheckCircle },
    inactive: { color: 'bg-gray-500', text: 'Inactive', icon: Clock },
    suspended: { color: 'bg-red-500', text: 'Suspended', icon: AlertTriangle },
    pending: { color: 'bg-yellow-500', text: 'Pending', icon: Clock },
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

// ISP Tier Badge Component
const ISPTierBadge = ({ tier }: { tier: string }) => {
  const tierConfig = {
    enterprise: { color: 'bg-purple-500', text: 'Enterprise', icon: Crown },
    professional: { color: 'bg-blue-500', text: 'Professional', icon: Star },
    standard: { color: 'bg-green-500', text: 'Standard', icon: Award },
    basic: { color: 'bg-gray-500', text: 'Basic', icon: Briefcase },
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.basic;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("border-2", config.color.replace('bg-', 'border-'))}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// ISP Stats Card Component
const ISPStatsCard = ({ isp }: { isp: any }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-bold">{isp.stats?.totalUsers || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">KES {isp.stats?.totalRevenue || 0}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
              <p className="text-2xl font-bold">{isp.stats?.activeSessions || 0}</p>
            </div>
            <Wifi className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-bold">{isp.stats?.uptime || '99.9'}%</p>
            </div>
            <Server className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ISP Branding Component
const ISPBrandingCard = ({ isp, onUpdate }: { isp: any; onUpdate: () => void }) => {
  const [brandingData, setBrandingData] = useState({
    logo: isp.branding?.logo || '',
    primaryColor: isp.branding?.primaryColor || '#3b82f6',
    secondaryColor: isp.branding?.secondaryColor || '#1e40af',
    domain: isp.branding?.domain || '',
    companyName: isp.branding?.companyName || isp.name,
  });

  const updateBrandingMutation = useMutation({
    mutationFn: (data: any) => ispService.updateBranding(isp.id, data),
    onSuccess: () => {
      onUpdate();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          White-Label Branding
        </CardTitle>
        <CardDescription>
          Customize the ISP's branding and appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={brandingData.logo}
              onChange={(e) => setBrandingData(prev => ({ ...prev, logo: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <Label htmlFor="domain">Custom Domain</Label>
            <Input
              id="domain"
              value={brandingData.domain}
              onChange={(e) => setBrandingData(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="isp.example.com"
            />
          </div>
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primaryColor"
                type="color"
                value={brandingData.primaryColor}
                onChange={(e) => setBrandingData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-16 h-10"
              />
              <Input
                value={brandingData.primaryColor}
                onChange={(e) => setBrandingData(prev => ({ ...prev, primaryColor: e.target.value }))}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondaryColor"
                type="color"
                value={brandingData.secondaryColor}
                onChange={(e) => setBrandingData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-16 h-10"
              />
              <Input
                value={brandingData.secondaryColor}
                onChange={(e) => setBrandingData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                placeholder="#1e40af"
              />
            </div>
          </div>
        </div>
        <Button 
          onClick={() => updateBrandingMutation.mutate(brandingData)}
          loading={updateBrandingMutation.isPending}
          className="w-full"
        >
          Update Branding
        </Button>
      </CardContent>
    </Card>
  );
};

// ISP Configuration Component
const ISPConfigurationCard = ({ isp, onUpdate }: { isp: any; onUpdate: () => void }) => {
  const [config, setConfig] = useState({
    maxUsers: isp.config?.maxUsers || 1000,
    maxBandwidth: isp.config?.maxBandwidth || 1000,
    allowedFeatures: isp.config?.allowedFeatures || [],
    autoSuspension: isp.config?.autoSuspension || false,
    multiCurrency: isp.config?.multiCurrency || false,
    apiAccess: isp.config?.apiAccess || false,
  });

  const features = [
    { id: 'vouchers', name: 'Voucher Management' },
    { id: 'analytics', name: 'Advanced Analytics' },
    { id: 'ai', name: 'AI Features' },
    { id: 'mikrotik', name: 'MikroTik Integration' },
    { id: 'sms', name: 'SMS Notifications' },
    { id: 'whatsapp', name: 'WhatsApp Integration' },
    { id: 'api', name: 'API Access' },
    { id: 'backup', name: 'Automated Backups' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          ISP Configuration
        </CardTitle>
        <CardDescription>
          Configure limits and features for this ISP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxUsers">Max Users</Label>
            <Input
              id="maxUsers"
              type="number"
              value={config.maxUsers}
              onChange={(e) => setConfig(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="maxBandwidth">Max Bandwidth (Mbps)</Label>
            <Input
              id="maxBandwidth"
              type="number"
              value={config.maxBandwidth}
              onChange={(e) => setConfig(prev => ({ ...prev, maxBandwidth: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <Label>Allowed Features</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Switch
                  id={feature.id}
                  checked={config.allowedFeatures.includes(feature.id)}
                  onCheckedChange={(checked) => {
                    setConfig(prev => ({
                      ...prev,
                      allowedFeatures: checked
                        ? [...prev.allowedFeatures, feature.id]
                        : prev.allowedFeatures.filter(f => f !== feature.id)
                    }));
                  }}
                />
                <Label htmlFor={feature.id} className="text-sm">{feature.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSuspension">Auto Suspension</Label>
              <p className="text-sm text-muted-foreground">Automatically suspend users for non-payment</p>
            </div>
            <Switch
              id="autoSuspension"
              checked={config.autoSuspension}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoSuspension: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="multiCurrency">Multi-Currency Support</Label>
              <p className="text-sm text-muted-foreground">Enable multiple currency support</p>
            </div>
            <Switch
              id="multiCurrency"
              checked={config.multiCurrency}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, multiCurrency: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="apiAccess">API Access</Label>
              <p className="text-sm text-muted-foreground">Allow external API integrations</p>
            </div>
            <Switch
              id="apiAccess"
              checked={config.apiAccess}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, apiAccess: checked }))}
            />
          </div>
        </div>

        <Button className="w-full">
          Update Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Component
export const AdvancedISPManagement = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedISP, setSelectedISP] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch ISPs
  const { data: isps, isLoading, error, refetch } = useQuery({
    queryKey: ['isps'],
    queryFn: () => ispService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Create ISP mutation
  const createISPMutation = useMutation({
    mutationFn: (data: any) => ispService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isps'] });
      setShowCreateDialog(false);
      toast({
        title: "ISP Created",
        description: "New ISP has been successfully created.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load ISPs</h2>
          <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced ISP Management</h1>
          <p className="text-muted-foreground">
            Manage multi-tenant ISPs with advanced features and configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {user?.role === UserRole.SUPER_ADMIN && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create ISP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New ISP</DialogTitle>
                  <DialogDescription>
                    Set up a new ISP with multi-tenant capabilities
                  </DialogDescription>
                </DialogHeader>
                {/* Create ISP Form would go here */}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ISP Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isps?.map((isp: any) => (
          <Card key={isp.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isp.branding?.logo ? (
                    <img src={isp.branding.logo} alt={isp.name} className="w-10 h-10 rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{isp.name}</CardTitle>
                    <CardDescription>{isp.description}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <ISPStatusBadge status={isp.status} />
                  <ISPTierBadge tier={isp.tier} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Users</p>
                    <p className="font-semibold">{isp.stats?.totalUsers || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-semibold">KES {isp.stats?.totalRevenue || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-semibold">{isp.stats?.uptime || '99.9'}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold">{isp.location || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedISP(isp)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ISP Details Dialog */}
      {selectedISP && (
        <Dialog open={!!selectedISP} onOpenChange={() => setSelectedISP(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedISP.branding?.logo ? (
                  <img src={selectedISP.branding.logo} alt={selectedISP.name} className="w-8 h-8 rounded" />
                ) : (
                  <Building2 className="h-8 w-8" />
                )}
                {selectedISP.name}
              </DialogTitle>
              <DialogDescription>
                Comprehensive ISP management and configuration
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <ISPStatsCard isp={selectedISP} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>ISP Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <p className="font-medium">{selectedISP.name}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <ISPStatusBadge status={selectedISP.status} />
                        </div>
                        <div>
                          <Label>Tier</Label>
                          <ISPTierBadge tier={selectedISP.tier} />
                        </div>
                        <div>
                          <Label>Created</Label>
                          <p className="font-medium">{new Date(selectedISP.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedISP.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedISP.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedISP.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedISP.website}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="branding">
                <ISPBrandingCard isp={selectedISP} onUpdate={() => refetch()} />
              </TabsContent>

              <TabsContent value="config">
                <ISPConfigurationCard isp={selectedISP} onUpdate={() => refetch()} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Growth Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">+24.5%</div>
                      <p className="text-sm text-muted-foreground">vs last month</p>
                      <Progress value={75} className="mt-4" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Retention Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-500">94.2%</div>
                      <p className="text-sm text-muted-foreground">Customer retention</p>
                      <Progress value={94} className="mt-4" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Performance Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-500">8.7/10</div>
                      <p className="text-sm text-muted-foreground">Overall performance</p>
                      <Progress value={87} className="mt-4" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>IP Restrictions</Label>
                          <p className="text-sm text-muted-foreground">Limit access by IP address</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Session Timeout</Label>
                          <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>API Key</Label>
                        <div className="flex gap-2 mt-1">
                          <Input value="sk_live_..." readOnly />
                          <Button variant="outline" size="sm">
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Webhook URL</Label>
                        <Input placeholder="https://your-isp.com/webhook" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>API Access Enabled</Label>
                          <p className="text-sm text-muted-foreground">Allow external API calls</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdvancedISPManagement;