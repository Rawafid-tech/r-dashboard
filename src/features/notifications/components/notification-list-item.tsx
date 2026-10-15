import { useTranslation } from "react-i18next";
import type { Notification } from "@/features/notifications/types";
import { getNotificationTopicMeta } from "@/features/notifications/lib/notification-topic";
import { formatRelativeTime } from "@/shared/lib/formatters";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

interface NotificationListItemProps {
  notification: Notification;
  onActivate: (notification: Notification) => void;
  /** Popover rows — compact padding, no card chrome */
  compact?: boolean;
  disabled?: boolean;
}

export function NotificationListItem({
  notification,
  onActivate,
  compact = false,
  disabled = false,
}: NotificationListItemProps) {
  const { t } = useTranslation("notifications");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const meta = getNotificationTopicMeta(notification.topic);
  const Icon = meta.icon;

  return (
    <li className="min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onActivate(notification)}
        className={cn(
          "flex w-full gap-3 text-start transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
          compact
            ? "rounded-lg px-3 py-2.5 hover:bg-muted/60"
            : "px-4 py-4 hover:bg-muted/30 sm:px-5",
          !notification.read && !compact && "bg-primary/[0.03]",
        )}
      >
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/10",
            meta.toneClassName,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>

        <span className="min-w-0 flex-1 space-y-1">
          <span className="flex items-start gap-2">
            {!notification.read ? (
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                "min-w-0 flex-1 text-sm leading-snug text-foreground",
                !notification.read && "font-semibold",
              )}
            >
              {notification.title}
              {!notification.read ? (
                <span className="sr-only"> — {t("list.unreadIndicator")}</span>
              ) : null}
            </span>
          </span>
          <span
            className={cn(
              "block text-sm leading-relaxed text-muted-foreground",
              compact && "line-clamp-2",
            )}
          >
            {notification.body}
          </span>
          <time
            dateTime={notification.createdAt}
            className="block text-xs tabular-nums text-muted-foreground"
            dir="ltr"
          >
            {formatRelativeTime(notification.createdAt, intlLocale)}
          </time>
        </span>
      </button>
    </li>
  );
}
