import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import { toast } from 'sonner';
import { postApi } from '@/lib/api/posts.api';

// ==========================================
// 1. AUTHOR MUTATIONS (Self-Service)
// ==========================================

export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => postApi.createPost(payload),
    onSuccess: (response) => {
      toast.success('Post created successfully!');
      
      // Force refresh the author's dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.myLists() });
      
      // If they published it immediately, refresh the public feed too
      if (response.data?.status === 'PUBLISHED') {
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
};

export const useUpdateMyPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => postApi.updateMyPost(params),
    onSuccess: (response, variables) => {
      toast.success('Post updated successfully!');
      
      // Invalidate everything this update might have touched
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.myLists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.details() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update post');
    },
  });
};

export const useDeleteMyPostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postApi.deleteMyPost(id),
    onSuccess: () => {
      toast.success('Post deleted permanently.');
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.myLists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });
};

export const useIncrementShareCountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postApi.incrementShareCount(id),
    onSuccess: (response, id) => {
      // Invalidate the post details cache so it shows updated share counts
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.details(id) });
      // Invalidate the list as well if it's visible there
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
    // We don't toast errors for share increments to keep it silent if it fails
  });
};

// ==========================================
// 2. ADMIN MUTATIONS (Total Control)
// ==========================================

export const useAdminUpdatePostStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => postApi.adminUpdatePostStatus(params),
    onSuccess: () => {
      toast.success('Post status overridden successfully.');
      // Admins affect everything, so we blast the cache for all post lists
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update post status');
    },
  });
};

export const useAdminDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postApi.adminDeletePost(id),
    onSuccess: () => {
      toast.success('Post force-deleted by Admin.');
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to force delete post');
    },
  });
};

export const useBulkAdminUpdatePostStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => postApi.bulkAdminUpdatePostStatus(params),
    onSuccess: (response, variables) => {
      toast.success(`Successfully updated posts to ${variables.payload.status}.`);
      // Blast the cache so the admin lists and stats immediately reflect the bulk changes
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to bulk update posts');
    },
  });
};