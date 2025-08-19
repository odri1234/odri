import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testApiCalls } from '@/utils/api-test';
import { toast } from '@/hooks/use-toast';

export function ApiTestButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    toast({
      title: 'API Test Started',
      description: 'Check the console for results',
    });
    
    try {
      await testApiCalls();
      toast({
        title: 'API Test Complete',
        description: 'Test completed successfully. Check console for details.',
      });
    } catch (error) {
      toast({
        title: 'API Test Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? 'Testing...' : 'Test API Connection'}
    </Button>
  );
}