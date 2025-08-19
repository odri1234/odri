// React Query hooks for authentication
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api.service';
import { useAuthActions } from '@/store/auth.store';
import { LoginFormData, RegisterFormData } from '@/types/common';
import { toast } from '@/hooks/use-toast';

export const useLogin = () => {
  const { login } = useAuthActions();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      const { user, tokens, tenant } = data;
      login(user, tokens.accessToken, tokens.refreshToken, tenant);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.fullName || user.email}!`,
      });
      
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Please log in.',
      });
      
      navigate('/auth/login', {
        state: {
          message: 'Registration successful! Please log in with your credentials.',
          email: data.user.email,
        },
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthActions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/auth/login');
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    },
    onError: () => {
      // Even if the API call fails, we should still log out locally
      logout();
      queryClient.clear();
      navigate('/auth/login');
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast({
        title: 'Reset Link Sent',
        description: 'If an account with that email exists, we\'ve sent a password reset link.',
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset. Please log in with your new password.',
      });
      navigate('/auth/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast({
        title: 'Reset Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};