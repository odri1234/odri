import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, useRoutes, Navigate, createBrowserRouter } from 'react-router-dom';
import { routerConfig } from './router-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuthActions } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { setupInterceptors } from '@/lib/api-interceptors';
import { checkApiHealth } from '@/lib/api-health';
import { toast } from '@/hooks/use-toast';
import websocketService from '@/services/websocket.service';

// Create a query client with optimized real-time settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds - reduced for more real-time data
      refetchOnWindowFocus: true, // Enable refetch when window gets focus
      refetchOnMount: true, // Always refetch on component mount
      refetchOnReconnect: true, // Refetch when reconnecting
      refetchInterval: (query) => {
        // Set different refetch intervals based on query type
        if (query.queryKey[0] === 'dashboard-stats') return 15 * 1000; // 15 seconds
        if (query.queryKey[0] === 'active-sessions') return 10 * 1000; // 10 seconds
        if (query.queryKey[0] === 'alerts') return 20 * 1000; // 20 seconds
        if (query.queryKey[0] === 'system-health') return 30 * 1000; // 30 seconds
        return false; // No polling for other queries (WebSocket will handle them)
      },
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        });
      },
    },
  },
});

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Import enhanced ErrorBoundary
import EnhancedErrorBoundary from '@/components/common/ErrorBoundary';

// Import debug utilities in development
if (!import.meta.env.PROD) {
  import('@/utils/auth-debug');
}

// Lazy-loaded components
const DashboardLayout = React.lazy(() => 
  import('@/components/layout/DashboardLayout')
);

const AuthGuard = React.lazy(() => 
  import('@/components/guards/AuthGuard').then(module => ({ 
    default: module.AuthGuard 
  }))
);

const RoleGuard = React.lazy(() => 
  import('@/components/guards/RoleGuard')
);

// Auth pages
const LoginPage = React.lazy(() => 
  import('@/pages/auth/LoginPage').then(module => ({ 
    default: module.LoginPage 
  }))
);

const RegisterPage = React.lazy(() => 
  import('@/pages/auth/RegisterPage')
);

// Main pages
const Dashboard = React.lazy(() => 
  import('@/pages/dashboard/UltimateDashboard')
);

const UltimateDashboard = React.lazy(() => 
  import('@/pages/dashboard/UltimateDashboard')
);

const NotFound = React.lazy(() => 
  import('@/pages/NotFound')
);

// Feature pages with fallbacks
const createLazyComponent = (importFn: () => Promise<any>, fallbackText: string) => 
  React.lazy(() => 
    importFn().catch(() => ({ 
      default: () => <div className="p-6 text-center text-muted-foreground">{fallbackText}</div> 
    }))
  );

// Users
const UsersPage = createLazyComponent(
  () => import('@/pages/users/UsersPage'),
  'Users Page - Coming Soon'
);

const UsersListPage = createLazyComponent(
  () => import('@/pages/users/UsersListPage'),
  'Users List Page - Coming Soon'
);

const CreateUserPage = createLazyComponent(
  () => import('@/pages/users/CreateUserPage'),
  'Create User Page - Coming Soon'
);

const UserDetailsPage = createLazyComponent(
  () => import('@/pages/users/UserDetailsPage'),
  'User Details Page - Coming Soon'
);

const AdvancedUserManagement = createLazyComponent(
  () => import('@/pages/users/AdvancedUserManagement'),
  'Advanced User Management - Coming Soon'
);

// ISPs
const ISPsPage = createLazyComponent(
  () => import('@/pages/isps/ISPsPage'),
  'ISPs Page - Coming Soon'
);

const ISPsListPage = createLazyComponent(
  () => import('@/pages/isps/ISPsListPage'),
  'ISPs List Page - Coming Soon'
);

const CreateISPPage = createLazyComponent(
  () => import('@/pages/isps/CreateISPPage'),
  'Create ISP Page - Coming Soon'
);

const ISPDetailsPage = createLazyComponent(
  () => import('@/pages/isps/ISPDetailsPage'),
  'ISP Details Page - Coming Soon'
);

const AdvancedISPManagement = createLazyComponent(
  () => import('@/pages/isps/AdvancedISPManagement'),
  'Advanced ISP Management - Coming Soon'
);

// Plans
const PlansPage = createLazyComponent(
  () => import('@/pages/plans/PlansPage'),
  'Plans Page - Coming Soon'
);

const PlansListPage = createLazyComponent(
  () => import('@/pages/plans/PlansListPage'),
  'Plans List Page - Coming Soon'
);

const CreatePlanPage = createLazyComponent(
  () => import('@/pages/plans/CreatePlanPage'),
  'Create Plan Page - Coming Soon'
);

const PlanDetailsPage = createLazyComponent(
  () => import('@/pages/plans/PlanDetailsPage'),
  'Plan Details Page - Coming Soon'
);

// Payments
const PaymentsPage = createLazyComponent(
  () => import('@/pages/payments/PaymentsPage'),
  'Payments Page - Coming Soon'
);

const RefundsPage = createLazyComponent(
  () => import('@/pages/payments/RefundsPage'),
  'Refunds Page - Coming Soon'
);

const AdvancedPaymentGateway = createLazyComponent(
  () => import('@/pages/payments/AdvancedPaymentGateway'),
  'Advanced Payment Gateway - Coming Soon'
);

// Vouchers
const VouchersPage = createLazyComponent(
  () => import('@/pages/vouchers/VouchersPage'),
  'Vouchers Page - Coming Soon'
);

const GenerateVouchersPage = createLazyComponent(
  () => import('@/pages/vouchers/GenerateVouchersPage'),
  'Generate Vouchers Page - Coming Soon'
);

// Sessions
const SessionsPage = createLazyComponent(
  () => import('@/pages/sessions/SessionsPage'),
  'Sessions Page - Coming Soon'
);

const SessionsHistoryPage = createLazyComponent(
  () => import('@/pages/sessions/SessionsHistoryPage'),
  'Sessions History Page - Coming Soon'
);

const ActiveSessionsPage = createLazyComponent(
  () => import('@/pages/sessions/ActiveSessionsPage'),
  'Active Sessions Page - Coming Soon'
);

// MikroTik
const MikroTikPage = createLazyComponent(
  () => import('@/pages/mikrotik/MikroTikPage'),
  'MikroTik Page - Coming Soon'
);

const RoutersPage = createLazyComponent(
  () => import('@/pages/mikrotik/RoutersPage'),
  'Routers Page - Coming Soon'
);

const HotspotUsersPage = createLazyComponent(
  () => import('@/pages/mikrotik/HotspotUsersPage'),
  'Hotspot Users Page - Coming Soon'
);

const ConnectedUsersPage = createLazyComponent(
  () => import('@/pages/mikrotik/ConnectedUsersPage'),
  'Connected Users Page - Coming Soon'
);

const AddRouterPage = createLazyComponent(
  () => import('@/pages/mikrotik/AddRouterPage'),
  'Add Router Page'
);

// Analytics
const AnalyticsPage = createLazyComponent(
  () => import('@/pages/analytics/AnalyticsPage'),
  'Analytics Page - Coming Soon'
);

const RevenueAnalyticsPage = createLazyComponent(
  () => import('@/pages/analytics/RevenueAnalyticsPage'),
  'Revenue Analytics Page - Coming Soon'
);

const UsageAnalyticsPage = createLazyComponent(
  () => import('@/pages/analytics/UsageAnalyticsPage'),
  'Usage Analytics Page - Coming Soon'
);

const ReportsPage = createLazyComponent(
  () => import('@/pages/analytics/ReportsPage'),
  'Reports Page - Coming Soon'
);

// AI
const AnomalyDetectionPage = createLazyComponent(
  () => import('@/pages/ai/AnomalyDetectionPage'),
  'Anomaly Detection Page - Coming Soon'
);

const DynamicPricingPage = createLazyComponent(
  () => import('@/pages/ai/DynamicPricingPage'),
  'Dynamic Pricing Page - Coming Soon'
);

const AIAnalyticsDashboard = createLazyComponent(
  () => import('@/pages/ai/AIAnalyticsDashboard'),
  'AI Analytics Dashboard - Coming Soon'
);

const NetworkMonitoringDashboard = createLazyComponent(
  () => import('@/pages/monitoring/NetworkMonitoringDashboard'),
  'Network Monitoring Dashboard - Coming Soon'
);

const MultiTenantManagement = createLazyComponent(
  () => import('@/pages/tenants/MultiTenantManagement'),
  'Multi-Tenant Management - Coming Soon'
);

const PaymentGatewayManagement = createLazyComponent(
  () => import('@/pages/payments/PaymentGatewayManagement'),
  'Payment Gateway Management - Coming Soon'
);

const AICustomerSupport = createLazyComponent(
  () => import('@/pages/support/AICustomerSupport'),
  'AI Customer Support - Coming Soon'
);

const SuperAdminDashboard = createLazyComponent(
  () => import('@/pages/dashboard/SuperAdminDashboard'),
  'Super Admin Dashboard - Coming Soon'
);

const CustomerPortal = createLazyComponent(
  () => import('@/pages/customer/CustomerPortal'),
  'Customer Portal - Coming Soon'
);

const VoucherManagement = createLazyComponent(
  () => import('@/pages/vouchers/VoucherManagement'),
  'Voucher Management - Coming Soon'
);

// Monitoring
const SystemHealthPage = createLazyComponent(
  () => import('@/pages/monitoring/SystemHealthPage'),
  'System Health Page - Coming Soon'
);

const AlertsPage = createLazyComponent(
  () => import('@/pages/monitoring/AlertsPage'),
  'Alerts Page - Coming Soon'
);

// TR-069
const DeviceManagementPage = createLazyComponent(
  () => import('@/pages/tr069/DeviceManagementPage'),
  'TR-069 Device Management - Coming Soon'
);

// PPPoE
const PppoeManagementPage = createLazyComponent(
  () => import('@/pages/pppoe/PppoeManagementPage'),
  'PPPoE Management - Coming Soon'
);

// Other pages
const BackupRestorePage = createLazyComponent(
  () => import('@/pages/backup/BackupRestorePage'),
  'Backup & Restore Page - Coming Soon'
);

const SettingsPage = createLazyComponent(
  () => import('@/pages/settings/SettingsPage'),
  'Settings Page - Coming Soon'
);

const ProfilePage = createLazyComponent(
  () => import('@/pages/profile/ProfilePage'),
  'Profile Page - Coming Soon'
);

const HelpSupportPage = createLazyComponent(
  () => import('@/pages/help/HelpSupportPage'),
  'Help & Support Page - Coming Soon'
);

// Notifications
const NotificationsPage = createLazyComponent(
  () => import('@/pages/notifications/NotificationsPage'),
  'Notifications Page - Coming Soon'
);

// Audit
const AuditLogsPage = createLazyComponent(
  () => import('@/pages/audit/AuditLogsPage'),
  'Audit Logs Page - Coming Soon'
);

// Metrics
const MetricsPage = createLazyComponent(
  () => import('@/pages/metrics/MetricsPage'),
  'Metrics Page - Coming Soon'
);



// Development components
const ApiTester = React.lazy(() => 
  import('@/components/dev/ApiTester').then(module => ({ 
    default: module.ApiTester 
  }))
);


// Route wrapper components
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: UserRole[]; 
}) => (
  <AuthGuard requireAuth={true}>
    {allowedRoles ? (
      <RoleGuard allowedRoles={allowedRoles}>
        <DashboardLayout>{children}</DashboardLayout>
      </RoleGuard>
    ) : (
      <DashboardLayout>{children}</DashboardLayout>
    )}
  </AuthGuard>
);

const AuthRoute = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard requireAuth={false} redirectTo="/dashboard">
    {children}
  </AuthGuard>
);

// Routes configuration
const routes = [
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  // Auth routes - These must come before dashboard routes to ensure login is seen first
  {
    path: '/auth/login',
    element: <AuthRoute><LoginPage /></AuthRoute>,
  },
  {
    path: '/auth/register',
    element: <AuthRoute><RegisterPage /></AuthRoute>,
  },
  // Dashboard - Only accessible after authentication
  {
    path: '/dashboard',
    element: <ProtectedRoute><UltimateDashboard /></ProtectedRoute>,
  },
  {
    path: '/dashboard/super',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}><SuperAdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/dashboard/basic',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  // Users routes
  {
    path: '/users',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><UsersPage /></ProtectedRoute>,
  },
  {
    path: '/users/create',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><CreateUserPage /></ProtectedRoute>,
  },
  {
    path: '/users/:id',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><UserDetailsPage /></ProtectedRoute>,
  },
  {
    path: '/users/advanced',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}><AdvancedUserManagement /></ProtectedRoute>,
  },
  // ISPs routes
  {
    path: '/isps',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}><ISPsPage /></ProtectedRoute>,
  },
  {
    path: '/isps/create',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}><CreateISPPage /></ProtectedRoute>,
  },
  {
    path: '/isps/:id',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}><ISPDetailsPage /></ProtectedRoute>,
  },
  {
    path: '/isps/advanced',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}><AdvancedISPManagement /></ProtectedRoute>,
  },
  // Plans routes
  {
    path: '/plans',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><PlansPage /></ProtectedRoute>,
  },
  {
    path: '/plans/create',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><CreatePlanPage /></ProtectedRoute>,
  },
  {
    path: '/plans/:id',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><PlanDetailsPage /></ProtectedRoute>,
  },
  // Payments routes
  {
    path: '/payments',
    element: <ProtectedRoute><PaymentsPage /></ProtectedRoute>,
  },
  {
    path: '/payments/refunds',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><RefundsPage /></ProtectedRoute>,
  },
  {
    path: '/payments/advanced',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><AdvancedPaymentGateway /></ProtectedRoute>,
  },
  // Vouchers routes
  {
    path: '/vouchers',
    element: <ProtectedRoute><VouchersPage /></ProtectedRoute>,
  },
  {
    path: '/vouchers/generate',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><GenerateVouchersPage /></ProtectedRoute>,
  },
  // Sessions routes
  {
    path: '/sessions',
    element: <ProtectedRoute><SessionsPage /></ProtectedRoute>,
  },
  {
    path: '/sessions/active',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><ActiveSessionsPage /></ProtectedRoute>,
  },
  // MikroTik routes
  {
    path: '/mikrotik',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><MikroTikPage /></ProtectedRoute>,
  },
  {
    path: '/mikrotik/routers',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><RoutersPage /></ProtectedRoute>,
  },
  {
    path: '/mikrotik/hotspot',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><HotspotUsersPage /></ProtectedRoute>,
  },
  {
    path: '/mikrotik/connected',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><ConnectedUsersPage /></ProtectedRoute>,
  },
  // Analytics routes
  {
    path: '/analytics',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><AnalyticsPage /></ProtectedRoute>,
  },
  {
    path: '/analytics/revenue',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><RevenueAnalyticsPage /></ProtectedRoute>,
  },
  {
    path: '/analytics/usage',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><UsageAnalyticsPage /></ProtectedRoute>,
  },
  {
    path: '/analytics/reports',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><ReportsPage /></ProtectedRoute>,
  },
  // AI routes
  {
    path: '/ai/anomaly',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><AnomalyDetectionPage /></ProtectedRoute>,
  },
  {
    path: '/ai/pricing',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><DynamicPricingPage /></ProtectedRoute>,
  },
  {
    path: '/ai/dashboard',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><AIAnalyticsDashboard /></ProtectedRoute>,
  },
  {
    path: '/monitoring/network',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><NetworkMonitoringDashboard /></ProtectedRoute>,
  },
  {
    path: '/tenants',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}><MultiTenantManagement /></ProtectedRoute>,
  },
  {
    path: '/payments/gateways',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}><PaymentGatewayManagement /></ProtectedRoute>,
  },
  {
    path: '/support/ai',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><AICustomerSupport /></ProtectedRoute>,
  },
  {
    path: '/admin/super',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}><SuperAdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/customer/portal',
    element: <ProtectedRoute allowedRoles={[UserRole.CLIENT, UserRole.CUSTOMER]}><CustomerPortal /></ProtectedRoute>,
  },
  {
    path: '/vouchers',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP, UserRole.USER]}><VoucherManagement /></ProtectedRoute>,
  },
  // Monitoring routes
  {
    path: '/monitoring/health',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><SystemHealthPage /></ProtectedRoute>,
  },
  {
    path: '/monitoring/alerts',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><AlertsPage /></ProtectedRoute>,
  },
  // TR-069 routes
  {
    path: '/tr069/devices',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><DeviceManagementPage /></ProtectedRoute>,
  },
  // PPPoE routes
  {
    path: '/mikrotik/pppoe',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><PppoeManagementPage /></ProtectedRoute>,
  },
  // Other routes
  {
    path: '/backup',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}><BackupRestorePage /></ProtectedRoute>,
  },
  {
    path: '/settings',
    element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
  },
  {
    path: '/help',
    element: <ProtectedRoute><HelpSupportPage /></ProtectedRoute>,
  },
  // Notifications routes
  {
    path: '/notifications',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><NotificationsPage /></ProtectedRoute>,
  },
  // Audit routes
  {
    path: '/audit',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUDITOR]}><AuditLogsPage /></ProtectedRoute>,
  },
  // Metrics routes
  {
    path: '/metrics',
    element: <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP]}><MetricsPage /></ProtectedRoute>,
  },

  // Development routes (only in development)
  ...(process.env.NODE_ENV === 'development' ? [
    {
      path: '/dev/api-test',
      element: (
        <div className="min-h-screen p-8 bg-gray-50">
          <ApiTester />
        </div>
      ),
    },
 
  ] : []),
  // Catch all
  {
    path: '*',
    element: <NotFound />,
  },
];

// App Routes component
function AppRoutes() {
  const routing = useRoutes(routes);
  return routing;
}

// App initialization component
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, isAuthenticated } = useAuthActions();
  const [apiHealthy, setApiHealthy] = useState(true);

  // Initialize auth and API interceptors
  useEffect(() => {
    // Initialize auth state from localStorage
    initialize();
    
    // Setup API interceptors
    setupInterceptors();
    
    // Check API health
    const checkHealth = async () => {
      const isHealthy = await checkApiHealth();
      setApiHealthy(isHealthy);
      if (!isHealthy) {
        toast({
          title: "API Connection Issue",
          description: "Unable to connect to the backend API. Some features may not work properly.",
          variant: "destructive",
        });
      }
    };
    
    checkHealth();
    
    // Set up periodic health checks
    const healthInterval = setInterval(checkHealth, 60000); // Check every minute
    
    return () => {
      clearInterval(healthInterval);
    };
  }, [initialize]);
  
  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Connect to WebSocket for real-time updates
      websocketService.connect();
      
      // Set the query client for the WebSocket service
      websocketService.setQueryClient(queryClient);
      
      return () => {
        // Disconnect WebSocket when component unmounts or auth state changes
        websocketService.disconnect();
      };
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

// Main App component
function App() {
  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={routerConfig.future}>
          <AppInitializer>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </AppInitializer>
        </BrowserRouter>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
}

export default App;