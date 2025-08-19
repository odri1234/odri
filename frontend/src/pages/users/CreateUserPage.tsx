import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "CLIENT",
    isActive: true,
    expiryDate: "",
    ispId: "",
    enableHotspot: true,
    enablePPPoE: true,
    require2FA: false,
    autoSuspendAfterDays: "",
    defaultBandwidthPackageId: "",
    maintenanceMode: false,
    maintenanceMessage: "",
    notificationEmail: "",
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the API service instead of direct fetch
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
          "x-tenant-id": localStorage.getItem('tenantId') || '1'
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create user");
      }

      toast.success("User created successfully");
      navigate("/users");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Create New User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            User Information
          </CardTitle>
          <CardDescription>Enter the details for the new user</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(val) => handleChange("role", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="ISP_ADMIN">ISP Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="AUDITOR">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.role === "CLIENT" && (
              <div>
                <Label>ISP ID</Label>
                <Input value={form.ispId} onChange={(e) => handleChange("ispId", e.target.value)} required />
              </div>
            )}

            {form.role === "ISP_ADMIN" && (
              <>
                <div>
                  <Label>Notification Email</Label>
                  <Input value={form.notificationEmail} onChange={(e) => handleChange("notificationEmail", e.target.value)} />
                </div>
                <div>
                  <Label>Auto Suspend After Days</Label>
                  <Input type="number" value={form.autoSuspendAfterDays} onChange={(e) => handleChange("autoSuspendAfterDays", e.target.value)} />
                </div>
                <div>
                  <Label>Maintenance Message</Label>
                  <Input value={form.maintenanceMessage} onChange={(e) => handleChange("maintenanceMessage", e.target.value)} />
                </div>
              </>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserPage;
