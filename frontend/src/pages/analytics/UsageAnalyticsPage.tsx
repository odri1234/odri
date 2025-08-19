// src/pages/analytics/UsageAnalyticsPage.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, RefreshCw } from "lucide-react";

export const UsageAnalyticsPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageSummary = async () => {
    if (!startDate || !endDate) {
      setError("Please select a start and end date");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/analytics/usage-summary?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch usage summary");
      const data = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage Analytics</h1>
        <p className="text-muted-foreground">Monitor bandwidth and usage statistics</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground">End Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button onClick={fetchUsageSummary} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Load Data
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Summary Data */}
      {summary && !loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Active in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Data Usage</CardTitle>
              <CardDescription>GB</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.totalDataUsage.toFixed(2)} GB</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Daily Usage</CardTitle>
              <CardDescription>GB/day</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.averageDailyUsage.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Usage</CardTitle>
              <CardDescription>GB</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.peakUsage.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Per User</CardTitle>
              <CardDescription>GB/user</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.usagePerUser.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!summary && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Usage Analytics
            </CardTitle>
            <CardDescription>Load data by selecting a date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Select dates above and click "Load Data"
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsageAnalyticsPage;
