import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { markAllNotificationsRead } from "@/features/notifications/api/notifications.api";
import { notificationKeys } from "@/features/notifications/hooks/query-keys";
import type { Notification } from "@/features/notifications/types";
import type { PaginatedResponse } from "@/shared/types/api";
import { parseApiError } from "@/shared/api/error-handler";

type ListSnapshot = [
  readonly unknown[],
  PaginatedResponse<Notification> | undefined,
][];

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
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
          content: data.content.map((item) => ({ ...item, read: true })),
        });
      }

      queryClient.setQueryData(notificationKeys.unreadCount(), { unread: 0 });

      return { previousLists, previousUnread };
    },
    onError: (_error, _vars, context) => {
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
      toast.error(parseApiError(_error).detail || t("errors.markAllFailed"));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}
