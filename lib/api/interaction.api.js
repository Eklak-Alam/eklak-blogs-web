import apiClient from './apiClient';

/**
 * Utility function to normalize API errors for the frontend.
 */
const handleApiError = (error, defaultMessage) => {
  const message = error?.message || error?.data?.message || defaultMessage;
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 [Interaction API Error] ${defaultMessage}:`, error);
  }
  
  throw new Error(message);
};

/**
 * ==========================================
 * INTERACTION API SERVICE (Likes, Bookmarks, Comments)
 * Base: /api/v1/interactions
 * ==========================================
 */
export const interactionApi = {
  // ==========================================
  // 🌐 PUBLIC ROUTES (Reading comments)
  // ==========================================

  /**
   * Fetches paginated top-level comments and their nested replies for a specific post.
   * @param {Object} params - { postId: string, page?: number, limit?: number }
   */
  getComments: async ({ postId, page = 1, limit = 10 }) => {
    try {
      const response = await apiClient.get(`/interactions/posts/${postId}/comments`, {
        params: { page, limit },
      });
      // apiClient interceptor already unwraps response.data, so `response` IS the data
      return response;
    } catch (error) {
      // Comments are public — return empty gracefully so page doesn't break
      if (process.env.NODE_ENV === 'development') {
        console.error('🚨 [Interaction API Error] Failed to load comments:', error);
      }
      return { comments: [], pagination: null };
    }
  },

  // ==========================================
  // 🛡️ PROTECTED ROUTES (User Actions)
  // ==========================================

  /**
   * Fetches the current user's like/bookmark state for a specific post.
   */
  getMyInteractions: async (postId) => {
    try {
      const response = await apiClient.get(`/interactions/posts/${postId}/interactions/me`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch interactions');
    }
  },

  /**
   * Toggles a like on a post.
   * @param {Object} params - { postId: string }
   */
  toggleLike: async ({ postId }) => {
    try {
      const response = await apiClient.post(`/interactions/posts/${postId}/like`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to toggle like');
    }
  },

  /**
   * Toggles a bookmark on a post.
   * @param {Object} params - { postId: string }
   */
  toggleBookmark: async ({ postId }) => {
    try {
      const response = await apiClient.post(`/interactions/posts/${postId}/bookmark`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to toggle bookmark');
    }
  },

  /**
   * Adds a new comment or a reply to an existing comment.
   * @param {Object} params - { postId: string, payload: { content: string, parentId?: string } }
   */
  addComment: async ({ postId, payload }) => {
    try {
      const response = await apiClient.post(`/interactions/posts/${postId}/comments`, payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to post comment');
    }
  },

  /**
   * Updates a user's own comment.
   * @param {Object} params - { id: string, payload: { content: string } }
   */
  updateComment: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/interactions/comments/${id}`, payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update comment');
    }
  },

  /**
   * Deletes a user's own comment (or deleted by an Admin)
   * @param {Object} params - { id: string }
   */
  deleteComment: async ({ id }) => {
    try {
      const response = await apiClient.delete(`/interactions/comments/${id}`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete comment');
    }
  },

  // ==========================================
  // 🚨 ADMIN MODERATION ROUTES
  // ==========================================

  /**
   * Admin action to approve or hide a comment.
   * @param {Object} params - { id: string, payload: { isApproved: boolean } }
   */
  moderateComment: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/interactions/comments/${id}/moderate`, payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to moderate comment');
    }
  },
};