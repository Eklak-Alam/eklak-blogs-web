import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/lib/api/category.api';
import { queryKeys } from '@/lib/api/queryKeys';
import { toast } from 'sonner';

/**
 * ==========================================
 * CATEGORY MUTATIONS
 * ==========================================
 */

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoryApi.createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully!');
      // Instantly refresh the category list across the app
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => categoryApi.updateCategory(params),
    onSuccess: (_, variables) => {
      toast.success('Category updated successfully!');
      // Invalidate the main list AND the specific detail view if someone is looking at it
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
};

/**
 * ==========================================
 * TAG MUTATIONS
 * ==========================================
 */

export const useCreateTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoryApi.createTag(data),
    onSuccess: () => {
      toast.success('Tag created successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create tag');
    },
  });
};

export const useUpdateTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => categoryApi.updateTag(params),
    onSuccess: () => {
      toast.success('Tag updated successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update tag');
    },
  });
};

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryApi.deleteTag(id),
    onSuccess: () => {
      toast.success('Tag deleted successfully.');
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.lists() });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete tag');
    },
  });
};