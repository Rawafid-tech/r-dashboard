import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateMe } from "@/features/account/api/account.api";
import type { UpdateProfileRequest } from "@/features/account/types";
import { accountQueryKeys } from "@/features/account/hooks/use-me";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateMe(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.me() });
      toast.success(t("profile.success"));
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("profile.error"));
    },
  });
}

export function applyProfileFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name, { type: "server", message: reason });
  }
}
