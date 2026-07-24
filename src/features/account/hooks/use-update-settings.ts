import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateSettings } from "@/features/account/api/account.api";
import type { UpdateSettingsRequest } from "@/features/account/types";
import { settingsQueryKeys } from "@/features/account/hooks/use-settings";
import { applyUserSettings } from "@/shared/lib/apply-user-settings";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: UpdateSettingsRequest) => updateSettings(payload),
    onSuccess: (settings) => {
      applyUserSettings(settings);
      void queryClient.setQueryData(settingsQueryKeys.detail(), settings);
      toast.success(t("preferences.success"));
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("preferences.error"));
    },
  });
}

export function applyPreferencesFieldErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void,
) {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return;

  for (const [name, reason] of Object.entries(fieldErrors)) {
    setError(name, { type: "server", message: reason });
  }
}
