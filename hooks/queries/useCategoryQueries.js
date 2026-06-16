import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/lib/api/category.api';
import { queryKeys } from '@/lib/api/queryKeys';

/**
 * ==========================================
 * CATEGORY QUERIES
 * ==========================================
 */

export const useGetCategoriesQuery = () => {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: () => categoryApi.getCategories(),
    // Categories rarely change, cache them for 30 minutes!
    staleTime: 1000 * 60 * 30, 
  });
};

export const useGetCategoryBySlugQuery = (slug) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => categoryApi.getCategoryBySlug(slug),
    enabled: !!slug, // Only run the query if a slug is actually provided
    staleTime: 1000 * 60 * 15,
  });
};

/**
 * ==========================================
 * TAG QUERIES
 * ==========================================
 */

export const useGetTagsQuery = () => {
  return useQuery({
    queryKey: queryKeys.tags.lists(),
    queryFn: () => categoryApi.getTags(),
    staleTime: 1000 * 60 * 30,
  });
};