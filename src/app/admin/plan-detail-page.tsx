import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PlanDetailHome } from "@/features/admin/plans/components/plan-detail-home";
import { useAdminPlan } from "@/features/admin/plans/hooks/use-admin-plan";
import {
  getPlanDisplayName,
} from "@/features/admin/plans/lib/plan-label";
import { useLocaleStore } from "@/stores/locale.store";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminPlanDetailPage() {
  const { t } = useTranslation("admin");
  const { planId } = useParams<{ planId: string }>();
  const locale = useLocaleStore((state) => state.locale);
  const planQuery = useAdminPlan(planId);

  const planName = planQuery.data
    ? getPlanDisplayName(planQuery.data.name, locale)
    : null;

  useDocumentMeta(
    planName
      ? t("plans.detail.metaTitle", { name: planName })
      : t("plans.detail.metaTitleFallback"),
    planName
      ? t("plans.detail.metaDescription", { name: planName })
      : t("plans.detail.metaDescriptionFallback"),
  );

  return <PlanDetailHome />;
}
