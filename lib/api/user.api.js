import apiClient from './apiClient';

/**
 * Utility function to normalize API errors for the frontend.
 * UPGRADED: Now safely handles Zod array errors from the backend!
 */
const handleApiError = (error, defaultMessage) => {
  const backendData = error?.response?.data;

  // 1. Check if it's a structured Zod Validation Error Array
  if (backendData?.errors && Array.isArray(backendData.errors) && backendData.errors.length > 0) {
    const firstError = backendData.errors[0];
    const validationMessage = firstError.message; // Just grab the exact message
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 [User API Validation Error] on field '${firstError.field}':`, validationMessage);
    }
    
    throw new Error(validationMessage);
  }

  // 2. Standard string message extraction
  const message = backendData?.message || error?.message || error?.data?.message || defaultMessage;
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 [User API Error] ${defaultMessage}:`, error);
  }
  
  throw new Error(message);
};

/**
 * ==========================================
 * USER API SERVICE 
 * ==========================================
 * Connects to: http://localhost:8000/api/v1/users
 */
export const userApi = {
  // ==========================================
  // 🌐 PUBLIC PROFILES
  // ==========================================

  /**
   * Fetches a writer's public profile and their latest published posts.
   * @param {string} id - The user's CUID
   */
  getPublicProfile: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}/public`);
      return response.data; // Stripped down to { user }
    } catch (error) {
      handleApiError(error, 'Failed to load public profile');
    }
  },

  // ==========================================
  // 👤 SELF-SERVICE (Logged-in User)
  // ==========================================

  /**
   * Fetches the current logged-in user's profile and stats.
   * Requires JWT token in cookies (handled automatically by apiClient).
   */
  getMe: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response.data; 
    } catch (error) {
      handleApiError(error, 'Failed to authenticate user session');
    }
  },

  /**
   * Fetches the current user's bookmarked posts with pagination.
   */
  getMyBookmarks: async (params = { page: 1, limit: 10 }) => {
    try {
      const response = await apiClient.get('/users/me/bookmarks', { params });
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch bookmarks');
    }
  },

  /**
   * Fetches the current logged-in author's analytics (views, likes, shares, comments).
   */
  getMyAnalytics: async () => {
    try {
      const response = await apiClient.get('/users/me/analytics');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch analytics');
    }
  },

  /**
   * Updates personal profile details.
   * ENTERPRISE FEATURE: `image` can now natively accept Base64 strings for Cloudflare R2!
   * @param {Object} payload - { name?, phoneNumber?, image? }
   */
  updateMyProfile: async (payload) => {
    try {
      const response = await apiClient.patch('/users/me', payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update profile');
    }
  },

  /**
   * Securely changes the user's password.
   * @param {Object} payload - { currentPassword, newPassword }
   */
  changePassword: async (payload) => {
    try {
      const response = await apiClient.patch('/users/me/password', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to change password');
    }
  },

  /**
   * Deletes the logged-in user's account permanently.
   */
  deleteMyAccount: async () => {
    try {
      const response = await apiClient.delete('/users/me');
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete account');
    }
  },

  // ==========================================
  // 🛡️ ADMIN OPERATIONS
  // ==========================================

  /**
   * Fetches all users for the Admin Dashboard.
   * @param {Object} params - { page, limit, search, role }
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data; // Contains { users, pagination }
    } catch (error) {
      handleApiError(error, 'Failed to load users list');
    }
  },

  /**
   * Fetches paginated liked posts for the logged-in user.
   */
  getMyLikes: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/me/likes', { params });
      return response.data; // Contains { likes, pagination }
    } catch (error) {
      handleApiError(error, 'Failed to load liked posts');
    }
  },

  /**
   * Promotes or demotes a user's role.
   * @param {Object} params - { id: string, payload: { role: 'USER' | 'WRITER' | 'AUTHOR' | 'ADMIN' } }
   */
  updateUserRole: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/users/${id}/role`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update user role');
    }
  },

  /**
   * Bans or unbans a user.
   * @param {Object} params - { id: string, payload: { isBanned: boolean } }
   */
  toggleUserBan: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/users/${id}/ban`, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to update ban status');
    }
  },

  /**
   * Force deletes any user from the system.
   * @param {string} id - The user's CUID
   */
  adminDeleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete user');
    }
  },

  /**
   * Admin Analytics: Get demographics and growth metrics.
   */
  getAdminStats: async () => {
    try {
      const response = await apiClient.get('/users/admin/stats');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch admin user stats');
    }
  },
};