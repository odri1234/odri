// src/pages/isps/ISPsListPage.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Plus, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ispsService } from "@/services/api.service";
import { ISP } from "@/types/common";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const ISPsListPage = () => {
  const { data: isps, isLoading: loading, error } = useQuery({
    queryKey: ['isps'],
    queryFn: () => ispsService.getISPs(),
    retry: 1,
    retryDelay: 1000,
    select: (data) => Array.isArray(data) ? data : []
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ISP Management</h1>
          <p className="text-muted-foreground">Manage Internet Service Providers</p>
        </div>
        <Button asChild>
          <Link to="/isps/create">
            <Plus className="h-4 w-4 mr-2" />
            Add ISP
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load ISPs. Please check if the backend server is running.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            ISPs List
          </CardTitle>
          <CardDescription>View and manage all ISPs in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg border animate-pulse bg-muted/50">
                  <div className="h-5 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : !isps || isps.length === 0 ? (
            <p className="text-muted-foreground">No ISPs found.</p>
          ) : (
            <div className="space-y-2">
              {isps.map((isp) => (
                <Link
                  key={isp.id}
                  to={`/isps/${isp.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{isp.name}</span>
                  </div>
                  <Badge variant={isp.isActive ? "success" : "secondary"}>
                    {isp.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ISPsListPage;
