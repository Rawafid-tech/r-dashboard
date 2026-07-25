import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminPlan } from "@/features/admin/plans/types";
import { formatCurrency } from "@/shared/lib/formatters";

interface PlanCatalogPricingProps {
  plan: AdminPlan;
  intlLocale: string;
}

export function PlanCatalogPricing({ plan, intlLocale }: PlanCatalogPricingProps) {
  const { t } = useTranslation("admin");

  if (plan.customPricing) {
    return (
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
        <PricingHeader />
        <p className="mt-2 text-sm font-medium text-foreground">
          {t("plans.catalog.customPricing")}
        </p>
      </div>
    );
  }

  if (plan.tiers.length === 0) {
    return (
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
        <PricingHeader />
        <p className="mt-2 text-sm text-muted-foreground">
          {t("plans.catalog.noTiers")}
        </p>
      </div>
    );
  }

  const sortedTiers = plan.tiers
    .slice()
    .sort((a, b) => a.shipmentsPerMonth - b.shipmentsPerMonth);

  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <PricingHeader />

      {sortedTiers.length === 1 ? (
        <div className="mt-2 flex items-baseline justify-between gap-3 rounded-md bg-background/60 px-2.5 py-2">
          <span className="text-sm text-muted-foreground">
            {t("plans.catalog.tierShipments", {
              count: sortedTiers[0]!.shipmentsPerMonth.toLocaleString(intlLocale),
            })}
          </span>
          <span
            dir="ltr"
            className="shrink-0 text-sm font-semibold tabular-nums text-foreground"
          >
            {t("plans.catalog.tierMonthly", {
              price: formatCurrency(
                sortedTiers[0]!.monthlyPrice,
                "EGP",
                intlLocale,
              ),
            })}
          </span>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("plans.catalog.tierCount", { count: sortedTiers.length })}
          </p>
          <ul
            className="space-y-1.5"
            aria-label={t("plans.catalog.tierListLabel", {
              count: sortedTiers.length,
            })}
          >
            {sortedTiers.map((tier) => (
              <li
                key={`${tier.shipmentsPerMonth}-${tier.sortOrder}`}
                className="flex items-baseline justify-between gap-3 rounded-md bg-background/60 px-2.5 py-2"
              >
                <span className="min-w-0 text-sm text-muted-foreground">
                  {t("plans.catalog.tierShipments", {
                    count: tier.shipmentsPerMonth.toLocaleString(intlLocale),
                  })}
                </span>
                <span
                  dir="ltr"
                  className="shrink-0 text-sm font-semibold tabular-nums text-foreground"
                >
                  {t("plans.catalog.tierMonthly", {
                    price: formatCurrency(tier.monthlyPrice, "EGP", intlLocale),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  function PricingHeader() {
    return (
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Layers className="size-3.5 shrink-0" aria-hidden="true" />
        {t("plans.catalog.pricing")}
      </div>
    );
  }
}
