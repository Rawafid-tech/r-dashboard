import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge, Button } from "@/shared/components/ui";
import { PlanStatusBadge } from "@/features/admin/plans/components/plan-status-badge";
import {
  getPlanDescription,
  getPlanDisplayName,
} from "@/features/admin/plans/lib/plan-label";
import type { AdminPlan } from "@/features/admin/plans/types";
import { PageHeader } from "@/shared/components/layout/page-header";
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
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
        <Link to="/admin/plans">
          <ArrowLeft aria-hidden="true" />
          {t("plans.detail.backToCatalog")}
        </Link>
      </Button>

      <PageHeader
        title={displayName}
        description={
          <>
            <span className="font-mono text-xs text-muted-foreground">{plan.code}</span>
            {description ? (
              <span className="mt-2 block text-sm text-muted-foreground">{description}</span>
            ) : null}
          </>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PlanStatusBadge status={plan.status} />
            {plan.isDefault ? (
              <Badge variant="secondary">{t("plans.catalog.defaultPlan")}</Badge>
            ) : null}
            {plan.highlighted ? (
              <Badge variant="default">{t("plans.catalog.highlighted")}</Badge>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
