import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Bell, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useMarkAllNotificationsRead } from "@/features/notifications/hooks/use-mark-all-notifications-read";
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-mark-notification-read";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-unread-notification-count";
import { resolveNotificationHref } from "@/features/notifications/lib/notification-link";
import { NotificationListItem } from "@/features/notifications/components/notification-list-item";
import type { Notification } from "@/features/notifications/types";
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@/shared/components/ui";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

const DROPDOWN_SIZE = 8;

export function NotificationBell() {
  const { t } = useTranslation("notifications");
  const locale = useLocaleStore((state) => state.locale);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const markAllButtonRef = useRef<HTMLButtonElement>(null);

  const unreadQuery = useUnreadNotificationCount();
  const listQuery = useNotifications(
    { page: 0, size: DROPDOWN_SIZE },
    { enabled: open },
  );
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const unread = unreadQuery.data?.unread ?? 0;
  const showBadge = unread > 0;

  const triggerLabel =
    unread > 0
      ? t("bell.labelWithCount", { count: unread })
      : t("bell.label");

  const handleActivate = useCallback(
    async (notification: Notification) => {
      const href = resolveNotificationHref(notification.link);

      try {
        if (!notification.read) {
          await markReadMutation.mutateAsync(notification.id);
        }
      } catch {
        return;
      }

      setOpen(false);

      if (href) {
        navigate(href);
      }
    },
    [markReadMutation, navigate],
  );

  const handleMarkAll = async () => {
    if (unread <= 0) return;

    try {
      await markAllMutation.mutateAsync();
      markAllButtonRef.current?.focus();
    } catch {
      // toast handled in mutation
    }
  };

  const notifications = listQuery.data?.content ?? [];
  const isListLoading = listQuery.isLoading && notifications.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="relative shrink-0"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={triggerLabel}
        >
          <Bell className="size-4" aria-hidden="true" />
          {showBadge ? (
            <Badge
              variant="destructive"
              className="pointer-events-none absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center px-1 text-[10px] tabular-nums"
              aria-hidden="true"
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {unreadQuery.isSuccess
          ? t("bell.labelWithCount", { count: unread })
          : null}
      </span>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-2rem),24rem)] gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            {t("bell.title")}
          </p>
          <Button
            ref={markAllButtonRef}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 px-2 text-xs"
            disabled={unread <= 0 || markAllMutation.isPending}
            onClick={() => void handleMarkAll()}
          >
            {t("bell.markAll")}
          </Button>
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          {isListLoading ? (
            <ul className="space-y-2" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="flex gap-3 px-3 py-2">
                  <Skeleton className="size-9 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </li>
              ))}
            </ul>
          ) : listQuery.isError ? (
            <div className="space-y-3 px-3 py-6 text-center" role="alert">
              <p className="text-sm text-destructive">{t("bell.loadError")}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void listQuery.refetch()}
              >
                <RefreshCw aria-hidden="true" />
                {t("bell.retry")}
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-8 text-center" role="status">
              <p className="text-sm font-medium text-foreground">
                {t("bell.emptyTitle")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t("bell.emptyDescription")}
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {notifications.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  onActivate={(item) => void handleActivate(item)}
                  compact
                  disabled={markReadMutation.isPending}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border bg-muted/20 p-3">
          <Button
            asChild
            variant="secondary"
            className="h-9 w-full justify-between gap-2"
            onClick={() => setOpen(false)}
          >
            <Link to="/notifications">
              <span>{t("bell.viewAll")}</span>
              <ArrowLeft
                className={cn(
                  "size-4 shrink-0 text-muted-foreground",
                  locale === "ar" ? "" : "rotate-180",
                )}
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
