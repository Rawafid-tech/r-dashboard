import { useQuery } from "@tanstack/react-query";
import { getNotificationPreferences } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: ({ signal }) => getNotificationPreferences(signal),
  });
}
