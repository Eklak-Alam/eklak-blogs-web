import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { queryKeys } from '@/lib/api/queryKeys';

// ==========================================
// 1. PUBLIC PROFILES
// ==========================================

export const useGetPublicProfileQuery = (userId) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => userApi.getPublicProfile(userId),
    enabled: !!userId, // Don't fetch until we have the ID from the URL
    staleTime: 1000 * 60 * 15, // Cache author profiles for 15 minutes
  });
};

// ==========================================
// 2. SELF-SERVICE (Logged-in User)
// ==========================================

export const useGetMeQuery = () => {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => userApi.getMe(),
    // Cache this heavily because it powers your navbar and global state
    staleTime: 1000 * 60 * 5, 
  });
};

export const useGetMyAnalyticsQuery = () => {
  return useQuery({
    queryKey: [...queryKeys.users.me(), 'analytics'],
    queryFn: () => userApi.getMyAnalytics(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useGetMyBookmarksQuery = (params = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: [...queryKeys.users.me(), 'bookmarks', params],
    queryFn: () => userApi.getMyBookmarks(params),
    keepPreviousData: true,
  });
};

// ==========================================
// 3. ADMIN QUERIES
// ==========================================

export const useGetAllUsersQuery = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userApi.getAllUsers(filters),
    keepPreviousData: true, // Super smooth pagination for the admin dashboard
  });
};

export const useAdminUserStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.users.adminStats(),
    queryFn: () => userApi.getAdminStats(),
    staleTime: 1000 * 60 * 5, // Cache stats for 5 minutes to avoid DB spam
  });
};