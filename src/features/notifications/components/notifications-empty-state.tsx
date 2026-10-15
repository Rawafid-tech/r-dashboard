import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NotificationsEmptyStateProps {
  unreadOnly: boolean;
}

export function NotificationsEmptyState({
  unreadOnly,
}: NotificationsEmptyStateProps) {
  const { t } = useTranslation("notifications");

  return (
    <div
      className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20"
      role="status"
    >
      <span
        className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
        aria-hidden="true"
      >
        <Bell className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        {unreadOnly ? t("empty.unreadTitle") : t("empty.title")}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {unreadOnly ? t("empty.unreadDescription") : t("empty.description")}
      </p>
    </div>
  );
}
