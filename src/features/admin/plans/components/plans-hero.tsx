import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout/page-header";
import { PageStat } from "@/shared/components/layout/page-stat";
import { useLocaleStore } from "@/stores/locale.store";

interface PlansHeroProps {
  totalPlans?: number;
  activeCount?: number;
  canManage?: boolean;
}

export function PlansHero({
  totalPlans,
  activeCount,
  canManage = false,
}: PlansHeroProps) {
  const { t } = useTranslation("admin");
  const locale = useLocaleStore((state) => state.locale);
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";

  const actions = (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      {typeof totalPlans === "number" ? (
        <PageStat
          label={t("plans.hero.totalLabel")}
          value={totalPlans.toLocaleString(intlLocale)}
          hint={
            typeof activeCount === "number"
              ? t("plans.hero.activeCount", { count: activeCount })
              : undefined
          }
        />
      ) : null}
      {canManage ? (
        <Button asChild className="w-full sm:w-auto">
          <Link to="/admin/plans/new">
            <Plus aria-hidden="true" />
            {t("plans.hero.createPlan")}
          </Link>
        </Button>
      ) : null}
    </div>
  );

  return (
    <PageHeader
      title={t("plans.hero.title")}
      description={t("plans.hero.subtitle")}
      actions={actions}
    />
  );
}
