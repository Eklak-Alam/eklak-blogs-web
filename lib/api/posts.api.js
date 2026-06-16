import apiClient from './apiClient';

/**
 * Utility function to normalize API errors for the frontend.
 */
const handleApiError = (error, defaultMessage) => {
  const message = error?.message || error?.data?.message || defaultMessage;
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 [Post API Error] ${defaultMessage}:`, error);
  }
  
  throw new Error(message);
};

/**
 * ==========================================
 * POSTS API SERVICE 
 * ==========================================
 * Connects to: http://localhost:8000/api/v1/posts
 */
export const postApi = {
  // ==========================================
  // 🌐 PUBLIC READER ROUTES
  // ==========================================

  /**
   * Fetches paginated, published posts. 
   * @param {Object} params - { page, limit, search, categoryId, tagSlug, authorId }
   */
  getPublishedPosts: async (params = {}) => {
    try {
      const response = await apiClient.get('/posts', { params });
      if (response && Array.isArray(response.data)) {
        return { ...response, data: { posts: response.data, pagination: response.meta || {} } };
      }
      return response; 
    } catch (error) {
      handleApiError(error, 'Failed to fetch posts');
    }
  },

  /**
   * Fetches a single published post by its SEO slug.
   * @param {string} slug - The post slug
   */
  getPostBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/posts/${slug}`);
      if (response && response.data && !response.data.post) {
        return { ...response, data: { post: response.data } };
      }
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch the post');
    }
  },

  /**
   * Increments the share count for a post.
   * @param {string} id - The post ID
   */
  incrementShareCount: async (id) => {
    try {
      const response = await apiClient.post(`/posts/${id}/share`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to share post');
    }
  },

  // ==========================================
  // ✍️ AUTHOR ROUTES (Self-Service)
  // ==========================================

  /**
   * Creates a new post (Draft or Published).
   * Note: `coverImage` can be a valid URL or a Base64 encoded string!
   * @param {Object} payload - { title, content, status, coverImage, categoryId, tags, etc. }
   */
  createPost: async (payload) => {
    try {
      const response = await apiClient.post('/posts', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to create post');
    }
  },

  /**
   * Fetches posts specifically written by the logged-in user.
   * @param {Object} params - { page, limit, status }
   */
  getMyPosts: async (params = {}) => {
    try {
      const response = await apiClient.get('/posts/me', { params });
      if (response && Array.isArray(response.data)) {
        return { ...response, data: { posts: response.data, pagination: response.meta || {} } };
      }
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to fetch your posts');
    }
  },

  /**
   * Updates an author's own post.
   * @param {Object} params - { id: string, payload: { title, content, coverImage, etc. } }
   */
  updateMyPost: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/posts/${id}`, payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update post');
    }
  },

  /**
   * Deletes an author's own post.
   * @param {string} id - The CUID of the post
   */
  deleteMyPost: async (id) => {
    try {
      const response = await apiClient.delete(`/posts/${id}`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete post');
    }
  },

  // ==========================================
  // 🛡️ ADMIN OPERATIONS
  // ==========================================

  /**
   * Admin dashboard view of all posts, regardless of status.
   * @param {Object} params - { page, limit, search, status, authorId }
   */
  getAllPostsAdmin: async (params = {}) => {
    try {
      const response = await apiClient.get('/posts/admin/all', { params });
      if (response && Array.isArray(response.data)) {
        return { ...response, data: { posts: response.data, pagination: response.meta || {} } };
      }
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to load admin post data');
    }
  },

  /**
   * Admin override to forcefully change a post's status.
   * @param {Object} params - { id: string, payload: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } }
   */
  adminUpdatePostStatus: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/posts/admin/${id}/status`, payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update post status');
    }
  },

  /**
   * Admin override to forcefully delete any post.
   * @param {string} id - The CUID of the post
   */
  adminDeletePost: async (id) => {
    try {
      const response = await apiClient.delete(`/posts/admin/${id}/force`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete post');
    }
  },

  /**
   * Admin Analytics: Get engagement metrics across all posts.
   */
  getAdminStats: async () => {
    try {
      const response = await apiClient.get('/posts/admin/stats');
      return response.data; // Stripped down to { totalMetrics, statusCounts }
    } catch (error) {
      handleApiError(error, 'Failed to fetch admin post stats');
    }
  },

  /**
   * Bulk updates the status of multiple posts atomically.
   * @param {Object} params - { payload: { postIds: string[], status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' } }
   */
  bulkAdminUpdatePostStatus: async ({ payload }) => {
    try {
      const response = await apiClient.patch('/posts/admin/bulk-status', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to bulk update posts');
    }
  },
};