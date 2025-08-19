import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';

type UserDetails = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  expiryDate?: string;
  ispId?: string;
  enableHotspot?: boolean;
  enablePPPoE?: boolean;
  require2FA?: boolean;
  autoSuspendAfterDays?: number;
  defaultBandwidthPackageId?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  notificationEmail?: string;
  createdAt?: string;
};

export const UserDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/v1/users/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'x-tenant-id': localStorage.getItem('tenantId') || '1'
          }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch user ${id}`);
        }
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return <p className="text-center py-10">Loading user details...</p>;
  }

  if (!user) {
    return <p className="text-center py-10 text-red-500">User not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground">View and edit user information</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {user.fullName}
            </CardTitle>
            <CardDescription>
              Role: {user.role} • ID: {user.id}
            </CardDescription>
          </div>
          <Button asChild>
            <Link to={`/users/${user.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Email" value={user.email} />
            <Detail label="Phone" value={user.phone} />
            <Detail label="Active" value={user.isActive ? "Yes" : "No"} />
            {user.expiryDate && <Detail label="Expiry Date" value={new Date(user.expiryDate).toLocaleDateString()} />}
            {user.role === "CLIENT" && user.ispId && <Detail label="ISP ID" value={user.ispId} />}
          </div>

          {user.role === "ISP_ADMIN" && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">ISP Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Enable Hotspot" value={user.enableHotspot ? "Yes" : "No"} />
                <Detail label="Enable PPPoE" value={user.enablePPPoE ? "Yes" : "No"} />
                <Detail label="Require 2FA" value={user.require2FA ? "Yes" : "No"} />
                {user.autoSuspendAfterDays !== undefined && (
                  <Detail label="Auto Suspend After (days)" value={String(user.autoSuspendAfterDays)} />
                )}
                {user.notificationEmail && <Detail label="Notification Email" value={user.notificationEmail} />}
                {user.maintenanceMode !== undefined && (
                  <Detail label="Maintenance Mode" value={user.maintenanceMode ? "Enabled" : "Disabled"} />
                )}
                {user.maintenanceMessage && <Detail label="Maintenance Message" value={user.maintenanceMessage} />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default UserDetailsPage;
