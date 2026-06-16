import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { queryKeys } from '@/lib/api/queryKeys';
import { getDeviceId } from '@/lib/utils/device';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore'; // 🔥 IMPORT ADDED

// ==========================================
// CORE AUTHENTICATION
// ==========================================

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) => authApi.login({ 
      ...credentials, 
      deviceId: getDeviceId() 
    }),
    onSuccess: (response) => {
      // Safely handle Axios interceptor data unwrapping
      const data = response?.data || response;
      const { accessToken, refreshToken, user } = data;

      // 1. Securely store tokens in cookies (keeps them logged in for 7 days)
      Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'strict' });

      // 2. 🔥 INSTANTLY update Global State BEFORE the router pushes to Dashboard
      useAuthStore.getState().setUser(user);

      // 3. Refresh user data globally
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
    // Errors are handled in the UI form directly for field-specific messages
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (userData) => authApi.register({ 
      ...userData, 
      deviceId: getDeviceId() 
    }),
    onSuccess: (response) => {
      const data = response?.data || response;
      const { accessToken, refreshToken, user } = data;
      
      // Auto-login on registration
      Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'strict' });
      
      // Instantly inject into Zustand so Verify Page knows who they are
      useAuthStore.getState().setUser(user);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refreshToken = Cookies.get('refreshToken');
      return authApi.logout({ refreshToken }); 
    },
    onSuccess: () => {
      // 1. Clear Cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      
      // 2. Clear Global State
      useAuthStore.getState().clearUser();
      queryClient.clear();
      
      toast.success('Logged out successfully');
      if (typeof window !== 'undefined') window.location.href = '/login';
    },
    onError: () => {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      useAuthStore.getState().clearUser();
      window.location.href = '/login';
    }
  });
};

// ==========================================
// EMAIL VERIFICATION & PASSWORD RECOVERY
// ==========================================

export const useVerifyEmailMutation = () => {
  return useMutation({ mutationFn: (payload) => authApi.verifyEmail(payload) });
};

export const useResendVerificationMutation = () => {
  return useMutation({ mutationFn: (email) => authApi.resendVerification({ email }) });
};

export const useForgotPasswordMutation = () => {
  return useMutation({ mutationFn: (email) => authApi.forgotPassword({ email }) });
};

export const useResetPasswordMutation = () => {
  return useMutation({ mutationFn: (payload) => authApi.resetPassword(payload) });
};