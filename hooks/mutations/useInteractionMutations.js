import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interactionApi } from '@/lib/api/interaction.api';
import { queryKeys } from '@/lib/api/queryKeys';
import { toast } from 'sonner';

// ==========================================
// 1. LIKES & BOOKMARKS
// ==========================================

export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => interactionApi.toggleLike(params),
    onSuccess: (response, variables) => {
      // Update the user's interactions for this post instantly without refetching
      queryClient.setQueryData(
        queryKeys.interactions.me(variables.postId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isLiked: response.data?.isLiked !== undefined ? response.data.isLiked : !old.data.isLiked
            }
          };
        }
      );
      
      // Invalidate the user's "Me" query to update their liked posts list in the dashboard
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      // Only invalidate post LISTS, NOT the post detail.
      // Invalidating the detail re-triggers getPostBySlug which increments viewCount!
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle like');
    },
  });
};

export const useToggleBookmarkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => interactionApi.toggleBookmark(params),
    onSuccess: (response, variables) => {
      // Update the user's interactions for this post instantly without refetching
      queryClient.setQueryData(
        queryKeys.interactions.me(variables.postId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              isBookmarked: response.data?.isBookmarked !== undefined ? response.data.isBookmarked : !old.data.isBookmarked
            }
          };
        }
      );

      // Invalidate the user's "Me" query to update their saved bookmarks list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      // Only invalidate post LISTS, not the detail (avoids view count re-increment)
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update bookmarks');
    },
  });
};

// ==========================================
// 2. COMMENT SYSTEM
// ==========================================

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => interactionApi.addComment(params),
    onSuccess: (_, variables) => {
      toast.success('Comment posted!');
      // Instantly refresh the comments list for THIS specific post
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.interactions.comments(variables.postId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });
};

export const useUpdateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Needs params: { id, postId (for invalidation), payload: { content } }
    mutationFn: (params) => interactionApi.updateComment(params),
    onSuccess: (_, variables) => {
      toast.success('Comment updated');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.interactions.comments(variables.postId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });
};

export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Needs params: { id, postId }
    mutationFn: (params) => interactionApi.deleteComment(params),
    onSuccess: (_, variables) => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.interactions.comments(variables.postId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
};

// ==========================================
// 3. ADMIN MODERATION
// ==========================================

export const useModerateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Needs params: { id, postId, payload: { isApproved } }
    mutationFn: (params) => interactionApi.moderateComment(params),
    onSuccess: (response, variables) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.interactions.comments(variables.postId) 
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to moderate comment');
    },
  });
};