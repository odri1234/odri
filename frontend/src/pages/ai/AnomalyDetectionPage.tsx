// src/pages/ai/AnomalyDetectionPage.tsx

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const AnomalyDetectionPage = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "",
    severity: "",
    description: "",
    actorId: "",
    sessionId: "",
  });

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/ai/anomalies", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        }
      });
      if (!res.ok) throw new Error("Failed to load anomalies");
      const data = await res.json();
      setAnomalies(data);
    } catch (err: any) {
      setError(err.message || "Error fetching anomalies");
    } finally {
      setLoading(false);
    }
  };

  const createAnomaly = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/ai/anomaly-alert", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create anomaly");
      await fetchAnomalies();
      setForm({ type: "", severity: "", description: "", actorId: "", sessionId: "" });
    } catch (err: any) {
      setError(err.message || "Error creating anomaly");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Anomaly Detection</h1>
        <p className="text-muted-foreground">AI-powered anomaly detection and alerts</p>
      </div>

      {/* Form to create anomaly alert */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger Anomaly Alert</CardTitle>
          <CardDescription>Send an anomaly alert to the AI service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["type", "severity", "description", "actorId", "sessionId"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm capitalize">{field}</label>
              <Input
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
          <Button onClick={createAnomaly} disabled={loading}>
            Trigger Alert
          </Button>
        </CardContent>
      </Card>

      {/* Anomalies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detected Anomalies
          </CardTitle>
          <CardDescription>All anomalies from the AI service</CardDescription>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnomalies}
            disabled={loading}
            className="mt-2"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500">{error}</p>}
          {anomalies.length === 0 && !loading ? (
            <p className="text-muted-foreground">No anomalies detected</p>
          ) : (
            <ul className="divide-y divide-border">
              {anomalies.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="font-semibold">{a.type} — {a.severity}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Actor: {a.actorId} | Session: {a.sessionId} | {new Date(a.detectedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetectionPage;
