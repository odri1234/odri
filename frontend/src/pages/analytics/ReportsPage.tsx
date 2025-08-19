// src/pages/analytics/ReportsPage.tsx

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, RefreshCw } from "lucide-react";

export const ReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/analytics/reports", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err: any) {
      setError(err.message || "Error fetching reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and view system reports</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reports List
          </CardTitle>
          <CardDescription>View previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-center text-muted-foreground">Loading reports...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>
                      {new Date(report.startDate).toLocaleDateString()} -{" "}
                      {new Date(report.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            !loading && <p className="text-center text-muted-foreground">No reports found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
