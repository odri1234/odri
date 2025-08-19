// C:\Users\ADMN\odri\frontend\src\pages\plans\CreatePlanPage.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Wifi, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const createPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CreatePlanFormValues = z.infer<typeof createPlanSchema>;

export const CreatePlanPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: CreatePlanFormValues) => {
      const res = await api.post('/plans', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Plan created successfully');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      navigate('/plans');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create plan');
    },
  });

  const onSubmit = (values: CreatePlanFormValues) => {
    createPlanMutation.mutate(values);
  };

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
          <h1 className="text-3xl font-bold">Create New Plan</h1>
          <p className="text-muted-foreground">Add a new service plan</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Plan Information
          </CardTitle>
          <CardDescription>
            Enter the details for the new plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Plan Name</label>
              <Input
                {...form.register('name')}
                placeholder="e.g., Premium Internet"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <Textarea
                {...form.register('description')}
                placeholder="Optional description of the plan"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePlanPage;
