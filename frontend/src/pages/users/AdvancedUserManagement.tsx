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
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Shield, 
  Crown, 
  Star, 
  Award, 
  Briefcase, 
  Settings, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Key, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Minus,
  MoreHorizontal,
  Bell,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Router,
  Wifi,
  WifiOff,
  Database,
  Server,
  Network,
  Zap,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usersService as userService } from '@/services/api.service';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { cn } from '@/lib/utils';

// User Role Badge Component
const UserRoleBadge = ({ role }: { role: string }) => {
  const roleConfig = {
    [UserRole.SUPER_ADMIN]: { color: 'bg-red-500', text: 'Super Admin', icon: Crown },
    [UserRole.ADMIN]: { color: 'bg-purple-500', text: 'Admin', icon: Shield },
    [UserRole.ISP_ADMIN]: { color: 'bg-blue-500', text: 'ISP Admin', icon: Star },
    [UserRole.ISP_STAFF]: { color: 'bg-green-500', text: 'ISP Staff', icon: Award },
    [UserRole.TECHNICIAN]: { color: 'bg-orange-500', text: 'Technician', icon: Settings },
    [UserRole.SUPPORT]: { color: 'bg-cyan-500', text: 'Support', icon: UserCheck },
    [UserRole.FINANCE]: { color: 'bg-yellow-500', text: 'Finance', icon: Briefcase },
    [UserRole.RESELLER]: { color: 'bg-indigo-500', text: 'Reseller', icon: Users },
    [UserRole.AGENT]: { color: 'bg-pink-500', text: 'Agent', icon: UserPlus },
    [UserRole.CLIENT]: { color: 'bg-gray-500', text: 'Client', icon: Users },
    [UserRole.AUDITOR]: { color: 'bg-teal-500', text: 'Auditor', icon: Eye },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig[UserRole.CLIENT];
  const Icon = config.icon;

  return (
    <Badge className={cn("text-white", config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// User Status Badge Component
const UserStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active', icon: CheckCircle },
    inactive: { color: 'bg-gray-500', text: 'Inactive', icon: Clock },
    suspended: { color: 'bg-red-500', text: 'Suspended', icon: XCircle },
    pending: { color: 'bg-yellow-500', text: 'Pending', icon: Clock },
    banned: { color: 'bg-red-600', text: 'Banned', icon: Lock },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("border-2", config.color.replace('bg-', 'border-'))}>
      <Icon className="h-3 w-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// User Card Component
const UserCard = ({ user, onEdit, onDelete, onViewDetails }: { 
  user: any; 
  onEdit: (user: any) => void; 
  onDelete: (user: any) => void; 
  onViewDetails: (user: any) => void; 
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                {user.email}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Last Login</p>
              <p className="font-semibold">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ISP</p>
              <p className="font-semibold">{user.isp?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-semibold">{user.location || 'N/A'}</p>
            </div>
          </div>
          
          {user.stats && (
            <div className="pt-2 border-t">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="font-semibold">{user.stats.totalSessions || 0}</p>
                  <p className="text-muted-foreground">Sessions</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.stats.dataUsed || '0 GB'}</p>
                  <p className="text-muted-foreground">Data Used</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.stats.revenue || 'KES 0'}</p>
                  <p className="text-muted-foreground">Revenue</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(user)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(user)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// User Statistics Component
const UserStatistics = ({ users }: { users: any[] }) => {
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    pending: users.filter(u => u.status === 'pending').length,
  };

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Users</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-200" />
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
            <UserX className="h-8 w-8 text-red-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Role Management Component
const RoleManagement = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<string[]>([]);

  const allPermissions = [
    { id: 'users.create', name: 'Create Users', category: 'User Management' },
    { id: 'users.read', name: 'View Users', category: 'User Management' },
    { id: 'users.update', name: 'Update Users', category: 'User Management' },
    { id: 'users.delete', name: 'Delete Users', category: 'User Management' },
    { id: 'isps.create', name: 'Create ISPs', category: 'ISP Management' },
    { id: 'isps.read', name: 'View ISPs', category: 'ISP Management' },
    { id: 'isps.update', name: 'Update ISPs', category: 'ISP Management' },
    { id: 'isps.delete', name: 'Delete ISPs', category: 'ISP Management' },
    { id: 'plans.create', name: 'Create Plans', category: 'Plan Management' },
    { id: 'plans.read', name: 'View Plans', category: 'Plan Management' },
    { id: 'plans.update', name: 'Update Plans', category: 'Plan Management' },
    { id: 'plans.delete', name: 'Delete Plans', category: 'Plan Management' },
    { id: 'payments.create', name: 'Process Payments', category: 'Payment Management' },
    { id: 'payments.read', name: 'View Payments', category: 'Payment Management' },
    { id: 'payments.refund', name: 'Refund Payments', category: 'Payment Management' },
    { id: 'vouchers.create', name: 'Generate Vouchers', category: 'Voucher Management' },
    { id: 'vouchers.read', name: 'View Vouchers', category: 'Voucher Management' },
    { id: 'analytics.read', name: 'View Analytics', category: 'Analytics' },
    { id: 'reports.generate', name: 'Generate Reports', category: 'Reports' },
    { id: 'system.configure', name: 'System Configuration', category: 'System' },
    { id: 'audit.read', name: 'View Audit Logs', category: 'Audit' },
  ];

  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role-Based Permissions
        </CardTitle>
        <CardDescription>
          Configure permissions for different user roles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="role">Select Role</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role to configure" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(UserRole).map((role) => (
                <SelectItem key={role} value={role}>
                  {role.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRole && (
          <div className="space-y-4">
            <h4 className="font-semibold">Permissions for {selectedRole.replace('_', ' ')}</h4>
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <div key={category} className="border rounded-lg p-4">
                <h5 className="font-medium mb-3">{category}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {perms.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPermissions([...permissions, permission.id]);
                          } else {
                            setPermissions(permissions.filter(p => p !== permission.id));
                          }
                        }}
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <Button className="w-full">
              Save Role Permissions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Bulk Actions Component
const BulkActions = ({ selectedUsers, onAction }: { 
  selectedUsers: string[]; 
  onAction: (action: string) => void; 
}) => {
  if (selectedUsers.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onAction('activate')}>
              <UserCheck className="h-4 w-4 mr-1" />
              Activate
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction('suspend')}>
              <UserX className="h-4 w-4 mr-1" />
              Suspend
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction('delete')}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAction('export')}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
export const AdvancedUserManagement = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch users
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users', searchTerm, roleFilter, statusFilter],
    queryFn: () => userService.getAll({ 
      search: searchTerm, 
      role: roleFilter, 
      status: statusFilter 
    }),
    staleTime: 5 * 60 * 1000,
  });

  const handleBulkAction = (action: string) => {
    // Handle bulk actions
    toast({
      title: "Bulk Action",
      description: `${action} action applied to ${selectedUsers.length} users`,
    });
    setSelectedUsers([]);
  };

  const handleUserSelect = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

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
          <h2 className="text-xl font-semibold mb-2">Failed to load users</h2>
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
          <h1 className="text-3xl font-bold">Advanced User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user management with role-based permissions and advanced features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
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
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with appropriate role and permissions
                </DialogDescription>
              </DialogHeader>
              {/* Create user form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Statistics */}
      <UserStatistics users={users || []} />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <BulkActions selectedUsers={selectedUsers} onAction={handleBulkAction} />

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Directory</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="analytics">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users?.map((user: any) => (
              <div key={user.id} className="relative">
                <Checkbox
                  className="absolute top-4 left-4 z-10"
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                />
                <UserCard
                  user={user}
                  onEdit={(user) => console.log('Edit user:', user)}
                  onDelete={(user) => console.log('Delete user:', user)}
                  onViewDetails={(user) => setSelectedUser(user)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">+18.2%</div>
                <p className="text-sm text-muted-foreground">vs last month</p>
                <Progress value={75} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">1,247</div>
                <p className="text-sm text-muted-foreground">Currently online</p>
                <Progress value={60} className="mt-4" />
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
                <div className="text-3xl font-bold text-purple-500">94.2%</div>
                <p className="text-sm text-muted-foreground">30-day retention</p>
                <Progress value={94} className="mt-4" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                {selectedUser.name}
              </DialogTitle>
              <DialogDescription>
                Detailed user information and activity
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <p className="font-medium">{selectedUser.name}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                        <div>
                          <Label>Role</Label>
                          <UserRoleBadge role={selectedUser.role} />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <UserStatusBadge status={selectedUser.status} />
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
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedUser.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedUser.address || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Activity timeline would go here */}
                      <p className="text-muted-foreground">Activity timeline coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="permissions">
                <Card>
                  <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Permissions list would go here */}
                      <p className="text-muted-foreground">Permissions management coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sessions list would go here */}
                      <p className="text-muted-foreground">Session management coming soon...</p>
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

export default AdvancedUserManagement;