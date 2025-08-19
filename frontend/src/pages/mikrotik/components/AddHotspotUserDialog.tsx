import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mikrotikService as apiService } from '@/services/api.service';
import { Loader2 } from 'lucide-react';

interface AddHotspotUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routerId?: string;
}

interface HotspotUserFormData {
  username: string;
  password: string;
  profile: string;
  comment?: string;
  disabled?: boolean;
}

export function AddHotspotUserDialog({ open, onOpenChange, routerId }: AddHotspotUserDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<HotspotUserFormData>({
    username: '',
    password: '',
    profile: '',
    comment: '',
    disabled: false,
  });

  const addHotspotUserMutation = useMutation({
    mutationFn: (data: HotspotUserFormData & { routerId: string }) => 
      apiService.addHotspotUser(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Hotspot user added successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['hotspot-users'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add hotspot user',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      profile: '',
      comment: '',
      disabled: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routerId) {
      toast({
        title: 'Error',
        description: 'No router selected',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.username || !formData.password || !formData.profile) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    addHotspotUserMutation.mutate({
      ...formData,
      routerId,
    });
  };

  const handleInputChange = (field: keyof HotspotUserFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Hotspot User</DialogTitle>
          <DialogDescription>
            Create a new hotspot user for the selected MikroTik router.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Profile *</Label>
            <Select value={formData.profile} onValueChange={(value) => handleInputChange('profile', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="2M">2M</SelectItem>
                <SelectItem value="5M">5M</SelectItem>
                <SelectItem value="10M">10M</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              placeholder="Optional comment"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addHotspotUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addHotspotUserMutation.isPending}
            >
              {addHotspotUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}