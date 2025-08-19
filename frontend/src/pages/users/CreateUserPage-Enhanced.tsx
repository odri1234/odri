import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateUser } from '@/hooks/api/useUsers';
import { useISPs } from '@/hooks/api/useISPs';
import { usePlans } from '@/hooks/api/usePlans';
import { useAuth } from '@/store/auth.store';
import { UserRole, CreateUserFormData } from '@/types/common';
import { 
  UserPlus, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Shield, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().default(true),
  ispId: z.string().optional(),
  planId: z.string().optional(),
  expiryDate: z.string().optional(),
  enableHotspot: z.boolean().default(true),
  enablePPPoE: z.boolean().default(false),
  require2FA: z.boolean().default(false),
  autoSuspendAfterDays: z.number().optional(),
  notificationEmail: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  // ISP is required for certain roles
  if ([UserRole.ISP, UserRole.CLIENT].includes(data.role) && !data.ispId) {
    return false;
  }
  return true;
}, {
  message: "ISP is required for this role",
  path: ["ispId"],
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // API Hooks
  const createUserMutation = useCreateUser();
  const { data: isps, isLoading: ispsLoading } = useISPs();
  const { data: plansData } = usePlans();

  // Form setup
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: UserRole.CLIENT,
      isActive: true,
      ispId: '',
      planId: '',
      expiryDate: '',
      enableHotspot: true,
      enablePPPoE: false,
      require2FA: false,
      notificationEmail: '',
      notes: '',
    },
  });

  const watchedRole = form.watch('role');
  const watchedIspId = form.watch('ispId');

  // Get available roles based on current user
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    switch (currentUser.role) {
      case UserRole.SUPER_ADMIN:
        return Object.values(UserRole);
      case UserRole.ADMIN:
        return [UserRole.ISP, UserRole.USER, UserRole.CLIENT, UserRole.AUDITOR];
      case UserRole.ISP:
        return [UserRole.USER, UserRole.CLIENT];
      default:
        return [];
    }
  };

  // Get filtered plans based on selected ISP
  const getFilteredPlans = () => {
    if (!plansData || !watchedIspId) return [];
    return plansData.filter(plan => plan.ispId === watchedIspId);
  };

  // Handle form submission
  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      const { confirmPassword, ...userData } = data;
      
      // Convert form data to API format
      const createUserData: CreateUserFormData = {
        ...userData,
        autoSuspendAfterDays: data.autoSuspendAfterDays || undefined,
        expiryDate: data.expiryDate || undefined,
        notificationEmail: data.notificationEmail || undefined,
        notes: data.notes || undefined,
      };

      await createUserMutation.mutateAsync(createUserData);
      navigate('/users');
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Role descriptions
  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      [UserRole.SUPER_ADMIN]: 'Full system access with all permissions',
      [UserRole.ADMIN]: 'Administrative access to manage ISPs and users',
      [UserRole.ISP]: 'ISP owner with access to their network and users',
      [UserRole.USER]: 'ISP staff member with limited administrative access',
      [UserRole.CLIENT]: 'End user with access to their account only',
      [UserRole.AUDITOR]: 'Read-only access for auditing purposes',
    };
    return descriptions[role];
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800',
      [UserRole.ADMIN]: 'bg-orange-100 text-orange-800',
      [UserRole.ISP]: 'bg-blue-100 text-blue-800',
      [UserRole.USER]: 'bg-green-100 text-green-800',
      [UserRole.CLIENT]: 'bg-purple-100 text-purple-800',
      [UserRole.AUDITOR]: 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New User</h1>
          <p className="text-muted-foreground">
            Add a new user to the system with appropriate permissions
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the user's personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="john@example.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="+1234567890" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Role and Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role and Permissions
              </CardTitle>
              <CardDescription>
                Set the user's role and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableRoles().map((role) => (
                          <SelectItem key={role} value={role || "NO_ROLE"}>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", getRoleColor(role))}>
                                {role.replace('_', ' ')}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {watchedRole && (
                      <FormDescription>
                        {getRoleDescription(watchedRole)}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ISP Selection - Required for ISP and CLIENT roles */}
              {[UserRole.ISP, UserRole.CLIENT, UserRole.USER].includes(watchedRole) && (
                <FormField
                  control={form.control}
                  name="ispId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISP {[UserRole.ISP, UserRole.CLIENT].includes(watchedRole) && '*'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an ISP" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isps?.map((isp) => (
                            <SelectItem key={isp.id} value={isp.id || "default-isp"}>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                {isp.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Plan Selection - For CLIENT role */}
              {watchedRole === UserRole.CLIENT && watchedIspId && (
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Plan (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getFilteredPlans().map((plan) => (
                            <SelectItem key={plan.id} value={plan.id || "default-plan"}>
                              {plan.name} - {plan.price} {plan.currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default plan for this client
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this user account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="require2FA"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require 2FA</FormLabel>
                        <FormDescription>
                          Require two-factor authentication
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings - For CLIENT role */}
          {watchedRole === UserRole.CLIENT && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Client Settings
                </CardTitle>
                <CardDescription>
                  Configure client-specific settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="enableHotspot"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Hotspot</FormLabel>
                          <FormDescription>
                            Allow hotspot authentication
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enablePPPoE"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable PPPoE</FormLabel>
                          <FormDescription>
                            Allow PPPoE authentication
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Account will be suspended after this date
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoSuspendAfterDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto Suspend After (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Suspend account after inactive days
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notificationEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Email (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="notifications@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Alternative email for notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Add any additional information about this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this user..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/users">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="min-w-[120px]"
            >
              {createUserMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}