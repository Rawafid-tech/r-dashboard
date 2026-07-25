import { ArrowLeft, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge, Button } from "@/shared/components/ui";
import { PlanStatusBadge } from "@/features/admin/plans/components/plan-status-badge";
import {
  getPlanDescription,
  getPlanDisplayName,
} from "@/features/admin/plans/lib/plan-label";
import type { AdminPlan } from "@/features/admin/plans/types";
import { useLocaleStore } from "@/stores/locale.store";

interface PlanDetailHeroProps {
  plan: AdminPlan;
}

export function PlanDetailHero({ plan }: PlanDetailHeroProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const displayName = getPlanDisplayName(plan.name, locale);
  const description = getPlanDescription(plan.description, locale);

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),color-mix(in_oklab,#7c3aed_8%,transparent))] px-5 py-6 ring-1 ring-foreground/8 sm:px-7 sm:py-8"
      aria-labelledby="plan-detail-title"
    >
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
          <Link to="/admin/plans">
            <ArrowLeft aria-hidden="true" />
            {t("plans.detail.backToCatalog")}
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <Badge variant="secondary" className="gap-1 uppercase">
              <CreditCard className="size-3" aria-hidden="true" />
              {t("plans.detail.badge")}
            </Badge>
            <h1
              id="plan-detail-title"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {displayName}
            </h1>
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              {plan.code}
            </p>
            {description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PlanStatusBadge status={plan.status} />
            {plan.isDefault ? (
              <Badge variant="secondary">{t("plans.catalog.defaultPlan")}</Badge>
            ) : null}
            {plan.highlighted ? (
              <Badge variant="default">{t("plans.catalog.highlighted")}</Badge>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
