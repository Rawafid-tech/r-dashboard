import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NotificationListItem } from "@/features/notifications/components/notification-list-item";
import { NotificationsEmptyState } from "@/features/notifications/components/notifications-empty-state";
import { NotificationsErrorState } from "@/features/notifications/components/notifications-error-state";
import { NotificationsHero } from "@/features/notifications/components/notifications-hero";
import { NotificationsListPanel } from "@/features/notifications/components/notifications-list-panel";
import { NotificationsPageSkeleton } from "@/features/notifications/components/notifications-page-skeleton";
import { useMarkAllNotificationsRead } from "@/features/notifications/hooks/use-mark-all-notifications-read";
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-mark-notification-read";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-unread-notification-count";
import { resolveNotificationHref } from "@/features/notifications/lib/notification-link";
import type { Notification } from "@/features/notifications/types";
import { Button } from "@/shared/components/ui";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";

const PAGE_SIZE = 20;

function readUnreadFilter(value: string | null): boolean {
  return value === "unread";
}

export function NotificationsHome() {
  const { t } = useTranslation(["notifications", "common"]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          });
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const page = readPageIndex(searchParams.get("page"));
  const unreadOnly = readUnreadFilter(searchParams.get("filter"));

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      unread: unreadOnly ? true : undefined,
    }),
    [page, unreadOnly],
  );

  const notificationsQuery = useNotifications(queryParams);
  const unreadQuery = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const data = notificationsQuery.data;
  const notifications = data?.content ?? [];
  const unread = unreadQuery.data?.unread ?? 0;

  useEffect(() => {
    if (!data || notificationsQuery.isFetching) return;

    if (
      shouldResetPageIndex(
        data.page,
        data.totalPages,
        data.totalElements,
        data.content.length,
      )
    ) {
      updateParams({ page: null });
    }
  }, [data, notificationsQuery.isFetching, updateParams]);

  const isInitialLoading =
    notificationsQuery.isLoading && !notificationsQuery.isError;

  const handleFilterChange = (nextUnreadOnly: boolean) => {
    updateParams({
      filter: nextUnreadOnly ? "unread" : null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: writePageIndex(nextPage) });
  };

  const handleActivate = async (notification: Notification) => {
    const href = resolveNotificationHref(notification.link);

    try {
      if (!notification.read) {
        await markReadMutation.mutateAsync(notification.id);
      }
    } catch {
      return;
    }

    if (href) {
      navigate(href);
    }
  };

  const handleMarkAll = () => {
    if (unread <= 0) return;
    void markAllMutation.mutateAsync();
  };

  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const showPagination = totalElements > 0 && totalPages > 1;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <a
        href="#notifications-main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>

      {isInitialLoading ? (
        <NotificationsPageSkeleton />
      ) : (
        <>
          <NotificationsHero
            unreadOnly={unreadOnly}
            unreadCount={unreadQuery.data?.unread}
            totalElements={data?.totalElements}
            onFilterChange={handleFilterChange}
            onMarkAll={handleMarkAll}
            markAllDisabled={unread <= 0 || markAllMutation.isPending}
          />

          {notificationsQuery.isError ? (
            <NotificationsErrorState
              onRetry={() => void notificationsQuery.refetch()}
              isRetrying={notificationsQuery.isFetching}
            />
          ) : (
            <>
              <NotificationsListPanel
                isFetching={notificationsQuery.isFetching && !isInitialLoading}
              >
                {notifications.length === 0 ? (
                  <NotificationsEmptyState unreadOnly={unreadOnly} />
                ) : (
                  <ul className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <NotificationListItem
                        key={notification.id}
                        notification={notification}
                        onActivate={(item) => void handleActivate(item)}
                        disabled={markReadMutation.isPending}
                      />
                    ))}
                  </ul>
                )}
              </NotificationsListPanel>

              {showPagination ? (
                <nav
                  aria-label={t("pagination.label")}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    <span className="tabular-nums">
                      {t("pagination.summary", {
                        start: page * PAGE_SIZE + 1,
                        end: Math.min((page + 1) * PAGE_SIZE, totalElements),
                        total: totalElements,
                      })}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 0 || notificationsQuery.isFetching}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      {t("common:common.previous")}
                    </Button>
                    <span
                      className="min-w-16 text-center text-sm font-medium tabular-nums text-foreground"
                      dir="ltr"
                    >
                      {t("pagination.pageOf", {
                        current: page + 1,
                        total: totalPages,
                      })}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={
                        page >= totalPages - 1 || notificationsQuery.isFetching
                      }
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {t("common:common.next")}
                    </Button>
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
