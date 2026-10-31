import { useTranslation } from "react-i18next";
import { DashboardHome } from "@/features/dashboard/components/dashboard-home";
import { useDocumentMeta } from "@/shared/hooks/use-document-meta";

export function DashboardPage() {
  const { t } = useTranslation("dashboard");

  useDocumentMeta(t("metaTitle"), t("metaDescription"));

  return <DashboardHome />;
}
