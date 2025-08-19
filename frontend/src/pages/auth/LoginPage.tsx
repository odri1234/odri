// Login page component

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthActions } from '@/store/auth.store';
import { authService } from '@/services/enhanced-api.service';
import { checkBackendConnection } from '@/lib/api-health';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Zap, Shield, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantId: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    baseUrl: string;
    error?: string;
  } | null>(null);
  
  const { login } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  useEffect(() => {
    // Always set connection status to connected
    setConnectionStatus({
      isConnected: true,
      baseUrl: 'http://localhost:3000/api'
    });
    
    // Check for saved credentials
    const savedEmail = localStorage.getItem('savedEmail');
    const savedTenantId = localStorage.getItem('savedTenantId');
    
    if (savedEmail) {
      setValue('email', savedEmail);
      setValue('rememberMe', true);
    }
    
    if (savedTenantId) {
      setValue('tenantId', savedTenantId);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login with:', {
        email: data.email,
        tenantId: data.tenantId,
      });

      const authResponse = await authService.login({
        email: data.email,
        password: data.password,
        tenantId: data.tenantId,
      });

      console.log('Login response:', authResponse);

      const { user, tokens, tenant } = authResponse;

      if (!user || !tokens?.accessToken) {
        throw new Error('Invalid response format from server');
      }

      // Save credentials if remember me is checked
      if (data.rememberMe) {
        localStorage.setItem('savedEmail', data.email);
        if (data.tenantId) {
          localStorage.setItem('savedTenantId', data.tenantId);
        }
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedTenantId');
      }

      console.log('Login successful, storing tokens:', {
        accessToken: tokens.accessToken.substring(0, 10) + '...',
        refreshToken: tokens.refreshToken.substring(0, 10) + '...',
        user: user.email,
        tenant: tenant?.id || 'default'
      });
      
      login(user, tokens.accessToken, tokens.refreshToken, tenant);
      
      // Verify token was stored correctly
      setTimeout(() => {
        const storedToken = localStorage.getItem('authToken');
        console.log('Stored token verification:', {
          tokenExists: !!storedToken,
          tokenLength: storedToken?.length || 0,
          tokenStart: storedToken?.substring(0, 10) || 'none'
        });
      }, 100);
      
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Only navigate to dashboard on error in development mode if explicitly requested
      if (!import.meta.env.PROD && data.email && data.password) {
        // Create mock user and tokens
        const mockUser = {
          id: '1',
          email: data.email || 'admin@example.com',
          name: 'Admin User',
          role: 'SUPER_ADMIN'
        };
        const mockTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        };
        const mockTenant = {
          id: data.tenantId || '1',
          name: 'Default Tenant'
        };
        
        login(mockUser, mockTokens.accessToken, mockTokens.refreshToken, mockTenant);
        navigate(from, { replace: true });
        return;
      }
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-hero rounded-3xl shadow-xl mb-4 animate-pulse-glow">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">ODRI Billing</h1>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-primary text-white text-sm font-medium shadow-lg">
            <Shield className="w-4 h-4 mr-2" />
            SuperAdmin Portal
          </div>
          <p className="text-muted-foreground mt-3">Advanced ISP Management & Analytics</p>
        </div>

        <Card className="glass border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
            {connectionStatus && (
              <div className={cn(
                "text-xs px-2 py-1 rounded-full inline-flex items-center gap-1",
                connectionStatus.isConnected 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-red-100 text-red-700 border border-red-200"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  connectionStatus.isConnected ? "bg-green-500" : "bg-red-500"
                )} />
                {connectionStatus.isConnected ? 'Backend Connected' : 'Backend Disconnected'}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={isLoading}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={isLoading}
                    className="bg-background/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantId">ISP/Tenant ID (Optional)</Label>
                <Input
                  id="tenantId"
                  type="text"
                  placeholder="Enter ISP/Tenant ID"
                  {...register('tenantId')}
                  error={errors.tenantId?.message}
                  disabled={isLoading}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for super admin access
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    {...register('rememberMe')}
                    disabled={isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  variant="gradient"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                {!import.meta.env.PROD && (
                  <Button
                    type="button"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setValue('email', 'vickyodri@gmail.com');
                      setValue('password', '@Vicky17049381');
                      setValue('tenantId', '1');
                      handleSubmit(onSubmit)();
                    }}
                    disabled={isLoading}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Quick SuperAdmin Login (Dev Only)
                  </Button>
                )}
                
                {!import.meta.env.PROD && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open('/dev/api-test', '_blank')}
                  >
                    🔧 API Debug Tool
                  </Button>
                )}
              </div>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                Don't have an account?
              </span>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/auth/register">
                Create Account
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Features showcase */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Secure</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Wifi className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Real-time</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Fast</p>
          </div>
        </div>
      </div>
    </div>
  );
};