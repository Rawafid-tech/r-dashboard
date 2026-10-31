import { useTranslation } from "react-i18next";
import type { ShipmentCounts, ShipmentsListTab } from "@/features/shipments/types";
import { tabCountFromCounts } from "@/features/shipments/lib/shipment-actions";
import { cn } from "@/shared/lib/utils";
import { handleTablistKeyDown } from "@/shared/lib/tablist-keyboard";

export type ShipmentsHeroScope = "shipments" | "returns" | "exchanges";

interface ShipmentsHeroProps {
  activeTab: ShipmentsListTab;
  counts?: ShipmentCounts;
  onTabChange: (tab: ShipmentsListTab) => void;
  scope?: ShipmentsHeroScope;
  mainPanelId?: string;
}

const TABS: ShipmentsListTab[] = [
  "AWAITING_PICKUP",
  "CURRENTLY_SHIPPING",
  "DELIVERED",
  "RETURNED",
  "BOOKING",
  "FAILED",
  "CANCELLED",
];

export function ShipmentsHero({
  activeTab,
  counts,
  onTabChange,
  scope = "shipments",
  mainPanelId = "shipments-main",
}: ShipmentsHeroProps) {
  const listScope = scope === "returns" || scope === "exchanges";
  const { t } = useTranslation(
    scope === "returns"
      ? "returns"
      : scope === "exchanges"
        ? "exchanges"
        : "shipments",
  );
  const { t: tShipmentsTabs } = useTranslation("shipments");
  const showTabCounts = scope === "shipments";

  return (
    <header className="space-y-5">
      <div className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {listScope ? t("list.hero.title") : t("hero.title")}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {listScope ? t("list.hero.subtitle") : t("hero.subtitle")}
        </p>
      </div>

      <div
        className="-mb-px flex w-full gap-1 overflow-x-auto border-b border-border"
        role="tablist"
        onKeyDown={handleTablistKeyDown}
        aria-label={
          listScope ? t("list.tabs.label") : t("tabs.label")
        }
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCountFromCounts(tab, counts);

          return (
            <button
              key={tab}
              id={`shipments-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={mainPanelId}
              className={cn(
                "relative flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onTabChange(tab)}
            >
              {tShipmentsTabs(`tabs.${tab}`)}
              {showTabCounts && typeof count === "number" ? (
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
