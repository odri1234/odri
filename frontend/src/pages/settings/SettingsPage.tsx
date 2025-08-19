import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Database, 
  Mail, 
  Smartphone, 
  CreditCard, 
  Wifi, 
  Server, 
  Key, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    supportPhone: string;
    timezone: string;
    currency: string;
    language: string;
  };
  security: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    paymentNotifications: boolean;
    systemAlerts: boolean;
    marketingEmails: boolean;
  };
  payment: {
    mpesaEnabled: boolean;
    mpesaConsumerKey: string;
    mpesaConsumerSecret: string;
    mpesaPasskey: string;
    mpesaShortcode: string;
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    paypalEnabled: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
  };
  mikrotik: {
    defaultRouterIp: string;
    defaultUsername: string;
    defaultPassword: string;
    apiPort: number;
    connectionTimeout: number;
    enableAutoSync: boolean;
    syncInterval: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    smtpEncryption: string;
    fromEmail: string;
    fromName: string;
  };
}

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'OD',
      siteDescription: 'Internet Service Provider Management System',
      supportEmail: 'support@odri.com',
      supportPhone: '+254700000000',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
      language: 'en',
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      enableTwoFactor: false,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      paymentNotifications: true,
      systemAlerts: true,
      marketingEmails: false,
    },
    payment: {
      mpesaEnabled: false,
      mpesaConsumerKey: '',
      mpesaConsumerSecret: '',
      mpesaPasskey: '',
      mpesaShortcode: '',
      stripeEnabled: false,
      stripePublishableKey: '',
      stripeSecretKey: '',
      paypalEnabled: false,
      paypalClientId: '',
      paypalClientSecret: '',
    },
    mikrotik: {
      defaultRouterIp: '192.168.1.1',
      defaultUsername: 'admin',
      defaultPassword: '',
      apiPort: 8728,
      connectionTimeout: 30,
      enableAutoSync: true,
      syncInterval: 300,
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromEmail: '',
      fromName: 'ODRI System',
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<SystemSettings>) => {
      // This would call your API to save settings
      // return settingsService.updateSettings(settingsData);
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  const handleSettingChange = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = (section?: keyof SystemSettings) => {
    const dataToSave = section ? { [section]: settings[section] } : settings;
    saveSettingsMutation.mutate(dataToSave);
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const canManageSettings = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role);
  };

  const canManagePaymentSettings = () => {
    if (!user) return false;
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN].includes(user.role);
  };

  if (!canManageSettings()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access system settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Config
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="mikrotik">MikroTik</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic system configuration and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={(e) => handleSettingChange('general', 'supportPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => handleSettingChange('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => handleSettingChange('general', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => handleSettingChange('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                />
              </div>
              <Button onClick={() => handleSaveSettings('general')} disabled={saveSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require users to verify their email address
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => handleSettingChange('security', 'requireEmailVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Phone Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require users to verify their phone number
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requirePhoneVerification}
                    onCheckedChange={(checked) => handleSettingChange('security', 'requirePhoneVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable 2FA for enhanced security
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('security', 'enableTwoFactor', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Strong Password Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce strong password requirements
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireStrongPassword}
                    onCheckedChange={(checked) => handleSettingChange('security', 'requireStrongPassword', checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Min Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('security')} disabled={saveSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences and channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'smsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify about payment events
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.paymentNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'paymentNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical system notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'systemAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Send promotional and marketing emails
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'marketingEmails', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('notifications')} disabled={saveSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          {canManagePaymentSettings() ? (
            <>
              {/* M-Pesa Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    M-Pesa Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure M-Pesa payment gateway settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable M-Pesa</Label>
                      <p className="text-sm text-muted-foreground">
                        Accept payments via M-Pesa
                      </p>
                    </div>
                    <Switch
                      checked={settings.payment.mpesaEnabled}
                      onCheckedChange={(checked) => handleSettingChange('payment', 'mpesaEnabled', checked)}
                    />
                  </div>
                  
                  {settings.payment.mpesaEnabled && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="mpesaConsumerKey">Consumer Key</Label>
                        <div className="relative">
                          <Input
                            id="mpesaConsumerKey"
                            type={showPasswords.mpesaConsumerKey ? 'text' : 'password'}
                            value={settings.payment.mpesaConsumerKey}
                            onChange={(e) => handleSettingChange('payment', 'mpesaConsumerKey', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility('mpesaConsumerKey')}
                          >
                            {showPasswords.mpesaConsumerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mpesaConsumerSecret">Consumer Secret</Label>
                        <div className="relative">
                          <Input
                            id="mpesaConsumerSecret"
                            type={showPasswords.mpesaConsumerSecret ? 'text' : 'password'}
                            value={settings.payment.mpesaConsumerSecret}
                            onChange={(e) => handleSettingChange('payment', 'mpesaConsumerSecret', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility('mpesaConsumerSecret')}
                          >
                            {showPasswords.mpesaConsumerSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mpesaPasskey">Passkey</Label>
                        <div className="relative">
                          <Input
                            id="mpesaPasskey"
                            type={showPasswords.mpesaPasskey ? 'text' : 'password'}
                            value={settings.payment.mpesaPasskey}
                            onChange={(e) => handleSettingChange('payment', 'mpesaPasskey', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility('mpesaPasskey')}
                          >
                            {showPasswords.mpesaPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mpesaShortcode">Shortcode</Label>
                        <Input
                          id="mpesaShortcode"
                          value={settings.payment.mpesaShortcode}
                          onChange={(e) => handleSettingChange('payment', 'mpesaShortcode', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  
                  <Button onClick={() => handleSaveSettings('payment')} disabled={saveSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {saveSettingsMutation.isPending ? 'Saving...' : 'Save Payment Settings'}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                  <p className="text-muted-foreground">
                    You don't have permission to manage payment settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mikrotik" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                MikroTik Configuration
              </CardTitle>
              <CardDescription>
                Default MikroTik router connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultRouterIp">Default Router IP</Label>
                  <Input
                    id="defaultRouterIp"
                    value={settings.mikrotik.defaultRouterIp}
                    onChange={(e) => handleSettingChange('mikrotik', 'defaultRouterIp', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultUsername">Default Username</Label>
                  <Input
                    id="defaultUsername"
                    value={settings.mikrotik.defaultUsername}
                    onChange={(e) => handleSettingChange('mikrotik', 'defaultUsername', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultPassword">Default Password</Label>
                  <div className="relative">
                    <Input
                      id="defaultPassword"
                      type={showPasswords.mikrotikPassword ? 'text' : 'password'}
                      value={settings.mikrotik.defaultPassword}
                      onChange={(e) => handleSettingChange('mikrotik', 'defaultPassword', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('mikrotikPassword')}
                    >
                      {showPasswords.mikrotikPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiPort">API Port</Label>
                  <Input
                    id="apiPort"
                    type="number"
                    value={settings.mikrotik.apiPort}
                    onChange={(e) => handleSettingChange('mikrotik', 'apiPort', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connectionTimeout">Connection Timeout (seconds)</Label>
                  <Input
                    id="connectionTimeout"
                    type="number"
                    value={settings.mikrotik.connectionTimeout}
                    onChange={(e) => handleSettingChange('mikrotik', 'connectionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Sync Interval (seconds)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={settings.mikrotik.syncInterval}
                    onChange={(e) => handleSettingChange('mikrotik', 'syncInterval', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync with MikroTik routers
                  </p>
                </div>
                <Switch
                  checked={settings.mikrotik.enableAutoSync}
                  onCheckedChange={(checked) => handleSettingChange('mikrotik', 'enableAutoSync', checked)}
                />
              </div>
              
              <Button onClick={() => handleSaveSettings('mikrotik')} disabled={saveSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save MikroTik Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                SMTP settings for sending system emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.email.smtpUsername}
                    onChange={(e) => handleSettingChange('email', 'smtpUsername', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showPasswords.smtpPassword ? 'text' : 'password'}
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility('smtpPassword')}
                    >
                      {showPasswords.smtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpEncryption">Encryption</Label>
                  <Select
                    value={settings.email.smtpEncryption}
                    onValueChange={(value) => handleSettingChange('email', 'smtpEncryption', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>
              
              <Button onClick={() => handleSaveSettings('email')} disabled={saveSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Email Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;