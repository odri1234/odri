import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  checkTokenStorage, 
  verifyTokenFormat, 
  testTokenInRequest,
  fixCommonTokenIssues
} from '@/utils/token-debug';

export const TokenDebugger = () => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  const runChecks = async () => {
    setLoading(true);
    
    // Check token storage
    const storage = checkTokenStorage();
    setTokenInfo(storage);
    
    // Test API request
    const requestTest = await testTokenInRequest();
    setRequestInfo(requestTest);
    
    setLoading(false);
  };

  const applyFix = () => {
    const fixed = fixCommonTokenIssues();
    setFixApplied(fixed);
    
    // Re-run checks after fix
    if (fixed) {
      setTimeout(runChecks, 500);
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Authentication Token Debugger</span>
          <Badge variant={tokenInfo?.authToken?.verification?.isValid ? "success" : "destructive"}>
            {tokenInfo?.authToken?.verification?.isValid ? "Valid" : "Invalid"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Storage Info */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Token Storage</h3>
          
          {tokenInfo?.authToken?.exists ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Auth Token:</div>
              <div>{tokenInfo.authToken.value}</div>
              
              <div className="font-medium">Format:</div>
              <div>{tokenInfo.authToken.verification?.tokenInfo?.format}</div>
              
              <div className="font-medium">Length:</div>
              <div>{tokenInfo.authToken.verification?.tokenInfo?.length} characters</div>
              
              <div className="font-medium">Parts:</div>
              <div>{tokenInfo.authToken.verification?.tokenInfo?.parts}</div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>No auth token found in storage</AlertDescription>
            </Alert>
          )}
          
          {tokenInfo?.authToken?.verification?.issues?.length > 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                <div className="font-medium">Issues detected:</div>
                <ul className="list-disc pl-5 mt-1">
                  {tokenInfo.authToken.verification.issues.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* API Request Test */}
        {requestInfo && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">API Request Test</h3>
            <Alert variant={requestInfo.success ? "success" : "destructive"}>
              <AlertDescription>{requestInfo.message}</AlertDescription>
            </Alert>
            
            {requestInfo.requestHeaders && (
              <div className="text-xs mt-2 bg-muted p-2 rounded">
                <div className="font-medium">Request Headers:</div>
                <pre className="mt-1 overflow-auto max-h-20">
                  {JSON.stringify(requestInfo.requestHeaders, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button onClick={runChecks} disabled={loading}>
            {loading ? "Running Checks..." : "Run Checks"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={applyFix} 
            disabled={loading || !tokenInfo?.authToken?.exists || tokenInfo?.authToken?.verification?.isValid}
          >
            Apply Fix
          </Button>
          
          {fixApplied && (
            <Badge variant="outline" className="ml-2">
              Fix Applied
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenDebugger;