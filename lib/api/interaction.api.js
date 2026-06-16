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
      const response = await apiClient.get(`/posts/${postId}/comments`, {
        params: { page, limit },
      });
      return response.data; 
    } catch (error) {
      handleApiError(error, 'Failed to load comments');
    }
  },

  // ==========================================
  // 🛡️ PROTECTED ROUTES (User Actions)
  // ==========================================

  /**
   * Toggles a like on a post.
   * @param {Object} params - { postId: string }
   */
  toggleLike: async ({ postId }) => {
    try {
      const response = await apiClient.post(`/posts/${postId}/like`);
      return response.data;
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
      const response = await apiClient.post(`/posts/${postId}/bookmark`);
      return response.data;
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
      const response = await apiClient.post(`/posts/${postId}/comments`, payload);
      return response.data;
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
      const response = await apiClient.patch(`/comments/${id}`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update comment');
    }
  },

  /**
   * Deletes a user's own comment (or deleted by an Admin).
   * @param {Object} params - { id: string }
   */
  deleteComment: async ({ id }) => {
    try {
      const response = await apiClient.delete(`/comments/${id}`);
      return response.data;
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
      const response = await apiClient.patch(`/comments/${id}/moderate`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to moderate comment');
    }
  },
};