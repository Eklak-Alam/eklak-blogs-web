import { useQuery } from '@tanstack/react-query';

// FIX: Added the 's' to match your actual file name "posts.api.js"
import { postApi } from '../../lib/api/posts.api'; 
import { queryKeys } from '../../lib/api/queryKeys'; 

// ==========================================
// 1. PUBLIC READER QUERIES
// ==========================================

export const useGetPublishedPostsQuery = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: () => postApi.getPublishedPosts(filters),
    keepPreviousData: true, 
    staleTime: 1000 * 60 * 2, 
  });
};

export const useGetPostBySlugQuery = (slug) => {
  return useQuery({
    queryKey: queryKeys.posts.detail(slug),
    queryFn: () => postApi.getPostBySlug(slug),
    enabled: !!slug, 
    staleTime: 1000 * 60 * 5, 
  });
};

// ==========================================
// 2. AUTHOR QUERIES (Self-Service)
// ==========================================

export const useGetMyPostsQuery = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: queryKeys.posts.myList(filters),
    queryFn: () => postApi.getMyPosts(filters),
    keepPreviousData: true,
  });
};

// ==========================================
// 3. ADMIN QUERIES
// ==========================================

export const useGetAllPostsAdminQuery = (filters = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: queryKeys.posts.adminList(filters),
    queryFn: () => postApi.getAllPostsAdmin(filters),
    keepPreviousData: true,
  });
};

export const useAdminPostStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.posts.adminStats(),
    queryFn: () => postApi.getAdminStats(),
    staleTime: 1000 * 60 * 5,
  });
};