import { Check, ListChecks, Minus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { getLocalizedLabel } from "@/features/admin/plans/lib/plan-label";
import type { AdminPlan, AdminPlanFeature } from "@/features/admin/plans/types";
import type { SupportedLocale } from "@/shared/lib/constants";
import { PlanFeatureType } from "@/shared/types/enums";
import { cn } from "@/shared/lib/utils";

interface PlanCatalogFeaturesProps {
  plan: AdminPlan;
  locale: SupportedLocale;
  intlLocale: string;
}

function FeatureValue({
  feature,
  intlLocale,
}: {
  feature: AdminPlanFeature;
  intlLocale: string;
}) {
  const { t } = useTranslation("admin");

  switch (feature.type) {
    case PlanFeatureType.NUMBER:
      return (
        <span
          dir="ltr"
          className="shrink-0 text-sm font-semibold tabular-nums text-foreground"
        >
          {feature.number != null
            ? feature.number.toLocaleString(intlLocale)
            : "—"}
        </span>
      );

    case PlanFeatureType.BOOLEAN:
      return feature.enabled ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-success">
          <Check className="size-3.5" aria-hidden="true" />
          {t("plans.catalog.featureIncluded")}
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground">
          <X className="size-3.5" aria-hidden="true" />
          {t("plans.catalog.featureExcluded")}
        </span>
      );

    case PlanFeatureType.UNLIMITED:
      return (
        <Badge variant="secondary" className="shrink-0">
          {t("plans.catalog.featureUnlimited")}
        </Badge>
      );

    case PlanFeatureType.TEXT:
      return (
        <span className="max-w-[45%] truncate text-end text-sm font-medium text-foreground">
          {feature.text?.trim() || "—"}
        </span>
      );

    default:
      return (
        <Minus
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      );
  }
}

export function PlanCatalogFeatures({
  plan,
  locale,
  intlLocale,
}: PlanCatalogFeaturesProps) {
  const { t } = useTranslation("admin");

  if (plan.features.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <ListChecks className="size-3.5 shrink-0" aria-hidden="true" />
          {t("plans.catalog.featuresTitle")}
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {t("plans.catalog.featureCount", { count: plan.features.length })}
        </span>
      </div>

      <ul
        className="mt-2 space-y-1.5"
        aria-label={t("plans.catalog.featureListLabel", {
          count: plan.features.length,
        })}
      >
        {plan.features.map((feature, index) => {
          const label = getLocalizedLabel(feature.label, locale);

          return (
            <li
              key={`${label}-${feature.type}-${index}`}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md bg-background/60 px-2.5 py-2",
              )}
            >
              <span className="min-w-0 text-sm text-muted-foreground">
                {label}
              </span>
              <FeatureValue feature={feature} intlLocale={intlLocale} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
