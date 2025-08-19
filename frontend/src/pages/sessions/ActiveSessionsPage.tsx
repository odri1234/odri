import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define the type for active sessions from backend
interface ActiveSession {
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
    ipAddress?: string;
  }[];
  startTime: string;
}

export const ActiveSessionsPage = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSessions = async () => {
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
        ? `${import.meta.env.VITE_API_URL}/sessions/active` 
        : `${import.meta.env.VITE_API_URL}/sessions/active?ispId=${ispId}`;

      // Adjust this URL to your backend route
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

      const data = await res.json();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Active Sessions</h1>
        <p className="text-muted-foreground">Monitor currently active sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            View all currently active sessions for your ISP
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
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
              <p className="text-muted-foreground">
                There are currently no active sessions.
              </p>
              <Button onClick={fetchActiveSessions} className="mt-4">Refresh</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="border border-muted">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{session.user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.user?.email || 'No email'} • Started:{" "}
                          {new Date(session.startTime).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>

                    {session.devices.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold mb-1">Devices:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {session.devices.map((device) => (
                            <li key={device.id}>
                              {device.deviceName} ({device.macAddress}){" "}
                              {device.ipAddress && ` - ${device.ipAddress}`}
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

export default ActiveSessionsPage;
