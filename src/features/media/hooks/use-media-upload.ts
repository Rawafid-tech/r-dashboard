import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { uploadMedia } from "@/features/media/api/media.api";
import { parseApiError } from "@/shared/api/error-handler";
import type { MediaFile } from "@/features/media/types";
import type { ApiError } from "@/shared/types/api";

export interface UseMediaUploadOptions {
  onSuccess?: (data: MediaFile) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for uploading media files
 * Handles FormData submission and error parsing
 */
export function useMediaUpload(
  options?: UseMediaUploadOptions,
): UseMutationResult<MediaFile, unknown, File> {
  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      options?.onError?.(apiError);
    },
  });
}
