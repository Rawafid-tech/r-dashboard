import { useTranslation } from "react-i18next";
import { PlansHome } from "@/features/admin/plans/components/plans-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function AdminPlansPage() {
  const { t } = useTranslation("admin");

  useDocumentMeta(t("plans.metaTitle"), t("plans.metaDescription"));

  return <PlansHome />;
}
