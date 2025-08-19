import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { vouchersService, plansService, ispsService } from '@/services/enhanced-api.service';
import { useAuth } from '@/store/auth.store';
import { UserRole, VoucherValidityUnit } from '@/types/common';
import { 
  Package, 
  ArrowLeft,
  Download
} from 'lucide-react';

const GenerateVouchersPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [generateForm, setGenerateForm] = useState({
    planId: '',
    quantity: 100,
    prefix: 'VCH',
    amount: 1000,
    validityUnit: VoucherValidityUnit.DAYS,
    duration: 30,
    ispId: user?.ispId || '',
    includeQR: true,
    includeScratch: true,
    metadata: '',
  });

  // Fetch plans for dropdown
  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansService.getPlans({ isActive: 'true' }),
  });

  // Fetch ISPs for dropdown
  const { data: ispsData } = useQuery({
    queryKey: ['isps'],
    queryFn: () => ispsService.getIsps(),
  });

  // Generate vouchers mutation
  const generateVouchersMutation = useMutation({
    mutationFn: vouchersService.generateVouchers,
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Generated ${data.count} vouchers successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate vouchers',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateVouchers = () => {
    if (!generateForm.planId || generateForm.quantity < 1 || generateForm.amount < 1 || generateForm.duration < 1) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields with valid values',
        variant: 'destructive',
      });
      return;
    }

    generateVouchersMutation.mutate({
      planId: generateForm.planId,
      count: generateForm.quantity,
      prefix: generateForm.prefix || undefined,
      amount: generateForm.amount,
      validityUnit: generateForm.validityUnit,
      duration: generateForm.duration,
      ispId: generateForm.ispId,
      metadata: generateForm.metadata || undefined,
    });
  };

  const validityUnits = [
    { value: VoucherValidityUnit.HOURS, label: 'Hours' },
    { value: VoucherValidityUnit.DAYS, label: 'Days' },
    { value: VoucherValidityUnit.WEEKS, label: 'Weeks' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Vouchers</h1>
          <p className="text-muted-foreground">
            Create multiple vouchers in a single batch
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Batch Voucher Generation
          </CardTitle>
          <CardDescription>
            Generate multiple vouchers with consistent settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchName">Batch Name (Optional)</Label>
                <Input
                  id="batchName"
                  value={generateForm.metadata}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, metadata: e.target.value }))}
                  placeholder="e.g., March 2024 Batch"
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={generateForm.quantity}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 100 }))}
                  min="1"
                  max="10000"
                />
              </div>
              
              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select 
                  value={generateForm.planId} 
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, planId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plansData?.data?.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price} {plan.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (MB)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={generateForm.amount}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 1000 }))}
                  min="1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="number"
                  value={generateForm.duration}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="validityUnit">Validity Unit</Label>
                <Select 
                  value={generateForm.validityUnit} 
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, validityUnit: value as VoucherValidityUnit }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {validityUnits.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prefix">Code Prefix (Optional)</Label>
                <Input
                  id="prefix"
                  value={generateForm.prefix}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, prefix: e.target.value }))}
                  placeholder="VCH"
                  maxLength={10}
                />
              </div>
              
              {user?.role === UserRole.SUPER_ADMIN && (
                <div>
                  <Label htmlFor="ispId">ISP</Label>
                  <Select 
                    value={generateForm.ispId} 
                    onValueChange={(value) => setGenerateForm(prev => ({ ...prev, ispId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ISP" />
                    </SelectTrigger>
                    <SelectContent>
                      {ispsData?.data?.map((isp: any) => (
                        <SelectItem key={isp.id} value={isp.id}>
                          {isp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Print Options</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeQR"
                  checked={generateForm.includeQR}
                  onCheckedChange={(checked) => setGenerateForm(prev => ({ ...prev, includeQR: !!checked }))}
                />
                <Label htmlFor="includeQR">Include QR Codes</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeScratch"
                  checked={generateForm.includeScratch}
                  onCheckedChange={(checked) => setGenerateForm(prev => ({ ...prev, includeScratch: !!checked }))}
                />
                <Label htmlFor="includeScratch">Scratch-off Security</Label>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold mb-3">Generation Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Vouchers</p>
                <p className="font-semibold">{generateForm.quantity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data Amount</p>
                <p className="font-semibold">{generateForm.amount.toLocaleString()} MB per voucher</p>
              </div>
              <div>
                <p className="text-muted-foreground">Validity</p>
                <p className="font-semibold">{generateForm.duration} {generateForm.validityUnit.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Processing Time</p>
                <p className="font-semibold">{Math.ceil(generateForm.quantity / 1000)} seconds</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleGenerateVouchers}
            disabled={generateVouchersMutation.isPending || !generateForm.planId}
          >
            <Package className="h-4 w-4 mr-2" />
            {generateVouchersMutation.isPending ? 'Generating...' : `Generate ${generateForm.quantity} Vouchers`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateVouchersPage;