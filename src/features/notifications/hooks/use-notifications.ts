import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getNotifications } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";
import type { NotificationsListParams } from "@/features/notifications/types";

interface UseNotificationsOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useNotifications(
  params: NotificationsListParams,
  options: UseNotificationsOptions = {},
) {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: notificationKeys.list(params, i18n.language),
    queryFn: ({ signal }) => getNotifications(params, signal),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime,
  });
}
