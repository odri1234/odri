// Sidebar navigation component

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth.store';
import { UserRole } from '@/types/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Wifi,
  CreditCard,
  Receipt,
  Activity,
  Router,
  Shield,
  BarChart3,
  Settings,
  FileText,
  Brain,
  Database,
  Bell,
  HelpCircle,
  ChevronDown,
  Building,
  Package,
  Zap,
  Server,
} from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  roles: UserRole[];
  badge?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
  },
  {
    title: 'ISP Management',
    icon: Building,
    href: '/isps',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'User Management',
    icon: Users,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
    children: [
      {
        title: 'All Users',
        icon: Users,
        href: '/users',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Add User',
        icon: Users,
        href: '/users/create',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'Plans & Packages',
    icon: Package,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF],
    children: [
      {
        title: 'All Plans',
        icon: Package,
        href: '/plans',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF],
      },
      {
        title: 'Create Plan',
        icon: Package,
        href: '/plans/create',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'Payments',
    icon: CreditCard,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
    children: [
      {
        title: 'Payment History',
        icon: CreditCard,
        href: '/payments',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
      },
      {
        title: 'Refunds',
        icon: CreditCard,
        href: '/payments/refunds',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'Vouchers',
    icon: Receipt,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
    children: [
      {
        title: 'All Vouchers',
        icon: Receipt,
        href: '/vouchers',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
      },
      {
        title: 'Generate Vouchers',
        icon: Receipt,
        href: '/vouchers/generate',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'Sessions',
    icon: Activity,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
    children: [
      {
        title: 'Active Sessions',
        icon: Activity,
        href: '/sessions/active',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF],
        badge: 'Live',
      },
      {
        title: 'Session History',
        icon: Activity,
        href: '/sessions',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
      },
    ],
  },
  {
    title: 'MikroTik',
    icon: Router,
    href: '/mikrotik',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF],
    children: [
      {
        title: 'Routers',
        icon: Router,
        href: '/mikrotik/routers',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Hotspot Users',
        icon: Wifi,
        href: '/mikrotik/hotspot',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF],
      },
      {
        title: 'PPPoE Management',
        icon: Server,
        href: '/mikrotik/pppoe',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Connected Users',
        icon: Users,
        href: '/mikrotik/connected',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF],
        badge: 'Live',
      },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
    children: [
      {
        title: 'Revenue Analytics',
        icon: BarChart3,
        href: '/analytics/revenue',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Usage Analytics',
        icon: BarChart3,
        href: '/analytics/usage',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Reports',
        icon: FileText,
        href: '/analytics/reports',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'AI Features',
    icon: Brain,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
    badge: 'Beta',
    children: [
      {
        title: 'Anomaly Detection',
        icon: Shield,
        href: '/ai/anomaly',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Dynamic Pricing',
        icon: Zap,
        href: '/ai/pricing',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'Monitoring',
    icon: Shield,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
    children: [
      {
        title: 'System Health',
        icon: Shield,
        href: '/monitoring/health',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Alerts',
        icon: Bell,
        href: '/monitoring/alerts',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
      {
        title: 'Network Monitoring',
        icon: Activity,
        href: '/monitoring/network',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'TR-069',
    icon: Server,
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
    children: [
      {
        title: 'Device Management',
        icon: Server,
        href: '/tr069/devices',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
      },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    href: '/notifications',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
  },
  {
    title: 'Audit Logs',
    icon: Shield,
    href: '/audit',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUDITOR],
  },
  {
    title: 'Metrics',
    icon: BarChart3,
    href: '/metrics',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN],
  },
  {
    title: 'System Overview',
    icon: Server,
    href: '/system',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'Backup & Restore',
    icon: Database,
    href: '/backup',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ISP_ADMIN, UserRole.ISP_STAFF, UserRole.CLIENT],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className, collapsed = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const hasAccess = (roles: UserRole[]) => {
    return user && roles.includes(user.role);
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    if (!hasAccess(item.roles)) return null;

    const isItemActive = isActive(item.href);
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isExpanded} onOpenChange={() => toggleExpanded(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-10 px-3 font-semibold text-white border border-transparent rounded-md",
                depth > 0 && "ml-2 w-auto",
                isItemActive && "bg-blue-600 text-white font-bold border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                !isItemActive && "hover:bg-blue-600/20 hover:text-white hover:border-blue-500/50"
              )}
            >
              <item.icon className="h-5 w-5 mr-3 text-white" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200 text-white",
                    isExpanded && "rotate-180"
                  )} />
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          {!collapsed && (
            <CollapsibleContent className="space-y-2 mt-1">
              <div className="ml-2 space-y-2">
                {item.children?.map(child => renderNavItem(child, depth + 1))}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        className={cn(
          "w-full justify-start h-10 px-3 font-semibold text-white border border-transparent rounded-md",
          depth > 0 && "ml-2 w-auto",
          isItemActive && "bg-blue-600 text-white font-bold hover:bg-blue-600/90 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
          !isItemActive && "hover:bg-blue-600/20 hover:text-white hover:border-blue-500/50"
        )}
        asChild
      >
        <Link to={item.href!}>
          <item.icon className="h-5 w-5 mr-3 text-white" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge 
                  variant={item.badge === 'Live' ? 'destructive' : 'secondary'} 
                  className="ml-2 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      </Button>
    );
  };

  return (
    <aside className={cn(
      "bg-gradient-to-b from-[#1a1f2c] to-[#111827] border-r border-gray-700 transition-all duration-300 shadow-md",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto py-4">
          <div className="mb-6 px-4">
            <h2 className="text-white font-bold text-xl">
              {!collapsed && "ODRI WIFI SYSTEM"}
              {collapsed && "OWS"}
            </h2>
          </div>
          <nav className="space-y-2 px-2">
            {navigationItems.map(item => renderNavItem(item))}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-700 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white font-medium hover:text-white hover:bg-blue-600/20 border border-transparent hover:border-blue-500/50 rounded-md"
            asChild
          >
            <Link to="/help">
              <HelpCircle className="h-4 w-4 mr-3 text-white" />
              {!collapsed && "Help & Support"}
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
};