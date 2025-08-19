// React Query hooks for user management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/api.service';
import { User, UserRole } from '@/types/common';
import { toast } from '@/hooks/use-toast';

export const useUsers = (filters?: {
  role?: UserRole;
  ispId?: string;
  isActive?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersService.getUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => usersService.getUserStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      toast({
        title: 'User Created',
        description: `User ${data.fullName || data.email} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create user';
      toast({
        title: 'Creation Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersService.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      toast({
        title: 'User Updated',
        description: `User ${data.fullName || data.email} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update user';
      toast({
        title: 'Update Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      toast({
        title: 'User Deleted',
        description: 'User has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast({
        title: 'Deletion Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};