// Simple re-export of the Spinner component for backward compatibility
import { Spinner, SpinnerProps } from '@/components/ui/spinner';

export const LoadingSpinner = ({ size = 'md', variant = 'default', className }: SpinnerProps) => {
  return <Spinner size={size} variant={variant} className={className} />;
};