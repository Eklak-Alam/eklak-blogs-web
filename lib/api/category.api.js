import apiClient from './apiClient';

/**
 * Utility function to normalize API errors for the frontend.
 */
const handleApiError = (error, defaultMessage) => {
  const message = error?.message || error?.data?.message || defaultMessage;
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 [Category/Tag API Error] ${defaultMessage}:`, error);
  }
  
  throw new Error(message);
};

/**
 * ==========================================
 * TAXONOMY API SERVICE (Categories & Tags)
 * ==========================================
 * Connects to: http://localhost:8000/api/v1/categories and /tags
 */
export const categoryApi = {
  // ==========================================
  // 🌐 PUBLIC ROUTES (Anyone can read)
  // ==========================================

  /**
   * Fetches all categories, including their post counts.
   */
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data; // Stripping it down to just the payload data
    } catch (error) {
      handleApiError(error, 'Failed to fetch categories');
    }
  },

  /**
   * Fetches a single category by its slug, including its 10 latest posts.
   * @param {string} slug - The SEO-friendly category slug
   */
  getCategoryBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/categories/${slug}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch category details');
    }
  },

  /**
   * Fetches all tags, including their post counts.
   */
  getTags: async () => {
    try {
      const response = await apiClient.get('/tags');
      return response.data;
    } catch (error) {
      handleApiError(error, 'Failed to fetch tags');
    }
  },

  // ==========================================
  // 🛡️ PROTECTED ADMIN ROUTES (Requires Admin Role)
  // ==========================================

  // --- CATEGORIES ---

  /**
   * Creates a new category.
   * @param {Object} payload - { name, slug?, description? }
   */
  createCategory: async (payload) => {
    try {
      const response = await apiClient.post('/categories', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to create category');
    }
  },

  /**
   * Updates an existing category.
   * @param {Object} params - { id: string, payload: { name?, slug?, description? } }
   */
  updateCategory: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/categories/${id}`, payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update category');
    }
  },

  /**
   * Deletes a category. Associated posts will just become uncategorized.
   * @param {string} id - The CUID of the category
   */
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete category');
    }
  },

  // --- TAGS ---

  /**
   * Creates a new tag.
   * @param {Object} payload - { name, slug? }
   */
  createTag: async (payload) => {
    try {
      const response = await apiClient.post('/tags', payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to create tag');
    }
  },

  /**
   * Updates an existing tag.
   * @param {Object} params - { id: string, payload: { name?, slug? } }
   */
  updateTag: async ({ id, payload }) => {
    try {
      const response = await apiClient.patch(`/tags/${id}`, payload);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to update tag');
    }
  },

  /**
   * Deletes a tag. It will be removed from all associated posts automatically.
   * @param {string} id - The CUID of the tag
   */
  deleteTag: async (id) => {
    try {
      const response = await apiClient.delete(`/tags/${id}`);
      return response;
    } catch (error) {
      handleApiError(error, 'Failed to delete tag');
    }
  },
};