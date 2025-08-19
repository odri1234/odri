import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

const dashboardCardVariants = cva(
  "transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-border/50 hover:border-primary/30 hover:-translate-y-1 hover:shadow-card",
        primary: "border-primary/20 hover:border-primary/40 hover:-translate-y-1 hover:shadow-card",
        secondary: "border-secondary/20 hover:border-secondary/40 hover:-translate-y-1 hover:shadow-card",
        accent: "border-accent/20 hover:border-accent/40 hover:-translate-y-1 hover:shadow-card",
        success: "border-success/20 hover:border-success/40 hover:-translate-y-1 hover:shadow-card",
        gradient: "bg-gradient-to-br from-primary/5 to-background border-primary/10 hover:border-primary/30 hover:-translate-y-1 hover:shadow-card",
      },
      size: {
        default: "",
        sm: "max-w-sm",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface DashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardCardVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}

const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ className, variant, size, title, description, icon, footer, loading, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(dashboardCardVariants({ variant, size, className }))}
        {...props}
      >
        {(title || description) && (
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-4",
            variant === "gradient" && "bg-gradient-to-br from-primary/10 to-transparent"
          )}>
            <div className="space-y-1">
              {title && (
                <CardTitle className="flex items-center gap-2 text-xl">
                  {icon && <span className="text-primary">{icon}</span>}
                  {title}
                </CardTitle>
              )}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {loading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
          </CardHeader>
        )}
        <CardContent className={cn(
          "pt-4",
          !title && !description && "pt-6"
        )}>
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

DashboardCard.displayName = "DashboardCard";

export { DashboardCard, dashboardCardVariants };