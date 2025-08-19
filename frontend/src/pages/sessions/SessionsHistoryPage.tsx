import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SessionHistory {
  id: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
  devices: {
    id: string;
    deviceName: string;
    macAddress: string;
  }[];
  startTime: string;
  endTime: string;
  totalBytesIn?: number;
  totalBytesOut?: number;
}

export const SessionsHistoryPage = () => {
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user from localStorage to check if SUPER_ADMIN
      const userStr = localStorage.getItem('auth-storage');
      let isSuperAdmin = false;
      let ispId = '';
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          isSuperAdmin = userData.state.user?.role === 'SUPER_ADMIN';
          ispId = userData.state.user?.ispId || '';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // For SUPER_ADMIN, we don't need to specify an ISP ID
      const url = isSuperAdmin 
        ? `${import.meta.env.VITE_API_URL}/sessions/history` 
        : `${import.meta.env.VITE_API_URL}/sessions/history?ispId=${ispId}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

      const data = await res.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching sessions history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sessions History</h1>
        <p className="text-muted-foreground">View historical session data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Sessions History
          </CardTitle>
          <CardDescription>
            All past sessions and their usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Historical Data</h3>
              <p className="text-muted-foreground">
                There are no past sessions to display.
              </p>
              <Button onClick={fetchHistory} className="mt-4">Refresh</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((session) => (
                <Card key={session.id} className="border border-muted">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{session.user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.user?.email || 'No email'} • 
                          Started: {new Date(session.startTime).toLocaleString()} • 
                          Ended: {new Date(session.endTime).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">Past Session</Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Total Upload: {formatBytes(session.totalBytesIn)}</div>
                      <div>Total Download: {formatBytes(session.totalBytesOut)}</div>
                    </div>

                    {session.devices.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold mb-1">Devices Used:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {session.devices.map((device) => (
                            <li key={device.id}>
                              {device.deviceName} ({device.macAddress})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionsHistoryPage;
