// Page integration test utility
import { API_ENDPOINTS } from '@/config/api.config';

interface PageIntegration {
  pageName: string;
  route: string;
  component: string;
  apiEndpoints: string[];
  requiredRoles: string[];
  features: string[];
  status: 'implemented' | 'partial' | 'placeholder';
}

export const PAGE_INTEGRATIONS: PageIntegration[] = [
  // Authentication Pages
  {
    pageName: 'Login Page',
    route: '/auth/login',
    component: 'LoginPage',
    apiEndpoints: [API_ENDPOINTS.AUTH.LOGIN, API_ENDPOINTS.AUTH.ENABLE_2FA],
    requiredRoles: ['public'],
    features: ['Email/Password Login', '2FA Support', 'Tenant Selection', 'Remember Me'],
    status: 'implemented'
  },
  {
    pageName: 'Register Page',
    route: '/auth/register',
    component: 'RegisterPage',
    apiEndpoints: [API_ENDPOINTS.AUTH.REGISTER],
    requiredRoles: ['public'],
    features: ['User Registration', 'Email Verification', 'Form Validation'],
    status: 'implemented'
  },

  // Dashboard
  {
    pageName: 'Dashboard',
    route: '/dashboard',
    component: 'Dashboard',
    apiEndpoints: [API_ENDPOINTS.STATS, API_ENDPOINTS.HEALTH],
    requiredRoles: ['all'],
    features: ['Statistics Cards', 'Quick Actions', 'System Health', 'Recent Activity'],
    status: 'implemented'
  },

  // User Management
  {
    pageName: 'Users Page',
    route: '/users',
    component: 'UsersPage',
    apiEndpoints: [API_ENDPOINTS.USERS.BASE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['User List', 'Search & Filter', 'Pagination', 'Bulk Actions', 'Role Management'],
    status: 'implemented'
  },
  {
    pageName: 'Create User Page',
    route: '/users/create',
    component: 'CreateUserPage',
    apiEndpoints: [API_ENDPOINTS.USERS.CREATE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['User Creation Form', 'Role Assignment', 'Email Verification'],
    status: 'implemented'
  },
  {
    pageName: 'User Details Page',
    route: '/users/:id',
    component: 'UserDetailsPage',
    apiEndpoints: [API_ENDPOINTS.USERS.BY_ID(':id'), API_ENDPOINTS.USERS.UPDATE(':id')],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['User Profile', 'Edit User', 'Activity History', 'Session Management'],
    status: 'implemented'
  },

  // ISP Management
  {
    pageName: 'ISPs Page',
    route: '/isps',
    component: 'ISPsPage',
    apiEndpoints: [API_ENDPOINTS.ISPS.BASE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    features: ['ISP List', 'Search & Filter', 'ISP Statistics', 'Status Management'],
    status: 'implemented'
  },
  {
    pageName: 'Create ISP Page',
    route: '/isps/create',
    component: 'CreateISPPage',
    apiEndpoints: [API_ENDPOINTS.ISPS.BASE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    features: ['ISP Creation', 'Admin User Setup', 'Configuration'],
    status: 'implemented'
  },
  {
    pageName: 'ISP Details Page',
    route: '/isps/:id',
    component: 'ISPDetailsPage',
    apiEndpoints: [API_ENDPOINTS.ISPS.BY_ID(':id'), API_ENDPOINTS.ISPS.STATS(':id')],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    features: ['ISP Dashboard', 'User Management', 'Plan Management', 'Analytics'],
    status: 'implemented'
  },

  // Plan Management
  {
    pageName: 'Plans Page',
    route: '/plans',
    component: 'PlansPage',
    apiEndpoints: [API_ENDPOINTS.PLANS.BASE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'],
    features: ['Plan List', 'Search & Filter', 'Plan Statistics', 'Pricing Management'],
    status: 'implemented'
  },
  {
    pageName: 'Create Plan Page',
    route: '/plans/create',
    component: 'CreatePlanPage',
    apiEndpoints: [API_ENDPOINTS.PLANS.CREATE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Plan Creation', 'Bandwidth Settings', 'Time Limits', 'Pricing'],
    status: 'implemented'
  },
  {
    pageName: 'Plan Details Page',
    route: '/plans/:id',
    component: 'PlanDetailsPage',
    apiEndpoints: [API_ENDPOINTS.PLANS.BY_ID(':id'), API_ENDPOINTS.PLANS.UPDATE(':id')],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Plan Configuration', 'Usage Analytics', 'User Assignments'],
    status: 'implemented'
  },

  // Payment Management
  {
    pageName: 'Payments Page',
    route: '/payments',
    component: 'PaymentsPage',
    apiEndpoints: [API_ENDPOINTS.PAYMENTS.HISTORY],
    requiredRoles: ['all'],
    features: ['Payment History', 'Transaction Details', 'Export Data', 'Filter & Search'],
    status: 'implemented'
  },
  {
    pageName: 'Refunds Page',
    route: '/payments/refunds',
    component: 'RefundsPage',
    apiEndpoints: [API_ENDPOINTS.PAYMENTS.REFUND],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Refund Processing', 'Reason Tracking', 'Audit Trail'],
    status: 'implemented'
  },

  // Voucher Management
  {
    pageName: 'Vouchers Page',
    route: '/vouchers',
    component: 'VouchersPage',
    apiEndpoints: [API_ENDPOINTS.VOUCHERS.BASE],
    requiredRoles: ['all'],
    features: ['Voucher List', 'Usage Tracking', 'Status Management', 'QR Codes'],
    status: 'implemented'
  },
  {
    pageName: 'Generate Vouchers Page',
    route: '/vouchers/generate',
    component: 'GenerateVouchersPage',
    apiEndpoints: [API_ENDPOINTS.VOUCHERS.BATCH],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Batch Generation', 'Custom Prefixes', 'Expiry Settings', 'PDF Export'],
    status: 'implemented'
  },

  // Session Management
  {
    pageName: 'Sessions Page',
    route: '/sessions',
    component: 'SessionsPage',
    apiEndpoints: [API_ENDPOINTS.SESSIONS.BASE],
    requiredRoles: ['all'],
    features: ['Session History', 'Usage Analytics', 'Filter & Search'],
    status: 'implemented'
  },
  {
    pageName: 'Active Sessions Page',
    route: '/sessions/active',
    component: 'ActiveSessionsPage',
    apiEndpoints: [API_ENDPOINTS.SESSIONS.ACTIVE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'],
    features: ['Live Sessions', 'Real-time Monitoring', 'Session Termination', 'Bandwidth Control'],
    status: 'implemented'
  },

  // MikroTik Integration
  {
    pageName: 'MikroTik Page',
    route: '/mikrotik',
    component: 'MikroTikPage',
    apiEndpoints: [API_ENDPOINTS.MIKROTIK.ROUTERS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'],
    features: ['Router Overview', 'Connection Status', 'Quick Actions'],
    status: 'implemented'
  },
  {
    pageName: 'Routers Page',
    route: '/mikrotik/routers',
    component: 'RoutersPage',
    apiEndpoints: [API_ENDPOINTS.MIKROTIK.ROUTERS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Router Management', 'Configuration', 'Health Monitoring'],
    status: 'implemented'
  },
  {
    pageName: 'Hotspot Users Page',
    route: '/mikrotik/hotspot',
    component: 'HotspotUsersPage',
    apiEndpoints: [API_ENDPOINTS.MIKROTIK.HOTSPOT_USERS, API_ENDPOINTS.MIKROTIK.ADD_HOTSPOT_USER],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'],
    features: ['Hotspot User Management', 'Profile Assignment', 'Bandwidth Control'],
    status: 'implemented'
  },
  {
    pageName: 'Connected Users Page',
    route: '/mikrotik/connected',
    component: 'ConnectedUsersPage',
    apiEndpoints: [API_ENDPOINTS.MIKROTIK.CONNECTED_USERS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN', 'ISP_STAFF'],
    features: ['Live Connected Users', 'Real-time Monitoring', 'Disconnect Users'],
    status: 'implemented'
  },

  // Analytics
  {
    pageName: 'Analytics Page',
    route: '/analytics',
    component: 'AnalyticsPage',
    apiEndpoints: [API_ENDPOINTS.ANALYTICS.DASHBOARD_STATS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Analytics Dashboard', 'Charts & Graphs', 'Trend Analysis'],
    status: 'implemented'
  },
  {
    pageName: 'Revenue Analytics Page',
    route: '/analytics/revenue',
    component: 'RevenueAnalyticsPage',
    apiEndpoints: [API_ENDPOINTS.ANALYTICS.REVENUE_SUMMARY],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Revenue Trends', 'Payment Method Analysis', 'Forecasting'],
    status: 'implemented'
  },
  {
    pageName: 'Usage Analytics Page',
    route: '/analytics/usage',
    component: 'UsageAnalyticsPage',
    apiEndpoints: [API_ENDPOINTS.ANALYTICS.USAGE_SUMMARY],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Bandwidth Usage', 'Peak Hours Analysis', 'User Behavior'],
    status: 'implemented'
  },
  {
    pageName: 'Reports Page',
    route: '/analytics/reports',
    component: 'ReportsPage',
    apiEndpoints: [API_ENDPOINTS.ANALYTICS.REPORTS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Custom Reports', 'PDF Export', 'Scheduled Reports'],
    status: 'implemented'
  },

  // AI Features
  {
    pageName: 'Anomaly Detection Page',
    route: '/ai/anomaly',
    component: 'AnomalyDetectionPage',
    apiEndpoints: [API_ENDPOINTS.AI.ANOMALY_DETECTION],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Anomaly Detection', 'Alert Management', 'Pattern Analysis'],
    status: 'implemented'
  },
  {
    pageName: 'Dynamic Pricing Page',
    route: '/ai/pricing',
    component: 'DynamicPricingPage',
    apiEndpoints: [API_ENDPOINTS.AI.DYNAMIC_PRICING],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Dynamic Pricing', 'Price Suggestions', 'Market Analysis'],
    status: 'implemented'
  },

  // Monitoring
  {
    pageName: 'System Health Page',
    route: '/monitoring/health',
    component: 'SystemHealthPage',
    apiEndpoints: [API_ENDPOINTS.MONITORING.HEALTH],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['System Health Monitoring', 'Service Status', 'Performance Metrics'],
    status: 'implemented'
  },
  {
    pageName: 'Alerts Page',
    route: '/monitoring/alerts',
    component: 'AlertsPage',
    apiEndpoints: [API_ENDPOINTS.MONITORING.ALERTS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Alert Management', 'Notification Settings', 'Alert History'],
    status: 'implemented'
  },

  // Additional Pages
  {
    pageName: 'Notifications Page',
    route: '/notifications',
    component: 'NotificationsPage',
    apiEndpoints: [API_ENDPOINTS.NOTIFICATIONS.SEND, API_ENDPOINTS.NOTIFICATIONS.LOGS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['Notification Management', 'Templates', 'Bulk Notifications'],
    status: 'implemented'
  },
  {
    pageName: 'Audit Logs Page',
    route: '/audit',
    component: 'AuditLogsPage',
    apiEndpoints: [API_ENDPOINTS.AUDIT.LOGS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'],
    features: ['Audit Trail', 'Activity Logs', 'Security Events'],
    status: 'implemented'
  },
  {
    pageName: 'Metrics Page',
    route: '/metrics',
    component: 'MetricsPage',
    apiEndpoints: [API_ENDPOINTS.METRICS.BASE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'ISP_ADMIN'],
    features: ['System Metrics', 'Performance Data', 'Custom Metrics'],
    status: 'implemented'
  },
  {
    pageName: 'System Overview Page',
    route: '/system',
    component: 'SystemOverviewPage',
    apiEndpoints: [API_ENDPOINTS.MONITORING.SYSTEM_STATUS],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    features: ['System Overview', 'Resource Usage', 'Configuration'],
    status: 'implemented'
  },
  {
    pageName: 'Backup & Restore Page',
    route: '/backup',
    component: 'BackupRestorePage',
    apiEndpoints: [API_ENDPOINTS.BACKUP.ALL, API_ENDPOINTS.BACKUP.CREATE],
    requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
    features: ['Backup Management', 'Restore Operations', 'Scheduled Backups'],
    status: 'implemented'
  },
  {
    pageName: 'Settings Page',
    route: '/settings',
    component: 'SettingsPage',
    apiEndpoints: [],
    requiredRoles: ['all'],
    features: ['System Settings', 'User Preferences', 'Configuration'],
    status: 'implemented'
  },
  {
    pageName: 'Profile Page',
    route: '/profile',
    component: 'ProfilePage',
    apiEndpoints: [API_ENDPOINTS.AUTH.PROFILE],
    requiredRoles: ['all'],
    features: ['User Profile', 'Password Change', '2FA Settings'],
    status: 'implemented'
  },
  {
    pageName: 'Help & Support Page',
    route: '/help',
    component: 'HelpSupportPage',
    apiEndpoints: [],
    requiredRoles: ['all'],
    features: ['Documentation', 'Support Tickets', 'FAQ'],
    status: 'implemented'
  }
];

export function generateIntegrationReport(): {
  summary: {
    totalPages: number;
    implementedPages: number;
    partialPages: number;
    placeholderPages: number;
    totalApiEndpoints: number;
    uniqueApiEndpoints: number;
  };
  pagesByStatus: {
    implemented: PageIntegration[];
    partial: PageIntegration[];
    placeholder: PageIntegration[];
  };
  apiEndpointUsage: { endpoint: string; usedBy: string[] }[];
  roleBasedPages: { role: string; pages: string[] }[];
} {
  const implemented = PAGE_INTEGRATIONS.filter(p => p.status === 'implemented');
  const partial = PAGE_INTEGRATIONS.filter(p => p.status === 'partial');
  const placeholder = PAGE_INTEGRATIONS.filter(p => p.status === 'placeholder');

  // Count API endpoints
  const allEndpoints = PAGE_INTEGRATIONS.flatMap(p => p.apiEndpoints);
  const uniqueEndpoints = [...new Set(allEndpoints)];

  // API endpoint usage
  const endpointUsage = uniqueEndpoints.map(endpoint => ({
    endpoint,
    usedBy: PAGE_INTEGRATIONS
      .filter(p => p.apiEndpoints.includes(endpoint))
      .map(p => p.pageName)
  }));

  // Role-based pages
  const allRoles = [...new Set(PAGE_INTEGRATIONS.flatMap(p => p.requiredRoles))];
  const roleBasedPages = allRoles.map(role => ({
    role,
    pages: PAGE_INTEGRATIONS
      .filter(p => p.requiredRoles.includes(role) || p.requiredRoles.includes('all'))
      .map(p => p.pageName)
  }));

  return {
    summary: {
      totalPages: PAGE_INTEGRATIONS.length,
      implementedPages: implemented.length,
      partialPages: partial.length,
      placeholderPages: placeholder.length,
      totalApiEndpoints: allEndpoints.length,
      uniqueApiEndpoints: uniqueEndpoints.length,
    },
    pagesByStatus: {
      implemented,
      partial,
      placeholder,
    },
    apiEndpointUsage: endpointUsage,
    roleBasedPages,
  };
}

export function validatePageIntegration(pageName: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const page = PAGE_INTEGRATIONS.find(p => p.pageName === pageName);
  
  if (!page) {
    return {
      isValid: false,
      errors: [`Page "${pageName}" not found in integration list`],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!page.route) errors.push('Route is required');
  if (!page.component) errors.push('Component is required');
  if (!page.requiredRoles.length) errors.push('At least one required role must be specified');
  if (!page.features.length) warnings.push('No features specified');

  // Validate route format
  if (page.route && !page.route.startsWith('/')) {
    errors.push('Route must start with /');
  }

  // Validate API endpoints
  if (page.apiEndpoints.length === 0 && page.status === 'implemented') {
    warnings.push('No API endpoints specified for implemented page');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Development helper
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Page Integration Report');
  const report = generateIntegrationReport();
  
  console.log('\n📈 Summary:');
  console.log(`- Total Pages: ${report.summary.totalPages}`);
  console.log(`- Implemented: ${report.summary.implementedPages}`);
  console.log(`- Partial: ${report.summary.partialPages}`);
  console.log(`- Placeholder: ${report.summary.placeholderPages}`);
  console.log(`- Total API Endpoints: ${report.summary.totalApiEndpoints}`);
  console.log(`- Unique API Endpoints: ${report.summary.uniqueApiEndpoints}`);
  
  console.log('\n✅ Implementation Status:');
  console.log(`- ${report.summary.implementedPages}/${report.summary.totalPages} pages fully implemented`);
  console.log(`- ${Math.round((report.summary.implementedPages / report.summary.totalPages) * 100)}% completion rate`);
  
  if (report.pagesByStatus.partial.length > 0) {
    console.log('\n⚠️ Partial Implementation:');
    report.pagesByStatus.partial.forEach(page => {
      console.log(`- ${page.pageName} (${page.route})`);
    });
  }
  
  if (report.pagesByStatus.placeholder.length > 0) {
    console.log('\n🚧 Placeholder Pages:');
    report.pagesByStatus.placeholder.forEach(page => {
      console.log(`- ${page.pageName} (${page.route})`);
    });
  }
}