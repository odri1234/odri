// src/pages/analytics/RevenueAnalyticsPage.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, RefreshCw } from "lucide-react";

export const RevenueAnalyticsPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueSummary = async () => {
    if (!startDate || !endDate) {
      setError("Please select a start and end date");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/analytics/revenue-summary?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch revenue summary");
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
        <h1 className="text-3xl font-bold">Revenue Analytics</h1>
        <p className="text-muted-foreground">Analyze revenue trends and patterns</p>
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
        <Button onClick={fetchRevenueSummary} disabled={loading}>
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
              <CardTitle>Total Revenue</CardTitle>
              <CardDescription>{summary.currency || "KES"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {summary.totalRevenue.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Total number of transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.transactionCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily Avg Revenue</CardTitle>
              <CardDescription>{summary.currency || "KES"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {summary.dailyAverageRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Rate</CardTitle>
              <CardDescription>Compared to previous period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${summary.growthRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                {summary.growthRate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avg Revenue Per User</CardTitle>
              <CardDescription>{summary.currency || "KES"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {summary.averageRevenuePerUser.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!summary && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Analytics
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

export default RevenueAnalyticsPage;
