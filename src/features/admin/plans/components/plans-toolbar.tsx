import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import type { PlanStatusFilter } from "@/features/admin/plans/schema";
import { cn } from "@/shared/lib/utils";

const FILTERS: PlanStatusFilter[] = ["ALL", "ACTIVE", "ARCHIVED"];

interface PlansToolbarProps {
  statusFilter: PlanStatusFilter;
  onStatusFilterChange: (value: PlanStatusFilter) => void;
  isFetching?: boolean;
}

export function PlansToolbar({
  statusFilter,
  onStatusFilterChange,
  isFetching = false,
}: PlansToolbarProps) {
  const { t } = useTranslation("admin");

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3"
      role="search"
      aria-label={t("plans.toolbar.title")}
    >
      <div>
        <p className="text-sm font-medium text-foreground">
          {t("plans.toolbar.title")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("plans.toolbar.hint")}
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("plans.toolbar.filterLabel")}
      >
        {FILTERS.map((filter) => {
          const isActive = statusFilter === filter;

          return (
            <Button
              key={filter}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              role="tab"
              aria-selected={isActive}
              disabled={isFetching && isActive}
              className={cn(isFetching && isActive && "opacity-80")}
              onClick={() => onStatusFilterChange(filter)}
            >
              {t(`plans.toolbar.filters.${filter}`)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
