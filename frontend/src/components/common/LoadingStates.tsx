// Comprehensive loading states and skeletons
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Loader2, Wifi, Database, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

// Page Loading Component
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 mx-auto">
          <Spinner size="xl" className="text-primary" />
        </div>
        <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-primary/20 rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{message}</h3>
        <p className="text-sm text-muted-foreground">Please wait while we load your data</p>
      </div>
    </div>
  </div>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}> = ({ 
  rows = 5, 
  columns = 4, 
  showHeader = true 
}) => (
  <div className="space-y-4">
    {showHeader && (
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
    )}
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          {showHeader && (
            <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50">
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          )}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC<{ height?: string }> = ({ 
  height = 'h-80' 
}) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <div className={cn("w-full bg-muted/30 rounded-lg animate-pulse", height)} />
    </CardContent>
  </Card>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ 
  fields = 4 
}) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </CardHeader>
    <CardContent className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </CardContent>
  </Card>
);

// Connection Status Loading
export const ConnectionStatusLoader: React.FC<{ 
  status: 'connecting' | 'checking' | 'syncing';
  message?: string;
}> = ({ status, message }) => {
  const getIcon = () => {
    switch (status) {
      case 'connecting':
        return <Wifi className="h-5 w-5 animate-pulse" />;
      case 'checking':
        return <Server className="h-5 w-5 animate-spin" />;
      case 'syncing':
        return <Database className="h-5 w-5 animate-bounce" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  const getDefaultMessage = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to server...';
      case 'checking':
        return 'Checking connection...';
      case 'syncing':
        return 'Syncing data...';
      default:
        return 'Loading...';
    }
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-3 text-muted-foreground">
        {getIcon()}
        <span className="text-sm font-medium">
          {message || getDefaultMessage()}
        </span>
      </div>
    </div>
  );
};

// Inline Loading Spinner
export const InlineLoader: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}> = ({ 
  size = 'md', 
  message,
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
};

// Button Loading State
export const ButtonLoader: React.FC<{ 
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}> = ({ 
  loading, 
  children, 
  loadingText = 'Loading...' 
}) => (
  <>
    {loading ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {loadingText}
      </>
    ) : (
      children
    )}
  </>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC<{ 
  items?: number;
  showAvatar?: boolean;
}> = ({ 
  items = 3, 
  showAvatar = true 
}) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Card Grid Skeleton
export const CardGridSkeleton: React.FC<{ 
  items?: number;
  columns?: number;
}> = ({ 
  items = 6, 
  columns = 3 
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn("grid gap-4", gridClasses[columns as keyof typeof gridClasses] || gridClasses[3])}>
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};