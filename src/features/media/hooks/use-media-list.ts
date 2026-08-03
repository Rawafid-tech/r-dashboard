import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getMediaList } from "@/features/media/api/media.api";
import type { PaginatedResponse } from "@/shared/types/api";
import type { MediaFile, MediaListParams } from "@/features/media/types";

export const MEDIA_QUERY_KEYS = {
  all: ["media"] as const,
  lists: () => [...MEDIA_QUERY_KEYS.all, "list"] as const,
  list: (params?: MediaListParams) =>
    [...MEDIA_QUERY_KEYS.lists(), params] as const,
};

/**
 * Hook for fetching paginated media list
 */
export function useMediaList(
  params?: MediaListParams,
): UseQueryResult<PaginatedResponse<MediaFile>> {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.list(params),
    queryFn: () => getMediaList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
