import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  clearUserAvatar,
  setUserAvatar,
} from "@/features/media/api/media.api";
import { parseApiError } from "@/shared/api/error-handler";
import { accountQueryKeys } from "@/features/account/hooks/use-me";
import type { SetAvatarRequest } from "@/features/media/types";
import type { User } from "@/features/auth/types";
import type { ApiError } from "@/shared/types/api";

export interface UseUserAvatarOptions {
  onSuccess?: (data?: User) => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for setting user avatar
 * Invalidates user data cache on success
 */
export function useSetUserAvatar(
  options?: UseUserAvatarOptions,
): UseMutationResult<User, unknown, SetAvatarRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setUserAvatar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.me() });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      options?.onError?.(apiError);
    },
  });
}

/**
 * Hook for clearing user avatar
 * Invalidates user data cache on success
 */
export function useClearUserAvatar(
  options?: UseUserAvatarOptions,
): UseMutationResult<void, unknown, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearUserAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountQueryKeys.me() });
      options?.onSuccess?.();
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      options?.onError?.(apiError);
    },
  });
}
