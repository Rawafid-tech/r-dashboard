import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { markNotificationRead } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";
import type { Notification } from "@/features/notifications/types";
import type { PaginatedResponse } from "@/shared/types/api";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

type ListSnapshot = [
  readonly unknown[],
  PaginatedResponse<Notification> | undefined,
][];

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });
      await queryClient.cancelQueries({
        queryKey: notificationKeys.unreadCount(),
      });

      const previousLists = queryClient.getQueriesData<
        PaginatedResponse<Notification>
      >({ queryKey: notificationKeys.lists() }) as ListSnapshot;

      const previousUnread = queryClient.getQueryData<{ unread: number }>(
        notificationKeys.unreadCount(),
      );

      for (const [key, data] of previousLists) {
        if (!data) continue;
        queryClient.setQueryData<PaginatedResponse<Notification>>(key, {
          ...data,
          content: data.content.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        });
      }

      if (previousUnread && previousUnread.unread > 0) {
        const wasUnread = previousLists.some(([, data]) =>
          data?.content.some((item) => item.id === id && !item.read),
        );
        if (wasUnread) {
          queryClient.setQueryData(notificationKeys.unreadCount(), {
            unread: Math.max(0, previousUnread.unread - 1),
          });
        }
      }

      return { previousLists, previousUnread };
    },
    onError: (error, _id, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousUnread !== undefined) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousUnread,
        );
      }

      if (isApiError(error, 404)) {
        toast.error(parseApiError(error).detail || t("errors.notFound"));
        return;
      }

      toast.error(parseApiError(error).detail || t("errors.markReadFailed"));
    },
    onSuccess: (notification) => {
      queryClient.setQueriesData<PaginatedResponse<Notification>>(
        { queryKey: notificationKeys.lists() },
        (data) => {
          if (!data) return data;
          return {
            ...data,
            content: data.content.map((item) =>
              item.id === notification.id ? notification : item,
            ),
          };
        },
      );
    },
  });
}
