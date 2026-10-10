import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OrderCounts, OrdersListTab } from "@/features/orders/types";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface OrdersHeroProps {
  activeTab: OrdersListTab;
  counts?: OrderCounts;
  onTabChange: (tab: OrdersListTab) => void;
  onAdd: () => void;
  onCreateShipment?: () => void;
  canManage?: boolean;
  canBookShipment?: boolean;
}

function tabCount(
  tab: OrdersListTab,
  counts: OrderCounts | undefined,
): number | undefined {
  if (!counts) return undefined;
  if (tab === "all") {
    return (
      counts.PENDING +
      counts.BOOKED +
      counts.DELIVERED +
      counts.RETURNED +
      counts.CANCELLED
    );
  }
  return counts[tab];
}

export function OrdersHero({
  activeTab,
  counts,
  onTabChange,
  onAdd,
  onCreateShipment,
  canManage = true,
  canBookShipment = false,
}: OrdersHeroProps) {
  const { t } = useTranslation("orders");
  const tabs: OrdersListTab[] = [
    "all",
    "PENDING",
    "BOOKED",
    "DELIVERED",
    "RETURNED",
    "CANCELLED",
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
        {canManage || canBookShipment ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            {canBookShipment && onCreateShipment ? (
              <Button type="button" variant="outline" onClick={onCreateShipment}>
                {t("hero.createShipment")}
              </Button>
            ) : null}
            {canManage ? (
              <Button type="button" onClick={onAdd}>
                <Plus aria-hidden="true" />
                {t("hero.add")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className="-mb-px flex w-full gap-1 overflow-x-auto border-b border-border"
        role="tablist"
        aria-label={t("tabs.label")}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCount(tab, counts);

          return (
            <button
              key={tab}
              id={`orders-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="orders-main"
              className={cn(
                "relative flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onTabChange(tab)}
            >
              {t(`tabs.${tab}`)}
              {typeof count === "number" ? (
                <span
                  className={cn(
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs tabular-nums",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-label={t("tabs.count", { count })}
                >
                  {count.toLocaleString("en-US")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}
