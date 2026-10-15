import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateNotificationPreferences } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";
import type { UpdateNotificationPreferencesRequest } from "@/features/notifications/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesRequest) =>
      updateNotificationPreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.preferences(), data);
      toast.success(t("settings.success"));
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }
      toast.error(parseApiError(error).detail || t("settings.error"));
    },
  });
}
