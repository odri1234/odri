// src/pages/isps/CreateISPPage.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, ArrowLeft, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const CreateISPPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/isps", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        },
        body: JSON.stringify({ name, settings: { contactEmail } }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to create ISP");
        return;
      }

      const data = await res.json();
      navigate(`/isps/${data.id}`);
    } catch (error) {
      console.error(error);
      alert("An error occurred while creating ISP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/isps">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to ISPs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New ISP</h1>
          <p className="text-muted-foreground">Add a new Internet Service Provider</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            ISP Information
          </CardTitle>
          <CardDescription>Enter the details for the new ISP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ISP Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter ISP name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Enter contact email"
              />
            </div>

            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create ISP"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateISPPage;
