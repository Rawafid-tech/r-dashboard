import { useTranslation } from "react-i18next";
import { PlanCreateHome } from "@/features/admin/plans/components/plan-create-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminPlanCreatePage() {
  const { t } = useTranslation("admin");

  useDocumentMeta(t("plans.create.metaTitle"), t("plans.create.metaDescription"));

  return <PlanCreateHome />;
}
