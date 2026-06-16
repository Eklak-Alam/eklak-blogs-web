import apiClient from './apiClient';

/**
 * Utility function to normalize API errors for the frontend.
 * Ensures your React Query mutations always receive a clean string message.
 */
const handleApiError = (error, defaultMessage) => {
  // If the backend sent a specific error message via your AppError class, use it.
  const message = error?.message || error?.data?.message || defaultMessage;
  
  // Log strictly for development debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 [Auth API Error] ${defaultMessage}:`, error);
  }
  
  // Re-throw so React Query's `onError` block can catch it and show a Toast
  throw new Error(message);
};

/**
 * ==========================================
 * AUTH API SERVICE
 * ==========================================
 * Connects to: http://localhost:8000/api/v1/auth
 */
export const authApi = {
  
  /**
   * Registers a new user and auto-generates a session.
   * @param {Object} payload - { name, email, password, phoneNumber?, deviceId? }
   */
  register: async (payload) => {
    try {
      // Note: apiClient interceptor already returns response.data
      const response = await apiClient.post('/auth/register', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to register account');
    }
  },

  /**
   * Verifies the user's email using the 6-digit OTP.
   * @param {Object} payload - { email, otp }
   */
  verifyEmail: async (payload) => {
    try {
      const response = await apiClient.post('/auth/verify-email', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to verify email');
    }
  },

  /**
   * Requests a new verification OTP.
   * @param {Object} payload - { email }
   */
  resendVerification: async (payload) => {
    try {
      const response = await apiClient.post('/auth/resend-verification', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to resend verification code');
    }
  },

  /**
   * Authenticates a user and sets HTTP-only cookies via the backend.
   * @param {Object} payload - { email, password, deviceId? }
   */
  login: async (payload) => {
    try {
      const response = await apiClient.post('/auth/login', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Invalid email or password');
    }
  },

  /**
   * Manually triggers a session refresh (usually handled automatically by interceptor).
   * @param {Object} payload - { refreshToken, deviceId? }
   */
  refreshSession: async (payload) => {
    try {
      const response = await apiClient.post('/auth/refresh', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Session expired. Please log in again.');
    }
  },

  /**
   * Logs the user out and clears the session database side.
   * @param {Object} payload - { refreshToken }
   */
  logout: async (payload) => {
    try {
      const response = await apiClient.post('/auth/logout', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Logout failed. Forcing local session clear.');
    }
  },

  /**
   * Initiates the password recovery flow.
   * @param {Object} payload - { email }
   */
  forgotPassword: async (payload) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to process password reset request');
    }
  },

  /**
   * Completes the password recovery flow with the OTP.
   * @param {Object} payload - { email, otp, newPassword }
   */
  resetPassword: async (payload) => {
    try {
      const response = await apiClient.post('/auth/reset-password', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to reset password. OTP may be invalid.');
    }
  },
};