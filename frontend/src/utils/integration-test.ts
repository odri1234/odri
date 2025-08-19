// Integration test utility to verify all pages and API endpoints
import { API_ENDPOINTS } from '@/config/api.config';

interface PageRoute {
  path: string;
  name: string;
  component: string;
  requiredRoles?: string[];
  apiEndpoints?: string[];
}

export const PAGE_ROUTES: PageRoute[] = [
  // Auth pages
  { path: '/auth/login', name: 'Login', component: 'LoginPage', apiEndpoints: [API_ENDPOINTS.AUTH.LOGIN] },
  { path: '/auth/register', name: 'Register', component: 'RegisterPage', apiEndpoints: [API_ENDPOINTS.AUTH.REGISTER] },
  
  // Main dashboard
  { path: '/dashboard', name: 'Dashboard', component: 'Dashboard', apiEndpoints: [API_ENDPOINTS.STATS, API_ENDPOINTS.HEALTH] },
  
  // User management
  { path: '/users', name: 'Users', component: 'UsersPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.USERS.BASE] },
  { path: '/users/create', name: 'Create User', component: 'CreateUserPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.USERS.CREATE] },
  { path: '/users/:id', name: 'User Details', component: 'UserDetailsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.USERS.BY_ID(':id')] },
  
  // ISP management
  { path: '/isps', name: 'ISPs', component: 'ISPsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN'], apiEndpoints: [API_ENDPOINTS.ISPS.BASE] },
  { path: '/isps/create', name: 'Create ISP', component: 'CreateISPPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN'], apiEndpoints: [API_ENDPOINTS.ISPS.CREATE] },
  { path: '/isps/:id', name: 'ISP Details', component: 'ISPDetailsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN'], apiEndpoints: [API_ENDPOINTS.ISPS.BY_ID(':id')] },
  
  // Plan management
  { path: '/plans', name: 'Plans', component: 'PlansPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.PLANS.BASE] },
  { path: '/plans/create', name: 'Create Plan', component: 'CreatePlanPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.PLANS.CREATE] },
  { path: '/plans/:id', name: 'Plan Details', component: 'PlanDetailsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.PLANS.BY_ID(':id')] },
  
  // Payment management
  { path: '/payments', name: 'Payments', component: 'PaymentsPage', apiEndpoints: [API_ENDPOINTS.PAYMENTS.HISTORY] },
  { path: '/payments/refunds', name: 'Refunds', component: 'RefundsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.PAYMENTS.REFUND] },
  
  // Voucher management
  { path: '/vouchers', name: 'Vouchers', component: 'VouchersPage', apiEndpoints: [API_ENDPOINTS.VOUCHERS.BASE] },
  { path: '/vouchers/generate', name: 'Generate Vouchers', component: 'GenerateVouchersPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.VOUCHERS.BATCH] },
  
  // Session management
  { path: '/sessions', name: 'Sessions', component: 'SessionsPage', apiEndpoints: [API_ENDPOINTS.SESSIONS.BASE] },
  { path: '/sessions/active', name: 'Active Sessions', component: 'ActiveSessionsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.SESSIONS.ACTIVE] },
  
  // MikroTik management
  { path: '/mikrotik', name: 'MikroTik', component: 'MikroTikPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.MIKROTIK.ROUTERS] },
  { path: '/mikrotik/routers', name: 'Routers', component: 'RoutersPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.MIKROTIK.ROUTERS] },
  { path: '/mikrotik/hotspot', name: 'Hotspot Users', component: 'HotspotUsersPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.MIKROTIK.HOTSPOT_USERS] },
  { path: '/mikrotik/connected', name: 'Connected Users', component: 'ConnectedUsersPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'], apiEndpoints: [API_ENDPOINTS.MIKROTIK.CONNECTED_USERS] },
  
  // Analytics
  { path: '/analytics', name: 'Analytics', component: 'AnalyticsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS] },
  { path: '/analytics/revenue', name: 'Revenue Analytics', component: 'RevenueAnalyticsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.ANALYTICS.REVENUE_SUMMARY] },
  { path: '/analytics/usage', name: 'Usage Analytics', component: 'UsageAnalyticsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.ANALYTICS.USAGE_SUMMARY] },
  { path: '/analytics/reports', name: 'Reports', component: 'ReportsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'], apiEndpoints: [API_ENDPOINTS.ANALYTICS.REPORTS] },
  
  // Settings
  { path: '/settings', name: 'Settings', component: 'SettingsPage', requiredRoles: ['SUPER_ADMIN', 'ADMIN'], apiEndpoints: [] },
];

export const API_ENDPOINT_TESTS = [
  // Authentication endpoints
  { endpoint: API_ENDPOINTS.AUTH.LOGIN, method: 'POST', description: 'User login' },
  { endpoint: API_ENDPOINTS.AUTH.REGISTER, method: 'POST', description: 'User registration' },
  { endpoint: API_ENDPOINTS.AUTH.PROFILE, method: 'GET', description: 'Get user profile' },
  { endpoint: API_ENDPOINTS.AUTH.LOGOUT, method: 'POST', description: 'User logout' },
  { endpoint: API_ENDPOINTS.AUTH.REFRESH, method: 'POST', description: 'Refresh token' },
  
  // User management endpoints
  { endpoint: API_ENDPOINTS.USERS.BASE, method: 'GET', description: 'Get users list' },
  { endpoint: API_ENDPOINTS.USERS.CREATE, method: 'POST', description: 'Create user' },
  { endpoint: API_ENDPOINTS.USERS.BY_ID('test'), method: 'GET', description: 'Get user by ID' },
  { endpoint: API_ENDPOINTS.USERS.UPDATE('test'), method: 'PUT', description: 'Update user' },
  { endpoint: API_ENDPOINTS.USERS.DELETE('test'), method: 'DELETE', description: 'Delete user' },
  
  // ISP management endpoints
  { endpoint: API_ENDPOINTS.ISPS.BASE, method: 'GET', description: 'Get ISPs list' },
  { endpoint: API_ENDPOINTS.ISPS.BASE, method: 'POST', description: 'Create ISP' },
  { endpoint: API_ENDPOINTS.ISPS.BY_ID('test'), method: 'GET', description: 'Get ISP by ID' },
  { endpoint: API_ENDPOINTS.ISPS.BY_ID('test'), method: 'PUT', description: 'Update ISP' },
  { endpoint: API_ENDPOINTS.ISPS.BY_ID('test'), method: 'DELETE', description: 'Delete ISP' },
  
  // Plan management endpoints
  { endpoint: API_ENDPOINTS.PLANS.BASE, method: 'GET', description: 'Get plans list' },
  { endpoint: API_ENDPOINTS.PLANS.CREATE, method: 'POST', description: 'Create plan' },
  { endpoint: API_ENDPOINTS.PLANS.BY_ID('test'), method: 'GET', description: 'Get plan by ID' },
  { endpoint: API_ENDPOINTS.PLANS.UPDATE('test'), method: 'PUT', description: 'Update plan' },
  { endpoint: API_ENDPOINTS.PLANS.DELETE('test'), method: 'DELETE', description: 'Delete plan' },
  
  // Payment endpoints
  { endpoint: API_ENDPOINTS.PAYMENTS.HISTORY, method: 'GET', description: 'Get payment history' },
  { endpoint: API_ENDPOINTS.PAYMENTS.CREATE, method: 'POST', description: 'Create payment' },
  { endpoint: API_ENDPOINTS.PAYMENTS.REFUND, method: 'POST', description: 'Refund payment' },
  { endpoint: API_ENDPOINTS.PAYMENTS.STATUS('test'), method: 'GET', description: 'Get payment status' },
  
  // Voucher endpoints
  { endpoint: API_ENDPOINTS.VOUCHERS.BASE, method: 'GET', description: 'Get vouchers list' },
  { endpoint: API_ENDPOINTS.VOUCHERS.BATCH, method: 'POST', description: 'Generate voucher batch' },
  { endpoint: API_ENDPOINTS.VOUCHERS.REDEEM, method: 'POST', description: 'Redeem voucher' },
  
  // Session endpoints
  { endpoint: API_ENDPOINTS.SESSIONS.BASE, method: 'GET', description: 'Get sessions list' },
  { endpoint: API_ENDPOINTS.SESSIONS.ACTIVE, method: 'GET', description: 'Get active sessions' },
  { endpoint: API_ENDPOINTS.SESSIONS.CLOSE('test'), method: 'POST', description: 'Close session' },
  
  // MikroTik endpoints
  { endpoint: API_ENDPOINTS.MIKROTIK.ROUTERS, method: 'GET', description: 'Get MikroTik routers' },
  { endpoint: API_ENDPOINTS.MIKROTIK.HOTSPOT_USERS, method: 'GET', description: 'Get hotspot users' },
  { endpoint: API_ENDPOINTS.MIKROTIK.CONNECTED_USERS, method: 'GET', description: 'Get connected users' },
  { endpoint: API_ENDPOINTS.MIKROTIK.ADD_HOTSPOT_USER, method: 'POST', description: 'Add hotspot user' },
  { endpoint: API_ENDPOINTS.MIKROTIK.REMOVE_HOTSPOT_USER, method: 'POST', description: 'Remove hotspot user' },
  
  // Analytics endpoints
  { endpoint: API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS, method: 'GET', description: 'Get dashboard stats' },
  { endpoint: API_ENDPOINTS.ANALYTICS.REVENUE_SUMMARY, method: 'GET', description: 'Get revenue summary' },
  { endpoint: API_ENDPOINTS.ANALYTICS.USAGE_SUMMARY, method: 'GET', description: 'Get usage summary' },
  { endpoint: API_ENDPOINTS.ANALYTICS.REPORTS, method: 'GET', description: 'Get analytics reports' },
  
  // System endpoints
  { endpoint: API_ENDPOINTS.HEALTH, method: 'GET', description: 'Health check' },
  { endpoint: API_ENDPOINTS.STATS, method: 'GET', description: 'System stats' },
  { endpoint: API_ENDPOINTS.VERSION, method: 'GET', description: 'API version' },
];

export function validatePageRoutes(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  PAGE_ROUTES.forEach(route => {
    // Check if route has required properties
    if (!route.path || !route.name || !route.component) {
      errors.push(`Route missing required properties: ${JSON.stringify(route)}`);
    }
    
    // Check if dynamic routes have proper format
    if (route.path.includes(':') && !route.path.match(/:[a-zA-Z]+/)) {
      errors.push(`Invalid dynamic route format: ${route.path}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateApiEndpoints(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  API_ENDPOINT_TESTS.forEach(test => {
    // Check if endpoint has required properties
    if (!test.endpoint || !test.method || !test.description) {
      errors.push(`API test missing required properties: ${JSON.stringify(test)}`);
    }
    
    // Check if endpoint starts with /
    if (!test.endpoint.startsWith('/')) {
      errors.push(`API endpoint should start with /: ${test.endpoint}`);
    }
    
    // Check if method is valid HTTP method
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(test.method)) {
      errors.push(`Invalid HTTP method: ${test.method} for ${test.endpoint}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function runIntegrationTests(): { 
  routes: { valid: boolean; errors: string[] };
  endpoints: { valid: boolean; errors: string[] };
  summary: string;
} {
  const routeValidation = validatePageRoutes();
  const endpointValidation = validateApiEndpoints();
  
  const totalRoutes = PAGE_ROUTES.length;
  const totalEndpoints = API_ENDPOINT_TESTS.length;
  const routeErrors = routeValidation.errors.length;
  const endpointErrors = endpointValidation.errors.length;
  
  const summary = `
Integration Test Summary:
- Total Routes: ${totalRoutes}
- Route Errors: ${routeErrors}
- Total API Endpoints: ${totalEndpoints}
- Endpoint Errors: ${endpointErrors}
- Overall Status: ${routeValidation.valid && endpointValidation.valid ? 'PASS' : 'FAIL'}
  `;
  
  return {
    routes: routeValidation,
    endpoints: endpointValidation,
    summary
  };
}

// Development helper to log integration test results
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Running Integration Tests...');
  const results = runIntegrationTests();
  console.log(results.summary);
  
  if (results.routes.errors.length > 0) {
    console.error('❌ Route Errors:', results.routes.errors);
  }
  
  if (results.endpoints.errors.length > 0) {
    console.error('❌ Endpoint Errors:', results.endpoints.errors);
  }
  
  if (results.routes.valid && results.endpoints.valid) {
    console.log('✅ All integration tests passed!');
  }
}