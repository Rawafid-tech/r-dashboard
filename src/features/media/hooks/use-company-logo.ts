import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  clearCompanyLogo,
  setCompanyLogo,
} from "@/features/media/api/media.api";
import { parseApiError } from "@/shared/api/error-handler";
import { companyQueryKeys } from "@/features/company/hooks/use-company";
import type { SetLogoRequest } from "@/features/media/types";
import type { ApiError } from "@/shared/types/api";

export interface UseCompanyLogoOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for setting company logo (OWNER only)
 * Invalidates company data cache on success
 */
export function useSetCompanyLogo(
  options?: UseCompanyLogoOptions,
): UseMutationResult<unknown, unknown, SetLogoRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setCompanyLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail() });
      options?.onSuccess?.();
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      options?.onError?.(apiError);
    },
  });
}

/**
 * Hook for clearing company logo (OWNER only)
 * Invalidates company data cache on success
 */
export function useClearCompanyLogo(
  options?: UseCompanyLogoOptions,
): UseMutationResult<void, unknown, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCompanyLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail() });
      options?.onSuccess?.();
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      options?.onError?.(apiError);
    },
  });
}
