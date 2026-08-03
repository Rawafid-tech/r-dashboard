import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { deleteMedia } from "@/features/media/api/media.api";
import { parseApiError } from "@/shared/api/error-handler";
import { MEDIA_QUERY_KEYS } from "@/features/media/hooks/use-media-list";
import type { ApiError } from "@/shared/types/api";

export interface UseMediaDeleteOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for deleting media files
 * Automatically invalidates media list cache on success
 */
export function useMediaDelete(
  options?: UseMediaDeleteOptions,
): UseMutationResult<void, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      // Invalidate all media lists to refresh data
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.lists(),
      });
      options?.onSuccess?.();
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      options?.onError?.(apiError);
    },
  });
}
