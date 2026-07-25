import {
  ArrowUpRight,
  Sparkles,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui";
import { PlanCatalogPricing } from "@/features/admin/plans/components/plan-catalog-pricing";
import { PlanCatalogFeatures } from "@/features/admin/plans/components/plan-catalog-features";
import { PlanStatusBadge } from "@/features/admin/plans/components/plan-status-badge";
import {
  getPlanDescription,
  getPlanDisplayName,
} from "@/features/admin/plans/lib/plan-label";
import type { AdminPlan } from "@/features/admin/plans/types";
import { PlanStatus } from "@/shared/types/enums";
import { useLocaleStore } from "@/stores/locale.store";
import { cn } from "@/shared/lib/utils";

interface PlansCatalogProps {
  plans: AdminPlan[];
}

export function PlansCatalog({ plans }: PlansCatalogProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => {
        const displayName = getPlanDisplayName(plan.name, locale);
        const description = getPlanDescription(plan.description, locale);
        const isArchived = plan.status === PlanStatus.ARCHIVED;

        return (
          <li key={plan.id}>
            <Card
              className={cn(
                "flex h-full flex-col transition-colors",
                plan.highlighted && !isArchived
                  ? "border-primary/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-primary)_6%,transparent),transparent)]"
                  : "border-border/80",
                isArchived && "opacity-80",
              )}
            >
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-base leading-snug">
                      {displayName}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs uppercase tracking-wide">
                      {plan.code}
                    </CardDescription>
                  </div>
                  <PlanStatusBadge status={plan.status} />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {plan.isDefault ? (
                    <Badge variant="secondary">{t("plans.catalog.defaultPlan")}</Badge>
                  ) : null}
                  {plan.highlighted ? (
                    <Badge variant="default" className="gap-1">
                      <Star className="size-3" aria-hidden="true" />
                      {t("plans.catalog.highlighted")}
                    </Badge>
                  ) : null}
                  {plan.customPricing ? (
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="size-3" aria-hidden="true" />
                      {t("plans.catalog.customBadge")}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {description}
                  </p>
                ) : null}

                <PlanCatalogPricing plan={plan} intlLocale={intlLocale} />

                <PlanCatalogFeatures
                  plan={plan}
                  locale={locale}
                  intlLocale={intlLocale}
                />

                <p className="text-xs text-muted-foreground">
                  {t("plans.catalog.sortOrder", { order: plan.sortOrder })}
                </p>
              </CardContent>

              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/admin/plans/${plan.id}`}>
                    {t("plans.catalog.viewPlan")}
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
