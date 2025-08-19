import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { vouchersService } from '@/services/enhanced-api.service';
import { VoucherValidityUnit } from '@/types/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateVoucherFormData {
  code?: string;
  amount: number;
  validityUnit: VoucherValidityUnit;
  duration: number;
  ispId?: string;
  planId?: string;
  metadata?: string;
}

interface CreateVoucherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plans: any[];
  isps: any[];
}

export const CreateVoucherDialog: React.FC<CreateVoucherDialogProps> = ({
  isOpen,
  onClose,
  plans,
  isps,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateVoucherFormData>({
    code: '',
    amount: 1000, // 1GB in MB
    validityUnit: VoucherValidityUnit.DAYS,
    duration: 30,
    ispId: '',
    planId: '',
    metadata: '',
  });

  const createVoucherMutation = useMutation({
    mutationFn: (data: CreateVoucherFormData) => vouchersService.createVoucher(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Voucher created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create voucher',
        variant: 'destructive',
      });
    },
  });

  const handleChange = (field: keyof CreateVoucherFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.amount || formData.amount < 1) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.duration || formData.duration < 1) {
      toast({
        title: 'Validation Error',
        description: 'Duration must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    createVoucherMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      amount: 1000,
      validityUnit: VoucherValidityUnit.DAYS,
      duration: 30,
      ispId: '',
      planId: '',
      metadata: '',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Voucher</DialogTitle>
          <DialogDescription>
            Create a single voucher with custom settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                placeholder="Auto-generated if empty"
                className="col-span-3"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (MB)
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                className="col-span-3"
                value={formData.amount}
                onChange={(e) => handleChange('amount', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="validityUnit" className="text-right">
                Validity Unit
              </Label>
              <Select
                value={formData.validityUnit}
                onValueChange={(value) => handleChange('validityUnit', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select validity unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VoucherValidityUnit.HOURS}>Hours</SelectItem>
                  <SelectItem value={VoucherValidityUnit.DAYS}>Days</SelectItem>
                  <SelectItem value={VoucherValidityUnit.WEEKS}>Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                className="col-span-3"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ispId" className="text-right">
                ISP
              </Label>
              <Select
                value={formData.ispId || ''}
                onValueChange={(value) => handleChange('ispId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select ISP (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {isps.map((isp) => (
                    <SelectItem key={isp.id} value={isp.id}>
                      {isp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planId" className="text-right">
                Plan
              </Label>
              <Select
                value={formData.planId || ''}
                onValueChange={(value) => handleChange('planId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Plan (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metadata" className="text-right">
                Metadata
              </Label>
              <Textarea
                id="metadata"
                placeholder="Optional metadata or notes"
                className="col-span-3"
                value={formData.metadata || ''}
                onChange={(e) => handleChange('metadata', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createVoucherMutation.isPending}>
              {createVoucherMutation.isPending ? 'Creating...' : 'Create Voucher'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};