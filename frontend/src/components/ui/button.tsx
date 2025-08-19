import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-button text-primary-foreground shadow-button hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 border border-primary/10",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg hover:shadow-destructive/25 hover:-translate-y-1 border border-destructive/10",
        outline: "border border-primary/30 bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 hover:shadow-sm",
        secondary: "bg-gradient-secondary text-secondary-foreground hover:bg-secondary-glow shadow-md hover:shadow-lg hover:shadow-secondary/25 hover:-translate-y-1 border border-secondary/10",
        ghost: "hover:bg-primary/10 hover:text-primary hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-dark",
        gradient: "bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 hover:scale-105 border border-primary/10",
        hero: "bg-gradient-hero text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 hover:scale-105 animate-pulse-glow border border-primary/10",
        glass: "glass text-white hover:bg-white/20 border border-white/20 shadow-lg hover:shadow-xl",
        success: "bg-gradient-success text-success-foreground shadow-success hover:shadow-lg hover:shadow-success/25 hover:-translate-y-1 border border-success/10",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md hover:shadow-lg hover:shadow-warning/25 hover:-translate-y-1 border border-warning/10",
        accent: "bg-gradient-accent text-accent-foreground shadow-md hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-1 border border-accent/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const content = (
      <>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-current opacity-20">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {children}
      </>
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? <span className="contents">{content}</span> : content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
