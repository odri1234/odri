import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { mikrotikService } from '@/services/api.service';
import { 
  Router, 
  ArrowLeft, 
  Wifi, 
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  Info
} from 'lucide-react';

const routerSchema = z.object({
  name: z.string().min(1, 'Router name is required'),
  ipAddress: z.string().ip('Please enter a valid IP address'),
  apiPort: z.number().min(1).max(65535).optional().default(8728),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  location: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RouterFormData = z.infer<typeof routerSchema>;

interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export const AddRouterPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [connectionTest, setConnectionTest] = useState<ConnectionTestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RouterFormData>({
    resolver: zodResolver(routerSchema),
    defaultValues: {
      apiPort: 8728,
      isActive: true,
    },
  });

  const watchedValues = watch();

  const addRouterMutation = useMutation({
    mutationFn: mikrotikService.addRouter,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Router added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mikrotik', 'routers'] });
      navigate('/mikrotik/routers');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add router',
        variant: 'destructive',
      });
    },
  });

  const testConnection = async () => {
    if (!watchedValues.ipAddress || !watchedValues.username || !watchedValues.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in IP address, username, and password before testing connection',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionTest(null);

    try {
      // Create a temporary router object for testing
      const testRouter = {
        name: watchedValues.name || 'Test Router',
        ipAddress: watchedValues.ipAddress,
        apiPort: watchedValues.apiPort || 8728,
        username: watchedValues.username,
        password: watchedValues.password,
        location: watchedValues.location,
        description: watchedValues.description,
        isActive: watchedValues.isActive,
      };

      const result = await mikrotikService.testRouterConnection(testRouter);
      setConnectionTest(result);

      if (result.success) {
        toast({
          title: 'Connection Successful',
          description: 'Successfully connected to the MikroTik router',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Connection test failed';
      setConnectionTest({
        success: false,
        message: errorMessage,
      });
      toast({
        title: 'Connection Test Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const onSubmit = (data: RouterFormData) => {
    addRouterMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/mikrotik/routers')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Routers
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Router className="h-6 w-6" />
            Add MikroTik Router
          </h1>
          <p className="text-muted-foreground">
            Configure a new MikroTik router for your network
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Router Configuration</CardTitle>
              <CardDescription>
                Enter the details for your MikroTik router
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Router Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., Main Office Router"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register('location')}
                        placeholder="e.g., Building A, Floor 2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Optional description of the router"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Connection Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Connection Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ipAddress">IP Address *</Label>
                      <Input
                        id="ipAddress"
                        {...register('ipAddress')}
                        placeholder="192.168.88.1"
                      />
                      {errors.ipAddress && (
                        <p className="text-sm text-red-500">{errors.ipAddress.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiPort">API Port</Label>
                      <Input
                        id="apiPort"
                        type="number"
                        {...register('apiPort', { valueAsNumber: true })}
                        placeholder="8728"
                      />
                      {errors.apiPort && (
                        <p className="text-sm text-red-500">{errors.apiPort.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        {...register('username')}
                        placeholder="admin"
                      />
                      {errors.username && (
                        <p className="text-sm text-red-500">{errors.username.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password')}
                        placeholder="Enter router password"
                      />
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Status</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={watchedValues.isActive}
                      onCheckedChange={(checked) => setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Router is active</Label>
                  </div>
                </div>

                {/* Connection Test Result */}
                {connectionTest && (
                  <Alert className={connectionTest.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {connectionTest.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={connectionTest.success ? 'text-green-800' : 'text-red-800'}>
                        {connectionTest.message}
                        {connectionTest.details?.name && (
                          <div className="mt-1 text-sm">
                            Router Identity: {connectionTest.details.name}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="flex items-center gap-2"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Test Connection
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Router className="h-4 w-4" />
                    )}
                    Add Router
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Help Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Before Adding Router:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ensure MikroTik API is enabled</li>
                  <li>• Create a user with API access</li>
                  <li>• Note down the router's IP address</li>
                  <li>• Verify network connectivity</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Default Settings:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• API Port: 8728</li>
                  <li>• Default Username: admin</li>
                  <li>• SSL Port: 8729 (if using SSL)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Troubleshooting:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check firewall rules</li>
                  <li>• Verify API service is running</li>
                  <li>• Test with Winbox first</li>
                  <li>• Ensure correct credentials</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Hotspot user management</li>
                <li>• Real-time monitoring</li>
                <li>• Bandwidth control</li>
                <li>• User session tracking</li>
                <li>• Automated user creation</li>
                <li>• Connection monitoring</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddRouterPage;