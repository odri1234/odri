// src/pages/isps/ISPDetailsPage.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

interface IspSettings {
  contactEmail?: string;
  address?: string;
}

interface IspBranding {
  logoUrl?: string;
  primaryColor?: string;
}

interface Isp {
  id: string;
  name: string;
  settings?: IspSettings;
  branding?: IspBranding;
}

export const ISPDetailsPage = () => {
  const { id } = useParams();
  const [isp, setIsp] = useState<Isp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIsp = async () => {
      try {
        const res = await fetch(`/api/v1/isps/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'x-tenant-id': localStorage.getItem('tenantId') || '1'
          }
        });
        if (!res.ok) {
          throw new Error("Failed to load ISP");
        }
        const data = await res.json();
        setIsp(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIsp();
  }, [id]);

  if (loading) {
    return <p>Loading ISP details...</p>;
  }

  if (!isp) {
    return <p>ISP not found.</p>;
  }

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
          <h1 className="text-3xl font-bold">{isp.name}</h1>
          <p className="text-muted-foreground">View and edit ISP information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            ISP ID: {isp.id}
          </CardTitle>
          <CardDescription>Detailed information about the ISP</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isp.branding?.logoUrl && (
            <div className="flex justify-center">
              <img src={isp.branding.logoUrl} alt="ISP Logo" className="h-20" />
            </div>
          )}

          <div>
            <strong>Name:</strong> {isp.name}
          </div>
          {isp.settings?.contactEmail && (
            <div>
              <strong>Contact Email:</strong> {isp.settings.contactEmail}
            </div>
          )}
          {isp.settings?.address && (
            <div>
              <strong>Address:</strong> {isp.settings.address}
            </div>
          )}
          {isp.branding?.primaryColor && (
            <div>
              <strong>Primary Color:</strong>{" "}
              <span
                style={{
                  backgroundColor: isp.branding.primaryColor,
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  marginLeft: "4px",
                }}
              ></span>
              {` ${isp.branding.primaryColor}`}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ISPDetailsPage;
