import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PlanDetailHome } from "@/features/admin/plans/components/plan-detail-home";
import { useAdminPlan } from "@/features/admin/plans/hooks/use-admin-plan";
import {
  getPlanDisplayName,
} from "@/features/admin/plans/lib/plan-label";
import { useLocaleStore } from "@/stores/locale.store";

export function AdminPlanDetailPage() {
  const { t } = useTranslation("admin");
  const { planId } = useParams<{ planId: string }>();
  const locale = useLocaleStore((state) => state.locale);
  const planQuery = useAdminPlan(planId);

  useEffect(() => {
    const previousTitle = document.title;
    const planName = planQuery.data
      ? getPlanDisplayName(planQuery.data.name, locale)
      : null;

    document.title = planName
      ? t("plans.detail.metaTitle", { name: planName })
      : t("plans.detail.metaTitleFallback");

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }

    const previousDescription = meta.content;
    meta.content = planName
      ? t("plans.detail.metaDescription", { name: planName })
      : t("plans.detail.metaDescriptionFallback");

    return () => {
      document.title = previousTitle;
      meta!.content = previousDescription;
    };
  }, [t, planQuery.data, locale]);

  return <PlanDetailHome />;
}
