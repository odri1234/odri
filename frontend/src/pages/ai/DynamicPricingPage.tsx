// src/pages/ai/DynamicPricingPage.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, RefreshCw } from "lucide-react";

export const DynamicPricingPage = () => {
  const [form, setForm] = useState({
    productId: "",
    basePrice: "",
    demandLevel: "",
    competitorPrice: "",
  });

  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/ai/dynamic-pricing", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-tenant-id': localStorage.getItem('tenantId') || '1'
        },
        body: JSON.stringify({
          productId: form.productId,
          basePrice: parseFloat(form.basePrice),
          demandLevel: form.demandLevel,
          competitorPrice: parseFloat(form.competitorPrice),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate pricing suggestion");
      const data = await res.json();
      setSuggestion(data);
    } catch (err: any) {
      setError(err.message || "Error generating suggestion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dynamic Pricing</h1>
        <p className="text-muted-foreground">AI-driven dynamic pricing strategies</p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Generate Pricing Suggestion
          </CardTitle>
          <CardDescription>Provide product and market details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["productId", "basePrice", "demandLevel", "competitorPrice"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm capitalize">{field}</label>
              <Input
                type={field.includes("Price") ? "number" : "text"}
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={`Enter ${field}`}
              />
            </div>
          ))}
          <Button onClick={generateSuggestion} disabled={loading}>
            {loading && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
            Generate Suggestion
          </Button>
        </CardContent>
      </Card>

      {/* Suggestion Display */}
      {suggestion && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Price</CardTitle>
            <CardDescription>Based on AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              ${suggestion.suggestedPrice?.toFixed(2) ?? "N/A"}
            </p>
            {suggestion.reasoning && (
              <p className="text-sm text-muted-foreground mt-2">{suggestion.reasoning}</p>
            )}
          </CardContent>
        </Card>
      )}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default DynamicPricingPage;
