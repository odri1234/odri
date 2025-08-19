// C:\Users\ADMN\odri\frontend\src\pages\plans\PlanDetailsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, ArrowLeft, Pencil } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Badge } from '@/components/ui/badge';

export const PlanDetailsPage = () => {
  const { id } = useParams();

  const { data: plan, isLoading, isError } = useQuery({
    queryKey: ['plan', id],
    queryFn: async () => {
      const res = await api.get(`/plans/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/plans">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Plan Details</h1>
          <p className="text-muted-foreground">View and edit plan information</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <p className="text-red-500">Failed to load plan details.</p>
      ) : plan ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description || 'No description provided'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Plan ID: {plan.id}</span>
                <Button size="sm" variant="secondary" asChild>
                  <Link to={`/plans/${id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Plan
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricings */}
          <Card>
            <CardHeader>
              <CardTitle>Pricings</CardTitle>
              <CardDescription>All pricing options for this plan</CardDescription>
            </CardHeader>
            <CardContent>
              {plan.pricings?.length > 0 ? (
                <ul className="space-y-2">
                  {plan.pricings.map((pricing: any) => (
                    <li key={pricing.id} className="flex justify-between items-center border rounded p-2">
                      <span>{pricing.name || 'Unnamed pricing'}</span>
                      <Badge variant="secondary">${pricing.price}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No pricings available</p>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Pricings */}
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Pricings</CardTitle>
              <CardDescription>Pricing rules based on conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {plan.dynamicPricings?.length > 0 ? (
                <ul className="space-y-2">
                  {plan.dynamicPricings.map((dp: any) => (
                    <li key={dp.id} className="flex justify-between items-center border rounded p-2">
                      <span>{dp.ruleName || 'Unnamed rule'}</span>
                      <Badge variant="outline">{dp.value}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No dynamic pricing rules available</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-muted-foreground">No plan found.</p>
      )}
    </div>
  );
};

export default PlanDetailsPage;
