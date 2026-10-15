import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";

const UNREAD_POLL_MS = 45_000;

export function useUnreadNotificationCount(options: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: ({ signal }) => getUnreadNotificationCount(signal),
    enabled: options.enabled ?? true,
    refetchInterval: UNREAD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { refetch } = query;

  useEffect(() => {
    if (options.enabled === false) return;

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refetch();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [options.enabled, refetch]);

  return query;
}
