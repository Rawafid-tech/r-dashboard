import { CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { PageStat } from "@/shared/components/layout/page-stat";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";
import { handleTablistKeyDown } from "@/shared/lib/tablist-keyboard";

interface NotificationsHeroProps {
  unreadOnly: boolean;
  unreadCount?: number;
  totalElements?: number;
  onFilterChange: (unreadOnly: boolean) => void;
  onMarkAll: () => void;
  markAllDisabled?: boolean;
}

export function NotificationsHero({
  unreadOnly,
  unreadCount,
  totalElements,
  onFilterChange,
  onMarkAll,
  markAllDisabled = false,
}: NotificationsHeroProps) {
  const { t } = useTranslation("notifications");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const filters = [
    { id: "all" as const, unreadOnly: false, label: t("filters.all") },
    { id: "unread" as const, unreadOnly: true, label: t("filters.unread") },
  ];

  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t("hero.title")}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("hero.subtitle")}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <div className="flex flex-wrap items-stretch justify-end gap-3">
            {typeof unreadCount === "number" ? (
              <PageStat
                label={t("hero.unreadLabel")}
                value={unreadCount.toLocaleString(intlLocale)}
              />
            ) : null}
            {typeof totalElements === "number" && !unreadOnly ? (
              <PageStat
                label={t("hero.totalLabel")}
                value={totalElements.toLocaleString(intlLocale)}
              />
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={markAllDisabled}
            onClick={onMarkAll}
          >
            <CheckCheck className="size-4" aria-hidden="true" />
            {t("list.markAll")}
          </Button>
        </div>
      </div>

      <div
        className="-mb-px flex w-full gap-1 overflow-x-auto border-b border-border"
        role="tablist"
        onKeyDown={handleTablistKeyDown}
        aria-label={t("filters.label")}
      >
        {filters.map((filter) => {
          const isActive = unreadOnly === filter.unreadOnly;
          const badgeCount =
            filter.unreadOnly && typeof unreadCount === "number"
              ? unreadCount
              : undefined;

          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="notifications-main"
              onClick={() => onFilterChange(filter.unreadOnly)}
              className={cn(
                "relative flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
              {badgeCount != null && badgeCount > 0 ? (
                <span
                  className={cn(
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}
