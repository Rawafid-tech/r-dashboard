import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { changePassword } from "@/features/account/api/account.api";
import type { ChangePasswordRequest } from "@/features/auth/types";
import { accountQueryKeys } from "@/features/account/hooks/use-me";
import { settingsQueryKeys } from "@/features/account/hooks/use-settings";
import { companyQueryKeys } from "@/features/company/hooks/use-company";
import { subscriptionQueryKeys } from "@/features/subscription/hooks/use-subscription";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import { useAuthStore } from "@/stores/auth.store";

export function useChangePassword() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePassword(payload),
    onSuccess: () => {
      clearTokens();
      queryClient.removeQueries({ queryKey: accountQueryKeys.all });
      queryClient.removeQueries({ queryKey: settingsQueryKeys.all });
      queryClient.removeQueries({ queryKey: companyQueryKeys.all });
      queryClient.removeQueries({ queryKey: subscriptionQueryKeys.all });
      toast.success(t("security.success"));
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("security.error"));
    },
  });
}

export function applyPasswordFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name, { type: "server", message: reason });
  }
}
