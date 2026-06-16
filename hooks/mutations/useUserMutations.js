import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { queryKeys } from '@/lib/api/queryKeys';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// ==========================================
// 1. SELF-SERVICE MUTATIONS
// ==========================================

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => userApi.updateMyProfile(payload),
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      
      // Instantly refresh the user's data in the React Query cache
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      
      // ALSO immediately update the Zustand global store to prevent stale data in the Navbar
      if (data?.user) {
        import('@/store/useAuthStore').then(({ useAuthStore }) => {
          const currentUser = useAuthStore.getState().user;
          useAuthStore.getState().setUser({ ...currentUser, ...data.user });
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload) => userApi.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed! You will be logged out of all other devices.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
};

export const useDeleteMyAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteMyAccount(),
    onSuccess: () => {
      toast.success('Your account has been permanently deleted.');
      
      // Wipe frontend session
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      queryClient.clear();
      
      // Redirect to home or login page
      if (typeof window !== 'undefined') window.location.href = '/';
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete account');
    },
  });
};

// ==========================================
// 2. ADMIN MUTATIONS
// ==========================================

export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => userApi.updateUserRole(params),
    onSuccess: (response) => {
      toast.success(response.message || 'User role updated.');
      // Refresh the admin dashboard list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
};

export const useToggleUserBanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => userApi.toggleUserBan(params),
    onSuccess: (response) => {
      toast.success(response.message || 'User ban status updated.');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle ban status');
    },
  });
};

export const useAdminDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => userApi.adminDeleteUser(id),
    onSuccess: () => {
      toast.success('User permanently deleted.');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
};