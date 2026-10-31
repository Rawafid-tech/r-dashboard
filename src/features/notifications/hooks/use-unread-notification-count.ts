import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";

const UNREAD_POLL_MS = 45_000;

export function useUnreadNotificationCount(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: ({ signal }) => getUnreadNotificationCount(signal),
    enabled: options.enabled ?? true,
    refetchInterval: UNREAD_POLL_MS,
    refetchIntervalInBackground: false,
    // Always refetch when the tab becomes visible again.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
