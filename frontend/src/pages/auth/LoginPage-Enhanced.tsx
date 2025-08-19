import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth, useAuthActions } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types/common';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Shield, 
  Crown,
  Building,
  Users,
  Wifi,
  Globe,
  Lock,
  Mail,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Two-factor authentication schema
const twoFactorSchema = z.object({
  code: z.string().length(6, 'Please enter a 6-digit code'),
});

type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

export default function LoginPageEnhanced() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useAuth();
  const { login, setLoading, setError, clearError } = useAuthActions();
  
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // Main login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Two-factor form
  const twoFactorForm = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle login attempts blocking
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsBlocked(true);
      setBlockTimeRemaining(300); // 5 minutes
      
      const interval = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [loginAttempts]);

  const handleLogin = async (data: LoginFormData) => {
    if (isBlocked) return;

    setLoading(true);
    clearError();

    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (response.requiresTwoFactor && response.tempToken) {
        setRequiresTwoFactor(true);
        setTempToken(response.tempToken);
        setLoading(false);
        return;
      }

      // Successful login
      login(response.user, response.tokens.accessToken, response.tokens.refreshToken, response.tenant);
      
      // Reset login attempts on successful login
      setLoginAttempts(0);
      
      navigate(from, { replace: true });
    } catch (error: any) {
      setLoginAttempts(prev => prev + 1);
      setError(error.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleTwoFactorVerification = async (data: TwoFactorFormData) => {
    setLoading(true);
    clearError();

    try {
      const response = await authService.verifyTwoFactor({
        tempToken,
        code: data.code,
      });

      login(response.user, response.tokens.accessToken, response.tokens.refreshToken, response.tenant);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequiresTwoFactor(false);
    setTempToken('');
    twoFactorForm.reset();
    clearError();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Demo credentials for different roles
  const demoCredentials = [
    { role: 'Super Admin', email: 'superadmin@odri.com', password: 'admin123', icon: Crown, color: 'bg-purple-100 text-purple-800' },
    { role: 'Admin', email: 'admin@odri.com', password: 'admin123', icon: Shield, color: 'bg-blue-100 text-blue-800' },
    { role: 'ISP Admin', email: 'isp@technet.com', password: 'isp123', icon: Building, color: 'bg-green-100 text-green-800' },
    { role: 'ISP Staff', email: 'staff@technet.com', password: 'staff123', icon: Users, color: 'bg-orange-100 text-orange-800' },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    loginForm.setValue('email', email);
    loginForm.setValue('password', password);
  };

  if (requiresTwoFactor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={twoFactorForm.handleSubmit(handleTwoFactorVerification)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  {...twoFactorForm.register('code')}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {twoFactorForm.formState.errors.code && (
                  <p className="text-sm text-red-600">{twoFactorForm.formState.errors.code.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleBackToLogin}>
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Wifi className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ODRI</h1>
                <p className="text-gray-600">Internet Billing System</p>
              </div>
            </div>
            <p className="text-lg text-gray-700">
              Complete ISP management solution with advanced billing, user management, and network monitoring.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Building className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Multi-ISP Support</h3>
              <p className="text-sm text-gray-600">Manage multiple ISPs with isolated data</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold">User Management</h3>
              <p className="text-sm text-gray-600">Complete user lifecycle management</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Globe className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold">MikroTik Integration</h3>
              <p className="text-sm text-gray-600">Seamless router management</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-orange-600 mb-2" />
              <h3 className="font-semibold">Secure & Scalable</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security</p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Demo Accounts</h3>
            <div className="grid grid-cols-1 gap-2">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    <cred.icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <Badge variant="outline" className={cn("text-xs", cred.color)}>
                        {cred.role}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{cred.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials(cred.email, cred.password)}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your ODRI account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register('email')}
                    placeholder="Enter your email"
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...loginForm.register('password')}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={loginForm.watch('rememberMe')}
                    onCheckedChange={(checked) => loginForm.setValue('rememberMe', checked as boolean)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isBlocked && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Too many failed attempts. Please wait {formatTime(blockTimeRemaining)} before trying again.
                  </AlertDescription>
                </Alert>
              )}

              {loginAttempts > 0 && loginAttempts < 5 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {5 - loginAttempts} attempts remaining before temporary lockout.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isBlocked}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/auth/register"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Contact your administrator
                  </Link>
                </p>
              </div>
            </div>

            {/* Mobile Demo Credentials */}
            <div className="lg:hidden mt-6 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Demo Accounts</h4>
              <div className="grid grid-cols-1 gap-2">
                {demoCredentials.slice(0, 2).map((cred, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <cred.icon className="h-4 w-4 text-gray-600" />
                      <div>
                        <Badge variant="outline" className={cn("text-xs", cred.color)}>
                          {cred.role}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(cred.email, cred.password)}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}