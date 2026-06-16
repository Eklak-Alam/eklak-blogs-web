import { useQuery } from '@tanstack/react-query';
import { interactionApi } from '@/lib/api/interaction.api';
import { queryKeys } from '@/lib/api/queryKeys';

/**
 * Fetches paginated comments (and their nested replies) for a specific post.
 */
export const useGetCommentsQuery = (postId, filters = { page: 1, limit: 10 }) => {
  return useQuery({
    // We include the filters in the query key so pagination is cached separately!
    queryKey: [...queryKeys.interactions.comments(postId), filters],
    queryFn: () => interactionApi.getComments({ postId, ...filters }),
    enabled: !!postId, // Won't fetch until we actually have a postId
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    keepPreviousData: true, // Smooth UI transitions when clicking "Next Page"
  });
};